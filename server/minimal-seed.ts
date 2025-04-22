/**
 * Minimal database seeding script that creates just enough data to make the application functional
 * This avoids the timeouts caused by the full seeding process
 */

import { db } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { 
  users, teams, products, companies, contacts, 
  leads, opportunities, quotations, salesOrders,
  insertUserSchema, insertTeamSchema, insertProductSchema,
  insertCompanySchema, insertContactSchema, insertLeadSchema, 
  insertOpportunitySchema, insertQuotationSchema, insertSalesOrderSchema
} from "@shared/schema";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

// Single admin user for quick login
const ADMIN_USER = {
  username: "admin",
  password: "admin123",
  fullName: "Admin User",
  email: "admin@hims-crm.com",
  role: "admin"
};

// Single team for basic functionality
const MAIN_TEAM = {
  name: "Sales Team",
  description: "Main sales team for medical systems"
};

// Basic product for sales pipeline
const BASIC_PRODUCT = {
  name: "Healthcare Information Management System",
  description: "Complete hospital management solution",
  price: "250000",
  sku: "HIMS-001"
};

// Single company for CRM testing
const SAMPLE_COMPANY = {
  name: "Apollo Hospitals",
  industry: "Healthcare",
  website: "https://www.apollohospitals.com",
  phone: "+91-9876543210",
  address: "Plot No. 1, Banjara Hills, Hyderabad"
};

// Contact at the company
const SAMPLE_CONTACT = {
  firstName: "Rajesh",
  lastName: "Kumar",
  email: "rajesh.kumar@apollohospitals.com",
  phone: "+91-9876543210",
  title: "IT Director",
  notes: "Key decision maker for IT systems"
};

// Lead for pipeline
const SAMPLE_LEAD = {
  name: "Apollo Hospitals HIMS Upgrade",
  source: "Conference",
  status: "new",
  notes: "Potential upgrade of existing legacy HIMS system"
};

// Opportunity for sales pipeline
const SAMPLE_OPPORTUNITY = {
  name: "Apollo HIMS Implementation",
  stage: "qualification",
  value: "450000",
  probability: 70,
  expectedCloseDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
  notes: "Client requires custom integration with existing lab systems"
};

// Basic quotation
const SAMPLE_QUOTATION = {
  quotationNumber: "Q-2023-001",
  status: "draft",
  validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
  subtotal: "400000",
  discount: "20000",
  tax: "72000",
  total: "452000",
  notes: "Includes 3 months of post-implementation support"
};

// Sales order
const SAMPLE_SALES_ORDER = {
  orderNumber: "SO-2023-001",
  status: "draft",
  orderDate: new Date(),
  subtotal: "400000",
  discount: "20000", 
  tax: "72000",
  total: "452000",
  notes: "Awaiting final approval from client finance department"
};

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedMinimalData() {
  console.log("Starting minimal data seeding...");
  
  try {
    // Create admin user
    const hashedPassword = await hashPassword(ADMIN_USER.password);
    const [adminUser] = await db.insert(users).values({
      ...ADMIN_USER,
      password: hashedPassword
    }).returning();
    console.log("Created admin user with ID:", adminUser.id);

    // Create main team
    const [team] = await db.insert(teams).values(MAIN_TEAM).returning();
    console.log("Created team with ID:", team.id);

    // Assign admin to team as manager
    await db.insert(teamMembers).values({
      userId: adminUser.id,
      teamId: team.id,
      role: "manager"
    });
    console.log("Assigned admin as team manager");

    // Create product
    const [product] = await db.insert(products).values(BASIC_PRODUCT).returning();
    console.log("Created product with ID:", product.id);

    // Create company
    const [company] = await db.insert(companies).values(SAMPLE_COMPANY).returning();
    console.log("Created company with ID:", company.id);

    // Create contact
    const [contact] = await db.insert(contacts).values({
      ...SAMPLE_CONTACT,
      companyId: company.id
    }).returning();
    console.log("Created contact with ID:", contact.id);

    // Create lead
    const [lead] = await db.insert(leads).values({
      ...SAMPLE_LEAD,
      companyId: company.id,
      contactId: contact.id,
      assignedTo: adminUser.id,
      teamId: team.id
    }).returning();
    console.log("Created lead with ID:", lead.id);

    // Create opportunity
    const [opportunity] = await db.insert(opportunities).values({
      ...SAMPLE_OPPORTUNITY,
      leadId: lead.id,
      companyId: company.id,
      contactId: contact.id,
      assignedTo: adminUser.id,
      teamId: team.id
    }).returning();
    console.log("Created opportunity with ID:", opportunity.id);

    // Create quotation
    const [quotation] = await db.insert(quotations).values({
      ...SAMPLE_QUOTATION,
      opportunityId: opportunity.id,
      companyId: company.id,
      contactId: contact.id,
      createdBy: adminUser.id
    }).returning();
    console.log("Created quotation with ID:", quotation.id);

    // Create sales order
    const [salesOrder] = await db.insert(salesOrders).values({
      ...SAMPLE_SALES_ORDER,
      quotationId: quotation.id,
      opportunityId: opportunity.id,
      companyId: company.id,
      contactId: contact.id,
      createdBy: adminUser.id
    }).returning();
    console.log("Created sales order with ID:", salesOrder.id);

    console.log("Minimal seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error during minimal seeding:", error);
    return false;
  }
}