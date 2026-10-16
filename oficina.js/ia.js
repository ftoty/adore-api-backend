// ==========================================
// MÓDULO DE INTELIGÊNCIA ARTIFICIAL & APROVAÇÕES
// ==========================================

const IA_API_URL = window.ADORE_API_URL ||
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000'
        : 'https://adore-api-backend.onrender.com');

document.addEventListener('DOMContentLoaded', () => {
    const iaForm = document.getElementById('iaGeradorForm');
    
    if (iaForm) {
        iaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await processarGeracaoIAForm();
        });
    }
});

// Função chamada pelo botão central "Gerar modelo" do estúdio 3D
function executarConversao3D() {
    const promptModal = prompt("Descreva o modelo 3D que deseja gerar:");
    if (!promptModal) return;
    dispararGeracaoIA(promptModal);
}

async function chamarApiMeshy(caminho, opcoes = {}) {
    const resposta = await fetch(`${IA_API_URL}${caminho}`, opcoes);
    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok || !dados?.success) {
        throw new Error(dados?.message || `Falha na API de modelagem (HTTP ${resposta.status}).`);
    }
    return dados;
}

async function dispararGeracaoIA(prompt) {
    const statusDiv = document.getElementById('iaResultadoStatus');
    const statusTexto = document.getElementById('iaResultadoTexto');
    const arquivoDiv = document.getElementById('iaResultadoArquivo');
    const linkVisual = document.getElementById('linkAprovacaoVisual');
    const botao = document.querySelector('#iaGeradorForm button[type="submit"]');
    statusDiv?.classList.remove('hidden');
    arquivoDiv?.classList.add('hidden');
    if (linkVisual) linkVisual.removeAttribute('href');
    if (botao) botao.disabled = true;
    if (statusTexto) statusTexto.textContent = 'Enviando a descrição para o Meshy...';
    try {
        const tarefa = await chamarApiMeshy('/api/ia/3d/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: 'text', prompt })
        });
        if (statusTexto) statusTexto.textContent = `Tarefa ${tarefa.taskId} criada. Aguardando o Meshy...`;
        const inicio = Date.now();
        let resultado;
        while (Date.now() - inicio < 60 * 60 * 1000) {
            await new Promise((resolve) => window.setTimeout(resolve, 5000));
            resultado = await chamarApiMeshy(
                `/api/ia/3d/tasks/${encodeURIComponent(tarefa.taskId)}?mode=text`
            );
            if (statusTexto) {
                statusTexto.textContent = `Meshy: ${resultado.status} · ${Math.round(resultado.progress || 0)}%`;
            }
            if (resultado.status === 'SUCCEEDED') break;
            if (resultado.status === 'FAILED' || resultado.status === 'CANCELED') {
                throw new Error(resultado.message || `A geração terminou com status ${resultado.status}.`);
            }
        }
        if (!resultado || resultado.status !== 'SUCCEEDED') {
            throw new Error(`A geração segue em andamento. Guarde o identificador da tarefa: ${tarefa.taskId}.`);
        }
        const formato = ['glb', 'fbx', 'obj'].find((item) => /^https:\/\//i.test(resultado.modelUrls?.[item] || ''));
        if (!formato) {
            throw new Error('A tarefa terminou, mas o Meshy não retornou um link de modelo para baixar.');
        }
        linkVisual.href = resultado.modelUrls[formato];
        linkVisual.textContent = `Baixar modelo ${formato.toUpperCase()}`;
        arquivoDiv?.classList.remove('hidden');
        if (statusTexto) statusTexto.textContent = 'Modelo 3D gerado e disponível para download.';
    } catch (erro) {
        console.error('Falha na geração de modelo 3D:', erro);
        if (statusTexto) statusTexto.textContent = erro instanceof Error ? erro.message : 'Falha na geração do modelo 3D.';
    } finally {
        if (botao) botao.disabled = false;
    }
}

async function processarGeracaoIAForm() {
    const prompt = document.getElementById('iaPrompt')?.value.trim();
    const provedor = document.getElementById('iaProvedor')?.value;
    if (!prompt || prompt.length > 800) {
        alert("Informe uma descrição de até 800 caracteres.");
        return;
    }
    if (provedor !== 'meshy') {
        alert("Este servidor está configurado para o provedor Meshy.");
        return;
    }
    await dispararGeracaoIA(prompt);
}

window.simularAprovacaoCliente = function(idPedido) {
    alert(`O cliente do pedido #${idPedido} aprovou a arte! O arquivo foi retornado ao painel para produção.`);
};

window.enviarParaProducao = function(idPedido) {
    alert(`O modelo do pedido #${idPedido} foi validado e enviado para a linha de produção da Adorê!`);
};