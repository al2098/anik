// Main Application Entry Point
import { StorageManager } from './utils/storage.js';
import { ExportManager } from './utils/export.js';
import { loadDashboard } from './components/Dashboard.js';
import { loadBillStatement } from './components/BillStatement.js';
import { loadYarnStatement } from './components/YarnStatement.js';
import { loadPayroll } from './components/Payroll.js';
import { loadVendorManagement } from './components/VendorManagement.js';
import { loadReports } from './components/Reports.js';
import { loadSettings } from './components/Settings.js';

// Global state
window.appState = {
    currentVendor: 'asrotex',
    currentPage: 'dashboard',
    data: {
        billStatements: {},
        yarnStatements: {},
        payroll: {},
        vendors: []
    },
    charts: {}
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load stored data
    loadStoredData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load initial page
    navigateTo('dashboard');
    
    // Setup vendor selector
    setupVendorSelector();
    
    // Show welcome toast
    showToast('Welcome to Knitting Garments Management System', 'success');
}

// Make globally available
window.showToast = showToast;
window.navigateTo = navigateTo;

function loadStoredData() {
    // Load vendors
    const vendors = StorageManager.getVendors();
    if (vendors.length === 0) {
        // Initialize with sample vendors
        StorageManager.initializeSampleData();
    }
    
    // Update state with loaded data
    window.appState.data.vendors = StorageManager.getVendors();
    window.appState.data.billStatements = StorageManager.getAllBillStatements();
    window.appState.data.yarnStatements = StorageManager.getAllYarnStatements();
    window.appState.data.payroll = StorageManager.getAllPayroll();
}

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    sidebarToggle?.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn?.addEventListener('click', () => {
        handleExport();
    });
    
    // Upload button
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn?.addEventListener('click', () => {
        showUploadModal();
    });
    
    // Modal close handlers
    setupModalHandlers();
}

function navigateTo(page) {
    // Update active state in sidebar
    document.querySelectorAll('.nav-item').forEach(item => {
        if (item.dataset.page === page) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
    
    // Update page title and subtitle
    const pageTitles = {
        dashboard: { title: 'Dashboard', subtitle: 'Overview of your business performance' },
        'bill-statement': { title: 'Bill Statement', subtitle: 'Manage invoices, payments, and balances' },
        'yarn-statement': { title: 'Yarn Statement', subtitle: 'Track yarn receipt, delivery, and shortages' },
        payroll: { title: 'Payroll', subtitle: 'Employee salary and attendance management' },
        vendors: { title: 'Vendors', subtitle: 'Manage all your business partners' },
        reports: { title: 'Reports', subtitle: 'Generate and export business reports' },
        settings: { title: 'Settings', subtitle: 'Configure system preferences' }
    };
    
    document.getElementById('pageTitle').textContent = pageTitles[page]?.title || 'Dashboard';
    document.getElementById('pageSubtitle').textContent = pageTitles[page]?.subtitle || '';
    
    window.appState.currentPage = page;
    
    // Load the appropriate component
    const pageContainer = document.getElementById('pageContainer');
    pageContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    
    setTimeout(() => {
        switch(page) {
            case 'dashboard':
                loadDashboard(pageContainer);
                break;
            case 'bill-statement':
                loadBillStatement(pageContainer);
                break;
            case 'yarn-statement':
                loadYarnStatement(pageContainer);
                break;
            case 'payroll':
                loadPayroll(pageContainer);
                break;
            case 'vendors':
                loadVendorManagement(pageContainer);
                break;
            case 'reports':
                loadReports(pageContainer);
                break;
            case 'settings':
                loadSettings(pageContainer);
                break;
            default:
                loadDashboard(pageContainer);
        }
    }, 100);
}

function setupVendorSelector() {
    const vendorSelect = document.getElementById('vendorSelect');
    const vendors = StorageManager.getVendors();
    
    vendorSelect.innerHTML = vendors.map(v => 
        `<option value="${v.id}">${v.name}</option>`
    ).join('');
    
    vendorSelect.addEventListener('change', (e) => {
        window.appState.currentVendor = e.target.value;
        showToast(`Switched to vendor: ${vendorSelect.options[vendorSelect.selectedIndex].text}`, 'info');
        
        // Reload current page with new vendor data
        navigateTo(window.appState.currentPage);
    });
}

function handleExport() {
    const currentPage = window.appState.currentPage;
    const vendorId = window.appState.currentVendor;
    
    switch(currentPage) {
        case 'bill-statement':
            ExportManager.exportBillStatement(vendorId);
            break;
        case 'yarn-statement':
            ExportManager.exportYarnStatement(vendorId);
            break;
        case 'payroll':
            ExportManager.exportPayroll(vendorId);
            break;
        default:
            ExportManager.exportAllData(vendorId);
    }
    
    showToast('Export completed successfully', 'success');
}

function showUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'flex';
    
    setupDropZone();
}

function setupModalHandlers() {
    const modal = document.getElementById('uploadModal');
    const closeBtn = modal?.querySelector('.modal-close');
    const cancelBtn = document.getElementById('cancelUpload');
    const confirmBtn = document.getElementById('confirmUpload');
    
    closeBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn?.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    confirmBtn?.addEventListener('click', () => {
        // Handle file confirmation
        modal.style.display = 'none';
        showToast('File uploaded successfully', 'success');
        navigateTo(window.appState.currentPage);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function setupDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    
    dropZone?.addEventListener('click', () => {
        fileInput.click();
    });
    
    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
        dropZone.style.background = 'var(--gray-50)';
    });
    
    dropZone?.addEventListener('dragleave', () => {
        dropZone.style.borderColor = 'var(--gray-300)';
        dropZone.style.background = 'transparent';
    });
    
    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        handleFileUpload(file);
    });
    
    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFileUpload(file);
    });
}

