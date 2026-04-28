import { StorageManager } from '../utils/storage.js';
import { ExportManager } from '../utils/export.js';

function showToast(message, type = 'info') {
    if (window.showToast) {
        window.showToast(message, type);
    } else {
        console.log(`Toast (${type}): ${message}`);
    }
}

export function loadBillStatement(container) {
    const vendorId = window.appState.currentVendor;
    const data = StorageManager.getBillStatement(vendorId);
    
    // Calculate summary metrics
    const totalBills = data.reduce((sum, row) => sum + (parseFloat(row['BILL AMOUNT']) || 0), 0);
    const totalPayments = data.reduce((sum, row) => sum + (parseFloat(row['PAYMENT']) || 0), 0);
    const currentBalance = totalBills - totalPayments;
    const lastBalance = data.length > 0 ? parseFloat(data[data.length - 1]['BALANCER'] || 0) : 0;
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Bills</span>
                    <i class="fas fa-file-invoice"></i>
                </div>
                <div class="stat-card-value">${formatCurrency(totalBills)}</div>
                <div class="stat-card-change">All time invoices</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Payments</span>
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="stat-card-value">${formatCurrency(totalPayments)}</div>
                <div class="stat-card-change">Received payments</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Current Balance</span>
                    <i class="fas fa-balance-scale"></i>
                </div>
                <div class="stat-card-value ${currentBalance >= 0 ? '' : 'negative'}">${formatCurrency(currentBalance)}</div>
                <div class="stat-card-change">Outstanding amount</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Last Balance</span>
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-card-value">${formatCurrency(lastBalance)}</div>
                <div class="stat-card-change">Latest running balance</div>
            </div>
        </div>
        
        <div class="data-table-container">
            <div class="table-toolbar">
                <h2>Bill Statement Transactions</h2>
                <div class="table-actions">
                    <input type="text" class="search-input" placeholder="Search by description or bill no..." id="searchInput">
                    <button class="btn-primary" id="addTransactionBtn">
                        <i class="fas fa-plus"></i> Add Transaction
                    </button>
                </div>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table" id="billTable">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Bill Amount</th>
                            <th>Payment</th>
                            <th>Balance</th>
                            <th>Remarks</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="billTableBody">
                        ${renderTableRows(data)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Setup event listeners
    document.getElementById('searchInput')?.addEventListener('input', (e) => {
        filterTable(e.target.value, data);
    });
    
    document.getElementById('addTransactionBtn')?.addEventListener('click', () => {
        showAddTransactionModal();
    });
    
    // Setup row action buttons
    setupRowActions(data);
}

function renderTableRows(data) {
    if (!data || data.length === 0) {
        return `<tr><td colspan="7" style="text-align: center; padding: 40px;">
            <i class="fas fa-inbox" style="font-size: 48px; color: var(--gray-400);"></i>
            <p style="margin-top: 10px;">No transactions found. Click "Add Transaction" to get started.</p>
        </td></tr>`;
    }
    
    return data.map(row => `
        <tr data-id="${row.id || Math.random()}">
            <td>${row.DATE || row.date || ''}</td>
            <td>${row.DESCRIPTION || row.description || ''}</td>
            <td class="amount">${formatCurrency(row['BILL AMOUNT'] || row.billAmount || 0)}</td>
            <td class="amount">${formatCurrency(row['PAYMENT'] || row.payment || 0)}</td>
            <td class="amount">${formatCurrency(row['BALANCER'] || row.balancer || row.BALANCE || 0)}</td>
            <td>${row['REMARKS'] || row.remarks || ''}</td>
            <td>
                <button class="btn-icon edit-row" data-id="${row.id || row.DATE}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon delete-row" data-id="${row.id || row.DATE}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function filterTable(searchTerm, data) {
    const filtered = data.filter(row => {
        const description = (row.DESCRIPTION || row.description || '').toLowerCase();
        const billNo = (row['BILL NO'] || '').toLowerCase();
        return description.includes(searchTerm.toLowerCase()) || billNo.includes(searchTerm.toLowerCase());
    });
    
    const tbody = document.getElementById('billTableBody');
    if (tbody) {
        tbody.innerHTML = renderTableRows(filtered);
        setupRowActions(filtered);
    }
}

function setupRowActions(data) {
    document.querySelectorAll('.edit-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const row = data.find(r => (r.id || r.DATE) == id);
            if (row) showEditTransactionModal(row);
        });
    });
    
    document.querySelectorAll('.delete-row').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            if (confirm('Are you sure you want to delete this transaction?')) {
                const vendorId = window.appState.currentVendor;
                const data = StorageManager.getBillStatement(vendorId);
                const filtered = data.filter(r => (r.id || r.DATE) != id);
                StorageManager.saveBillStatement(vendorId, filtered);
                showToast('Transaction deleted successfully', 'success');
                loadBillStatement(document.getElementById('pageContainer'));
            }
        });
    });
}

function showAddTransactionModal() {
    const modalHtml = `
        <div id="transactionModal" class="modal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Transaction</h3>
                    <button class="modal-close" id="closeModal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="transactionForm">
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" name="date" required>
                        </div>
                        <div class="form-group">
                            <label>Description / Bill No</label>
                            <input type="text" name="description" placeholder="e.g., BILL NO 1864" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Bill Amount</label>
                                <input type="number" name="billAmount" step="0.01" value="0">
                            </div>
                            <div class="form-group">
                                <label>Payment Amount</label>
                                <input type="number" name="payment" step="0.01" value="0">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Remarks</label>
                            <textarea name="remarks" rows="2" placeholder="Optional remarks"></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" id="cancelModal">Cancel</button>
                    <button class="btn-primary" id="saveTransaction">Save Transaction</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('transactionModal');
    const closeModal = () => modal.remove();
    
    document.getElementById('closeModal')?.addEventListener('click', closeModal);
    document.getElementById('cancelModal')?.addEventListener('click', closeModal);
    
    document.getElementById('saveTransaction')?.addEventListener('click', () => {
        const form = document.getElementById('transactionForm');
        const formData = new FormData(form);
        
        const transaction = {
            DATE: formData.get('date'),
            DESCRIPTION: formData.get('description'),
            'BILL AMOUNT': parseFloat(formData.get('billAmount')) || 0,
            PAYMENT: parseFloat(formData.get('payment')) || 0,
            REMARKS: formData.get('remarks'),
            id: Date.now()
        };
        
        const vendorId = window.appState.currentVendor;
        const currentData = StorageManager.getBillStatement(vendorId);
        
        // Calculate running balance
        let lastBalance = currentData.length > 0 ? parseFloat(currentData[currentData.length - 1]['BALANCER'] || 0) : 0;
        transaction['BALANCER'] = lastBalance + transaction['BILL AMOUNT'] - transaction['PAYMENT'];
        
        currentData.push(transaction);
        StorageManager.saveBillStatement(vendorId, currentData);
        
        showToast('Transaction added successfully', 'success');
        closeModal();
        loadBillStatement(document.getElementById('pageContainer'));
    });
}

function showEditTransactionModal(row) {
    // Similar to add modal but pre-filled with existing data
    showToast('Edit feature coming soon', 'info');
}

function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '₱ ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}