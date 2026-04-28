import { StorageManager } from '../utils/storage.js';

let chartInstances = {};

export function loadDashboard(container) {
    const vendorId = window.appState.currentVendor;
    const billData = StorageManager.getBillStatement(vendorId);
    const yarnData = StorageManager.getYarnStatement(vendorId);
    const payrollData = StorageManager.getPayroll(vendorId);
    
    // Calculate metrics
    const metrics = calculateMetrics(billData, yarnData, payrollData);
    
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Revenue</span>
                    <i class="fas fa-chart-line"></i>
                </div>
                <div class="stat-card-value">${formatCurrency(metrics.totalRevenue)}</div>
                <div class="stat-card-change positive">+12.5% from last month</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Payments Received</span>
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <div class="stat-card-value">${formatCurrency(metrics.totalPayments)}</div>
                <div class="stat-card-change positive">+8.3% from last month</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Outstanding Balance</span>
                    <i class="fas fa-clock"></i>
                </div>
                <div class="stat-card-value">${formatCurrency(metrics.outstandingBalance)}</div>
                <div class="stat-card-change negative">-3.2% from last month</div>
            </div>
            <div class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-card-title">Total Employees</span>
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-card-value">${metrics.totalEmployees}</div>
                <div class="stat-card-change">Active staff</div>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-card">
                <h3>Monthly Revenue Trend</h3>
                <div class="chart-container">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Payment vs Outstanding</h3>
                <div class="chart-container">
                    <canvas id="paymentChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Yarn Shortage Analysis</h3>
                <div class="chart-container">
                    <canvas id="yarnChart"></canvas>
                </div>
            </div>
            <div class="chart-card">
                <h3>Department Payroll Distribution</h3>
                <div class="chart-container">
                    <canvas id="payrollChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="data-table-container">
            <div class="table-toolbar">
                <h2>Recent Transactions</h2>
                <a href="#" data-page="bill-statement" class="btn-secondary view-all-link">View All</a>
            </div>
            <div style="overflow-x: auto;">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Bill Amount</th>
                            <th>Payment</th>
                            <th>Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${renderRecentTransactions(billData)}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // Initialize charts after DOM is ready
    setTimeout(() => {
        initializeCharts(billData, yarnData, payrollData);
    }, 100);
    
    // Setup view all link
    document.querySelector('.view-all-link')?.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.closest('a').dataset.page;
        if (page && window.navigateTo) {
            window.navigateTo(page);
        }
    });
}

function calculateMetrics(billData, yarnData, payrollData) {
    const totalRevenue = billData.reduce((sum, row) => sum + (parseFloat(row['BILL AMOUNT']) || 0), 0);
    const totalPayments = billData.reduce((sum, row) => sum + (parseFloat(row['PAYMENT']) || 0), 0);
    const outstandingBalance = totalRevenue - totalPayments;
    const totalEmployees = payrollData.length;
    
    return {
        totalRevenue,
        totalPayments,
        outstandingBalance,
        totalEmployees
    };
}

function renderRecentTransactions(data) {
    if (!data || data.length === 0) {
        return `<tr><td colspan="5" style="text-align: center;">No recent transactions</td></tr>`;
    }
    
    return data.slice(-5).reverse().map(row => `
        <tr>
            <td>${row.DATE || row.date || ''}</td>
            <td>${(row.DESCRIPTION || row.description || '').substring(0, 30)}</td>
            <td class="amount">${formatCurrency(row['BILL AMOUNT'] || row.billAmount || 0)}</td>
            <td class="amount">${formatCurrency(row['PAYMENT'] || row.payment || 0)}</td>
            <td class="amount">${formatCurrency(row['BALANCER'] || row.balancer || 0)}</td>
        </tr>
    `).join('');
}

