// ==========================================
// MÓDULO DE AUTENTICAÇÃO E RECUPERAÇÃO (Supabase)
// ==========================================

const authSupabaseClient = window.supabaseClient || (window.supabase
    ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null);
const PASSWORDLESS_ADMIN_EMAILS = [
    'ftoty.fernando@gmail.com',
    'adorepersonalite@gmail.com'
];

async function inicializarAutenticacao() {
    const loginErro = document.getElementById('loginErro');

    try {
        await tratarRecuperacaoSenhaURL();
        await verificarSessaoAtiva();
    } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
        if (loginErro) loginErro.textContent = 'Não foi possível validar a sessão. Recarregue a página.';
    }

    const abrirModalBtn = document.getElementById('abrirModalRegistoBtn');
    const fecharModalBtn = document.getElementById('fecharModalBtn');
    const modal = document.getElementById('modalPrimeiroAcesso');
    const formRegisto = document.getElementById('formPrimeiroAcesso');
    const loginForm = document.getElementById('loginForm');
    const inputEmailLogin = document.getElementById('loginEmail');
    const campoSenhaContainer = document.getElementById('campoSenhaContainer');
    const inputSenhaLogin = document.getElementById('loginSenha');
    const btnSubmitLogin = document.getElementById('btnSubmitLogin');
    const linkEsqueceuSenha = document.getElementById('linkEsqueceuSenha');
    const recuperarSenhaForm = document.getElementById('recuperarSenhaForm');
    const btnVoltarLogin = document.getElementById('btnVoltarLogin');

    function atualizarEstadoLogin() {
        const email = (inputEmailLogin?.value || '').trim().toLowerCase();
        const semSenha = PASSWORDLESS_ADMIN_EMAILS.includes(email);
        campoSenhaContainer?.classList.toggle('hidden', semSenha);
        if (inputSenhaLogin) {
            inputSenhaLogin.required = !semSenha;
            if (semSenha) inputSenhaLogin.value = '';
        }
        if (btnSubmitLogin) {
            btnSubmitLogin.textContent = semSenha ? 'Enviar link de acesso' : 'Entrar no Painel';
        }
    }

    inputEmailLogin?.addEventListener('input', atualizarEstadoLogin);
    inputEmailLogin?.addEventListener('change', atualizarEstadoLogin);
    atualizarEstadoLogin();

    linkEsqueceuSenha?.addEventListener('click', (event) => {
        event.preventDefault();
        const recuperarEmail = document.getElementById('recuperarEmailInput');
        if (recuperarEmail && inputEmailLogin?.value) {
            recuperarEmail.value = inputEmailLogin.value.trim();
        }
        loginForm?.classList.add('hidden');
        if (linkEsqueceuSenha.parentElement) linkEsqueceuSenha.parentElement.hidden = true;
        recuperarSenhaForm?.classList.remove('hidden');
        if (loginErro) loginErro.textContent = '';
    });

    btnVoltarLogin?.addEventListener('click', () => {
        recuperarSenhaForm?.classList.add('hidden');
        loginForm?.classList.remove('hidden');
        if (linkEsqueceuSenha?.parentElement) linkEsqueceuSenha.parentElement.hidden = false;
        if (loginErro) loginErro.textContent = '';
    });

    recuperarSenhaForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const recuperarEmail = document.getElementById('recuperarEmailInput');
        const email = (recuperarEmail?.value || '').trim().toLowerCase();
        const submitButton = recuperarSenhaForm.querySelector('button[type="submit"]');

        if (!authSupabaseClient) {
            if (loginErro) loginErro.textContent = 'Não foi possível conectar ao serviço de autenticação.';
            return;
        }

        if (submitButton) submitButton.disabled = true;
        if (loginErro) loginErro.textContent = 'Enviando instruções...';

        try {
            const { error } = await authSupabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}${window.location.pathname}?flow=recovery`
            });
            if (error) throw error;
            if (loginErro) {
                loginErro.textContent = 'Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação.';
            }
        } catch (error) {
            if (loginErro) loginErro.textContent = 'Não foi possível enviar as instruções. Tente novamente.';
            console.error('Erro ao solicitar recuperação de senha:', error);
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });

    abrirModalBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        modal?.classList.remove('hidden');
    });
    fecharModalBtn?.addEventListener('click', () => modal?.classList.add('hidden'));
    modal?.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.add('hidden');
    });

    formRegisto?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const nome = document.getElementById('regNome')?.value || '';
        const email = document.getElementById('regEmail')?.value;
        const telefone = document.getElementById('regTelefone')?.value || '';
        const cargo = document.getElementById('regCargo')?.value || 'user';
        const senha = document.getElementById('regSenha')?.value;
        const regErro = document.getElementById('regErro');

        if (!authSupabaseClient) {
            if (regErro) regErro.innerText = 'Não foi possível conectar ao serviço de autenticação.';
            return;
        }
        if (regErro) regErro.innerText = 'A criar conta...';

        try {
            const { error } = await authSupabaseClient.auth.signUp({
                email,
                password: senha,
                options: { data: { role: 'admin', full_name: nome, phone: telefone, cargo } }
            });
            if (error) throw error;
            alert('Conta criada com sucesso! Podes fazer login agora.');
            modal?.classList.add('hidden');
            formRegisto.reset();
            if (regErro) regErro.innerText = '';
        } catch (error) {
            if (regErro) regErro.innerText = `Erro: ${error.message}`;
            console.error('Erro ao criar conta:', error);
        }
    });

    loginForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = (inputEmailLogin?.value || '').trim().toLowerCase();
        const password = inputSenhaLogin?.value || '';
        const semSenha = PASSWORDLESS_ADMIN_EMAILS.includes(email);
        const originalText = btnSubmitLogin?.textContent || 'Entrar no Painel';

        if (!authSupabaseClient) {
            if (loginErro) loginErro.textContent = 'Não foi possível conectar ao serviço de autenticação.';
            return;
        }

        if (loginErro) loginErro.textContent = semSenha ? 'Enviando link seguro...' : 'A entrar...';
        if (btnSubmitLogin) btnSubmitLogin.disabled = true;

        try {
            if (semSenha) {
                const { error } = await authSupabaseClient.auth.signInWithOtp({
                    email,
                    options: {
                        shouldCreateUser: false,
                        emailRedirectTo: `${window.location.origin}${window.location.pathname}`
                    }
                });
                if (error) throw error;
                if (loginErro) {
                    loginErro.textContent = 'Se o e-mail estiver cadastrado, enviaremos um link seguro para entrar.';
                }
            } else {
                const { data, error } = await authSupabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                if (loginErro) loginErro.textContent = '';
                showToast('Login efetuado com sucesso. Bem-vindo à Oficina Adorê!');
                verificarPermissaoAdmin(data.user);
            }
        } catch (error) {
            if (loginErro) {
                loginErro.textContent = semSenha
                    ? 'Não foi possível enviar o link de acesso. Verifique a conexão e tente novamente.'
                    : 'Credenciais inválidas. Verifique e-mail e senha.';
            }
            if (!semSenha) showToast('Login falhou. Verifique as credenciais.', 'error');
            console.error('Erro ao autenticar:', error);
        } finally {
            if (btnSubmitLogin) {
                btnSubmitLogin.disabled = false;
                btnSubmitLogin.textContent = originalText;
            }
        }
    });

    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        if (authSupabaseClient) await authSupabaseClient.auth.signOut();
        window.location.reload();
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarAutenticacao, { once: true });
} else {
    inicializarAutenticacao();
}

// ==========================================
// INTEGRAÇÃO COM MODAL DINÂMICO DA OFICINA
// ==========================================

function abrirModalAuth(tipo) {
    const container = document.getElementById('kromModalContainer');
    if (!container) return;

    const titulo = tipo === 'login' ? 'Acessar Oficina Adorê' : 'Criar Conta na Oficina';
    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card" style="width: 400px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">${titulo}</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                <p style="font-size: 12px; color: var(--text-muted);">Entre para sincronizar seus projetos e modelos 3D na nuvem.</p>
                <button onclick="loginComGoogle()" style="background: #fff; color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 12px; width: 100%;">
                    Continuar com o Google
                </button>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <input type="email" id="authEmail" placeholder="Seu e-mail" style="background: var(--bg-base); border: 1px solid var(--border-color); color: white; padding: 9px; border-radius: 6px; font-size: 12px; outline: none;">
                    <input type="password" id="authSenha" placeholder="Sua senha" style="background: var(--bg-base); border: 1px solid var(--border-color); color: white; padding: 9px; border-radius: 6px; font-size: 12px; outline: none;">
                    <button onclick="executarLoginDinamico()" style="background: var(--accent-green); color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 12px; width: 100%;">Entrar na Oficina</button>
                    <div id="authModalErro" style="color: #ff5555; font-size: 11px; text-align: center;"></div>
                </div>
            </div>
        </div>`;
}

