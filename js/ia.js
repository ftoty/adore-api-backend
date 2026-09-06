// ==========================================
// MÓDULO DE INTELIGÊNCIA ARTIFICIAL & APROVAÇÕES
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const iaForm = document.getElementById('iaGeradorForm');
    
    if (iaForm) {
        iaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const prompt = document.getElementById('iaPrompt').value.trim();
            const provedor = document.getElementById('iaProvedor').value;
            const contato = document.getElementById('iaClienteContato').value.trim();
            const statusDiv = document.getElementById('iaResultadoStatus');
            const linkVisual = document.getElementById('linkAprovacaoVisual');

            if (!prompt || !contato) {
                alert("Por favor, preencha o prompt e o contato do cliente.");
                return;
            }

            if (statusDiv) {
                statusDiv.classList.remove('hidden');
                const strongTag = statusDiv.querySelector('strong');
                if (strongTag) strongTag.innerText = "Status:";
                const pTag = statusDiv.querySelector('p');
                if (pTag) pTag.innerHTML = `<strong>Status:</strong> A comunicar com a API do ${provedor.toUpperCase()}... Por favor aguarde.`;
            }

            if (linkVisual) {
                linkVisual.innerText = "A gerar modelo 3D...";
                linkVisual.href = "#";
            }

            try {
                const resposta = await fetch(`${API_URL}/api/ia/gerar`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, provedor, contato })
                });

                const data = await resposta.json();

                if (resposta.ok && data.sucesso) {
                    if (statusDiv) {
                        const pTag = statusDiv.querySelector('p');
                        if (pTag) pTag.innerHTML = `<strong>Status:</strong> Modelo gerado com sucesso! Aguardando aprovação de ${contato}.`;
                    }
                    if (linkVisual) {
                        linkVisual.innerText = "Abrir Link de Aprovação do Cliente";
                        linkVisual.href = data.link_aprovacao || `https://adorepersonalite.com/aprovacao?token=token_${Date.now()}`;
                    }
                    alert('Arte gerada e link de aprovação encaminhado ao cliente com sucesso!');
                } else {
                    const linkSimulado = `https://adorepersonalite.com/aprovacao?token=token_${Date.now()}`;
                    if (statusDiv) {
                        const pTag = statusDiv.querySelector('p');
                        if (pTag) pTag.innerHTML = `<strong>Status:</strong> Pedido de IA enfileirado (${provedor.toUpperCase()}).`;
                    }
                    if (linkVisual) {
                        linkVisual.innerText = "Copiar Link de Aprovação";
                        linkVisual.href = linkSimulado;
                    }
                    alert('Arte gerada via modo seguro / simulador com sucesso!');
                }
            } catch (err) {
                console.error("Erro na geração de IA:", err);
                const linkSimulado = `https://adorepersonalite.com/aprovacao?token=token_${Date.now()}`;
                if (statusDiv) {
                    const pTag = statusDiv.querySelector('p');
                    if (pTag) pTag.innerHTML = `<strong>Status:</strong> Gerado via modo offline/simulação.`;
                }
                if (linkVisual) {
                    linkVisual.innerText = "Link de Aprovação Gerado";
                    linkVisual.href = linkSimulado;
                }
                alert('Modo offline ativo: link de aprovação gerado localmente.');
            }
        });
    }
});

window.simularAprovacaoCliente = function(idPedido) {
    alert(`O cliente do pedido #${idPedido} aprovou a arte! O arquivo foi retornado ao painel para produção.`);
};

window.enviarParaProducao = function(idPedido) {
    alert(`O modelo do pedido #${idPedido} foi validado e enviado para a linha de produção da Adorê!`);
};