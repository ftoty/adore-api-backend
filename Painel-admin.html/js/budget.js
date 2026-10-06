const BUDGET_STORAGE_KEY = 'adore-orcamentos-locais';
let budgetState = { itens: [], cliente: null, documento: null };

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4200);
}

function abrirModalOrcamento() {
    if (!document.getElementById('modalOrcamento')) return;
    const modal = document.getElementById('modalOrcamento');
    modal.classList.remove('hidden');
    document.body.classList.add('modal-open');
    carregarClientesOrcamento();
    carregarOrcamentosOrcamento();
}

function fecharModalOrcamento() {
    const modal = document.getElementById('modalOrcamento');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.classList.remove('modal-open');
}

async function carregarClientesOrcamento() {
    const select = document.getElementById('budgetClienteSelect');
    if (!select) return;
    select.innerHTML = '<option value="">Selecione um cliente...</option>';
    try {
        const response = await fetch(`${API_URL || ''}/api/clientes`);
        if (!response.ok) throw new Error('Não foi possível carregar clientes.');
        const clientes = await response.json();
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = `${cliente.nome} — ${cliente.email || cliente.telefone || 'Sem contato'}`;
            select.appendChild(option);
        });
    } catch (error) {
        select.innerHTML = '<option value="">Clientes indisponíveis</option>';
        console.warn(error.message);
    }
}

async function carregarOrcamentosOrcamento() {
    const list = document.getElementById('budgetOrcamentosLista');
    if (!list) return;
    list.innerHTML = '<p class="budget-empty">Nenhum orçamento salvo.</p>';
    try {
        const response = await fetch(`${API_URL || ''}/api/orcamentos`);
        if (!response.ok) throw new Error('Não foi possível carregar orçamentos.');
        const orcamentos = await response.json();
        list.innerHTML = orcamentos.slice(0, 5).map(item => `
            <button class="budget-history-item" type="button" data-orcamento-id="${item.id}">
                <span>${item.cliente_nome || 'Cliente'} · ${new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                <strong>${formatCurrency(item.total)}</strong>
            </button>
        `).join('') || '<p class="budget-empty">Nenhum orçamento salvo.</p>';
        list.querySelectorAll('[data-orcamento-id]').forEach(button => {
            button.addEventListener('click', () => abrirOrcamentoPorId(button.dataset.orcamentoId));
        });
    } catch (error) {
        console.warn(error.message);
    }
}

function adicionarItemOrcamento() {
    const descricao = document.getElementById('budgetDescricao').value.trim();
    const quantidade = Number(document.getElementById('budgetQuantidade').value);
    const unitario = Number(document.getElementById('budgetUnitario').value);
    if (!descricao || !Number.isFinite(quantidade) || quantidade <= 0 || !Number.isFinite(unitario) || unitario < 0) {
        showToast('Preencha descrição, quantidade e preço válidos.', 'error');
        return;
    }
    budgetState.itens.push({ descricao, quantidade, unitario });
    renderItemsOrcamento();
    document.getElementById('budgetDescricao').value = '';
    document.getElementById('budgetQuantidade').value = '';
    document.getElementById('budgetUnitario').value = '';
}

function renderItemsOrcamento() {
    const list = document.getElementById('budgetItensLista');
    const total = document.getElementById('budgetTotal');
    if (!list || !total) return;
    list.innerHTML = budgetState.itens.length ? budgetState.itens.map((item, index) => `
        <div class="budget-item-row">
            <div><strong>${escapeHtml(item.descricao)}</strong><small>${item.quantidade} × ${formatCurrency(item.unitario)}</small></div>
            <span>${formatCurrency(item.quantidade * item.unitario)}</span>
            <button type="button" class="budget-remove" data-index="${index}" aria-label="Remover item">×</button>
        </div>
    `).join('') : '<p class="budget-empty">Adicione um item para começar o orçamento.</p>';
    const totalValor = budgetState.itens.reduce((sum, item) => sum + item.quantidade * item.unitario, 0);
    total.textContent = formatCurrency(totalValor);
    list.querySelectorAll('[data-index]').forEach(button => {
        button.addEventListener('click', () => {
            budgetState.itens.splice(Number(button.dataset.index), 1);
            renderItemsOrcamento();
        });
    });
}

function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