async function loginComGoogle() {
    if (!authSupabaseClient) return alert('Supabase não configurado.');
    const { error } = await authSupabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.href }
    });
    if (error) alert(`Erro ao autenticar com Google: ${error.message}`);
}

async function executarLoginDinamico() {
    const email = document.getElementById('authEmail')?.value?.trim().toLowerCase();
    const senha = document.getElementById('authSenha')?.value;
    const erroDiv = document.getElementById('authModalErro');

    if (!email || !senha) {
        if (erroDiv) erroDiv.innerText = 'Preencha o e-mail e a senha.';
        return;
    }
    if (!authSupabaseClient) {
        if (erroDiv) erroDiv.innerText = 'Supabase não configurado.';
        return;
    }
    if (erroDiv) erroDiv.innerText = 'A autenticar...';

    const { data, error } = await authSupabaseClient.auth.signInWithPassword({ email, password: senha });
    if (error) {
        if (erroDiv) erroDiv.innerText = `Erro: ${error.message}`;
        showToast('Login falhou. Verifique as credenciais.', 'error');
        return;
    }
    showToast('Login efetuado com sucesso. Bem-vindo à Oficina Adorê!');
    fecharModalGlobal();
    verificarPermissaoAdmin(data.user);
}

async function tratarRecuperacaoSenhaURL() {
    if (!authSupabaseClient) return;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const isPasswordRecovery = urlParams.get('flow') === 'recovery'
        || window.location.hash.includes('type=recovery');

    if (code) {
        const { error } = await authSupabaseClient.auth.exchangeCodeForSession(code);
        if (error) {
            console.error('Erro ao trocar código por sessão:', error.message);
            const loginErro = document.getElementById('loginErro');
            if (loginErro) loginErro.textContent = 'O link expirou ou já foi usado. Solicite um novo.';
            return;
        }
        urlParams.delete('code');
        const query = urlParams.toString();
        window.history.replaceState(
            {},
            document.title,
            `${window.location.pathname}${query ? `?${query}` : ''}`
        );
    }

    if (isPasswordRecovery) {
        const novaSenha = prompt('Redefinição de Senha • Oficina Adorê\nInsira a sua nova senha (mínimo 6 caracteres):');
        if (novaSenha && novaSenha.length >= 6) {
            const { error } = await authSupabaseClient.auth.updateUser({ password: novaSenha });
            if (error) {
                alert(`Erro ao atualizar senha: ${error.message}`);
            } else {
                alert('Senha redefinida com sucesso! Faça login com a nova senha.');
                window.location.href = window.location.pathname;
            }
        } else if (novaSenha !== null) {
            alert('A senha deve ter pelo menos 6 caracteres.');
        }
    }
}

