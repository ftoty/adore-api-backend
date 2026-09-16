// ==========================================
// MÓDULO ESPECÍFICO DE SUBLIMAÇÃO
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar lógica específica de sublimação se houver elementos na página
    const calcSublimacaoBtn = document.getElementById('btnCalcularSublimacao');
    
    calcSublimacaoBtn?.addEventListener('click', () => {
        calcularParametrosSublimacao();
    });
});

function calcularParametrosSublimacao() {
    // Exemplo de calculadora rápida de prensa térmica para o operador
    const tipoItem = document.getElementById('subTipoItem')?.value || 'caneca';
    const qtd = parseFloat(document.getElementById('subQtd')?.value || 1);
    
    let tempoSegundos = 180;
    let temperaturaCelsius = 200;

    if (tipoItem === 'camisa') {
        tempoSegundos = 45;
        temperaturaCelsius = 190;
    } else if (tipoItem === 'azulejo') {
        tempoSegundos = 300;
        temperaturaCelsius = 195;
    }

    const resultadoDiv = document.getElementById('subResultadoCalculo');
    if (resultadoDiv) {
        resultadoDiv.innerHTML = `
            <strong>Parâmetros de Impressão (${qtd}x ${tipoItem.toUpperCase()}):</strong><br>
            🌡️ Temperatura: ${temperaturaCelsius}°C<br>
            ⏱️ Tempo de Prensagem: ${tempoSegundos} segundos<br>
            💡 Dica do Krom: Verifique a pressão da prensa antes de iniciar o lote!
        `;
    }
}