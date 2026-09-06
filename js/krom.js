// ==========================================
// MÓDULO DO KROM - FAMÍLIA KROM & ESTADOS
// ==========================================

const KROM_AVATARES = {
    falando: "videos/krom-Conversando.mp4",       // Ou o nome exato do ficheiro que guardaste
    pensando: "videos/krom-engenheiro.mp4",     // Para quando está a calcular ou a carregar
    forjando: "videos/krom-trabalhando.mp4",   // Para processos em produção
    magia: "videos/krom-magia.mp4"            // Para geração por IA
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarFamiliaKrom();
});

function inicializarFamiliaKrom() {
    const videoElemento = document.querySelector('#kromAvatarToggle video') || document.querySelector('.krom-chat-header-info video');
    if (!videoElemento) return;

    // Exemplo de função para alternar o membro da família Krom conforme a ação
    window.mudarEstadoKrom = function(estado) {
        const novoVideo = KROM_AVATARES[estado] || KROM_AVATARES.falando;
        videoElemento.src = novoVideo;
        videoElemento.load();
        videoElemento.play().catch(e => console.log("Autoplay evitado pelo browser:", e));
    };
}