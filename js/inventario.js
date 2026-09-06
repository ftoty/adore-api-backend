// ==========================================
// MÓDULO DE GESTÃO DE INVENTÁRIO (3D & Sublimação)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    carregarInventario();
    carregarSetoresInventarioSelect();

    // Submeter novo material/item de inventário
    document.getElementById('materialForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msgDiv = document.getElementById('matResultado');
        msgDiv.innerText = "A guardar material no inventário...";

        const novoMaterial = {
            nome: document.getElementById('matNome').value.trim(),
            tipo: document.getElementById('matTipo').value, // '3d' ou 'sublimacao' (ou categoria dinâmica)
            quantidade: parseFloat(document.getElementById('matQtd').value),
            unidade: document.getElementById('matUnidade').value,
            custo_unitario: parseFloat(document.getElementById('matCusto').value),
            fornecedor: document.getElementById('matFornecedor').value.trim()
        };

        try {
            const resposta = await fetch(`${API_URL}/materiais`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(novoMaterial)
            });

            const data = await resposta.json();
            if (resposta.ok) {
                msgDiv.style.color = "var(--success)";
                msgDiv.innerText = "Material adicionado com sucesso!";
                e.target.reset();
                carregarInventario();
            } else {
                msgDiv.style.color = "var(--danger)";
                msgDiv.innerText = "Erro: " + (data.mensagem || "Falha ao gravar material.");
            }
        } catch (err) {
            console.error("Erro ao adicionar material:", err);
            msgDiv.style.color = "var(--danger)";
            msgDiv.innerText = "Erro de ligação ao servidor.";
        }
    });

    // Gestão de Setores / Categorias do Inventário na Barra Lateral
    document.getElementById('btnAddCatInv')?.addEventListener('click', () => {
        const inputSetor = document.getElementById('novaCatInv');
        const valor = inputSetor.value.trim();
        if (!valor) return;

        adicionarSetorInventarioLocal(valor);
        inputSetor.value = '';
        carregarSetoresInventarioSelect();
    });

    document.getElementById('btnDelCatInv')?.addEventListener('click', () => {
        const select = document.getElementById('selectDelCatInv');
        const valor = select.value;
        if (!valor) return;

        if (confirm(`Tens a certeza que pretendes remover o setor/categoria "${valor}"?`)) {
            removerSetorInventarioLocal(valor);
            carregarSetoresInventarioSelect();
        }
    });
});

async function carregarInventario() {
    const tabelaCorpo = document.getElementById('tabelaMateriaisCorpo');
    if (!tabelaCorpo) return;

    tabelaCorpo.innerHTML = `<tr><td colspan="6" style="color: var(--text-muted); text-align: center;">Carregando inventário...</td></tr>`;

    try {
        const resposta = await fetch(`${API_URL}/materiais`);
        if (!resposta.ok) throw new Error("Erro ao buscar dados do inventário.");

        const materiais = await resposta.json();

        if (!materiais || materiais.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="6" style="color: var(--text-muted); text-align: center;">Nenhum material registado no inventário.</td></tr>`;
            return;
        }

        tabelaCorpo.innerHTML = '';
        materiais.forEach(mat => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${mat.nome}</strong></td>
                <td><span class="badge">${mat.tipo || 'Geral'}</span></td>
                <td>${mat.quantidade} ${mat.unidade || 'un'}</td>
                <td>R$ ${parseFloat(mat.custo_unitario || 0).toFixed(2)}</td>
                <td>${mat.fornecedor || '-'}</td>
                <td><button onclick="excluirMaterial(${mat.id})" style="background: var(--danger); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">Excluir</button></td>
            `;
            tabelaCorpo.appendChild(tr);
        });
    } catch (err) {
        console.error("Erro ao carregar inventário:", err);
        tabelaCorpo.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center;">Erro ao carregar os materiais do servidor.</td></tr>`;
    }
}

async function excluirMaterial(id) {
    if (!confirm("Tens a certeza que pretendes excluir este material do inventário?")) return;
    try {
        const res = await fetch(`${API_URL}/materiais/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data && (data.sucesso || data.success || data.ok)) {
            carregarInventario();
        } else {
            alert("Erro ao excluir material.");
        }
    } catch (err) {
        console.error("Erro na exclusão do material:", err);
    }
}

// Funções auxiliares para Gestão Local de Setores de Inventário
function obterSetoresInventario() {
    const salvos = localStorage.getItem('adore_setores_inventario');
    return salvos ? JSON.parse(salvos) : ['3D', 'Sublimação', 'Geral'];
}

function adicionarSetorInventarioLocal(nome) {
    const setores = obterSetoresInventario();
    if (!setores.includes(nome)) {
        setores.push(nome);
        localStorage.setItem('adore_setores_inventario', JSON.stringify(setores));
    }
}

function removerSetorInventarioLocal(nome) {
    let setores = obterSetoresInventario();
    setores = setores.filter(s => s !== nome);
    localStorage.setItem('adore_setores_inventario', JSON.stringify(setores));
}

function carregarSetoresInventarioSelect() {
    const setores = obterSetoresInventario();

    // Atualizar o dropdown do formulário de cadastro de inventário
    const selectForm = document.getElementById('matTipo');
    if (selectForm) {
        selectForm.innerHTML = '';
        setores.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.toLowerCase();
            opt.innerText = s;
            selectForm.appendChild(opt);
        });
    }

    // Atualizar o dropdown de exclusão na barra lateral
    const selectDel = document.getElementById('selectDelCatInv');
    if (selectDel) {
        selectDel.innerHTML = '<option value="">Selecionar setor...</option>';
        setores.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s;
            opt.innerText = s;
            selectDel.appendChild(opt);
        });
    }
}