function initializeCharts(billData, yarnData, payrollData) {
    // Destroy existing charts
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
        const monthlyData = aggregateMonthlyData(billData);
        chartInstances.revenue = new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Revenue',
                    data: monthlyData.revenue,
                    borderColor: '#2D6A4F',
                    backgroundColor: 'rgba(45, 106, 79, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Payments',
                    data: monthlyData.payments,
                    borderColor: '#FFB703',
                    backgroundColor: 'rgba(255, 183, 3, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Payment vs Outstanding Chart
    const paymentCtx = document.getElementById('paymentChart')?.getContext('2d');
    if (paymentCtx) {
        const totals = calculateTotals(billData);
        chartInstances.payment = new Chart(paymentCtx, {
            type: 'doughnut',
            data: {
                labels: ['Payments Received', 'Outstanding Balance'],
                datasets: [{
                    data: [totals.payments, totals.outstanding],
                    backgroundColor: ['#2D6A4F', '#E53935'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Yarn Shortage Chart
    const yarnCtx = document.getElementById('yarnChart')?.getContext('2d');
    if (yarnCtx && yarnData.length > 0) {
        const shortageData = extractYarnShortage(yarnData);
        chartInstances.yarn = new Chart(yarnCtx, {
            type: 'bar',
            data: {
                labels: shortageData.labels,
                datasets: [{
                    label: 'Yarn Shortage (KG)',
                    data: shortageData.shortages,
                    backgroundColor: '#FB8C00',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Shortage (KG)' } }
                }
            }
        });
    }
    
    // Payroll Distribution Chart
    const payrollCtx = document.getElementById('payrollChart')?.getContext('2d');
    if (payrollCtx && payrollData.length > 0) {
        const deptData = aggregateByDepartment(payrollData);
        chartInstances.payroll = new Chart(payrollCtx, {
            type: 'bar',
            data: {
                labels: deptData.labels,
                datasets: [{
                    label: 'Monthly Salary',
                    data: deptData.salaries,
                    backgroundColor: '#40916C',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                scales: {
                    x: { title: { display: true, text: 'Salary (BDT)' } }
                }
            }
        });
    }
}

function aggregateMonthlyData(data) {
    const monthlyMap = new Map();
    
    data.forEach(row => {
        const date = row.DATE || row.date;
        if (date) {
            const month = date.substring(0, 7);
            const revenue = parseFloat(row['BILL AMOUNT'] || row.billAmount || 0);
            const payment = parseFloat(row['PAYMENT'] || row.payment || 0);
            
            if (!monthlyMap.has(month)) {
                monthlyMap.set(month, { revenue: 0, payments: 0 });
            }
            const current = monthlyMap.get(month);
            current.revenue += revenue;
            current.payments += payment;
        }
    });
    
    const sorted = Array.from(monthlyMap.entries()).sort();
    return {
        labels: sorted.map(([month]) => month),
        revenue: sorted.map(([, data]) => data.revenue),
        payments: sorted.map(([, data]) => data.payments)
    };
}

function calculateTotals(data) {
    const revenue = data.reduce((sum, row) => sum + (parseFloat(row['BILL AMOUNT']) || 0), 0);
    const payments = data.reduce((sum, row) => sum + (parseFloat(row['PAYMENT']) || 0), 0);
    return { revenue, payments, outstanding: revenue - payments };
}

function extractYarnShortage(data) {
    const shortages = [];
    const labels = [];
    
    data.forEach(row => {
        const remarks = row.REMARKS || row.remarks || '';
        const shortageMatch = remarks.match(/SHORT\s+([\d.]+)\s*KG/i);
        if (shortageMatch) {
            labels.push(row['BILL NO'] || row.billNo || 'Unknown');
            shortages.push(parseFloat(shortageMatch[1]));
        }
    });
    
    return { labels: labels.slice(0, 10), shortages: shortages.slice(0, 10) };
}

function aggregateByDepartment(data) {
    const deptMap = new Map();
    
    data.forEach(emp => {
        const dept = emp.DESIGANATION || emp.designation || 'General';
        const salary = parseFloat(emp['GROSS SALARY'] || emp.grossSalary || 0);
        
        deptMap.set(dept, (deptMap.get(dept) || 0) + salary);
    });
    
    const sorted = Array.from(deptMap.entries()).sort((a, b) => b[1] - a[1]);
    return {
        labels: sorted.map(([dept]) => dept),
        salaries: sorted.map(([, salary]) => salary)
    };
}

function formatCurrency(amount) {
    const num = parseFloat(amount) || 0;
    return '₱ ' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}