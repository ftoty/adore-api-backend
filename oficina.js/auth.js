// ==========================================
// MÓDULO DE AUTENTICAÇÃO E RECUPERAÇÃO (Supabase)
// ==========================================

const SUPABASE_URL = "https://mlfgluwcuzddwijffrbe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZmdsdXdjdXpkZHdpamZmcmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDg0ODYsImV4cCI6MjEwNDAyNDQ4Nn0.8U4Df4fQg1fa0ceowGndkE3c06hMUMKjqL0ceZhTNR0"; 

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

document.addEventListener('DOMContentLoaded', () => {
    verificarSessaoAtiva();
    tratarRecuperacaoSenhaURL();

    // Eventos estáticos do DOM (caso existam na página principal)
    const abrirModalBtn = document.getElementById('abrirModalRegistoBtn');
    const fecharModalBtn = document.getElementById('fecharModalBtn');
    const modal = document.getElementById('modalPrimeiroAcesso');
    const formRegisto = document.getElementById('formPrimeiroAcesso');
    const loginForm = document.getElementById('loginForm');

    // Gerir modal estático de primeiro acesso
    abrirModalBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        modal?.classList.remove('hidden');
    });

    fecharModalBtn?.addEventListener('click', () => {
        modal?.classList.add('hidden');
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // Submissão do Registo estático
    formRegisto?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('regNome')?.value || '';
        const email = document.getElementById('regEmail')?.value;
        const telefone = document.getElementById('regTelefone')?.value || '';
        const cargo = document.getElementById('regCargo')?.value || 'user';
        const senha = document.getElementById('regSenha')?.value;
        const regErro = document.getElementById('regErro');

        if (regErro) regErro.innerText = "A criar conta...";
        if (!supabaseClient) return alert("Erro: Supabase não configurado.");

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: { role: 'admin', full_name: nome, phone: telefone, cargo: cargo }
            }
        });

        if (error) {
            if (regErro) regErro.innerText = "Erro: " + error.message;
        } else {
            alert("Conta criada com sucesso! Podes fazer login agora.");
            modal?.classList.add('hidden');
            formRegisto.reset();
            if (regErro) regErro.innerText = "";
        }
    });

    // Submissão do Login normal estático
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;
        const erroDiv = document.getElementById('loginErro');
        
        if (erroDiv) erroDiv.innerText = "A entrar...";

        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

        if (error) {
            if (erroDiv) erroDiv.innerText = "Credenciais inválidas: " + error.message;
        } else {
            verificarPermissaoAdmin(data.user);
        }
    });

    // Botão de Logout global
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        if (supabaseClient) await supabaseClient.auth.signOut();
        window.location.reload();
    });
});

// ==========================================
// INTEGRAÇÃO COM MODAL DINÂMICO DA OFICINA
// ==========================================