function handleFileUpload(file) {
    if (!file) return;
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (extension === 'csv') {
        parseCSV(file);
    } else if (['xlsx', 'xls'].includes(extension)) {
        parseExcel(file);
    } else {
        showToast('Please upload CSV or Excel file', 'error');
    }
}

function parseCSV(file) {
    Papa.parse(file, {
        header: true,
        complete: (results) => {
            processUploadedData(results.data);
        },
        error: (error) => {
            showToast('Error parsing CSV: ' + error.message, 'error');
        }
    });
}

function parseExcel(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        processUploadedData(jsonData);
    };
    reader.onerror = () => {
        showToast('Error reading Excel file', 'error');
    };
    reader.readAsArrayBuffer(file);
}

function processUploadedData(data) {
    const currentPage = window.appState.currentPage;
    const vendorId = window.appState.currentVendor;
    
    if (currentPage === 'bill-statement') {
        StorageManager.saveBillStatement(vendorId, data);
    } else if (currentPage === 'yarn-statement') {
        StorageManager.saveYarnStatement(vendorId, data);
    } else if (currentPage === 'payroll') {
        StorageManager.savePayroll(vendorId, data);
    }
    
    // Show preview in modal
    showDataPreview(data);
}

function showDataPreview(data) {
    const previewDiv = document.getElementById('uploadPreview');
    const previewTable = document.getElementById('previewTable');
    
    if (data && data.length > 0) {
        const headers = Object.keys(data[0]);
        const rows = data.slice(0, 5);
        
        let html = '<thead><tr>';
        headers.forEach(h => {
            html += `<th>${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        
        rows.forEach(row => {
            html += '<tr>';
            headers.forEach(h => {
                html += `<td>${row[h] || ''}</td>`;
            });
            html += '</tr>';
        });
        
        if (data.length > 5) {
            html += `<tr><td colspan="${headers.length}" style="text-align: center; color: var(--gray-500);">... and ${data.length - 5} more rows</td></tr>`;
        }
        
        html += '</tbody>';
        previewTable.innerHTML = html;
        previewDiv.style.display = 'block';
        document.getElementById('dropZone').style.display = 'none';
    }
}

export function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '<i class="fas fa-check-circle" style="color: var(--success);"></i>',
        error: '<i class="fas fa-exclamation-circle" style="color: var(--danger);"></i>',
        info: '<i class="fas fa-info-circle" style="color: var(--info);"></i>',
        warning: '<i class="fas fa-exclamation-triangle" style="color: var(--warning);"></i>'
    };
    
    toast.innerHTML = `${icons[type]}<span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add animation keyframes to document
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);