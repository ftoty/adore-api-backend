// ==========================================
// MÓDULO DE PAGAMENTOS E CRÉDITOS (Mercado Pago)
// ==========================================

// Função acionada quando o usuário clica em assinar ou comprar créditos na Oficina Adorê
async function iniciarPagamentoMercadoPago(planoNome, valorPreco) {
    // 1. Verifica se o usuário está logado no Supabase
    if (!window.supabaseClient) {
        alert("Erro: Sistema de sessão não inicializado.");
        return;
    }

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        alert("Por favor, faça login na Oficina Adorê antes de realizar um upgrade.");
        if (typeof abrirModalAuth === 'function') abrirModalAuth('login');
        return;
    }

    console.log(`Iniciando pagamento para ${planoNome} no valor de R$ ${valorPreco} para o usuário ${user.email}`);

    // 2. Simulação ou Chamada real para criar a Preferência no Mercado Pago
    // (Em produção, isso chama sua API/Backend que interage com o SDK do Mercado Pago)
    try {
        // Exemplo de link de Checkout Pro gerado pelo Mercado Pago
        // Nota: Substitua pelo endpoint real da sua API backend que gera a preferência
        const linkCheckoutSimulado = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=exemplo_pref_${Date.now()}`;
        
        // Se preferir abrir em nova aba ou redirecionar na mesma janela:
        if (confirm(`Deseja prosseguir para o ambiente seguro do Mercado Pago para assinar o plano [${planoNome}] por R$ ${valorPreco},00?`)) {
            window.open(linkCheckoutSimulado, '_blank');
        }
    } catch (error) {
        console.error("Erro ao iniciar pagamento:", error);
        alert("Não foi possível iniciar o checkout no momento. Tente novamente.");
    }
}

// Vincula os botões de upgrade existentes no HTML para disparar o Mercado Pago
document.addEventListener("DOMContentLoaded", () => {
    // Exemplo: se houver um botão de plano mestre nos modais
    window.assinarPlanoMestre = function() {
        iniciarPagamentoMercadoPago("Mestre Artesão Adorê", 89.00);
        <button onclick="assinarPlanoMestre()" style="background: var(--accent-green); color: #000; ...">Assinar com Mercado Pago</button>
    };
});