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
// 4. PAINÉIS DE CONFIGURAÇÕES, NOTIFICAÇÕES E UPGRADE (MERCADO PAGO)
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
            <div class="krom-modal-card" style="width: 460px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">Planos & Upgrade - Oficina Adorê</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 15px;">Escolha seu plano para desbloquear exportações ilimitadas em alta resolução.</p>
                
                <div style="background: var(--bg-surface); padding: 14px; border-radius: 8px; border: 1px solid var(--accent-green); margin-bottom: 15px;">
                    <strong style="color: var(--accent-green); font-size: 14px;">Mestre Artesão Adorê</strong>
                    <p style="font-size: 11px; color: var(--text-muted); margin: 6px 0;">R$ 49,00/mês • Créditos ilimitados de IA • Prioridade na Fila</p>
                    <button onclick="inicializarBrickMercadoPago()" style="background: var(--accent-green); color: #000; border: none; padding: 8px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 11px; width: 100%;">Prosseguir para Pagamento</button>
                </div>

                <!-- Container onde o Payment Brick do Mercado Pago será renderizado -->
                <div id="paymentBrick_container"></div>
            </div>
        </div>
    `;
}

async function inicializarBrickMercadoPago() {
    const containerBrick = document.getElementById('paymentBrick_container');
    if (!containerBrick) {
        console.error("Container paymentBrick_container não encontrado no DOM.");
        return;
    }

    containerBrick.innerHTML = '<div style="text-align:center; padding: 20px; font-size:12px; color:var(--text-muted);">Carregando painel de pagamento seguro...</div>';

    try {
        if (!window.MercadoPago) {
            throw new Error("SDK do Mercado Pago não foi injetado.");
        }

        const mp = new window.MercadoPago('APP_USR-fc44fd7b-f168-49bd-a726-0caaa44f098d', {
            locale: 'pt-BR'
        });

        const bricksBuilder = mp.bricks();

        const settings = {
            initialization: {
                amount: 49.00,
            },
            customization: {
                paymentMethods: {
                    creditCard: "all",
                    ticket: "all",
                    bankTransfer: "all",
                },
            },
            callbacks: {
                onReady: () => {
                    console.log("Payment Brick pronto e carregado.");
                },
                onSubmit: async ({ selectedPaymentMethod, formData }) => {
                    const { data: { user } } = await supabaseAppClient.auth.getUser();
                    if (!user) {
                        alert("Você precisa estar logado para assinar!");
                        abrirModalAuth('login');
                        return;
                    }

                    try {
                        const { data: paymentResult, error } = await supabaseAppClient.functions.invoke('processar-pagamento', {
                            body: { 
                                payment: formData, 
                                product: "mestre_artesao",
                                userId: user.id
                            }
                        });

                        if (error) throw error;

                        if (paymentResult.approved || paymentResult.status === "approved") {
                            alert("🎉 Assinatura realizada com sucesso!");
                            fecharModalGlobal();
                            window.location.reload();
                        } else if (paymentResult.status === "in_process" || paymentResult.status === "pending") {
                            alert("⏳ Pagamento pendente ou em análise.");
                            fecharModalGlobal();
                        } else {
                            alert("O pagamento não foi aprovado. Status: " + (paymentResult.status_detail || paymentResult.status));
                        }
                    } catch (err) {
                        console.error("Erro ao processar pagamento:", err);
                        alert("Erro de comunicação com o servidor de pagamentos.");
                    }
                },
                onError: (error) => {
                    console.error("Erro estrutural no Payment Brick:", error);
                },
            },
        };

        containerBrick.innerHTML = "";

        window.paymentBrickController = await bricksBuilder.create(
            "payment",
            "paymentBrick_container",
            settings
        );

    } catch (e) {
        console.error("Falha ao inicializar o Payment Brick:", e);
        containerBrick.innerHTML = '<p style="color: #ff4f50; text-align: center; font-size: 12px;">Erro ao carregar o meio de pagamento. Verifique sua conexão.</p>';
    }
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