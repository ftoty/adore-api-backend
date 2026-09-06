// ==========================================
// MÓDULO DE GESTÃO DE PEDIDOS & APROVAÇÕES
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();
});

async function carregarPedidos() {
    const tabelaCorpo = document.getElementById('tabelaPedidosCorpo');
    if (!tabelaCorpo) return;

    tabelaCorpo.innerHTML = `<tr><td colspan="6" style="color: var(--text-muted); text-align: center;">Carregando pedidos...</td></tr>`;

    try {
        const resposta = await fetch(`${API_URL}/pedidos`);
        if (!resposta.ok) throw new Error("Erro ao buscar pedidos do servidor.");

        const pedidos = await resposta.json();

        if (!pedidos || pedidos.length === 0) {
            tabelaCorpo.innerHTML = `<tr><td colspan="6" style="color: var(--text-muted); text-align: center;">Nenhum pedido registado no momento.</td></tr>`;
            return;
        }

        tabelaCorpo.innerHTML = '';
        pedidos.forEach(pedido => {
            const statusClass = pedido.status === 'aprovado' ? 'status-approved' : 'status-pending';
            const statusTexto = pedido.status === 'aprovado' ? 'Aprovado' : 'Aguardando Cliente';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${pedido.id}</td>
                <td>${pedido.cliente_email || pedido.cliente || 'Cliente'}</td>
                <td>${pedido.descricao || pedido.nome_peca || 'Peça Personalizada'}</td>
                <td>${pedido.motor_ia || 'Manual / Padrão'}</td>
                <td><span class="status-badge ${statusClass}">${statusTexto}</span></td>
                <td>
                    ${pedido.status !== 'aprovado' ? `<button onclick="aprovarPedido(${pedido.id})" style="background: var(--success); color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 10px;">Aprovar</button>` : '<span style="font-size:10px; color:var(--success);">Concluído</span>'}
                </td>
            `;
            tabelaCorpo.appendChild(tr);
        });
    } catch (err) {
        console.error("Erro ao carregar pedidos:", err);
        tabelaCorpo.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center;">Erro ao comunicar com o servidor de pedidos. (Modo de simulação ativo se backend ausente)</td></tr>`;
    }
}

async function aprovarPedido(id) {
    if (!confirm(`Deseja marcar o pedido #${id} como aprovado para produção?`)) return;

    try {
        const resposta = await fetch(`${API_URL}/pedidos/${id}/aprovar`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await resposta.json();
        if (resposta.ok || (data && data.sucesso)) {
            carregarPedidos();
        } else {
            alert("Erro ao atualizar estado do pedido.");
        }
    } catch (err) {
        console.error("Erro na aprovação:", err);
        alert("Erro de ligação ao servidor.");
    }
}