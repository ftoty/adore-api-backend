const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// 1. Rota para gerar o link de pagamento/upgrade para o usuário
async function createCheckoutSession(req, res) {
    try {
        const { userId, priceId } = req.body; // priceId vem do painel do Stripe (ex: ID do plano Pro ou Créditos)

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId, // Identificador do produto/plano no Stripe
                    quantity: 1,
                },
            ],
            mode: 'subscription', // ou 'payment' se for compra única de créditos
            metadata: { userId },
            success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
        });

        return res.status(200).json({ checkoutUrl: session.url });
    } catch (error) {
        console.error('Erro ao criar sessão de checkout:', error);
        return res.status(500).json({ error: 'Erro ao processar pagamento.' });
    }
}

// 2. Webhook: Confirmação automática enviada pelo Stripe após o pagamento aprovado
async function handleStripeWebhook(req, res) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
        // Valida se a requisição veio realmente do Stripe
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = session.metadata.userId;

        // AQUI VOCÊ ATUALIZA O BANCO DE DADOS DO SEU HUB:
        // Exemplo: await database.users.update({ plan: 'pro', credits: 1000 }, { where: { id: userId } });
        console.log(`Pagamento confirmado! Usuário ${userId} atualizado para o plano Pro.`);
    }

    res.json({ received: true });
}

module.exports = { createCheckoutSession, handleStripeWebhook };