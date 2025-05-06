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
  appointments, type Appointment, type InsertAppointment,
  teams, type Team, type InsertTeam,
  salesTargets, type SalesTarget, type InsertSalesTarget
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
  getAllUsers(): Promise<User[]>;

  // Lead methods
  getAllLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  getLeadsByContact(contactId: number): Promise<Lead[]>;

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
  getQuotationsByOpportunity(opportunityId: number): Promise<Quotation[]>;

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

  // Team methods
  getAllTeams(): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  updateTeam(id: number, team: Partial<Team>): Promise<Team | undefined>;
  deleteTeam(id: number): Promise<boolean>;
  getTeamMembers(teamId: number): Promise<User[]>;
  getTeamManagers(teamId: number): Promise<User[]>;
  getTeamLeads(teamId: number): Promise<Lead[]>;
  getTeamOpportunities(teamId: number): Promise<Opportunity[]>;
  
  // User Extension methods
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
  getUsersWithTeam(): Promise<any[]>;
  getUsersByManager(managerId: number): Promise<User[]>;
  getTeamMembersByManager(managerId: number): Promise<User[]>;
  getTeamMemberIds(managerId: number): Promise<number[]>;

  // Report methods
  getSalesReportData(period?: string): Promise<any>;
  getActivityReportData(period?: string): Promise<any>;
  
  // Dashboard methods
  getDashboardStats(): Promise<any>;
  getTeamDashboardStats(managerId: number): Promise<any>;
  getUserDashboardStats(userId: number): Promise<any>;
  
  getPipelineData(): Promise<any>;
  getTeamPipelineData(managerId: number): Promise<any>;
  getUserPipelineData(userId: number): Promise<any>;
  
  getRecentOpportunities(): Promise<any>;
  getTeamRecentOpportunities(managerId: number): Promise<any>;
  getUserRecentOpportunities(userId: number): Promise<any>;
  
  getTodayTasks(): Promise<any>;
  getTeamTodayTasks(managerId: number): Promise<any>;
  getUserTodayTasks(userId: number): Promise<any>;
  
  getRecentActivities(): Promise<any>;
  getTeamRecentActivities(managerId: number): Promise<any>;
  getUserRecentActivities(userId: number): Promise<any>;
  
  getLeadSources(): Promise<any>;
  getTeamLeadSources(managerId: number): Promise<any>;
  getUserLeadSources(userId: number): Promise<any>;

  // Sales Target methods
  getAllSalesTargets(): Promise<SalesTarget[]>;
  getSalesTarget(id: number): Promise<SalesTarget | undefined>;
  getSalesTargetsByUser(userId: number): Promise<SalesTarget[]>;
  getSalesTargetsByCompany(companyId: number): Promise<SalesTarget[]>;
  createSalesTarget(target: InsertSalesTarget): Promise<SalesTarget>;
  updateSalesTarget(id: number, target: Partial<SalesTarget>): Promise<SalesTarget | undefined>;
  deleteSalesTarget(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.Store;
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
  
  sessionStore: session.Store;
  
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
  private salesTargets: Map<number, SalesTarget>;
  private salesTargetIdCounter: number;

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
    this.salesTargets = new Map();
    
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
    this.salesTargetIdCounter = 1;
    
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
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
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
  
  async getLeadsByContact(contactId: number): Promise<Lead[]> {
    // Find all opportunities that are linked to this contact
    const contactOpportunities = Array.from(this.opportunities.values())
      .filter((opp) => opp.contactId === contactId);
    
    // Extract the lead IDs from those opportunities
    const leadIds = contactOpportunities
      .filter((opp) => opp.leadId !== null)
      .map((opp) => opp.leadId);
    
    // Get the leads
    return Array.from(this.leads.values())
      .filter((lead) => leadIds.includes(lead.id));
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
  
  async getQuotationsByOpportunity(opportunityId: number): Promise<Quotation[]> {
    return Array.from(this.quotations.values()).filter(
      (quotation) => quotation.opportunityId === opportunityId
    );
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

  // Report methods
  async getSalesReportData(period: string = 'monthly'): Promise<any> {
    // Calculate date ranges based on period
    const now = new Date();
    const periods: { [key: string]: Date[] } = {
      weekly: Array(4).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (7 * i));
        return date;
      }),
      monthly: Array(6).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        return date;
      }),
      quarterly: Array(4).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (3 * i));
        return date;
      }),
      yearly: Array(3).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        return date;
      })
    };
    
    const timeLabels = periods[period] || periods.monthly;
    
    // Generate sales data by period
    const salesByPeriod = timeLabels.map((date, index) => {
      const randomAmount = Math.floor(10000 + Math.random() * 50000);
      
      let timeLabel;
      if (period === 'weekly') {
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() - 6);
        timeLabel = `${endDate.toLocaleDateString()} - ${date.toLocaleDateString()}`;
      } else if (period === 'monthly') {
        timeLabel = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      } else if (period === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        timeLabel = `Q${quarter} ${date.getFullYear()}`;
      } else {
        timeLabel = date.getFullYear().toString();
      }
      
      return {
        time_period: timeLabel,
        total_sales: randomAmount
      };
    });
    
    // Get top products
    const products = Array.from(this.products.values());
    const topProducts = products.slice(0, Math.min(5, products.length))
      .map(product => {
        const quantity = Math.floor(10 + Math.random() * 90);
        const revenue = parseFloat(product.price || "0") * quantity;
        return {
          name: product.name,
          total_quantity: quantity,
          total_revenue: revenue.toFixed(2)
        };
      });
    
    // Sales by company
    const companies = Array.from(this.companies.values());
    const salesByCompany = companies.slice(0, Math.min(5, companies.length))
      .map(company => {
        const sales = Math.floor(10000 + Math.random() * 50000);
        return {
          name: company.name,
          total_sales: sales
        };
      });
    
    // Conversion rate
    const opportunityCount = this.opportunities.size;
    const convertedCount = Math.min(
      opportunityCount, 
      Math.floor(opportunityCount * (0.3 + Math.random() * 0.4))
    );
    
    const opportunityConversion = {
      total_opportunities: opportunityCount,
      converted_opportunities: convertedCount,
      conversion_rate: opportunityCount ? (convertedCount / opportunityCount) * 100 : 0
    };
    
    return {
      salesByPeriod,
      topProducts,
      salesByCompany,
      opportunityConversion
    };
  }

  async getActivityReportData(period: string = 'monthly'): Promise<any> {
    // Activity counts by type
    const activityTypes = ['call', 'email', 'meeting', 'task', 'lead'];
    const activityByType = activityTypes.map(type => {
      const count = Array.from(this.activities.values())
        .filter(a => a.type === type)
        .length;
      
      return {
        type,
        count: count || Math.floor(Math.random() * 20) + 1 // Fallback if no activities present
      };
    });
    
    // Calculate date ranges based on period
    const now = new Date();
    const periods: { [key: string]: Date[] } = {
      weekly: Array(4).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (7 * i));
        return date;
      }),
      monthly: Array(6).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - i);
        return date;
      }),
      quarterly: Array(4).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setMonth(date.getMonth() - (3 * i));
        return date;
      }),
      yearly: Array(3).fill(0).map((_, i) => {
        const date = new Date(now);
        date.setFullYear(date.getFullYear() - i);
        return date;
      })
    };
    
    const timeLabels = periods[period] || periods.monthly;
    
    // Generate activity data by period
    const activityByPeriod = timeLabels.map((date, index) => {
      const count = Math.floor(5 + Math.random() * 15);
      
      let timeLabel;
      if (period === 'weekly') {
        const endDate = new Date(date);
        endDate.setDate(endDate.getDate() - 6);
        timeLabel = `${endDate.toLocaleDateString()} - ${date.toLocaleDateString()}`;
      } else if (period === 'monthly') {
        timeLabel = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      } else if (period === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        timeLabel = `Q${quarter} ${date.getFullYear()}`;
      } else {
        timeLabel = date.getFullYear().toString();
      }
      
      return {
        time_period: timeLabel,
        activity_count: count
      };
    });
    
    // Activity counts by user
    const users = Array.from(this.users.values());
    const activityByUser = users.map(user => {
      const count = Math.floor(5 + Math.random() * 20);
      return {
        username: user.username,
        activity_count: count
      };
    });
    
    // Task completion rates
    const totalTasks = this.tasks.size;
    const completedTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'completed')
      .length;
    
    const taskCompletionRate = {
      total_tasks: totalTasks,
      completed_tasks: completedTasks || Math.floor(totalTasks * 0.7), // Fallback
      completion_rate: totalTasks ? (completedTasks / totalTasks) * 100 : 0
    };
    
    // Recent activities
    const recentActivities = Array.from(this.activities.values())
      .sort((a, b) => {
        const dateA = a.createdAt?.getTime() || 0;
        const dateB = b.createdAt?.getTime() || 0;
        return dateB - dateA;
      })
      .slice(0, 10);
    
    return {
      activityByType,
      activityByPeriod,
      activityByUser,
      taskCompletionRate,
      recentActivities
    };
  }
  
  // Dashboard Methods
  async getDashboardStats(): Promise<any> {
    const leads = Array.from(this.leads.values());
    const opportunities = Array.from(this.opportunities.values());
    const salesOrders = Array.from(this.salesOrders.values());
    
    // Calculate total leads with month-over-month change
    const totalLeadsCount = leads.length;
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const lastMonthLeads = leads.filter(lead => 
      new Date(lead.createdAt) < lastMonth
    ).length;
    
    const leadsChange = lastMonthLeads > 0 
      ? ((totalLeadsCount - lastMonthLeads) / lastMonthLeads) * 100 
      : 0;
    
    // Calculate open deals
    const openDeals = opportunities.filter(opp => 
      opp.status !== 'closed-won' && opp.status !== 'closed-lost'
    ).length;
    
    const lastMonthOpenDeals = opportunities.filter(opp => 
      opp.status !== 'closed-won' && 
      opp.status !== 'closed-lost' && 
      new Date(opp.createdAt) < lastMonth
    ).length;
    
    const openDealsChange = lastMonthOpenDeals > 0 
      ? ((openDeals - lastMonthOpenDeals) / lastMonthOpenDeals) * 100 
      : 0;
    
    // Calculate total sales this month
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month
    
    const currentMonthSales = salesOrders
      .filter(order => new Date(order.createdAt) >= currentMonth)
      .reduce((sum, order) => sum + Number(order.total), 0);
    
    // Last month's sales
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    
    const lastMonthEnd = new Date(currentMonth);
    lastMonthEnd.setMilliseconds(-1);
    
    const lastMonthSales = salesOrders
      .filter(order => {
        const date = new Date(order.createdAt);
        return date >= lastMonthStart && date < currentMonth;
      })
      .reduce((sum, order) => sum + Number(order.total), 0);
    
    const salesChange = lastMonthSales > 0 
      ? ((currentMonthSales - lastMonthSales) / lastMonthSales) * 100 
      : 0;
    
    // Calculate conversion rate
    const closedWon = opportunities.filter(opp => opp.status === 'closed-won').length;
    const allOpps = opportunities.length;
    const conversionRate = allOpps > 0 ? (closedWon / allOpps) * 100 : 0;
    
    const lastMonthClosedWon = opportunities.filter(opp => 
      opp.status === 'closed-won' && new Date(opp.createdAt) < lastMonth
    ).length;
    
    const lastMonthAllOpps = opportunities.filter(opp => 
      new Date(opp.createdAt) < lastMonth
    ).length;
    
    const lastMonthConversionRate = lastMonthAllOpps > 0 
      ? (lastMonthClosedWon / lastMonthAllOpps) * 100 
      : 0;
    
    const conversionRateChange = lastMonthConversionRate > 0 
      ? conversionRate - lastMonthConversionRate 
      : 0;
    
    return {
      totalLeads: { 
        value: totalLeadsCount.toString(), 
        change: parseFloat(leadsChange.toFixed(1)) 
      },
      openDeals: { 
        value: openDeals.toString(), 
        change: parseFloat(openDealsChange.toFixed(1)) 
      },
      salesMtd: { 
        value: `$${currentMonthSales.toLocaleString()}`, 
        change: parseFloat(salesChange.toFixed(1)) 
      },
      conversionRate: { 
        value: `${conversionRate.toFixed(1)}%`, 
        change: parseFloat(conversionRateChange.toFixed(1)) 
      }
    };
  }

  async getPipelineData(): Promise<any> {
    const stages = [
      { name: "Qualification", color: "rgb(59, 130, 246)" },
      { name: "Proposal", color: "rgb(79, 70, 229)" },
      { name: "Negotiation", color: "rgb(139, 92, 246)" },
      { name: "Closing", color: "rgb(245, 158, 11)" }
    ];
    
    const opportunities = Array.from(this.opportunities.values());
    
    // Calculate metrics for each stage
    const stagesWithData = stages.map(stage => {
      const stageOpps = opportunities.filter(opp => 
        opp.stage.toLowerCase() === stage.name.toLowerCase() && 
        opp.status !== 'closed-lost'
      );
      
      const count = stageOpps.length;
      const value = stageOpps.reduce((sum, opp) => sum + Number(opp.value || 0), 0);
      
      return {
        ...stage,
        count,
        value: `$${value.toLocaleString()}`
      };
    });
    
    // Calculate total value across all pipeline stages
    const totalValue = opportunities
      .filter(opp => opp.status !== 'closed-lost')
      .reduce((sum, opp) => sum + Number(opp.value || 0), 0);
    
    // Calculate percentages based on the highest count
    const maxCount = Math.max(...stagesWithData.map(stage => stage.count));
    
    const stagesWithPercentage = stagesWithData.map(stage => ({
      ...stage,
      percentage: maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0
    }));
    
    return {
      stages: stagesWithPercentage,
      totalValue: `$${totalValue.toLocaleString()}`
    };
  }

  async getRecentOpportunities(): Promise<any> {
    const opportunities = Array.from(this.opportunities.values());
    
    // Sort by most recently updated
    const sortedOpps = opportunities.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - 
      new Date(a.updatedAt || a.createdAt).getTime()
    ).slice(0, 4);
    
    // Format for display
    return sortedOpps.map(opp => {
      // Get company name
      const company = this.companies.get(opp.companyId || 0);
      
      // Calculate time difference for "updatedAt"
      const now = new Date();
      const updatedAt = new Date(opp.updatedAt || opp.createdAt);
      const diffMs = now.getTime() - updatedAt.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      let timeAgo;
      if (diffDays > 0) {
        timeAgo = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
      } else {
        timeAgo = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
      
      return {
        id: opp.id,
        name: opp.name,
        company: company?.name || 'Unknown Company',
        stage: opp.stage.toLowerCase(),
        value: `$${Number(opp.value || 0).toLocaleString()}`,
        updatedAt: timeAgo
      };
    });
  }

  async getTodayTasks(): Promise<any> {
    const tasks = Array.from(this.tasks.values());
    
    // Get today's date (at midnight)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Get tasks due today
    const todayTasks = tasks
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      })
      .sort((a, b) => {
        // Sort by priority (high, medium, low)
        const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (priorityOrder[a.priority || 'medium'] || 1) - (priorityOrder[b.priority || 'medium'] || 1);
      })
      .slice(0, 4);
    
    // Format tasks for display
    return todayTasks.map(task => {
      return {
        id: task.id,
        title: task.title,
        dueTime: task.dueDate ? "Due today" : "",
        priority: task.priority || "medium",
        completed: task.status === "completed"
      };
    });
  }

  async getRecentActivities(): Promise<any> {
    const activities = Array.from(this.activities.values());
    
    // Sort by most recent
    const recentActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
    
    // Format for display
    return recentActivities.map(activity => {
      // Get related entity
      let target = "";
      if (activity.relatedTo === 'company' && activity.relatedId) {
        const company = this.companies.get(activity.relatedId);
        target = company?.name || '';
      } else if (activity.relatedTo === 'contact' && activity.relatedId) {
        const contact = this.contacts.get(activity.relatedId);
        target = contact ? `${contact.firstName} ${contact.lastName}` : '';
      } else if (activity.relatedTo === 'lead' && activity.relatedId) {
        const lead = this.leads.get(activity.relatedId);
        target = lead?.name || '';
      }
      
      // Calculate time ago
      const now = new Date();
      const activityDate = new Date(activity.createdAt);
      const diffMs = now.getTime() - activityDate.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let time;
      if (diffDays > 0) {
        if (diffDays === 1) {
          const hours = activityDate.getHours();
          const minutes = activityDate.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          const hour12 = hours % 12 || 12;
          time = `Yesterday at ${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
        } else {
          time = `${diffDays} days ago`;
        }
      } else if (diffHours > 0) {
        time = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      } else {
        time = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
      }
      
      return {
        id: activity.id,
        type: activity.type,
        title: activity.title,
        isYou: activity.type === 'email', // Example condition
        target,
        time
      };
    });
  }

  async getLeadSources(): Promise<any> {
    const leads = Array.from(this.leads.values());
    
    // Group leads by source
    const sourceCounts: Record<string, number> = {};
    leads.forEach(lead => {
      const source = lead.source || 'Other';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    // Convert to array and sort by count
    const sources = Object.entries(sourceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate percentages
    const totalLeads = leads.length;
    
    // Assign colors
    const colors = ["#3b82f6", "#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
    
    return sources.map((source, index) => ({
      name: source.name,
      percentage: totalLeads > 0 ? Math.round((source.count / totalLeads) * 100) : 0,
      color: colors[index % colors.length]
    }));
  }

  // Sales Targets methods
  async getAllSalesTargets(): Promise<SalesTarget[]> {
    return Array.from(this.salesTargets.values());
  }

  async getSalesTarget(id: number): Promise<SalesTarget | undefined> {
    return this.salesTargets.get(id);
  }

  async getSalesTargetsByUser(userId: number): Promise<SalesTarget[]> {
    return Array.from(this.salesTargets.values())
      .filter((target) => target.userId === userId);
  }

  async getSalesTargetsByCompany(companyId: number): Promise<SalesTarget[]> {
    return Array.from(this.salesTargets.values())
      .filter((target) => target.companyId === companyId);
  }

  async createSalesTarget(insertTarget: InsertSalesTarget): Promise<SalesTarget> {
    const id = this.salesTargetIdCounter++;
    const createdAt = new Date();
    const target: SalesTarget = { ...insertTarget, id, createdAt };
    this.salesTargets.set(id, target);
    return target;
  }

  async updateSalesTarget(id: number, updates: Partial<SalesTarget>): Promise<SalesTarget | undefined> {
    const target = this.salesTargets.get(id);
    if (!target) return undefined;
    
    const updatedTarget = { ...target, ...updates };
    this.salesTargets.set(id, updatedTarget);
    return updatedTarget;
  }

  async deleteSalesTarget(id: number): Promise<boolean> {
    return this.salesTargets.delete(id);
  }
}

// Import the DatabaseStorage instead of using MemStorage
import { DatabaseStorage } from "./database-storage";

// Use database storage for production
export const storage = new DatabaseStorage();
