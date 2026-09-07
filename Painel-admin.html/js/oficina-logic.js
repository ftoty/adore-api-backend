// Dropdown toggle logic profissional
function toggleDropdown(element, event) {
    event.stopPropagation();
    const isOpen = element.classList.contains('open');
    document.querySelectorAll('.dropdown-container').forEach(el => el.classList.remove('open'));
    if (!isOpen) element.classList.add('open');
}

window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-container').forEach(el => el.classList.remove('open'));
});

// Funções de Fechamento de Modais
function fecharModalGlobal() {
    const container = document.getElementById('kromModalContainer');
    if (container) container.innerHTML = '';
}

// ==========================================
// 1. FUNÇÕES DO TOPO (Comunidade e API)
// ==========================================
function abrirComunidade() {
    const container = document.getElementById('kromModalContainer');
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">Comunidade Clã Adorê</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">Conecte-se com criadores, compartilhe malhas 3D e participe dos desafios da forja.</p>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
                    <button onclick="window.open('https://discord.com', '_blank')" style="background: #5865F2; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">Discord Oficial do Clã</button>
                    <button onclick="window.open('https://github.com', '_blank')" style="background: #333; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">Repositório GitHub / Projetos</button>
                </div>
            </div>
        </div>
    `;
}

function abrirAPI() {
    const container = document.getElementById('kromModalContainer');
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">API & Integrações</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">Integre a engine 3D da Oficina Adorê com seu site ou e-commerce (Wix, Shopify):</p>
                <label style="font-size: 11px; color: var(--text-muted);">Sua Chave de API Ativa:</label>
                <input type="text" readonly value="adore_live_token_88392019482" style="background: var(--bg-base); color: var(--accent-green); border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; font-size: 11px; width: 100%; text-align: center;">
                <button onclick="alert('Chave de API copiada para a área de transferência!'); fecharModalGlobal();" style="background: var(--accent-green); color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">Copiar Chave</button>
            </div>
        </div>
    `;
}

// ==========================================
// 2. FUNÇÕES DO LABORATÓRIO CRIATIVO
// ==========================================
function filtrarLab(categoria) {
    const nomesLab = {
        'figurinhas': 'Gerador de Figurinhas 3D',
        'chaveiros': 'Modelador de Chaveiros Customizados',
        'utilidades': 'Laboratório de Utilidades Práticas',
        'sublimacao': 'Ferramenta de Preparação para Sublimação'
    };
    
    let titulo = nomesLab[categoria] || 'Laboratório Criativo';
    
    const container = document.getElementById('kromModalContainer');
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card" style="width: 440px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-pink); font-size: 16px;">🧪 ${titulo}</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">Carregue sua referência para este laboratório específico:</p>
                <div style="background: var(--bg-base); border: 2px dashed var(--border-color); padding: 20px; border-radius: 8px; text-align: center; cursor: pointer;" onclick="alert('Selecione o arquivo de referência...');">
                    <span style="font-size: 24px;">📁</span>
                    <p style="font-size: 12px; margin-top: 6px; color: var(--text-main);">Clique para enviar arquivo para ${categoria}</p>
                </div>
                <button onclick="alert('Processando item no ${categoria}...'); fecharModalGlobal();" style="background: linear-gradient(135deg, var(--accent-green), var(--accent-pink)); color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">Iniciar Processamento 3D</button>
            </div>
        </div>
    `;
}

// ==========================================
// 3. FUNÇÕES DE RECURSOS E SEÇÕES
// ==========================================
function filtrarSecao(secao) {
    const descricoesSecao = {
        'aprender': 'Central de Tutoriais e Manuais da Oficina Adorê',
        'programas': 'Softwares e Plugins compatíveis com a Engine',
        'plugins': 'Extensões oficiais para Blender, Unreal e Wix',
        'ferramentas': 'Utilitários avançados de malha e topologia'
    };
    
    alert(`📚 ${descricoesSecao[secao] || 'Carregando seção...'}`);
}

// ==========================================
// 4. PAINÉIS DE CONFIGURAÇÕES, NOTIFICAÇÕES E UPGRADE
// ==========================================
function abrirNotificacoes() {
    const container = document.getElementById('kromModalContainer');
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">Notificações Recentes</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <div style="background: var(--bg-surface); padding: 10px; border-radius: 6px; font-size: 12px; border-left: 3px solid var(--accent-green);">
                    <p style="color: var(--text-main); font-weight: bold;">Renderização Finalizada</p>
                    <p style="color: var(--text-muted); font-size: 11px;">O modelo "Esfera PBR" está disponível na sua biblioteca.</p>
                </div>
            </div>
        </div>
    `;
}

