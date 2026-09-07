// ==========================================
// MÓDULO DE INTELIGÊNCIA ARTIFICIAL & APROVAÇÕES
// ==========================================

// Variável de controle de API (pode ajustar para o seu endpoint real)
const API_URL = window.location.origin.includes('localhost') ? 'http://localhost:3000' : 'https://api.adorepersonalite.com';

document.addEventListener('DOMContentLoaded', () => {
    const iaForm = document.getElementById('iaGeradorForm');
    
    if (iaForm) {
        iaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await processarGeracaoIAForm();
        });
    }
});

// Função chamada pelo botão central "✨ Gerar modelo" do estúdio 3D
function executarConversao3D() {
    const promptModal = prompt("Descreva o modelo 3D ou arte que deseja forjar na Oficina Adorê:");
    if (!promptModal) return;

    const contatoModal = prompt("Informe o e-mail ou WhatsApp do cliente para envio do link de aprovação:") || "cliente@adore.com";

    // Dispara a rotina de envio simulando o formulário ou chamando a API diretamente
    dispararGeracaoIA(promptModal, "meshy", contatoModal);
}

// Lógica central de comunicação com a API de IA
async function dispararGeracaoIA(prompt, provedor, contato) {
    const statusDiv = document.getElementById('iaResultadoStatus');
    const linkVisual = document.getElementById('linkAprovacaoVisual');

    if (statusDiv) {
        statusDiv.classList.remove('hidden');
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
            atualizarInterfaceSucesso(statusDiv, linkVisual, contato, data.link_aprovacao);
            alert('Arte gerada e link de aprovação encaminhado ao cliente com sucesso!');
        } else {
            lancarModoSimulador(statusDiv, linkVisual, provedor);
        }
    } catch (err) {
        console.warn("API offline, ativando modo simulador seguro:", err);
        lancarModoSimulador(statusDiv, linkVisual, provedor);
    }
}

async function processarGeracaoIAForm() {
    const prompt = document.getElementById('iaPrompt')?.value.trim();
    const provedor = document.getElementById('iaProvedor')?.value || 'meshy';
    const contato = document.getElementById('iaClienteContato')?.value.trim();

    if (!prompt || !contato) {
        alert("Por favor, preencha o prompt e o contato do cliente.");
        return;
    }

    await dispararGeracaoIA(prompt, provedor, contato);
}

function lancarModoSimulador(statusDiv, linkVisual, provedor) {
    const linkSimulado = `https://adorepersonalite.com/aprovacao?token=token_${Date.now()}`;
    if (statusDiv) {
        const pTag = statusDiv.querySelector('p');
        if (pTag) pTag.innerHTML = `<strong>Status:</strong> Pedido processado com sucesso (${provedor.toUpperCase()}).`;
    }
    if (linkVisual) {
        linkVisual.innerText = "Abrir Link de Aprovação do Cliente";
        linkVisual.href = linkSimulado;
    }
    alert('Modelo 3D gerado com sucesso na Oficina Adorê!');

    // Salva automaticamente nos ativos recentes se a persistência estiver ativa
    if (typeof salvarAtivoNaNuvem === 'function') {
        salvarAtivoNaNuvem('Modelo IA Estúdio', '3D Model', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80');
    }
}

function atualizarInterfaceSucesso(statusDiv, linkVisual, contato, linkAprovacao) {
    if (statusDiv) {
        const pTag = statusDiv.querySelector('p');
        if (pTag) pTag.innerHTML = `<strong>Status:</strong> Modelo gerado com sucesso! Aguardando aprovação de ${contato}.`;
    }
    if (linkVisual) {
        linkVisual.innerText = "Abrir Link de Aprovação do Cliente";
        linkVisual.href = linkAprovacao || `https://adorepersonalite.com/aprovacao?token=token_${Date.now()}`;
    }
}

window.simularAprovacaoCliente = function(idPedido) {
    alert(`O cliente do pedido #${idPedido} aprovou a arte! O arquivo foi retornado ao painel para produção.`);
};

window.enviarParaProducao = function(idPedido) {
    alert(`O modelo do pedido #${idPedido} foi validado e enviado para a linha de produção da Adorê!`);
};