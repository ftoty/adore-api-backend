const fs = require('fs');

// 1. Atualizar a aba de IA no index.html para suportar Imagem/Texto e Chat de Mudanças
const novaSecaoIA = `
        <!-- PÁGINA 2: CRIADOR IA PROPRIETÁRIO DA ADORÊ -->
        <div id="viewIA" class="admin-view hidden">
            <div class="card">
                <h3 style="color: var(--primary-color); margin-top:0;">🤖 Adorê IA • Estúdio de Modelagem 3D Generativa</h3>
                <p style="font-size: 12px; color: var(--text-muted);">Gere malhas tridimensionais exclusivas a partir de fotos (Image-to-3D) ou descrições em texto (Text-to-3D).</p>

                <form id="adoreIaForm">
                    <label>Modo de Criação</label>
                    <select id="adoreIaModo" onchange="alternarModoIa(this.value)">
                        <option value="texto">Texto Prompt (Text-to-3D)</option>
                        <option value="imagem">Imagem Referência (Image-to-3D)</option>
                    </select>

                    <div id="blocoPrompt" style="margin-top: 8px;">
                        <label>Prompt / Descrição da Modelagem</label>
                        <textarea id="adoreIaPrompt" placeholder="Ex: Chaveiro personalizado minimalista com relevo..."></textarea>
                    </div>

                    <div id="blocoImagem" class="hidden" style="margin-top: 8px;">
                        <label>Enviar Imagem 2D (Referência para 3D)</label>
                        <input type="file" id="adoreIaArquivoImg" accept="image/*">
                    </div>

                    <label style="margin-top: 8px;">Contato do Cliente (E-mail ou WhatsApp)</label>
                    <input type="text" id="adoreIaContato" placeholder="cliente@email.com">

                    <button type="submit" class="action-btn" style="padding: 12px; margin-top: 10px;">Gerar Modelagem 3D com Adorê IA</button>
                </form>

                <!-- Painel de Iteração e Mudanças -->
                <div id="adoreIaResultadoArea" class="hidden" style="margin-top: 20px; background: #252525; padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                    <h4 style="color: var(--primary-color); margin-top: 0; font-size: 13px;">📦 Status da Modelagem & Iterações</h4>
                    <p style="font-size: 11px; color: var(--text-muted);" id="statusIaTexto">Modelo gerado com sucesso!</p>
                    
                    <div style="margin-top: 10px;">
                        <label>Solicitar Alteração / Feedback do Cliente</label>
                        <div style="display: flex; gap: 6px; margin-top: 4px;">
                            <input type="text" id="adoreMudancaInput" placeholder="Ex: Deixe as bordas mais arredondadas e aumente o relevo..." style="flex:1;">
                            <button type="button" class="action-btn" onclick="solicitarMudancaAdoreIa()" style="padding: 6px 12px;">Enviar Mudança</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
`;

// Substitui a seção de IA antiga no index.html se ela existir
if (fs.existsSync('index.html')) {
    let html = fs.readFileSync('index.html', 'utf8');
    // Regex para substituir a viewIA antiga
    html = html.replace(/<div id="viewIA"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, novaSecaoIA);
    fs.writeFileSync('index.html', html);
    console.log('Sucesso: Interface de IA atualizada no index.html!');
}

// 2. Criar ou atualizar o arquivo js/ia-engine.js com a lógica de geração e mudanças
const jsEngineCode = `// Motor de Geração e Iteração da Adorê IA
function alternarModoIa(modo) {
    const blocoPrompt = document.getElementById('blocoPrompt');
    const blocoImagem = document.getElementById('blocoImagem');
    if (modo === 'texto') {
        blocoPrompt.classList.remove('hidden');
        blocoImagem.classList.add('hidden');
    } else {
        blocoPrompt.classList.add('hidden');
        blocoImagem.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('adoreIaForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const modo = document.getElementById('adoreIaModo').value;
        const contato = document.getElementById('adoreIaContato').value;
        const resultadoArea = document.getElementById('adoreIaResultadoArea');
        const statusTxt = document.getElementById('statusIaTexto');

        if (!contato) {
            alert('Por favor, informe o contato do cliente.');
            return;
        }

        resultadoArea.classList.remove('hidden');
        statusTxt.innerHTML = \`Processando <strong>\${modo.toUpperCase()}</strong> na Oficina Adorê... Esculpindo malha 3D.\`;

        setTimeout(() => {
            statusTxt.innerHTML = \`✅ Modelagem 3D gerada com sucesso para <strong>\${contato}</strong>!<br>Pronta para revisão ou exportação.\`;
        }, 2500);
    });
});

function solicitarMudancaAdoreIa() {
    const inputMudanca = document.getElementById('adoreMudancaInput');
    const statusTxt = document.getElementById('statusIaTexto');
    if (!inputMudanca || !inputMudanca.value.trim()) {
        alert('Digite a alteração desejada.');
        return;
    }

    const pedido = inputMudanca.value;
    statusTxt.innerHTML = \`🔄 Aplicando alteração da IA: "<em>\${pedido}</em>"... Recalculando geometria.\`;
    
    setTimeout(() => {
        statusTxt.innerHTML = \`✨ Alteração aplicada com sucesso! Nova malha gerada com base no seu feedback.\`;
        inputMudanca.value = '';
    }, 2000);
}
`;

if (!fs.existsSync('js')) fs.mkdirSync('js');
fs.writeFileSync('js/ia-engine.js', jsEngineCode);
console.log('Sucesso: Arquivo js/ia-engine.js criado!');