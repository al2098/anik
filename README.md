# Knitting Garments Management System

A comprehensive multi-vendor management system for knitting garments businesses.

## Features

- **Multi-Vendor Support**: Manage multiple vendors with separate data
- **Bill/Payment Statement**: Track all invoices, payments, and running balances
- **Yarn Statement Management**: Monitor yarn receipt, delivery, and shortages
- **Payroll System**: Complete employee salary management with bonuses and overtime
- **Export Reports**: Generate Excel/CSV reports for all modules
- **Dashboard Analytics**: Real-time insights into financial and operational metrics

## Quick Start

1. Clone the repository
2. Run `npm install`
3. Run `npm start`
4. Open `http://localhost:3000`

## Deployment

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Render**: Use the provided render.yaml configuration

## Data Import

Upload CSV files with the following formats:

### Bill Statement CSV
- Columns: DATE, DESCRIPTION, BILL AMOUNT, PAYMENT, YARN, DABIT NOT, BALANCE

### Yarn Statement CSV
- Columns: DATE, CHALLAN, LOT, YARN COUNT, BUYER, BOOKING, QTY, FABRIC, YARN

### Payroll CSV
- Columns: NAME, BANK ACCOUNT, DESIGNATION, GROSS SALARY, PRESENT, OT

## License

MIT