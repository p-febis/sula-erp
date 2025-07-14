# Sula ERP

Sula ERP is a modern business management system designed to help companies streamline operations and improve productivity.
It is currently under active development and aims to provide a flexible and user-friendly experience for managing sales, inventory, finances, HR, and more.

## Project Status
Sula ERP is currently in the early stages of development. The core features are being implemented, and we are working towards a stable release.

## Features (Planned and In Progress)
- **Sales Management**: Manage customer orders, invoicing, and sales reporting.
- **Inventory Management**: Track stock levels, manage suppliers, and handle purchase orders.
- **Financial Management**: Manage accounts, transactions, and financial reporting.
- **Human Resources**: Manage employee records, payroll, and performance tracking.
- **User Management**: Role-based access control and user permissions.
- **Reporting and Analytics**: Generate reports for sales, inventory, finances, and more.
- **Multi-language Support**: Support for multiple languages to cater to a global audience.
- **Customer Management**: Manage customer information, interactions, and support tickets.

## Tech Stack
- **Backend**: Node.js, TypeScript, H3, Prisma, PostgreSQL
- **Frontend**: React, Tanstack Query, Tailwind CSS, TypeScript, Shadcn UI

## Getting Started
To get started with Sula ERP, follow these steps:
**Clone the Repository**:
   ```bash
   git clone https://github.com/p-febis/sula-erp.git
   ```

### Backend
1. **Navigate to the Backend Directory**:
   ```bash
   cd sula-erp/backend
   ```
2. **Install Dependencies**:
```bash
pnpm install
```

3. **Set Up Environment Variables**:
   Create a `.env` file in the `backend` (based on the `.env.example`) and configure your database connection and other settings.

4. **Run Migrations**:
   ```bash
    pnpm prisma migrate dev --name init
    ```

5. **Start the Backend Server**:
   ```bash
   pnpm tsx src/main.ts
   ```

### Frontend
1. **Navigate to the Frontend Directory**:
   ```bash
   cd sula-erp/frontend
   ```

2. **Install Dependencies**:
   ```bash
    pnpm install
    ```
3. **Start the Frontend Development Server**:
   ```bash
   pnpm dev
   ```
4. **Access the Application**:
    Open your web browser and go to `http://localhost:5173` to access the Sula ERP application.
