/**
 * Servidor & API de Integração Comercial - Adorê & Mercado Livre
 * Conformidade com OAuth 2.0, Criptografia AES-256, Gestão de Kits Virtuais e Headers Seguros.
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const ML_API_BASE = 'https://api.mercadolibre.com';
const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || crypto.randomBytes(32);
const IV_LENGTH = 16;

const secureDatabase = {};

function encryptToken(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptToken(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

app.get('/auth/login', (req, res) => {
    const authUrl = `https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
    res.redirect(authUrl);
});

app.get('/auth/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Código de autorização não encontrado.");

    try {
        const response = await axios.post(`${ML_API_BASE}/oauth/token`, null, {
            params: {
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                redirect_uri: REDIRECT_URI
            }
        });

        const { access_token, refresh_token, user_id } = response.data;

        secureDatabase[user_id] = {
            access_token_encrypted: encryptToken(access_token),
            refresh_token_encrypted: encryptToken(refresh_token)
        };

        console.log(`[INFO] Seller ${user_id} autenticado com sucesso. Tokens criptografados.`);
        res.send(`<h2>Autenticação realizada com sucesso para o usuário ${user_id}!</h2><p>Você já pode fechar esta aba e retornar ao painel Adorê.</p>`);
    } catch (error) {
        console.error("[ERROR] Falha ao trocar code por token:", error.response?.data || error.message);
        res.status(500).send("Erro ao processar autenticação OAuth.");
    }
});

app.post('/api/kits/search', async (req, res) => {
    const { sellerId, searchText, mainProductId, addedProducts } = req.body;
    
    if (!secureDatabase[sellerId]) {
        return res.status(401).json({ error: "Seller não autenticado ou tokens não encontrados." });
    }

    try {
        const accessToken = decryptToken(secureDatabase[sellerId].access_token_encrypted);
        const endpoint = `${ML_API_BASE}/users/${sellerId}/kits/components/search?searchText=${encodeURIComponent(searchText)}&limit=10`;
        
        const payload = { active_channels: ["marketplace"] };
        if (mainProductId) {
            payload.main_product_id = mainProductId;
            payload.added_products = addedProducts || [];
            payload.search_filters = { only_eligible: "ONLY_ELIGIBLE" };
        }

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error("[ERROR] Erro ao buscar componentes:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.post('/api/kits/create', async (req, res) => {
    const { sellerId, familyName, thumbnailId, listingTypeId, components, price, discount } = req.body;

    if (!secureDatabase[sellerId]) {
        return res.status(401).json({ error: "Seller não autenticado." });
    }

    try {
        const accessToken = decryptToken(secureDatabase[sellerId].access_token_encrypted);
        const endpoint = `${ML_API_BASE}/items/kits`;

        const formattedComponents = components.map(comp => ({
            type: "user_product",
            user_product_id: comp.user_product_id,
            quantity: comp.quantity,
            automatic_price: discount !== undefined && discount !== null ? { discount: discount } : null
        }));

        const payload = {
            family_name: familyName,
            channels: ["marketplace"],
            thumbnail: { id: thumbnailId },
            currency_id: "BRL",
            listing_type_id: listingTypeId,
            bundle: {
                type: "kit",
                components: formattedComponents
            }
        };

        if (price && (!discount && discount !== 0)) {
            payload.price = price;
        }

        const response = await axios.post(endpoint, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            }
        });

        res.status(201).json(response.data);
    } catch (error) {
        console.error("[ERROR] Erro ao criar kit virtual:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || error.message });
    }
});

app.listen(PORT, () => {
    console.log(`[INFO] Servidor da API Adorê rodando na porta ${PORT}`);
    console.log(`[INFO] Credenciais carregadas para Client ID: ${CLIENT_ID}`);
});