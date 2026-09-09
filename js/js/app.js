document.addEventListener("DOMContentLoaded", () => {
    initThreeViewer();

    document.getElementById('btnUpgrade').addEventListener('click', abrirModalUpgrade);
    document.getElementById('btnOpenAuth').addEventListener('click', () => {
        alert("Painel de login rápido integrado via Supabase.");
    });
});

function executarConversao3D() {
    const promptIA = prompt("Descreva o modelo 3D:");
    if (promptIA) alert(`Gerando ${promptIA}...`);
}