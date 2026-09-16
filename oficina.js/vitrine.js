window.categoriaAtual = 'todos';

document.getElementById('hamburgerToggle').addEventListener('click', () => {
    document.getElementById('sidebarNav').classList.toggle('collapsed');
    document.getElementById('mainContent').classList.toggle('full');
});

document.getElementById('adminToggleHeader').addEventListener('click', () => {
    document.getElementById('adminControlsPanel').classList.toggle('show');
});

document.querySelectorAll('.nav-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-link-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const targetViewId = btn.getAttribute('data-target');
        document.querySelectorAll('.admin-view').forEach(view => view.classList.add('hidden'));
        document.getElementById(targetViewId).classList.remove('hidden');

        if(targetViewId === 'viewVitrine') {
            document.getElementById('subcategoriasSecao').style.display = 'block';
        } else {
            document.getElementById('subcategoriasSecao').style.display = 'none';
        }
    });
});

document.getElementById('pickerPrimary').addEventListener('input', (e) => {
    const cor = e.target.value;
    document.documentElement.style.setProperty('--primary-color', cor);
    document.documentElement.style.setProperty('--primary-hover', cor);
});

// Calculadora 3D
document.getElementById('btnCalcular').addEventListener('click', () => {
    const peso = parseFloat(document.getElementById('calcPeso').value) || 0;
    const precoKg = parseFloat(document.getElementById('calcPrecoKg').value) || 0;
    const horas = parseFloat(document.getElementById('calcHoras').value) || 0;
    const custoHora = parseFloat(document.getElementById('calcCustoHora').value) || 0;
    const lucroPercentual = parseFloat(document.getElementById('calcLucro').value) || 50;

    const custoFilamento = (peso / 1000) * precoKg;
    const custoEnergia = horas * custoHora;
    const custoTotal = custoFilamento + custoEnergia;
    const precoFinal = custoTotal * (1 + (lucroPercentual / 100));

    document.getElementById('precoSugerido').innerText = `R$ ${precoFinal.toFixed(2)}`;
    window.precoCalculado = precoFinal.toFixed(2);
    if(typeof dispararSugestaoKrom === 'function') dispararSugestaoKrom('calculo');
});

document.getElementById('btnUsarPreco').addEventListener('click', () => {
    if (window.precoCalculado) {
        document.getElementById('preco').value = window.precoCalculado;
    } else {
        alert('Faça o cálculo primeiro!');
    }
});

async function excluirProduto(id) {
    if(!confirm("Tens a certeza que pretendes excluir este produto?")) return;
    try {
        const res = await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if(data.sucesso) {
            carregarCategoriasESincronizar();
            carregarProdutos(window.categoriaAtual);
        } else {
            alert("Erro ao excluir: " + data.mensagem);
        }
    } catch(err) {
        alert("Erro de conexão ao tentar excluir.");
    }
}

async function carregarCategoriasESincronizar() {
    try {
        const res = await fetch(`${API_URL}/categorias`);
        const cats = await res.json();
        const containerFiltros = document.getElementById('categoriasFiltrosContainer');
        const datalist = document.getElementById('listaCategorias');
        
        containerFiltros.innerHTML = '<button class="filter-btn active" data-cat="todos">📂 Todas as Peças</button>';
        datalist.innerHTML = '';

        const padroes = ['Decoração', 'Utilidades', 'Acessórios', 'Geral'];
        const todasCats = Array.from(new Set([...padroes, ...cats]));

        todasCats.forEach(cat => {
            const b = document.createElement('button');
            b.className = 'filter-btn';
            b.setAttribute('data-cat', cat);
            b.innerText = `📁 ${cat}`;
            b.onclick = () => {
                document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
                b.classList.add('active');
                window.categoriaAtual = cat;
                document.getElementById('tituloVitrine').innerText = `Vitrine • ${cat}`;
                carregarProdutos(cat);
            };
            containerFiltros.appendChild(b);

            const opt = document.createElement('option');
            opt.value = cat;
            datalist.appendChild(opt);
        });
    } catch(e) {}
}

async function carregarProdutos(cat = 'todos') {
    const container = document.getElementById('produtosLista');
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 12px;">Carregando...</p>';

    try {
        const url = cat === 'todos' ? `${API_URL}/produtos` : `${API_URL}/produtos?categoria=${cat}`;
        const response = await fetch(url);
        const produtos = await response.json();

        if (!Array.isArray(produtos) || produtos.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); font-size: 12px;">Nenhum produto cadastrado.</p>';
            return;
        }

        container.innerHTML = '';
        produtos.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'product-card';

            let imgSource = (prod.imagem_url && prod.imagem_url.trim() !== '') 
                ? `${API_URL}/uploads/${prod.imagem_url}` 
                : `https://picsum.photos/seed/${encodeURIComponent(prod.nome || '3d')}/200/120`;

            const imgTag = document.createElement('img');
            imgTag.src = imgSource;
            imgTag.alt = prod.nome;

            const infoDiv = document.createElement('div');
            infoDiv.className = 'product-info';
            infoDiv.innerHTML = `
                <span class="badge">${prod.categoria || 'Geral'}</span>
                <h4 style="margin-top: 4px;">${prod.nome}</h4>
                <p class="price">R$ ${parseFloat(prod.preco).toFixed(2)}</p>
                <div style="display: flex; gap: 6px; margin-top: 8px;">
                    <button onclick="excluirProduto(${prod.id})" style="background: var(--danger); color: white; border: none; padding: 6px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 11px; font-weight: bold;">Excluir</button>
                </div>
            `;

            card.appendChild(imgTag);
            card.appendChild(infoDiv);
            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = '<p style="color: #d9534f; font-size: 12px;">Erro ao carregar produtos.</p>';
    }
}

// Formulário de Cadastro de Produto
const formProduto = document.getElementById('produtoForm');
if(formProduto) {
    formProduto.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('nome', document.getElementById('nome').value);
        formData.append('preco', document.getElementById('preco').value);
        formData.append('link_externo', document.getElementById('link_externo').value);
        formData.append('categoria', document.getElementById('categoriaInput').value || 'Geral');
        
        const imagemInput = document.getElementById('imagem').files[0];
        if (imagemInput) formData.append('imagem', imagemInput);

        const stlInput = document.getElementById('stl').files[0];
        if (stlInput) formData.append('stl', stlInput);

        document.getElementById('resultado').innerText = "Salvando produto...";

        try {
            const response = await fetch(`${API_URL}/produtos/upload`, { method: 'POST', body: formData });
            const result = await response.json();
            document.getElementById('resultado').innerText = JSON.stringify(result, null, 2);
            formProduto.reset();
            carregarCategoriasESincronizar();
            carregarProdutos(window.categoriaAtual);
            if(typeof dispararSugestaoKrom === 'function') dispararSugestaoKrom('produto');
        } catch (err) {
            document.getElementById('resultado').innerText = "Erro de conexão: " + err.message;
        }
    });
}