async function verificarSessaoAtiva() {
    if (!authSupabaseClient) return;
    const { data: { session }, error } = await authSupabaseClient.auth.getSession();
    if (error) throw error;
    if (session?.user) verificarPermissaoAdmin(session.user);
}

function verificarPermissaoAdmin(user) {
    const metadata = user.user_metadata || {};
    const emailUser = (user.email || '').trim().toLowerCase();
    const permitido = PASSWORDLESS_ADMIN_EMAILS.includes(emailUser)
        || metadata.role === 'admin'
        || emailUser.endsWith('@adore.com')
        || emailUser === 'admin@adore.com';

    if (!permitido) {
        const loginErro = document.getElementById('loginErro');
        if (loginErro) loginErro.innerText = 'Acesso negado: Conta sem privilégios.';
        authSupabaseClient.auth.signOut();
        return;
    }

    atualizarInterfaceUsuario(user);
    document.getElementById('loginSection')?.classList.add('hidden');
    document.getElementById('modalPrimeiroAcesso')?.classList.add('hidden');
    document.getElementById('sidebarNav')?.classList.remove('hidden');
    document.getElementById('mainContent')?.classList.remove('hidden');
    document.getElementById('kromFloatingWidget')?.classList.remove('hidden');
    document.getElementById('hamburgerToggle')?.classList.remove('hidden');

    const welcome = document.getElementById('userWelcomeTitle');
    if (welcome) {
        const nomeExibicao = metadata.full_name || emailUser.split('@')[0];
        welcome.innerText = nomeExibicao.toUpperCase();
    }
    if (typeof carregarProdutosVitrine === 'function') carregarProdutosVitrine();
    if (typeof carregarCategoriasSelect === 'function') carregarCategoriasSelect();
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
            if (authSupabaseClient) await authSupabaseClient.auth.signOut();
            window.location.reload();
        };
        userBadge.innerHTML = `👤 ${user.email.split('@')[0]} <span style="font-size: 9px; color: var(--text-muted);">(Sair)</span>`;
        topoControles.insertBefore(userBadge, topoControles.firstChild);
    }
}
