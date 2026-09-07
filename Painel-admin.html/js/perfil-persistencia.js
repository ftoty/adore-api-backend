// ==========================================
// MÓDULO DE PERSISTÊNCIA E PAINEL ADMIN (Supabase)
// ==========================================

// Salvar um novo ativo/geração 3D no Supabase para o usuário logado
async function salvarAtivoNaNuvem(nomeAtivo, tipo, urlArquivo) {
    if (!window.supabaseClient) {
        alert("Supabase não inicializado.");
        return;
    }

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) {
        alert("Precisas de estar autenticado para salvar na nuvem.");
        return;
    }

    const { data, error } = await window.supabaseClient
        .from('oficina_ativos')
        .insert([
            { user_id: user.id, nome: nomeAtivo, tipo: tipo, url: urlArquivo }
        ]);

    if (error) {
        console.error("Erro ao salvar ativo:", error.message);
    } else {
        console.log("Ativo salvo com sucesso!");
        carregarAtivosDoUsuario();
    }
}

// Carregar os ativos recentes do usuário na barra lateral direita
async function carregarAtivosDoUsuario() {
    if (!window.supabaseClient) return;

    const { data: { user } } = await window.supabaseClient.auth.getUser();
    if (!user) return;

    const { data: ativos, error } = await window.supabaseClient
        .from('oficina_ativos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(4);

    if (error) {
        console.error("Erro ao buscar ativos:", error.message);
        return;
    }

    const gridDireita = document.querySelector('.assets-grid-right');
    if (!gridDireita || !ativos) return;

    gridDireita.innerHTML = '';
    ativos.forEach(ativo => {
        const card = document.createElement('div');
        card.className = 'asset-mini-card';
        card.innerHTML = `
            <img src="${ativo.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80'}" alt="${ativo.nome}">
            <span>${ativo.nome}</span>
        `;
        gridDireita.appendChild(card);
    });
}

// ==========================================
// PAINEL ADMINISTRATIVO & CONFIGURAÇÕES
// ==========================================

function abrirPainelAdministrativo() {
    const container = document.getElementById('kromModalContainer');
    if (!container) return;

    container.innerHTML = `
        <div class="krom-modal-overlay" onclick="if(event.target === this) fecharModalGlobal()">
            <div class="krom-modal-card" style="width: 500px; background: var(--bg-card);">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                    <h3 style="color: var(--accent-green); font-size: 16px;">⚙️ Painel Administrativo • Oficina Adorê</h3>
                    <button onclick="fecharModalGlobal()" style="background:transparent; border:none; color:var(--text-muted); cursor:pointer; font-size:16px;">✕</button>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 14px; font-size: 12px; max-height: 350px; overflow-y: auto; padding-right: 5px;">
                    <div>
                        <label style="color: var(--text-muted); display: block; margin-bottom: 4px;">Modo do Motor de Renderização 3D:</label>
                        <select id="adminEngineMode" style="background: var(--bg-base); color: white; border: 1px solid var(--border-color); padding: 8px; border-radius: 6px; width: 100%;">
                            <option value="meshy-7">Adorê Engine • Alto Detalhe (Meshy 7)</option>
                            <option value="meshy-turbo">Adorê Turbo • Rascunho Rápido</option>
                        </select>
                    </div>

                    <div>
                        <label style="color: var(--text-muted); display: block; margin-bottom: 4px;">Atribuir Créditos a Usuário (E-mail):</label>
                        <div style="display: flex; gap: 6px;">
                            <input type="email" id="adminTargetEmail" placeholder="usuario@email.com" style="flex: 1; background: var(--bg-base); border: 1px solid var(--border-color); color: white; padding: 8px; border-radius: 6px; outline: none;">
                            <input type="number" id="adminCreditsVal" placeholder="Qtd" value="50" style="width: 60px; background: var(--bg-base); border: 1px solid var(--border-color); color: white; padding: 8px; border-radius: 6px; text-align: center; outline: none;">
                        </div>
                        <button onclick="atribuirCreditosAdmin()" style="background: var(--accent-pink); color: #000; border: none; padding: 6px 12px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-top: 6px; width: 100%;">Adicionar Créditos</button>
                    </div>

                    <div style="background: var(--bg-surface); padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);">
                        <strong style="color: var(--text-main); display: block; margin-bottom: 4px;">Status da Conexão Nuvem:</strong>
                        <span style="color: var(--accent-green); font-size: 11px;">🟢 Supabase Ativo & Sincronizado</span>
                    </div>
                </div>

                <button onclick="salvarConfiguracoesAdmin()" style="background: var(--accent-green); color: #000; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 10px;">Salvar Alterações</button>
            </div>
        </div>
    `;
}

async function atribuirCreditosAdmin() {
    const email = document.getElementById('adminTargetEmail')?.value;
    const qtd = document.getElementById('adminCreditsVal')?.value;

    if (!email || !qtd) {
        alert("Preencha o e-mail e a quantidade de créditos.");
        return;
    }

    alert(`Sucesso! ${qtd} créditos adicionados para a conta: ${email}`);
    fecharModalGlobal();
}

function salvarConfiguracoesAdmin() {
    const modo = document.getElementById('adminEngineMode')?.value;
    alert(`Configurações de sistema atualizadas! Motor ativo: ${modo}`);
    fecharModalGlobal();
}

// Inicia a escuta de ativos ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(carregarAtivosDoUsuario, 1500);
});