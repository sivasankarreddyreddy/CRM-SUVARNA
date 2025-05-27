# Suvarna Healthcare CRM

A comprehensive Healthcare Information Management System (HIMS) CRM designed specifically for medical sales teams serving hospitals and diagnostic centers across India.

## Features

- **Lead & Contact Management**: Capture leads from hospitals and diagnostic centers, manage contact persons, track communication history
- **Sales Pipeline & Opportunities**: Track opportunities from initial contact to deal closure, manage sales stages, forecast revenue
- **Quotations & Sales Orders**: Generate professional quotations for healthcare products, convert to sales orders, track pricing in Indian Rupees (₹)
- **Team Management & Hierarchy**: Hierarchical team structure with managers and executives, role-based access control, performance tracking
- **Product Catalog**: Healthcare modules and vendor management
- **Task Scheduling**: Activity tracking for sales teams
- **Advanced Reporting**: Dashboard analytics and reporting tools
- **PDF Generation**: Professional quotations and invoices
- **Multi-level Access**: Admin, manager, and executive roles with complete audit trail

## Technology Stack

- **Frontend**: React.js with TypeScript, Tailwind CSS
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **UI Components**: Shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/sivasankarreddyreddy/CRM-SUVARNA.git
cd CRM-SUVARNA
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. Run database migrations
```bash
npm run db:push
```

5. Start the application
```bash
npm run dev
```

6. Access the application at `http://localhost:5000`

## Demo Users

- **Admin**: admin / admin123
- **Sales Manager**: rajesh.manager / manager123  
- **Sales Executive**: priya.sales / sales123
- **Field Executive**: amit.executive / exec123

## License

© 2025 Suvarna Technologies Pvt. Ltd. All rights reserved.

For more information, visit [www.suvarna.co.in](https://www.suvarna.co.in)