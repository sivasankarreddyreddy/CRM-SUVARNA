import {
  users, type User, type InsertUser,
  leads, type Lead, type InsertLead,
  contacts, type Contact, type InsertContact,
  companies, type Company, type InsertCompany,
  products, type Product, type InsertProduct,
  opportunities, type Opportunity, type InsertOpportunity,
  quotations, type Quotation, type InsertQuotation,
  quotationItems, type QuotationItem, type InsertQuotationItem,
  salesOrders, type SalesOrder, type InsertSalesOrder,
  salesOrderItems, type SalesOrderItem, type InsertSalesOrderItem,
  tasks, type Task, type InsertTask,
  activities, type Activity, type InsertActivity,
  appointments, type Appointment, type InsertAppointment
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

// Define the storage interface for all CRUD operations
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Lead methods
  getAllLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;

  // Contact methods
  getAllContacts(): Promise<Contact[]>;
  getContact(id: number): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  updateContact(id: number, contact: Partial<Contact>): Promise<Contact | undefined>;
  deleteContact(id: number): Promise<boolean>;

  // Company methods
  getAllCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<Company>): Promise<Company | undefined>;
  deleteCompany(id: number): Promise<boolean>;

  // Product methods
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Opportunity methods
  getAllOpportunities(): Promise<Opportunity[]>;
  getOpportunity(id: number): Promise<Opportunity | undefined>;
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  updateOpportunity(id: number, opportunity: Partial<Opportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: number): Promise<boolean>;

  // Quotation methods
  getAllQuotations(): Promise<Quotation[]>;
  getQuotation(id: number): Promise<Quotation | undefined>;
  createQuotation(quotation: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: number, quotation: Partial<Quotation>): Promise<Quotation | undefined>;
  deleteQuotation(id: number): Promise<boolean>;

  // Quotation Item methods
  getQuotationItems(quotationId: number): Promise<QuotationItem[]>;
  createQuotationItem(item: InsertQuotationItem): Promise<QuotationItem>;

  // Sales Order methods
  getAllSalesOrders(): Promise<SalesOrder[]>;
  getSalesOrder(id: number): Promise<SalesOrder | undefined>;
  createSalesOrder(order: InsertSalesOrder): Promise<SalesOrder>;
  updateSalesOrder(id: number, order: Partial<SalesOrder>): Promise<SalesOrder | undefined>;
  deleteSalesOrder(id: number): Promise<boolean>;

  // Sales Order Item methods
  getSalesOrderItems(orderId: number): Promise<SalesOrderItem[]>;
  createSalesOrderItem(item: InsertSalesOrderItem): Promise<SalesOrderItem>;

  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Activity methods
  getAllActivities(): Promise<Activity[]>;
  getActivity(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<Activity>): Promise<Activity | undefined>;
  deleteActivity(id: number): Promise<boolean>;

  // Appointment methods
  getAllAppointments(): Promise<Appointment[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  getAppointmentsByAttendee(attendeeType: string, attendeeId: number): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<Appointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<boolean>;

  // Report methods
  getSalesReportData(period?: string): Promise<any>;
  getActivityReportData(period?: string): Promise<any>;

  // Session store
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private leads: Map<number, Lead>;
  private contacts: Map<number, Contact>;
  private companies: Map<number, Company>;
  private products: Map<number, Product>;
  private opportunities: Map<number, Opportunity>;
  private quotations: Map<number, Quotation>;
  private quotationItems: Map<number, QuotationItem>;
  private salesOrders: Map<number, SalesOrder>;
  private salesOrderItems: Map<number, SalesOrderItem>;
  private tasks: Map<number, Task>;
  private activities: Map<number, Activity>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private leadIdCounter: number;
  private contactIdCounter: number;
  private companyIdCounter: number;
  private productIdCounter: number;
  private opportunityIdCounter: number;
  private quotationIdCounter: number;
  private quotationItemIdCounter: number;
  private salesOrderIdCounter: number;
  private salesOrderItemIdCounter: number;
  private taskIdCounter: number;
  private activityIdCounter: number;
  private appointmentIdCounter: number;
  private appointments: Map<number, Appointment>;

  constructor() {
    this.users = new Map();
    this.leads = new Map();
    this.contacts = new Map();
    this.companies = new Map();
    this.products = new Map();
    this.opportunities = new Map();
    this.quotations = new Map();
    this.quotationItems = new Map();
    this.salesOrders = new Map();
    this.salesOrderItems = new Map();
    this.tasks = new Map();
    this.activities = new Map();
    this.appointments = new Map();
    
    this.userIdCounter = 1;
    this.leadIdCounter = 1;
    this.contactIdCounter = 1;
    this.companyIdCounter = 1;
    this.productIdCounter = 1;
    this.opportunityIdCounter = 1;
    this.quotationIdCounter = 1;
    this.quotationItemIdCounter = 1;
    this.salesOrderIdCounter = 1;
    this.salesOrderItemIdCounter = 1;
    this.taskIdCounter = 1;
    this.activityIdCounter = 1;
    this.appointmentIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Lead methods
  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const createdAt = new Date();
    const lead: Lead = { ...insertLead, id, createdAt };
    this.leads.set(id, lead);
    return lead;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead = { ...lead, ...updates };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  // Contact methods
  async getAllContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: number): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = this.contactIdCounter++;
    const createdAt = new Date();
    const contact: Contact = { ...insertContact, id, createdAt };
    this.contacts.set(id, contact);
    return contact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    
    const updatedContact = { ...contact, ...updates };
    this.contacts.set(id, updatedContact);
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    return this.contacts.delete(id);
  }

  // Company methods
  async getAllCompanies(): Promise<Company[]> {
    return Array.from(this.companies.values());
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.companyIdCounter++;
    const createdAt = new Date();
    const company: Company = { ...insertCompany, id, createdAt };
    this.companies.set(id, company);
    return company;
  }

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined> {
    const company = this.companies.get(id);
    if (!company) return undefined;
    
    const updatedCompany = { ...company, ...updates };
    this.companies.set(id, updatedCompany);
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    return this.companies.delete(id);
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const createdAt = new Date();
    const product: Product = { ...insertProduct, id, createdAt };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Opportunity methods
  async getAllOpportunities(): Promise<Opportunity[]> {
    return Array.from(this.opportunities.values());
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    return this.opportunities.get(id);
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const id = this.opportunityIdCounter++;
    const createdAt = new Date();
    const opportunity: Opportunity = { ...insertOpportunity, id, createdAt };
    this.opportunities.set(id, opportunity);
    return opportunity;
  }

  async updateOpportunity(id: number, updates: Partial<Opportunity>): Promise<Opportunity | undefined> {
    const opportunity = this.opportunities.get(id);
    if (!opportunity) return undefined;
    
    const updatedOpportunity = { ...opportunity, ...updates };
    this.opportunities.set(id, updatedOpportunity);
    return updatedOpportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    return this.opportunities.delete(id);
  }

  // Quotation methods
  async getAllQuotations(): Promise<Quotation[]> {
    return Array.from(this.quotations.values());
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    return this.quotations.get(id);
  }

  async createQuotation(insertQuotation: InsertQuotation): Promise<Quotation> {
    const id = this.quotationIdCounter++;
    const createdAt = new Date();
    const quotation: Quotation = { ...insertQuotation, id, createdAt };
    this.quotations.set(id, quotation);
    return quotation;
  }

  async updateQuotation(id: number, updates: Partial<Quotation>): Promise<Quotation | undefined> {
    const quotation = this.quotations.get(id);
    if (!quotation) return undefined;
    
    const updatedQuotation = { ...quotation, ...updates };
    this.quotations.set(id, updatedQuotation);
    return updatedQuotation;
  }

  async deleteQuotation(id: number): Promise<boolean> {
    return this.quotations.delete(id);
  }

  // Quotation Item methods
  async getQuotationItems(quotationId: number): Promise<QuotationItem[]> {
    return Array.from(this.quotationItems.values()).filter(
      (item) => item.quotationId === quotationId
    );
  }

  async createQuotationItem(insertItem: InsertQuotationItem): Promise<QuotationItem> {
    const id = this.quotationItemIdCounter++;
    const item: QuotationItem = { ...insertItem, id };
    this.quotationItems.set(id, item);
    return item;
  }

  // Sales Order methods
  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return Array.from(this.salesOrders.values());
  }

  async getSalesOrder(id: number): Promise<SalesOrder | undefined> {
    return this.salesOrders.get(id);
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const id = this.salesOrderIdCounter++;
    const createdAt = new Date();
    const order: SalesOrder = { ...insertOrder, id, createdAt };
    this.salesOrders.set(id, order);
    return order;
  }

  async updateSalesOrder(id: number, updates: Partial<SalesOrder>): Promise<SalesOrder | undefined> {
    const order = this.salesOrders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates };
    this.salesOrders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteSalesOrder(id: number): Promise<boolean> {
    return this.salesOrders.delete(id);
  }

  // Sales Order Item methods
  async getSalesOrderItems(orderId: number): Promise<SalesOrderItem[]> {
    return Array.from(this.salesOrderItems.values()).filter(
      (item) => item.salesOrderId === orderId
    );
  }

  async createSalesOrderItem(insertItem: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const id = this.salesOrderItemIdCounter++;
    const item: SalesOrderItem = { ...insertItem, id };
    this.salesOrderItems.set(id, item);
    return item;
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const createdAt = new Date();
    const task: Task = { ...insertTask, id, createdAt };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...updates };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityIdCounter++;
    const createdAt = new Date();
    const activity: Activity = { ...insertActivity, id, createdAt };
    this.activities.set(id, activity);
    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const activity = this.activities.get(id);
    if (!activity) return undefined;
    
    const updatedActivity = { ...activity, ...updates };
    this.activities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    return this.activities.delete(id);
  }

  // Appointment methods
  async getAllAppointments(): Promise<Appointment[]> {
    return Array.from(this.appointments.values());
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async getAppointmentsByAttendee(attendeeType: string, attendeeId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.attendeeType === attendeeType && appointment.attendeeId === attendeeId
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.appointmentIdCounter++;
    const createdAt = new Date();
    const appointment: Appointment = { ...insertAppointment, id, createdAt };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const appointment = this.appointments.get(id);
    if (!appointment) return undefined;
    
    const updatedAppointment = { ...appointment, ...updates };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    return this.appointments.delete(id);
  }
}

export const storage = new MemStorage();
