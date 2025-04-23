import { pgTable, text, serial, numeric, timestamp, integer, boolean, json, primaryKey, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session table for connect-pg-simple - using exact types from database
export const sessions = pgTable("session", {
  sid: text("sid", { length: 255 }).primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { mode: 'date', precision: 6 }).notNull(),
});

// Teams
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

// Users and Authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("sales_executive"),
  managerId: integer("manager_id"),
  teamId: integer("team_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Companies
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry"),
  website: text("website"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

// Contacts
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  companyId: integer("company_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

// Leads
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  source: text("source"),
  status: text("status").notNull().default("new"),
  email: text("email"),
  phone: text("phone"),
  companyName: text("company_name"),
  notes: text("notes"),
  assignedTo: integer("assigned_to").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

export const leadsRelations = relations(leads, ({ one, many }) => ({
  createdByUser: one(users, {
    fields: [leads.createdBy],
    references: [users.id],
  }),
  assignedToUser: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [leads.teamId],
    references: [teams.id],
  }),
  opportunities: many(opportunities),
}));

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 5, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

// Opportunities
export const opportunities = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stage: text("stage").notNull().default("qualification"),
  value: numeric("value", { precision: 10, scale: 2 }),
  probability: integer("probability"),
  expectedCloseDate: timestamp("expected_close_date"),
  notes: text("notes"),
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  leadId: integer("lead_id").references(() => leads.id), // Reference to lead, soft constraint
  assignedTo: integer("assigned_to").references(() => users.id),
  teamId: integer("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

export const opportunitiesRelations = relations(opportunities, ({ one, many }) => ({
  lead: one(leads, {
    fields: [opportunities.leadId],
    references: [leads.id],
  }),
  company: one(companies, {
    fields: [opportunities.companyId],
    references: [companies.id],
  }),
  contact: one(contacts, {
    fields: [opportunities.contactId],
    references: [contacts.id],
  }),
  assignedToUser: one(users, {
    fields: [opportunities.assignedTo],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [opportunities.createdBy],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [opportunities.teamId],
    references: [teams.id],
  }),
  quotations: many(quotations),
}));

// Create the base schema first
const baseOpportunitySchema = createInsertSchema(opportunities).omit({
  id: true,
  createdAt: true,
});

// Then extend it to properly parse date strings
export const insertOpportunitySchema = baseOpportunitySchema.extend({
  expectedCloseDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    },
    z.date().optional()
  ),
});

// Quotations
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  quotationNumber: text("quotation_number").notNull(),
  opportunityId: integer("opportunity_id").references(() => opportunities.id), // Reference to opportunity, soft constraint
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("draft"),
  validUntil: timestamp("valid_until"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  opportunity: one(opportunities, {
    fields: [quotations.opportunityId],
    references: [opportunities.id],
  }),
  contact: one(contacts, {
    fields: [quotations.contactId],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [quotations.companyId],
    references: [companies.id],
  }),
  createdByUser: one(users, {
    fields: [quotations.createdBy],
    references: [users.id],
  }),
  quotationItems: many(quotationItems),
  salesOrders: many(salesOrders),
}));

// Create the base schema first
const baseQuotationSchema = createInsertSchema(quotations).omit({
  id: true,
  createdAt: true,
});

// Then extend it to properly parse date strings
export const insertQuotationSchema = baseQuotationSchema.extend({
  validUntil: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    },
    z.date().optional()
  ),
});

// Quotation Items
export const quotationItems = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull().references(() => quotations.id),
  productId: integer("product_id").notNull().references(() => products.id),
  description: text("description"),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 5, scale: 2 }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
  quotation: one(quotations, {
    fields: [quotationItems.quotationId],
    references: [quotations.id],
  }),
  product: one(products, {
    fields: [quotationItems.productId],
    references: [products.id],
  }),
}));

// Create the base schema first
const baseQuotationItemSchema = createInsertSchema(quotationItems).omit({
  id: true,
});

// Then extend it to correctly handle numeric values as strings
export const insertQuotationItemSchema = baseQuotationItemSchema.extend({
  unitPrice: z.string(),
  tax: z.string().optional(),
  subtotal: z.string()
});