async function salvarOrcamento() {
    const clienteId = document.getElementById('budgetClienteSelect').value;
    const clienteNome = document.getElementById('budgetClienteNome').value.trim();
    const email = document.getElementById('budgetClienteEmail').value.trim();
    const telefone = document.getElementById('budgetClienteTelefone').value.trim();
    const obs = document.getElementById('budgetObservacoes').value.trim();
    if (!clienteId && !clienteNome) {
        showToast('Selecione ou informe um cliente.', 'error');
        return;
    }
    if (!budgetState.itens.length) {
        showToast('Adicione pelo menos um item.', 'error');
        return;
    }
    const payload = {
        clienteId: clienteId || null,
        cliente: { nome: clienteNome, email, telefone },
        itens: budgetState.itens,
        observacoes: obs,
        total: budgetState.itens.reduce((sum, item) => sum + item.quantidade * item.unitario, 0),
        documento: budgetState.documento
    };
    try {
        const response = await fetch(`${API_URL || ''}/api/orcamentos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.mensagem || 'Não foi possível salvar o orçamento.');
        const localOrcamento = { ...result.orcamento, itens: budgetState.itens };
        const existing = JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY) || '[]');
        localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify([localOrcamento, ...existing].slice(0, 20)));
        showToast('Orçamento salvo com sucesso.');
        await carregarOrcamentosOrcamento();
        if (budgetState.documento) await enviarOrcamentoPorEmail(result.orcamento.id, budgetState.documento);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function baixarPdfOrcamento() {
    if (!budgetState.itens.length) {
        showToast('Adicione itens antes de gerar o PDF.', 'error');
        return;
    }
    const cliente = document.getElementById('budgetClienteNome').value.trim() || document.getElementById('budgetClienteSelect').selectedOptions[0]?.textContent || 'Cliente';
    const total = budgetState.itens.reduce((sum, item) => sum + item.quantidade * item.unitario, 0);
    const lines = budgetState.itens.map((item, index) => `${index + 1}. ${item.descricao} — ${item.quantidade} × ${formatCurrency(item.unitario)} — ${formatCurrency(item.quantidade * item.unitario)}`);
    const content = [
        'ADORÊ — ORÇAMENTO',
        `Cliente: ${cliente}`,
        `Data: ${new Date().toLocaleDateString('pt-BR')}`,
        '',
        ...lines,
        '',
        `TOTAL: ${formatCurrency(total)}`
    ].join('\n');
    const escaped = content.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const objects = [
        '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj',
        '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj',
        '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj',
        '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj',
        `5 0 obj\n<< /Length ${escaped.length} >>\nstream\nBT /F1 12 Tf 40 750 Td (${escaped}) Tj ET\nendstream\nendobj`
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${object}\n`; });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => { pdf += `${offset.toString().padStart(10, '0')} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    const blob = new Blob([pdf], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orcamento-adore-${Date.now()}.pdf`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

async function enviarOrcamentoPorEmail(id, file) {
    const email = document.getElementById('budgetClienteEmail').value.trim();
    if (!email || !file) return;
    const response = await fetch(`${API_URL || ''}/api/orcamentos/${id}/enviar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, nomeDocumento: file.name })
    });
    if (!response.ok) throw new Error('O orçamento foi salvo, mas o envio falhou.');
    showToast('Orçamento enviado por e-mail com sucesso.');
}

function anotarDocumentoOrcamento(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        budgetState.documento = { name: file.name, data: String(reader.result).split(',')[1], mimeType: file.type };
        document.getElementById('budgetDocumentoStatus').textContent = `Documento anexado: ${file.name}`;
        showToast('PDF anexado ao orçamento.');
    };
    reader.readAsDataURL(file);
}

async function abrirOrcamentoPorId(id) {
    const local = JSON.parse(localStorage.getItem(BUDGET_STORAGE_KEY) || '[]').find(item => item.id === Number(id));
    if (!local) {
        showToast('Orçamento não encontrado no dispositivo.', 'error');
        return;
    }
    budgetState = { itens: local.itens, cliente: local.cliente, documento: null };
    document.getElementById('budgetClienteSelect').value = '';
    document.getElementById('budgetClienteNome').value = local.cliente?.nome || '';
    document.getElementById('budgetClienteEmail').value = local.cliente?.email || '';
    document.getElementById('budgetClienteTelefone').value = local.cliente?.telefone || '';
    renderItemsOrcamento();
    abrirModalOrcamento();
}

function carregarDadosStlNoOrcamento() {
    const analysis = window.stlAnalysis;
    if (!analysis) {
        showToast('Análise do STL não encontrada. Importar um arquivo primeiro.', 'error');
        return false;
    }
    document.getElementById('budgetClienteNome').value = document.getElementById('budgetClienteNome').value || 'Cliente';
    document.getElementById('calcPeso').value = analysis.pesoGramas;
    document.getElementById('stlDimX').value = analysis.tamanhoX.toFixed(2);
    document.getElementById('stlDimY').value = analysis.tamanhoY.toFixed(2);
    document.getElementById('stlDimZ').value = analysis.tamanhoZ.toFixed(2);
    document.getElementById('stlMaterial').value = analysis.material;
    document.getElementById('calcHoras').value = (analysis.pesoGramas / 12).toFixed(1);
    document.getElementById('budgetDescricao').value = `Peça 3D - ${analysis.material}`;
    document.getElementById('budgetQuantidade').value = '1';
    document.getElementById('budgetUnitario').value = document.getElementById('precoSugerido').textContent.replace(/[^0-9,.-]/g, '').replace(',', '.');
    mostrarItemNoOrcamento(analysis);
}

function mostrarItemNoOrcamento(analysis) {
    budgetState.itens.push({
        descricao: `Peça 3D (${analysis.tamanhoX.toFixed(2)} × ${analysis.tamanhoY.toFixed(2)} × ${analysis.tamanhoZ.toFixed(2)} cm)`,
        quantidade: 1,
        unitario: Number(document.getElementById('budgetUnitario').value) || 0
    });
    renderItemsOrcamento();
}
