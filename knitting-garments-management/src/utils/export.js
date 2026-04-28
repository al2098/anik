export const ExportManager = {
    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Add headers
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header] || '';
                // Escape quotes and commas
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        this.downloadBlob(blob, `${filename}.csv`);
    },
    
    exportToExcel(data, filename) {
        if (!data || data.length === 0) {
            alert('No data to export');
            return;
        }
        
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    },
    
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    exportBillStatement(vendorId) {
        import('./storage.js').then(({ StorageManager }) => {
            const data = StorageManager.getBillStatement(vendorId);
            const vendor = StorageManager.getVendors().find(v => v.id === vendorId);
            this.exportToExcel(data, `${vendor?.name || vendorId}_Bill_Statement`);
        });
    },
    
    exportYarnStatement(vendorId) {
        import('./storage.js').then(({ StorageManager }) => {
            const data = StorageManager.getYarnStatement(vendorId);
            const vendor = StorageManager.getVendors().find(v => v.id === vendorId);
            this.exportToExcel(data, `${vendor?.name || vendorId}_Yarn_Statement`);
        });
    },
    
    exportPayroll(vendorId, month = null) {
        import('./storage.js').then(({ StorageManager }) => {
            let data = StorageManager.getPayroll(vendorId);
            if (month) {
                data = data.filter(emp => emp.month === month);
            }
            const vendor = StorageManager.getVendors().find(v => v.id === vendorId);
            this.exportToExcel(data, `${vendor?.name || vendorId}_Payroll`);
        });
    },
    
    exportAllData(vendorId) {
        import('./storage.js').then(({ StorageManager }) => {
            const vendor = StorageManager.getVendors().find(v => v.id === vendorId);
            const allData = {
                vendor: vendor,
                billStatements: StorageManager.getBillStatement(vendorId),
                yarnStatements: StorageManager.getYarnStatement(vendorId),
                payroll: StorageManager.getPayroll(vendorId)
            };
            this.exportToExcel([allData], `${vendor?.name || vendorId}_All_Data`);
        });
    },
    
    printReport(elementId) {
        const printContent = document.getElementById(elementId);
        if (!printContent) return;
        
        const originalTitle = document.title;
        document.title = 'Print Report';
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Knitting Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { border-collapse: collapse; width: 100%; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background: #f5f5f5; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent.innerHTML}
                    <div class="no-print" style="margin-top: 20px; text-align: center;">
                        <button onclick="window.print()">Print</button>
                    </div>
                </body>
            </html>
        `);
        printWindow.document.close();
        
        document.title = originalTitle;
    }
};