function abrirModalAuth(tipo) {
    const container = document.getElementById('kromModalContainer');
    if (!container) return;

    let titulo = tipo === 'login' ? 'Acessar Oficina Adorê' : 'Criar Conta na Oficina';

    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card" style="width: 400px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">${titulo}</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">Entre para sincronizar seus projetos e modelos 3D na nuvem.</p>
                
                <!-- Botão Google OAuth -->
                <button onclick="loginComGoogle()" style="background: #fff; color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; width: 100%;">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.95H1.2v3.15C3.18 21.31 7.23 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.25c-.25-.72-.38-1.49-.38-2.25s.13-1.53.38-2.25V6.6H1.2C.43 8.15 0 9.89 0 12s.43 3.85 1.2 5.4l4.08-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.23 0 3.18 2.69 1.2 6.6l4.08 3.15c.95-2.84 3.6-4.95 6.72-4.95z"/></svg>
                    Continuar com o Google
                </button>

                <div style="display: flex; align-items: center; gap: 10px; color: var(--text-muted); font-size: 11px; text-align: center;">
                    <hr style="flex: 1; border-color: var(--border-color);"> ou com e-mail <hr style="flex: 1; border-color: var(--border-color);">
                </div>

                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="email" id="authEmail" placeholder="Seu e-mail" style="background: var(--bg-base); border: 1px solid var(--border-color); color: white; padding: 9px; border-radius: 6px; font-size: 12px; outline: none;">
                    <input type="password" id="authSenha" placeholder="Sua senha" style="background: var(--bg-base); border: 1px solid var(--border-color); color: white; padding: 9px; border-radius: 6px; font-size: 12px; outline: none;">
                    <button onclick="executarLoginDinamico()" style="background: var(--accent-green); color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; width: 100%;">Entrar na Oficina</button>
                    <div id="authModalErro" style="color: #ff5555; font-size: 11px; text-align: center;"></div>
                </div>
            </div>
        </div>
    `;
}

// Função de Login via Google OAuth
async function loginComGoogle() {
    if (!supabaseClient) return alert("Supabase não configurado.");
    const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
    });
    if (error) alert("Erro ao autenticar com Google: " + error.message);
}

// Função de Login via E-mail acionada pelo modal dinâmico
async function executarLoginDinamico() {
    const email = document.getElementById('authEmail')?.value;
    const senha = document.getElementById('authSenha')?.value;
    const erroDiv = document.getElementById('authModalErro');

    if (!email || !senha) {
        if (erroDiv) erroDiv.innerText = "Preencha o e-mail e a senha.";
        return;
    }

    if (erroDiv) erroDiv.innerText = "A autenticar...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password: senha });

    if (error) {
        if (erroDiv) erroDiv.innerText = "Erro: " + error.message;
    } else {
        alert("Login efetuado com sucesso na Oficina Adorê!");
        fecharModalGlobal();
        verificarPermissaoAdmin(data.user);
    }
}

// ==========================================
// TRATAMENTO DE RECUPERAÇÃO E SESSÃO
// ==========================================

async function tratarRecuperacaoSenhaURL() {
    if (!supabaseClient) return;

    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code || (hash && hash.includes('type=recovery'))) {
        if (code) {
            const { error } = await supabaseClient.auth.exchangeCodeForSession(code);
            if (error) {
                console.error("Erro ao trocar código por sessão:", error.message);
                return;
            }
        }

        const novaSenha = prompt("Redefinição de Senha • Oficina Adorê\nInsira a sua nova senha (mínimo 6 caracteres):");
        if (novaSenha && novaSenha.length >= 6) {
            const { error: updateError } = await supabaseClient.auth.updateUser({ password: novaSenha });
            if (updateError) {
                alert("Erro ao atualizar senha: " + updateError.message);
            } else {
                alert("Senha redefinida com sucesso! Faça login com a nova senha.");
                window.location.href = window.location.pathname; 
            }
        } else if (novaSenha !== null) {
            alert("A senha deve ter pelo menos 6 caracteres.");
        }
    }
}

async function verificarSessaoAtiva() {
    if (!supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
        verificarPermissaoAdmin(session.user);
    }
}

function verificarPermissaoAdmin(user) {
    const metadata = user.user_metadata || {};
    const emailUser = user.email || "";
    
    const isPermitido = metadata.role === 'admin' || emailUser.endsWith('@adore.com') || emailUser === "admin@adore.com" || user.id;

    if (isPermitido) {
        // Atualiza o botão "Entrar" no topo para exibir o e-mail logado
        atualizarInterfaceUsuario(user);

        // Revelar o painel, a barra lateral e o Krom se existirem IDs na página
        document.getElementById('loginSection')?.classList.add('hidden');
        document.getElementById('modalPrimeiroAcesso')?.classList.add('hidden');
        document.getElementById('sidebarNav')?.classList.remove('hidden');
        document.getElementById('mainContent')?.classList.remove('hidden');
        document.getElementById('kromFloatingWidget')?.classList.remove('hidden');
        
        const welcome = document.getElementById('userWelcomeTitle');
        if (welcome) {
            const nomeExibicao = metadata.full_name || emailUser.split('@')[0];
            welcome.innerText = nomeExibicao.toUpperCase();
        }

        if (typeof carregarProdutosVitrine === 'function') carregarProdutosVitrine();
        if (typeof carregarCategoriasSelect === 'function') carregarCategoriasSelect();
    } else {
        const erroDiv = document.getElementById('loginErro');
        if (erroDiv) erroDiv.innerText = "Acesso negado: Conta sem privilégios.";
        supabaseClient.auth.signOut();
    }
}

function atualizarInterfaceUsuario(user) {
    const topoControles = document.querySelector('.top-right-controls');
    if (!topoControles) return;

    const btnEntrar = topoControles.querySelector('button[onclick*="abrirModalAuth"]');
    if (btnEntrar) btnEntrar.remove();

    let userBadge = document.getElementById('userProfileBadge');
    if (!userBadge) {
        userBadge = document.createElement('div');
        userBadge.id = 'userProfileBadge';
        userBadge.style.cssText = 'background: var(--bg-card); border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 20px; font-size: 11px; display: flex; align-items: center; gap: 8px; color: var(--accent-green); cursor: pointer;';
        userBadge.title = 'Clique para Sair';
        userBadge.onclick = async () => {
            if (supabaseClient) await supabaseClient.auth.signOut();
            window.location.reload();
        };
        userBadge.innerHTML = `👤 ${user.email.split('@')[0]} <span style="font-size: 9px; color: var(--text-muted);">(Sair)</span>`;
        topoControles.insertBefore(userBadge, topoControles.firstChild);
    }
}