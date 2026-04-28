// Storage Management for IndexedDB / LocalStorage

const STORAGE_KEYS = {
    VENDORS: 'kgm_vendors',
    BILL_STATEMENTS: 'kgm_bill_statements',
    YARN_STATEMENTS: 'kgm_yarn_statements',
    PAYROLL: 'kgm_payroll',
    SETTINGS: 'kgm_settings'
};

export const StorageManager = {
    // Vendor Management
    getVendors() {
        const vendors = localStorage.getItem(STORAGE_KEYS.VENDORS);
        return vendors ? JSON.parse(vendors) : [];
    },
    
    addVendor(vendor) {
        const vendors = this.getVendors();
        vendor.id = vendor.id || Date.now().toString();
        vendor.createdAt = new Date().toISOString();
        vendors.push(vendor);
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
        return vendor;
    },
    
    updateVendor(vendorId, updates) {
        const vendors = this.getVendors();
        const index = vendors.findIndex(v => v.id === vendorId);
        if (index !== -1) {
            vendors[index] = { ...vendors[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
            return vendors[index];
        }
        return null;
    },
    
    deleteVendor(vendorId) {
        const vendors = this.getVendors();
        const filtered = vendors.filter(v => v.id !== vendorId);
        localStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(filtered));
        
        // Also delete vendor data
        this.deleteVendorData(vendorId);
    },
    
    // Bill Statement Management
    getBillStatement(vendorId) {
        const all = this.getAllBillStatements();
        return all[vendorId] || [];
    },
    
    getAllBillStatements() {
        const data = localStorage.getItem(STORAGE_KEYS.BILL_STATEMENTS);
        return data ? JSON.parse(data) : {};
    },
    
    saveBillStatement(vendorId, data) {
        const all = this.getAllBillStatements();
        all[vendorId] = data;
        localStorage.setItem(STORAGE_KEYS.BILL_STATEMENTS, JSON.stringify(all));
    },
    
    addBillTransaction(vendorId, transaction) {
        const statements = this.getBillStatement(vendorId);
        transaction.id = Date.now();
        transaction.date = transaction.date || new Date().toISOString().split('T')[0];
        statements.push(transaction);
        this.saveBillStatement(vendorId, statements);
        return transaction;
    },
    
    // Yarn Statement Management
    getYarnStatement(vendorId) {
        const all = this.getAllYarnStatements();
        return all[vendorId] || [];
    },
    
    getAllYarnStatements() {
        const data = localStorage.getItem(STORAGE_KEYS.YARN_STATEMENTS);
        return data ? JSON.parse(data) : {};
    },
    
    saveYarnStatement(vendorId, data) {
        const all = this.getAllYarnStatements();
        all[vendorId] = data;
        localStorage.setItem(STORAGE_KEYS.YARN_STATEMENTS, JSON.stringify(all));
    },
    
    addYarnTransaction(vendorId, transaction) {
        const statements = this.getYarnStatement(vendorId);
        transaction.id = Date.now();
        statements.push(transaction);
        this.saveYarnStatement(vendorId, statements);
        return transaction;
    },
    
    // Payroll Management
    getPayroll(vendorId) {
        const all = this.getAllPayroll();
        return all[vendorId] || [];
    },
    
    getAllPayroll() {
        const data = localStorage.getItem(STORAGE_KEYS.PAYROLL);
        return data ? JSON.parse(data) : {};
    },
    
    savePayroll(vendorId, data) {
        const all = this.getAllPayroll();
        all[vendorId] = data;
        localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(all));
    },
    
    addEmployee(vendorId, employee) {
        const payroll = this.getPayroll(vendorId);
        employee.id = Date.now();
        payroll.push(employee);
        this.savePayroll(vendorId, payroll);
        return employee;
    },
    
    updateEmployee(vendorId, employeeId, updates) {
        const payroll = this.getPayroll(vendorId);
        const index = payroll.findIndex(e => e.id === employeeId);
        if (index !== -1) {
            payroll[index] = { ...payroll[index], ...updates };
            this.savePayroll(vendorId, payroll);
            return payroll[index];
        }
        return null;
    },
    
    deleteEmployee(vendorId, employeeId) {
        const payroll = this.getPayroll(vendorId);
        const filtered = payroll.filter(e => e.id !== employeeId);
        this.savePayroll(vendorId, filtered);
    },
    
    // Settings
    getSettings() {
        const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : {
            companyName: 'Anik Knitting',
            currency: 'BDT',
            dateFormat: 'DD/MM/YYYY',
            taxRate: 0
        };
    },
    
    saveSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    },
    
    // Helper Methods
    deleteVendorData(vendorId) {
        const billData = this.getAllBillStatements();
        delete billData[vendorId];
        localStorage.setItem(STORAGE_KEYS.BILL_STATEMENTS, JSON.stringify(billData));
        
        const yarnData = this.getAllYarnStatements();
        delete yarnData[vendorId];
        localStorage.setItem(STORAGE_KEYS.YARN_STATEMENTS, JSON.stringify(yarnData));
        
        const payrollData = this.getAllPayroll();
        delete payrollData[vendorId];
        localStorage.setItem(STORAGE_KEYS.PAYROLL, JSON.stringify(payrollData));
    },
    
    clearAllData() {
        localStorage.removeItem(STORAGE_KEYS.VENDORS);
        localStorage.removeItem(STORAGE_KEYS.BILL_STATEMENTS);
        localStorage.removeItem(STORAGE_KEYS.YARN_STATEMENTS);
        localStorage.removeItem(STORAGE_KEYS.PAYROLL);
        localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    },
    
    initializeSampleData() {
        // Add sample vendor
        this.addVendor({
            name: 'ASROTEX',
            contactPerson: 'Asrotex Team',
            email: 'asrotex@example.com',
            phone: '+880123456789',
            address: 'BSCIC, Narayanganj'
        });
        
        this.addVendor({
            name: 'ANIK KNITTING',
            contactPerson: 'Anik Knitting Team',
            email: 'anik@example.com',
            phone: '+880987654321',
            address: 'BSCIC, Narayanganj'
        });
    }
};