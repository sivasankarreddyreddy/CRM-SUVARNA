# Architecture Documentation

## Overview

This repository contains a CRM (Customer Relationship Management) system focused on the healthcare industry, specifically for managing Hospital Information Management System (HIMS) sales. The application follows a modern full-stack architecture with a React frontend and a Node.js Express backend. It uses PostgreSQL (via Neon Database) for data storage with Drizzle ORM for database interactions.

The CRM system provides functionality for managing leads, contacts, companies, opportunities, quotations, sales orders, invoices, tasks, and activities. It also includes team management features, role-based access control, and reporting capabilities.

## System Architecture

The system follows a client-server architecture with:

- **Frontend**: React-based single-page application (SPA) with Wouter for routing, TanStack Query for data fetching, and ShadCN UI components for the interface
- **Backend**: Node.js with Express.js REST API server
- **Database**: PostgreSQL (using Neon Database's serverless offering)
- **ORM**: Drizzle ORM for type-safe database interactions
- **Authentication**: Custom session-based authentication with Passport.js

### Architectural Diagram

```
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│               │      │               │      │               │
│  React SPA    │◄────►│  Express API  │◄────►│  PostgreSQL   │
│  (Frontend)   │      │  (Backend)    │      │  (Database)   │
│               │      │               │      │               │
└───────────────┘      └───────────────┘      └───────────────┘
                               ▲
                               │
                               ▼
                       ┌───────────────┐
                       │  External     │
                       │  Services     │
                       │  (SendGrid)   │
                       └───────────────┘
```

## Key Components

### Frontend Components

1. **Authentication System**
   - Session-based authentication
   - Role-based access control (Admin, Sales Manager, Sales Executive)
   - Protected routes

2. **Page Structure**
   - Dashboard with sales analytics
   - Lead management
   - Contact management
   - Company management
   - Opportunity pipeline
   - Quotation handling
   - Sales orders
   - Invoicing
   - Task management
   - Activity tracking
   - Reports and analytics
   - Team management

3. **UI Framework**
   - Based on ShadCN UI components
   - Responsive design
   - Dark/light theme support
   - Custom healthcare-themed styling

4. **State Management**
   - TanStack Query for server state
   - React Hooks for local state
   - Context API for global state (auth)

### Backend Components

1. **API Server**
   - Express.js REST API
   - Organized by resource types
   - Session-based authentication

2. **Database Abstraction**
   - Drizzle ORM for type-safe database queries
   - Schema definitions with relations
   - Zod for validation

3. **Authentication Service**
   - Custom Passport.js implementation
   - Session storage in PostgreSQL
   - Password hashing with scrypt

4. **PDF Generation**
   - Server-side PDF generation for quotations and invoices using PDFKit

5. **Email Service**
   - Integration with SendGrid for email notifications

### Database Schema

The database schema is defined using Drizzle ORM and includes the following main entities:

1. **Users**: System users with roles and team assignments
2. **Teams**: Organizational units for users
3. **Leads**: Potential sales opportunities
4. **Contacts**: Individual contacts at companies
5. **Companies**: Organizations that are potential or current customers
6. **Opportunities**: Qualified sales opportunities
7. **Products**: Products or services being sold
8. **Quotations & Quotation Items**: Price quotes for customers
9. **Sales Orders & Order Items**: Confirmed orders
10. **Tasks**: Actionable items assigned to users
11. **Activities**: Logged interactions with customers
12. **Appointments**: Scheduled meetings

## Data Flow

### Lead Management Flow

1. New leads are created through the frontend or imported from external sources
2. Leads are assigned to sales executives based on team, territory, or manual assignment
3. Leads progress through various stages (new, contacted, qualified, etc.)
4. Qualified leads are converted to opportunities

### Opportunity Management Flow

1. Opportunities are created from qualified leads or directly
2. Opportunities progress through stages (prospecting, needs analysis, proposal, negotiation, closed won/lost)
3. Quotations are created for opportunities in the proposal stage
4. When accepted, quotations are converted to sales orders

### Sales Process Flow

1. Sales orders are created from accepted quotations
2. Invoices are generated from sales orders
3. Payments are tracked against invoices
4. Reports provide insights into the sales pipeline and performance

## External Dependencies

### Frontend Dependencies

- **React**: UI library
- **Wouter**: Lightweight routing
- **TanStack Query**: Data fetching and caching
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework
- **date-fns**: Date manipulation library
- **zod**: Schema validation
- **react-hook-form**: Form handling

### Backend Dependencies

- **Express.js**: Web framework
- **Drizzle ORM**: Database ORM
- **Passport.js**: Authentication middleware
- **SendGrid**: Email service
- **PDFKit**: PDF generation
- **connect-pg-simple**: PostgreSQL session store

### External Services

- **Neon Database**: PostgreSQL database provider
- **SendGrid**: Email delivery service

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

1. **Development Environment**
   - Uses Replit's Node.js 20 environment
   - PostgreSQL 16 database
   - Vite for frontend development
   - TypeScript for type safety

2. **Production Build Process**
   - Frontend: Vite build process
   - Backend: esbuild for bundling server code
   - Combined into a single deployment package

3. **Runtime Configuration**
   - Environment variables for configuration
   - Database connection string
   - Session secrets
   - Email service API keys

4. **Deployment Configuration**
   - Configured for auto-scaling deployment
   - Exposes port 5000 internally, mapped to port 80 externally
   - Run and build commands defined in .replit configuration

5. **Database Migration Strategy**
   - Drizzle Kit for database migrations
   - Manual migration scripts for complex changes
   - Data seeding for initial setup

## Security Considerations

1. **Authentication**
   - Session-based with secure cookies
   - Password hashing using scrypt with salt
   - Role-based access control

2. **Data Protection**
   - Input validation with Zod
   - API security with proper authentication checks
   - HTTPS for production (managed by deployment platform)

3. **Session Management**
   - Sessions stored in PostgreSQL
   - Configurable session expiration
   - Secure cookie settings for production