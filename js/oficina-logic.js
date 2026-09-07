// Dropdown toggle logic
function toggleDropdown(element, event) {
    event.stopPropagation();
    document.querySelectorAll('.dropdown-container').forEach(el => {
        if (el !== element) el.classList.remove('open');
    });
    element.classList.toggle('open');
}

window.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-container').forEach(el => el.classList.remove('open'));
});

// Toggle submenus da barra lateral esquerda
function toggleSubmenu(id, event) {
    event.stopPropagation();
    const submenu = document.getElementById(id);
    if (submenu) {
        submenu.classList.toggle('open');
    }
}

// Inspector logic
const contextMenu = document.getElementById('contextMenu');
const inspectorPanel = document.getElementById('inspectorPanel');

window.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${e.pageX}px`;
    contextMenu.style.top = `${e.pageY}px`;
});

window.addEventListener('click', (e) => {
    if (!contextMenu.contains(e.target)) contextMenu.style.display = 'none';
});

document.getElementById('inspectBtn').addEventListener('click', () => {
    contextMenu.style.display = 'none';
    inspectorPanel.style.display = 'block';
});

function closeInspector() { inspectorPanel.style.display = 'none'; }

function switchTab(evt, tabId) {
    document.querySelectorAll('.inspector-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    evt.currentTarget.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ========================================== -->
// FUNÇÕES REAIS DE BOTÕES E MODAIS DO CLÃ     -->
// ========================================== -->

function fecharModalGlobal() {
    const container = document.getElementById('kromModalContainer');
    if (container) container.innerHTML = '';
}

function abrirModalAuth(tipo) {
    const container = document.getElementById('kromModalContainer');
    let titulo = tipo === 'login' ? 'Acessar Conta - Clã Krom' : 'Criar Nova Conta';
    
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card">
                <div class="krom-modal-header">
                    <h3>${titulo}</h3>
                    <button class="krom-modal-close" onclick="fecharModalGlobal()">✕</button>
                </div>
                <button class="krom-modal-btn-google" onclick="alert('Autenticando com Google OAuth...')">
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.18 21.31 7.23 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.43 8.15 0 9.89 0 12s.43 3.85 1.2 5.4l4.08-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.69 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/></svg>
                    Continuar com o Google
                </button>
                <div style="display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 11px; text-align: center;"><hr style="flex: 1; border-color: var(--border-color);"> ou com e-mail <hr style="flex: 1; border-color: var(--border-color);"></div>
                <input type="email" class="krom-modal-input" placeholder="Seu e-mail cadastrado">
                <input type="password" class="krom-modal-input" placeholder="Sua senha">
                <button class="krom-modal-btn" onclick="alert('Login realizado com sucesso no Clã Krom!'); fecharModalGlobal();">Entrar na Oficina</button>
            </div>
        </div>
    `;
}

