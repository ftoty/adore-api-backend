// ==========================================
// MÓDULO DE CUSTOMIZAÇÃO DE LAYOUT & TEMA
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    carregarPreferenciasLayout();

    const adminToggleHeader = document.getElementById('adminToggleHeader');
    const adminControlsPanel = document.getElementById('adminControlsPanel');
    const pickerPrimary = document.getElementById('pickerPrimary');
    const selectLayoutCard = document.getElementById('selectLayoutCard');
    const hamburgerToggle = document.getElementById('hamburgerToggle');
    const sidebar = document.getElementById('sidebarNav');
    const mainContent = document.getElementById('mainContent');

    // Expandir/recolher o painel de customização na barra lateral
    adminToggleHeader?.addEventListener('click', () => {
        adminControlsPanel?.classList.toggle('show');
    });

    // Alterar cor principal dinamicamente
    pickerPrimary?.addEventListener('input', (e) => {
        const novaCor = e.target.value;
        document.documentElement.style.setProperty('--primary-color', novaCor);
        localStorage.setItem('adore_primary_color', novaCor);
    });

    // Alterar estilo dos cartões dinamicamente
    selectLayoutCard?.addEventListener('change', (e) => {
        const estilo = e.target.value;
        aplicarEstiloCartao(estilo);
        localStorage.setItem('adore_card_style', estilo);
    });

    // Alternar visibilidade da barra lateral (Menu Hambúrguer)
    hamburgerToggle?.addEventListener('click', () => {
        if (sidebar && mainContent) {
            sidebar.classList.toggle('collapsed');
            mainContent.classList.toggle('full');
        }
    });

    // Gerir cliques nos botões de navegação lateral para trocar de aba (view)
    const navButtons = document.querySelectorAll('.nav-link-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            
            // Remover classe active de todos os botões e esconder todas as views
            navButtons.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-view').forEach(v => v.classList.add('hidden'));

            // Ativar botão clicado e mostrar view correspondente
            btn.classList.add('active');
            const targetView = document.getElementById(targetId);
            if (targetView) {
                targetView.classList.remove('hidden');
            }
        });
    });
});

function carregarPreferenciasLayout() {
    // Carregar cor guardada
    const corSalva = localStorage.getItem('adore_primary_color');
    if (corSalva) {
        document.documentElement.style.setProperty('--primary-color', corSalva);
        const picker = document.getElementById('pickerPrimary');
        if (picker) picker.value = corSalva;
    }

    // Carregar estilo de cartão guardado
    const estiloSalvo = localStorage.getItem('adore_card_style');
    if (estiloSalvo) {
        aplicarEstiloCartao(estiloSalvo);
        const select = document.getElementById('selectLayoutCard');
        if (select) select.value = estiloSalvo;
    }
}

function aplicarEstiloCartao(estilo) {
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        if (estilo === 'bordered') {
            card.style.border = '2px solid var(--primary-color)';
            card.style.boxShadow = 'none';
        } else if (estilo === 'minimal') {
            card.style.border = 'none';
            card.style.boxShadow = 'none';
            card.style.background = '#181818';
        } else {
            // Padrão sólido escuro
            card.style.border = '1px solid var(--border-color)';
            card.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
            card.style.background = 'var(--card-bg)';
        }
    });
}