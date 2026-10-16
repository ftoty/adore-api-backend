// ==========================================
// LEITOR UNIVERSAL DE FICHEIROS (QUALQUER FORMATO)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const inputFicheiro = document.getElementById('inputArquivoStl') || document.querySelector('input[type="file"]');

    inputFicheiro?.addEventListener('change', (e) => {
        const ficheiro = e.target.files[0];
        if (!ficheiro) return;

        const nomeCompleto = ficheiro.name;
        const nomeLimpo = nomeCompleto.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
        const extensao = nomeCompleto.split('.').pop().toLowerCase();

        console.log(`Ficheiro detetado: ${nomeCompleto} (${extensao})`);
        preencherCamposGenericos(nomeLimpo);

        if (extensao === 'stl') {
            const reader = new FileReader();
            reader.readAsArrayBuffer(ficheiro);

            reader.onload = function (evento) {
                analisarGeometriaStl(evento.target.result, nomeLimpo);
            };
        } else {
            definirValoresPadraoParaOutrosFicheiros(extensao, nomeLimpo);
        }
    });
});

function preencherCamposGenericos(nomeLimpo) {
    const inputNome = document.getElementById('produtoNome') || document.getElementById('nome') || document.getElementById('calcNome');
    if (inputNome && nomeLimpo) {
        inputNome.value = nomeLimpo;
        inputNome.dispatchEvent(new Event('input', { bubbles: true }));
    }

}

function preencherFormularioComAnalise({ nome, volumeCm3, pesoGramas, material, tamanhoX, tamanhoY, tamanhoZ, horas }) {
    const nomeProduto = nome || document.getElementById('produtoNome')?.value || 'Produto 3D';
    const inputNome = document.getElementById('produtoNome') || document.getElementById('nome');
    if (inputNome && nomeProduto) {
        inputNome.value = nomeProduto;
    }

    const inputPeso = document.getElementById('calcPeso') || document.getElementById('produtoPeso');
    const inputTempo = document.getElementById('calcHoras') || document.getElementById('calcTempoHoras');
    const inputX = document.getElementById('stlDimX');
    const inputY = document.getElementById('stlDimY');
    const inputZ = document.getElementById('stlDimZ');
    const inputMaterial = document.getElementById('stlMaterial');
    const inputPreco = document.getElementById('preco');

    if (inputPeso && pesoGramas) inputPeso.value = Number(pesoGramas).toFixed(0);
    if (inputTempo && horas) inputTempo.value = Number(horas).toFixed(1);
    if (inputX && tamanhoX) inputX.value = Number(tamanhoX).toFixed(2);
    if (inputY && tamanhoY) inputY.value = Number(tamanhoY).toFixed(2);
    if (inputZ && tamanhoZ) inputZ.value = Number(tamanhoZ).toFixed(2);
    if (inputMaterial && material) inputMaterial.value = material;

    const precoCalculado = calcularPrecoSugerido({ pesoGramas: Number(pesoGramas || 0), horas: Number(horas || 0) });
    if (precoCalculado > 0) {
        window.precoCalculado = precoCalculado.toFixed(2);
        if (inputPreco) {
            inputPreco.value = window.precoCalculado;
            inputPreco.dispatchEvent(new Event('input', { bubbles: true }));
            inputPreco.dispatchEvent(new Event('change', { bubbles: true }));
        }
        const sugestao = document.getElementById('precoSugerido');
        if (sugestao) sugestao.innerText = `R$ ${window.precoCalculado}`;
    }

    const stlResultado = document.getElementById('stlResultado');
    if (stlResultado) {
        const densidadePorMaterial = { PLA: 1.24, PETG: 1.27, ABS: 1.04, Nylon: 1.14 };
        stlResultado.innerHTML = `<strong>STL analisado</strong><br>Dimensões: ${Number(tamanhoX || 0).toFixed(2)} × ${Number(tamanhoY || 0).toFixed(2)} × ${Number(tamanhoZ || 0).toFixed(2)} cm<br>Volume: ${Number(volumeCm3 || 0).toFixed(2)} cm³ · Massa: ${Number(pesoGramas || 0).toFixed(0)} g · Material: ${material || 'PLA'}<br>Densidade estimada: ${densidadePorMaterial[material || 'PLA'] || 1.24} g/cm³`;
        stlResultado.classList.remove('hidden');
    }

    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.innerText = `Arquivo analisado: ${nomeProduto} • ${Number(tamanhoX || 0).toFixed(2)} x ${Number(tamanhoY || 0).toFixed(2)} x ${Number(tamanhoZ || 0).toFixed(2)} cm • ${Number(pesoGramas || 0).toFixed(0)} g`;
    }
}

function calcularPrecoSugerido({ pesoGramas, horas }) {
    const pesoKg = Number(pesoGramas || 0) / 1000;
    const precoKg = Number(document.getElementById('calcPrecoKg')?.value) || 90;
    const custoHora = Number(document.getElementById('calcCustoHora')?.value) || 2.5;
    const margemLucro = Number(document.getElementById('calcLucro')?.value) || 50;
    const custoFilamento = pesoKg * precoKg;
    const custoEnergia = Number(horas || 0) * custoHora;
    const custoTotal = custoFilamento + custoEnergia;
    return custoTotal * (1 + margemLucro / 100);
}

function analisarGeometriaStl(buffer, nomeArquivo = '') {
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

        const material = document.getElementById('stlMaterial')?.value || 'PLA';
        const densidadePorMaterial = { PLA: 1.24, PETG: 1.27, ABS: 1.04, Nylon: 1.14 };
        const pesoGramas = (volumeCm3 * (densidadePorMaterial[material] || 1.24)).toFixed(0);
        const horas = (Number(pesoGramas) / 12).toFixed(1);

        preencherFormularioComAnalise({
            nome: nomeArquivo,
            volumeCm3,
            pesoGramas: Number(pesoGramas),
            material,
            tamanhoX,
            tamanhoY,
            tamanhoZ,
            horas: Number(horas)
        });

        window.stlAnalysis = { tamanhoX, tamanhoY, tamanhoZ, volumeCm3, pesoGramas: Number(pesoGramas), material, massaKg: (Number(pesoGramas) / 1000).toFixed(3) };
    } catch (err) {
        console.warn('Não foi possível calcular malha 3D detalhada, a manter dados básicos.', err);
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

function definirValoresPadraoParaOutrosFicheiros(extensao, nomeArquivo = '') {
    const inputPeso = document.getElementById('calcPeso') || document.getElementById('produtoPeso');
    const inputNome = document.getElementById('produtoNome') || document.getElementById('nome');
    const inputPreco = document.getElementById('preco');

    if (inputNome && nomeArquivo) {
        inputNome.value = nomeArquivo;
    }

    if (inputPeso && (extensao === 'jpg' || extensao === 'png' || extensao === 'jpeg')) {
        inputPeso.value = '30';
    }

    if (inputPreco && (!inputPreco.value || Number(inputPreco.value) <= 0)) {
        inputPreco.value = '29.90';
    }

    const resultado = document.getElementById('resultado');
    if (resultado) {
        resultado.innerText = `Arquivo recebido: ${nomeArquivo || 'arquivo'} • ${extensao.toUpperCase()} • valores padrão aplicados.`;
    }
}