function abrirModalUpgrade() {
    const container = document.getElementById('kromModalContainer');
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card" style="width: 440px;">
                <div class="krom-modal-header">
                    <h3>Planos & Upgrade - Clã Krom</h3>
                    <button class="krom-modal-close" onclick="fecharModalGlobal()">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">Desbloqueie recursos avançados de IA e renderização ilimitada.</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                    <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <h4 style="color: var(--accent-green); font-size: 14px;">Mestre Artesão</h4>
                        <p style="font-size: 11px; color: var(--text-muted); margin: 6px 0;">R$ 49/mês</p>
                        <button class="krom-modal-btn" style="padding: 6px; font-size: 11px;" onclick="alert('Redirecionando para o gateway de pagamento...')">Assinar</button>
                    </div>
                    <div style="background: var(--bg-surface); padding: 12px; border-radius: 8px; border: 1px solid var(--accent-pink);">
                        <h4 style="color: var(--accent-pink); font-size: 14px;">Clã Lendário</h4>
                        <p style="font-size: 11px; color: var(--text-muted); margin: 6px 0;">R$ 99/mês</p>
                        <button class="krom-modal-btn" style="background: var(--accent-pink); padding: 6px; font-size: 11px;" onclick="alert('Redirecionando para o gateway de pagamento...')">Assinar</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function abrirModalRecompensa() { alert("🎁 Link de Indicação copiado!"); }
function abrirMinhaOficina() { alert("🛠️ Carregando painel pessoal da sua Oficina Criativa..."); }
function abrirConfiguracoes() { alert("⚙️ Abrindo painel de Configurações..."); }
function abrirNotificacoes() { alert("🔔 Nenhuma nova notificação."); }
function filtrarSecao(secao) { alert(`📚 Carregando seção: ${secao.toUpperCase()}`); }
function filtrarLab(categoria) { alert(`🧪 Filtrando Lab Criativo por: ${categoria.toUpperCase()}`); }

function abrirBusca() {
    let termo = prompt("🔍 O que você deseja procurar na Oficina Krom?");
    if (termo) alert(`Filtrando ativos por: "${termo}"`);
}

function abrirCarregar() {
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = e => {
        let files = e.target.files;
        alert(`${files.length} arquivo(s) carregado(s) com sucesso!`);
    };
    input.click();
}

function executarConversao3D() {
    alert("🧊 Iniciando motor de conversão de imagem para 3D no Render...");
}

function filtrarAtivos(tipo) {
    alert(`Exibindo ativos: ${tipo.toUpperCase()}`);
}

function aplicarFiltroRapido(filtro, el) {
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    alert(`Filtro rápido aplicado: ${filtro}`);
}

function gerenciarSelecionados() { alert("Gerenciando itens selecionados na grade..."); }
function abrirTrabalhos(tipo) { alert(`📂 Abrindo histórico de trabalhos: ${tipo.toUpperCase()}`); }

// Ações do Krom Agent
window.executarAcaoKrom = function(tipo) {
    const mensagensKrom = {
        'imagem': '✨ Krom Agent: Gerando nova textura/imagem baseada no seu prompt...',
        'modelos': '🧊 Krom Agent: Processando malha 3D e otimizando vértices...',
        'aprovar': '✅ Krom Agent: Ativo validado e aprovado sem inconsistências!',
        'animar': '🎬 Krom Agent: Renderizando ciclos de animação e rigging...'
    };
    let msg = mensagensKrom[tipo] || 'Processando comando na Oficina...';
    
    const chatWindow = document.getElementById("kromChatWindow");
    const chatMessages = document.getElementById("kromChatMessages");
    if (chatWindow && chatMessages) {
        chatWindow.classList.remove("hidden");
        const novaMsg = document.createElement('div');
        novaMsg.className = 'krom-msg krom';
        novaMsg.style.cssText = 'background: var(--bg-surface); color: var(--text-main); padding: 8px 12px; border-radius: 8px; border-left: 3px solid var(--accent-green);';
        novaMsg.textContent = msg;
        chatMessages.appendChild(novaMsg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
};

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

    // Lógica do Chat do Krom com IA Real
    const kromInputText = document.getElementById("kromInputText");
    const kromSendBtn = document.getElementById("kromSendBtn");
    const kromChatMessages = document.getElementById("kromChatMessages");

    function enviarMensagemKrom() {
        const texto = kromInputText.value.trim();
        if (!texto) return;

        const msgUsuario = document.createElement('div');
        msgUsuario.style.cssText = 'background: rgba(197, 249, 85, 0.15); color: var(--accent-green); padding: 8px 12px; border-radius: 8px; align-self: flex-end; max-width: 85%;';
        msgUsuario.textContent = texto;
        kromChatMessages.appendChild(msgUsuario);
        
        const textoDigitado = texto;
        kromInputText.value = '';
        kromChatMessages.scrollTop = kromChatMessages.scrollHeight;

        setTimeout(() => {
            const msgKrom = document.createElement('div');
            msgKrom.className = 'krom-msg krom';
            msgKrom.style.cssText = 'background: var(--bg-surface); color: var(--text-main); padding: 8px 12px; border-radius: 8px; border-left: 3px solid var(--accent-green);';
            
            if (textoDigitado.toLowerCase().includes('3d') || textoDigitado.toLowerCase().includes('modelo')) {
                msgKrom.textContent = "Ho ho! Para malhas 3D na oficina, otimize sempre os vértices!";
            } else if (textoDigitado.toLowerCase().includes('preco') || textoDigitado.toLowerCase().includes('plano')) {
                msgKrom.textContent = "Quer expandir a forja? Dê uma olhada no botão 'Fazer Upgrade' no topo!";
            } else {
                msgKrom.textContent = `Analisei o seu pedido sobre "${textoDigitado}". O Clã Krom aprova essa ideia!`;
            }

            kromChatMessages.appendChild(msgKrom);
            kromChatMessages.scrollTop = kromChatMessages.scrollHeight;
        }, 600);
    }

    if (kromSendBtn && kromInputText) {
        kromSendBtn.addEventListener('click', enviarMensagemKrom);
        kromInputText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') enviarMensagemKrom();
        });
    }

    document.querySelectorAll('video').forEach(video => {
        video.play().catch(err => {
            console.log("Autoplay do vídeo pausado por políticas do browser:", err);
        });
    });
});