function abrirConfiguracoes() {
    const container = document.getElementById('kromModalContainer');
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">Configurações do Estúdio</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; font-size: 12px;">
                    <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" checked> Otimização automática de malha 3D</label>
                    <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" checked> Notificações de conclusão de render</label>
                    <label style="display: flex; align-items: center; gap: 8px;"><input type="checkbox"> Modo de economia de GPU</label>
                </div>
                <button onclick="alert('Configurações salvas com sucesso!'); fecharModalGlobal();" style="background: var(--accent-green); color: #000; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px;">Salvar Preferências</button>
            </div>
        </div>
    `;
}

function abrirModalUpgrade() {
    const container = document.getElementById('kromModalContainer');
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card" style="width: 420px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">Planos & Upgrade - Oficina Adorê</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">Escolha seu plano para desbloquear exportações ilimitadas em alta resolução.</p>
                <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--accent-green);">
                    <strong style="color: var(--accent-green); font-size: 14px;">Mestre Artesão Adorê</strong>
                    <p style="font-size: 11px; color: var(--text-muted); margin: 6px 0;">R$ 49/mês • Créditos ilimitados de IA • Prioridade na Fila</p>
                    <button onclick="assinarPlanoMestre()" style="background: var(--accent-green); color: #000; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; width: 100%;">Assinar com Mercado Pago</button>
                </div>
            </div>
        </div>
    `;
}

// Ferramentas da Esquerda
function selecionarFerramenta(ferramenta, event) {
    document.querySelectorAll('.tool-tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    console.log(`Ferramenta ativa no estúdio: ${ferramenta}`);
}

function executarConversao3D() {
    alert("✨ Oficina Adorê: Enviando referência para o motor de conversão 3D...");
}

function abrirCarregar() {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = e => {
        alert(`📁 ${e.target.files.length} arquivo(s) carregado(s) com sucesso na Oficina Adorê!`);
    };
    input.click();
}

// Inicialização do Chat Assistente da Oficina
document.addEventListener("DOMContentLoaded", () => {
    const avatarToggle = document.getElementById("kromAvatarToggle");
    const chatWindow = document.getElementById("kromChatWindow");
    const fecharChat = document.getElementById("fecharChatKrom");

    if (avatarToggle && chatWindow) {
        avatarToggle.addEventListener("click", () => {
            chatWindow.classList.toggle("hidden");
        });
    }

    if (fecharChat && chatWindow) {
        fecharChat.addEventListener("click", () => {
            chatWindow.classList.add("hidden");
        });
    }

    const kromInputText = document.getElementById("kromInputText");
    const kromSendBtn = document.getElementById("kromSendBtn");
    const kromChatMessages = document.getElementById("kromChatMessages");

    function enviarMensagemAssistente() {
        if (!kromInputText) return;
        const texto = kromInputText.value.trim();
        if (!texto) return;

        const msgUsuario = document.createElement('div');
        msgUsuario.style.cssText = 'background: rgba(197, 249, 85, 0.15); color: var(--accent-green); padding: 8px 12px; border-radius: 8px; align-self: flex-end; max-width: 85%;';
        msgUsuario.textContent = texto;
        kromChatMessages.appendChild(msgUsuario);
        
        kromInputText.value = '';
        kromChatMessages.scrollTop = kromChatMessages.scrollHeight;

        setTimeout(() => {
            const msgAssistente = document.createElement('div');
            msgAssistente.style.cssText = 'background: var(--bg-surface); color: var(--text-main); padding: 8px 12px; border-radius: 8px; border-left: 3px solid var(--accent-green);';
            msgAssistente.textContent = `Assistente Adorê: Entendido! Analisando parâmetros para "${texto}".`;
            kromChatMessages.appendChild(msgAssistente);
            kromChatMessages.scrollTop = kromChatMessages.scrollHeight;
        }, 500);
    }

    if (kromSendBtn && kromInputText) {
        kromSendBtn.addEventListener('click', enviarMensagemAssistente);
        kromInputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensagemAssistente();
        });
    }
});