// Sales Orders
export const salesOrders = pgTable("sales_orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  quotationId: integer("quotation_id").references(() => quotations.id), // Reference to quotation, soft constraint
  opportunityId: integer("opportunity_id").references(() => opportunities.id),
  contactId: integer("contact_id").references(() => contacts.id),
  companyId: integer("company_id").references(() => companies.id),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 10, scale: 2 }),
  discount: numeric("discount", { precision: 10, scale: 2 }),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  orderDate: timestamp("order_date").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  quotation: one(quotations, {
    fields: [salesOrders.quotationId],
    references: [quotations.id],
  }),
  opportunity: one(opportunities, {
    fields: [salesOrders.opportunityId],
    references: [opportunities.id],
  }),
  contact: one(contacts, {
    fields: [salesOrders.contactId],
    references: [contacts.id],
  }),
  company: one(companies, {
    fields: [salesOrders.companyId],
    references: [companies.id],
  }),
  createdByUser: one(users, {
    fields: [salesOrders.createdBy],
    references: [users.id],
  }),
  salesOrderItems: many(salesOrderItems),
}));

// Create the base schema first
const baseSalesOrderSchema = createInsertSchema(salesOrders).omit({
  id: true,
  createdAt: true,
});

// Then extend it to properly parse date strings and handle nullable foreign keys
export const insertSalesOrderSchema = baseSalesOrderSchema.extend({
  orderDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    },
    z.date().optional()
  ),
  // Allow null values for the foreign keys
  quotationId: z.number().nullable().optional(),
  opportunityId: z.number().nullable().optional(),
  contactId: z.number().nullable().optional(),
  companyId: z.number().nullable().optional(),
  // String numeric values
  subtotal: z.string(),
  tax: z.string().optional().default("0.00"),
  discount: z.string().optional().default("0.00"),
  total: z.string(),
});

// Sales Order Items
export const salesOrderItems = pgTable("sales_order_items", {
  id: serial("id").primaryKey(),
  salesOrderId: integer("sales_order_id").notNull().references(() => salesOrders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  description: text("description"),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  tax: numeric("tax", { precision: 5, scale: 2 }),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const salesOrderItemsRelations = relations(salesOrderItems, ({ one }) => ({
  salesOrder: one(salesOrders, {
    fields: [salesOrderItems.salesOrderId],
    references: [salesOrders.id],
  }),
  product: one(products, {
    fields: [salesOrderItems.productId],
    references: [products.id],
  }),
}));

export const insertSalesOrderItemSchema = createInsertSchema(salesOrderItems).omit({
  id: true,
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date"),
  priority: text("priority").default("medium"),
  status: text("status").notNull().default("pending"),
  assignedTo: integer("assigned_to"),
  relatedTo: text("related_to"), // e.g. "lead", "opportunity", "contact", etc.
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

// Create the base schema first
const baseTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Then extend it to properly parse date strings
export const insertTaskSchema = baseTaskSchema.extend({
  dueDate: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    },
    z.date().optional()
  ),
});

// Activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // e.g. "call", "email", "meeting", "note", etc.
  title: text("title").notNull(),
  description: text("description"),
  completedAt: timestamp("completed_at"),
  relatedTo: text("related_to"), // e.g. "lead", "opportunity", "contact", etc.
  relatedId: integer("related_id"),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: integer("created_by").notNull(),
});

// Create the base schema first
const baseActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

// Then extend it to properly parse date strings
export const insertActivitySchema = baseActivitySchema.extend({
  completedAt: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    },
    z.date().optional()
  ),
});

// Type definitions
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = z.infer<typeof insertQuotationItemSchema>;

export type SalesOrder = typeof salesOrders.$inferSelect;
export type InsertSalesOrder = z.infer<typeof insertSalesOrderSchema>;

export type SalesOrderItem = typeof salesOrderItems.$inferSelect;
export type InsertSalesOrderItem = z.infer<typeof insertSalesOrderItemSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

// Appointments
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  attendeeType: text("attendee_type").notNull(), // 'contact', 'lead', etc.
  attendeeId: integer("attendee_id").notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create the base schema first
const baseAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

// Then extend it to properly parse date strings
export const insertAppointmentSchema = baseAppointmentSchema.extend({
  startTime: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
  endTime: z.preprocess(
    (arg) => {
      if (typeof arg === 'string') {
        return new Date(arg);
      }
      return arg;
    },
    z.date()
  ),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
