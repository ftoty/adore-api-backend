import dotenv from "dotenv";
import express from "express";
import axios from "axios";
import crypto from "crypto";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const ML_API_BASE = "https://api.mercadolibre.com";
const ENCRYPTION_KEY = process.env.VAULT_ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const IV_LENGTH = 16;

const secureDatabase = {};

function encryptToken(text) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decryptToken(text) {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift(), "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

app.get("/auth/login", (req, res) => {
    const authUrl = "https://auth.mercadolibre.com.br/authorization?response_type=code&client_id=" + CLIENT_ID + "&redirect_uri=" + encodeURIComponent(REDIRECT_URI);
    res.redirect(authUrl);
});

app.get("/auth/callback", async (req, res) => {
    const code = req.query.code;
    if (!code) return res.status(400).send("Código não encontrado.");
    try {
        const response = await axios.post(ML_API_BASE + "/oauth/token", null, {
            params: { grant_type: "authorization_code", client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code: code, redirect_uri: REDIRECT_URI }
        });
        const { access_token, refresh_token, user_id } = response.data;
        secureDatabase[user_id] = { access_token_encrypted: encryptToken(access_token), refresh_token_encrypted: encryptToken(refresh_token) };
        res.send("<h2>Autenticação OK para o usuário " + user_id + "!</h2>");
    } catch (err) {
        res.status(500).send("Erro no OAuth.");
    }
});

app.listen(PORT, () => {
    console.log("[INFO] Servidor ES Module rodando na porta " + PORT);
});
