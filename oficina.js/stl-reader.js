// ==========================================
// LEITOR UNIVERSAL DE FICHEIROS (QUALQUER FORMATO)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Procura por qualquer input de ficheiro na secção de produtos
    const inputFicheiro = document.getElementById('inputArquivoStl') || document.querySelector('input[type="file"]');
    
    inputFicheiro?.addEventListener('change', (e) => {
        const ficheiro = e.target.files[0];
        if (!ficheiro) return;

        const nomeCompleto = ficheiro.name;
        const nomeLimpo = nomeCompleto.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const extensao = nomeCompleto.split('.').pop().toLowerCase();

        console.log(`Ficheiro detetado: ${nomeCompleto} (${extensao})`);

        // Preencher imediatamente o nome do produto com base no ficheiro
        preencherCamposGenericos(nomeLimpo);

        // Se for um ficheiro STL, tenta fazer a leitura geométrica avançada
        if (extensao === 'stl') {
            const reader = new FileReader();
            reader.readAsArrayBuffer(ficheiro);
            
            reader.onload = function (evento) {
                analisarGeometriaStl(evento.target.result);
            };
        } else {
            // Para outros ficheiros (imagens, obj, etc.), aplica valores padrão seguros
            definirValoresPadraoParaOutrosFicheiros(extensao);
        }
    });
});

function preencherCamposGenericos(nomeLimpo) {
    const inputNome = document.getElementById('produtoNome') || document.getElementById('nome') || document.getElementById('calcNome');
    if (inputNome) {
        inputNome.value = nomeLimpo;
        inputNome.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

function analisarGeometriaStl(buffer) {
    if (typeof THREE === 'undefined' || typeof THREE.STLLoader === 'undefined') return;

    try {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(buffer);
        geometry.computeBoundingBox();

        const box = geometry.boundingBox;
        const tamanhoX = (box.max.x - box.min.x) / 10;
        const tamanhoY = (box.max.y - box.min.y) / 10;
        const tamanhoZ = (box.max.z - box.min.z) / 10;

        let volumeCm3 = calcularVolumeMalha(geometry);
        if (isNaN(volumeCm3) || volumeCm3 <= 0) {
            volumeCm3 = (tamanhoX * tamanhoY * tamanhoZ) * 0.20; 
        }

        const pesoGramas = (volumeCm3 * 1.24).toFixed(0);
        const horas = (pesoGramas / 12).toFixed(1);

        const inputPeso = document.getElementById('calcPeso') || document.getElementById('produtoPeso');
        const inputTempo = document.getElementById('calcHoras') || document.getElementById('calcTempoHoras');

        if (inputPeso) {
            inputPeso.value = pesoGramas;
            inputPeso.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (inputTempo) {
            inputTempo.value = horas;
            inputTempo.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } catch (err) {
        console.warn("Não foi possível calcular malha 3D detalhada, a manter dados básicos.", err);
    }
}

function calcularVolumeMalha(geometry) {
    let volume = 0;
    const position = geometry.attributes.position;
    if (!position) return 0;

    const p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), p3 = new THREE.Vector3();
    for (let i = 0; i < position.count; i += 3) {
        p1.fromBufferAttribute(position, i);
        p2.fromBufferAttribute(position, i + 1);
        p3.fromBufferAttribute(position, i + 2);
        volume += p1.dot(p2.cross(p3)) / 6.0;
    }
    return Math.abs(volume);
}

function definirValoresPadraoParaOutrosFicheiros(extensao) {
    // Se for imagem ou outro formato, limpa ou define valores base para não bloquear o formulário
    const inputPeso = document.getElementById('calcPeso') || document.getElementById('produtoPeso');
    if (inputPeso && (extensao === 'jpg' || extensao === 'png' || extensao === 'jpeg')) {
        inputPeso.value = "30"; // Valor base para sublimação/itens planos
    }
}