// ==========================================
// MÓDULO DE AUTENTICAÇÃO E RECUPERAÇÃO (Supabase)
// ==========================================

const SUPABASE_URL = "https://mlfgluwcuzddwijffrbe.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZmdsdXdjdXpkZHdpamZmcmJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NDg0ODYsImV4cCI6MjEwNDAyNDQ4Nn0.8U4Df4fQg1fa0ceowGndkE3c06hMUMKjqL0ceZhTNR0"; 

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

document.addEventListener('DOMContentLoaded', () => {
    verificarSessaoAtiva();
    tratarRecuperacaoSenhaURL();

    const abrirModalBtn = document.getElementById('abrirModalRegistoBtn');
    const fecharModalBtn = document.getElementById('fecharModalBtn');
    const modal = document.getElementById('modalPrimeiroAcesso');
    const formRegisto = document.getElementById('formPrimeiroAcesso');
    const loginForm = document.getElementById('loginForm');

    // Gerir modal de primeiro acesso
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

    // Submissão do Registo de Primeiro Acesso
    formRegisto?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('regNome').value;
        const email = document.getElementById('regEmail').value;
        const telefone = document.getElementById('regTelefone').value;
        const cargo = document.getElementById('regCargo').value;
        const senha = document.getElementById('regSenha').value;
        const regErro = document.getElementById('regErro');

        regErro.innerText = "A criar conta...";

        if (!supabaseClient) {
            regErro.innerText = "Erro: Supabase não configurado.";
            return;
        }

        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: senha,
            options: {
                data: { 
                    role: 'admin',
                    full_name: nome,
                    phone: telefone,
                    cargo: cargo
                }
            }
        });

        if (error) {
            regErro.innerText = "Erro: " + error.message;
        } else {
            alert("Conta de administrador criada com sucesso! Podes fazer login agora.");
            modal.classList.add('hidden');
            formRegisto.reset();
            regErro.innerText = "";
        }
    });

    // Submissão do Login normal
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const senha = document.getElementById('loginSenha').value;
        const erroDiv = document.getElementById('loginErro');
        
        erroDiv.innerText = "A entrar...";

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });

        if (error) {
            erroDiv.innerText = "Credenciais inválidas: " + error.message;
        } else {
            verificarPermissaoAdmin(data.user);
        }
    });

    // Botão de Logout
    document.getElementById('btnLogout')?.addEventListener('click', async () => {
        if (supabaseClient) await supabaseClient.auth.signOut();
        window.location.reload();
    });
});

// Tratamento inteligente para recuperação de senha (Evita ecrãs brancos)
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

        const novaSenha = prompt("Redefinição de Senha • Adorê Adm\nInsira a sua nova senha (mínimo 6 caracteres):");
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
    
    // Liberta o acesso para novos utilizadores autenticados com sucesso
    const isPermitido = metadata.role === 'admin' || emailUser.endsWith('@adore.com') || emailUser === "admin@adore.com" || user.id;

    if (isPermitido) {
        document.getElementById('loginSection')?.classList.add('hidden');
        document.getElementById('modalPrimeiroAcesso')?.classList.add('hidden');
        
        // Revelar o painel, a barra lateral e o Krom
        document.getElementById('sidebarNav')?.classList.remove('hidden');
        document.getElementById('mainContent')?.classList.remove('hidden');
        document.getElementById('kromFloatingWidget')?.classList.remove('hidden');
        
        const welcome = document.getElementById('userWelcomeTitle');
        if (welcome) {
            const nomeExibicao = metadata.full_name || emailUser.split('@')[0];
            welcome.innerText = nomeExibicao.toUpperCase();
        }

        // Atualizar listagens do painel se as funções existirem
        if (typeof carregarProdutosVitrine === 'function') carregarProdutosVitrine();
        if (typeof carregarCategoriasSelect === 'function') carregarCategoriasSelect();
    } else {
        const erroDiv = document.getElementById('loginErro');
        if (erroDiv) erroDiv.innerText = "Acesso negado: Conta sem privilégios.";
        supabaseClient.auth.signOut();
    }
}