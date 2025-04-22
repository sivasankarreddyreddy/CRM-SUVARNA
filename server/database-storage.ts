import { IStorage } from "./storage";
import { db, pool } from "./db";
import { 
  Activity,
  Appointment,
  Company,
  Contact,
  InsertActivity,
  InsertAppointment,
  InsertCompany,
  InsertContact,
  InsertLead,
  InsertOpportunity,
  InsertProduct,
  InsertQuotation,
  InsertQuotationItem,
  InsertSalesOrder,
  InsertSalesOrderItem,
  InsertTask,
  InsertTeam,
  InsertUser,
  Lead,
  Opportunity,
  Product,
  Quotation,
  QuotationItem,
  SalesOrder,
  SalesOrderItem,
  Task,
  Team,
  User,
  activities,
  appointments,
  companies,
  contacts,
  leads,
  opportunities,
  products,
  quotationItems,
  quotations,
  salesOrderItems,
  salesOrders,
  tasks,
  teams,
  users
} from "@shared/schema";
import { eq, desc, asc, and, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // Team methods
  async getAllTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(asc(teams.name));
  }
  
  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team;
  }
  
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const [team] = await db.insert(teams).values(insertTeam).returning();
    return team;
  }
  
  async updateTeam(id: number, updates: Partial<Team>): Promise<Team | undefined> {
    const [updatedTeam] = await db
      .update(teams)
      .set(updates)
      .where(eq(teams.id, id))
      .returning();
    return updatedTeam;
  }
  
  async deleteTeam(id: number): Promise<boolean> {
    const result = await db.delete(teams).where(eq(teams.id, id));
    return result.rowCount > 0;
  }
  
  async getTeamMembers(teamId: number): Promise<User[]> {
    return await db.select().from(users).where(eq(users.teamId, teamId)).orderBy(asc(users.fullName));
  }
  
  async getTeamManagers(teamId: number): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(and(
        eq(users.teamId, teamId),
        eq(users.role, "sales_manager")
      ))
      .orderBy(asc(users.fullName));
  }
  
  async getTeamLeads(teamId: number): Promise<Lead[]> {
    return await db.select()
      .from(leads)
      .where(eq(leads.teamId, teamId))
      .orderBy(desc(leads.createdAt));
  }
  
  async getTeamOpportunities(teamId: number): Promise<Opportunity[]> {
    return await db.select()
      .from(opportunities)
      .where(eq(opportunities.teamId, teamId))
      .orderBy(desc(opportunities.createdAt));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.username));
  }
  
  async getUsersWithTeam(): Promise<any[]> {
    const result = await db.select({
      user: users,
      team: teams,
      manager: users
    })
    .from(users)
    .leftJoin(teams, eq(users.teamId, teams.id))
    .leftJoin(users, eq(users.managerId, users.id), { alias: 'manager' })
    .orderBy(asc(users.fullName));
    
    return result;
  }
  
  async getUsersByManager(managerId: number): Promise<User[]> {
    return await db.select()
      .from(users)
      .where(eq(users.managerId, managerId))
      .orderBy(asc(users.fullName));
  }

  // Lead methods
  async getAllLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, updates: Partial<Lead>): Promise<Lead | undefined> {
    const [updatedLead] = await db
      .update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    const result = await db.delete(leads).where(eq(leads.id, id));
    return result.rowCount > 0;
  }

  // Contact methods
  async getAllContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: number): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(insertContact).returning();
    return contact;
  }

  async updateContact(id: number, updates: Partial<Contact>): Promise<Contact | undefined> {
    const [updatedContact] = await db
      .update(contacts)
      .set(updates)
      .where(eq(contacts.id, id))
      .returning();
    return updatedContact;
  }

  async deleteContact(id: number): Promise<boolean> {
    const result = await db.delete(contacts).where(eq(contacts.id, id));
    return result.rowCount > 0;
  }

  // Company methods
  async getAllCompanies(): Promise<Company[]> {
    return await db.select().from(companies).orderBy(desc(companies.createdAt));
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, updates: Partial<Company>): Promise<Company | undefined> {
    const [updatedCompany] = await db
      .update(companies)
      .set(updates)
      .where(eq(companies.id, id))
      .returning();
    return updatedCompany;
  }

  async deleteCompany(id: number): Promise<boolean> {
    const result = await db.delete(companies).where(eq(companies.id, id));
    return result.rowCount > 0;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product | undefined> {
    const [updatedProduct] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Opportunity methods
  async getAllOpportunities(): Promise<Opportunity[]> {
    return await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
  }

  async getOpportunity(id: number): Promise<Opportunity | undefined> {
    const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
    return opportunity;
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    const [opportunity] = await db.insert(opportunities).values(insertOpportunity).returning();
    return opportunity;
  }

  async updateOpportunity(id: number, updates: Partial<Opportunity>): Promise<Opportunity | undefined> {
    const [updatedOpportunity] = await db
      .update(opportunities)
      .set(updates)
      .where(eq(opportunities.id, id))
      .returning();
    return updatedOpportunity;
  }

  async deleteOpportunity(id: number): Promise<boolean> {
    const result = await db.delete(opportunities).where(eq(opportunities.id, id));
    return result.rowCount > 0;
  }

  // Quotation methods
  async getAllQuotations(): Promise<Quotation[]> {
    return await db.select().from(quotations).orderBy(desc(quotations.createdAt));
  }

  async getQuotation(id: number): Promise<Quotation | undefined> {
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, id));
    return quotation;
  }

  async createQuotation(insertQuotation: InsertQuotation): Promise<Quotation> {
    const [quotation] = await db.insert(quotations).values(insertQuotation).returning();
    return quotation;
  }

  async updateQuotation(id: number, updates: Partial<Quotation>): Promise<Quotation | undefined> {
    const [updatedQuotation] = await db
      .update(quotations)
      .set(updates)
      .where(eq(quotations.id, id))
      .returning();
    return updatedQuotation;
  }

  async deleteQuotation(id: number): Promise<boolean> {
    const result = await db.delete(quotations).where(eq(quotations.id, id));
    return result.rowCount > 0;
  }

  // Quotation Item methods
  async getQuotationItems(quotationId: number): Promise<QuotationItem[]> {
    return await db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotationId));
  }

  async createQuotationItem(insertItem: InsertQuotationItem): Promise<QuotationItem> {
    const [item] = await db.insert(quotationItems).values(insertItem).returning();
    return item;
  }

  // Sales Order methods
  async getAllSalesOrders(): Promise<SalesOrder[]> {
    return await db.select().from(salesOrders).orderBy(desc(salesOrders.createdAt));
  }

  async getSalesOrder(id: number): Promise<SalesOrder | undefined> {
    const [order] = await db.select().from(salesOrders).where(eq(salesOrders.id, id));
    return order;
  }

  async createSalesOrder(insertOrder: InsertSalesOrder): Promise<SalesOrder> {
    const [order] = await db.insert(salesOrders).values(insertOrder).returning();
    return order;
  }

  async updateSalesOrder(id: number, updates: Partial<SalesOrder>): Promise<SalesOrder | undefined> {
    const [updatedOrder] = await db
      .update(salesOrders)
      .set(updates)
      .where(eq(salesOrders.id, id))
      .returning();
    return updatedOrder;
  }

  async deleteSalesOrder(id: number): Promise<boolean> {
    const result = await db.delete(salesOrders).where(eq(salesOrders.id, id));
    return result.rowCount > 0;
  }

  // Sales Order Item methods
  async getSalesOrderItems(orderId: number): Promise<SalesOrderItem[]> {
    return await db.select().from(salesOrderItems).where(eq(salesOrderItems.salesOrderId, orderId));
  }

  async createSalesOrderItem(insertItem: InsertSalesOrderItem): Promise<SalesOrderItem> {
    const [item] = await db.insert(salesOrderItems).values(insertItem).returning();
    return item;
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(desc(tasks.createdAt));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db.insert(tasks).values(insertTask).returning();
    return task;
  }

  async updateTask(id: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, id))
      .returning();
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }

  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    return await db.select().from(activities).orderBy(desc(activities.createdAt));
  }

  async getActivity(id: number): Promise<Activity | undefined> {
    const [activity] = await db.select().from(activities).where(eq(activities.id, id));
    return activity;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(insertActivity).returning();
    return activity;
  }

  async updateActivity(id: number, updates: Partial<Activity>): Promise<Activity | undefined> {
    const [updatedActivity] = await db
      .update(activities)
      .set(updates)
      .where(eq(activities.id, id))
      .returning();
    return updatedActivity;
  }

  async deleteActivity(id: number): Promise<boolean> {
    const result = await db.delete(activities).where(eq(activities.id, id));
    return result.rowCount > 0;
  }

  // Appointment methods
  async getAllAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(desc(appointments.startTime));
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment;
  }

  async getAppointmentsByAttendee(attendeeType: string, attendeeId: number): Promise<Appointment[]> {
    return await db.select()
      .from(appointments)
      .where(
        and(
          eq(appointments.attendeeType, attendeeType),
          eq(appointments.attendeeId, attendeeId)
        )
      )
      .orderBy(desc(appointments.startTime));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }

  async updateAppointment(id: number, updates: Partial<Appointment>): Promise<Appointment | undefined> {
    const [updatedAppointment] = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, id))
      .returning();
    return updatedAppointment;
  }

  async deleteAppointment(id: number): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return result.rowCount > 0;
  }

  // Report methods
  async getSalesReportData(period: string = 'monthly'): Promise<any> {
    // Get sales totals by period
    let timeFilter;
    switch (period) {
      case 'weekly':
        timeFilter = sql`DATE_TRUNC('week', "createdAt")`;
        break;
      case 'quarterly':
        timeFilter = sql`DATE_TRUNC('quarter', "createdAt")`;
        break;
      case 'yearly':
        timeFilter = sql`DATE_TRUNC('year', "createdAt")`;
        break;
      case 'monthly':
      default:
        timeFilter = sql`DATE_TRUNC('month', "createdAt")`;
    }

    // Get sales by time period
    const salesByPeriod = await db.execute(sql`
      SELECT 
        ${timeFilter} as time_period,
        SUM(CAST("total" as decimal)) as total_sales
      FROM ${salesOrders}
      GROUP BY time_period
      ORDER BY time_period
    `);

    // Top products sold
    const topProducts = await db.execute(sql`
      SELECT 
        p.name, 
        SUM(soi.quantity) as total_quantity,
        SUM(CAST(soi.subtotal as decimal)) as total_revenue
      FROM ${salesOrderItems} soi
      JOIN ${products} p ON soi."productId" = p.id
      GROUP BY p.name
      ORDER BY total_revenue DESC
      LIMIT 5
    `);

    // Sales by company
    const salesByCompany = await db.execute(sql`
      SELECT 
        c.name, 
        SUM(CAST(so.total as decimal)) as total_sales
      FROM ${salesOrders} so
      JOIN ${companies} c ON so."companyId" = c.id
      GROUP BY c.name
      ORDER BY total_sales DESC
      LIMIT 5
    `);

    // Conversion rate from opportunities to orders
    const opportunityConversion = await db.execute(sql`
      WITH total_opportunities AS (
        SELECT COUNT(*) as count FROM ${opportunities}
      ),
      converted_opportunities AS (
        SELECT COUNT(*) as count FROM ${salesOrders} so
        WHERE so."opportunityId" IS NOT NULL
      )
      SELECT 
        t.count as total_opportunities,
        c.count as converted_opportunities,
        CASE 
          WHEN t.count = 0 THEN 0
          ELSE (c.count::float / t.count::float) * 100 
        END as conversion_rate
      FROM total_opportunities t, converted_opportunities c
    `);

    return {
      salesByPeriod,
      topProducts,
      salesByCompany,
      opportunityConversion: opportunityConversion[0] || { 
        total_opportunities: 0, 
        converted_opportunities: 0, 
        conversion_rate: 0 
      }
    };
  }

  async getActivityReportData(period: string = 'monthly'): Promise<any> {
    // Get activity counts by type
    const activityByType = await db.execute(sql`
      SELECT 
        type, 
        COUNT(*) as count
      FROM ${activities}
      GROUP BY type
      ORDER BY count DESC
    `);

    // Get activity counts by time period
    let timeFilter;
    switch (period) {
      case 'weekly':
        timeFilter = sql`DATE_TRUNC('week', "createdAt")`;
        break;
      case 'quarterly':
        timeFilter = sql`DATE_TRUNC('quarter', "createdAt")`;
        break;
      case 'yearly':
        timeFilter = sql`DATE_TRUNC('year', "createdAt")`;
        break;
      case 'monthly':
      default:
        timeFilter = sql`DATE_TRUNC('month', "createdAt")`;
    }

    const activityByPeriod = await db.execute(sql`
      SELECT 
        ${timeFilter} as time_period,
        COUNT(*) as activity_count
      FROM ${activities}
      GROUP BY time_period
      ORDER BY time_period
    `);

    // Activity counts by user
    const activityByUser = await db.execute(sql`
      SELECT 
        u.username, 
        COUNT(a.id) as activity_count
      FROM ${activities} a
      JOIN ${users} u ON a."createdBy" = u.id
      GROUP BY u.username
      ORDER BY activity_count DESC
    `);

    // Task completion rates
    const taskCompletionRate = await db.execute(sql`
      WITH total_tasks AS (
        SELECT COUNT(*) as count FROM ${tasks}
      ),
      completed_tasks AS (
        SELECT COUNT(*) as count FROM ${tasks}
        WHERE status = 'completed'
      )
      SELECT 
        t.count as total_tasks,
        c.count as completed_tasks,
        CASE 
          WHEN t.count = 0 THEN 0
          ELSE (c.count::float / t.count::float) * 100 
        END as completion_rate
      FROM total_tasks t, completed_tasks c
    `);

    // Recent activities
    const recentActivities = await db.select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(10);

    return {
      activityByType,
      activityByPeriod,
      activityByUser,
      taskCompletionRate: taskCompletionRate[0] || { 
        total_tasks: 0, 
        completed_tasks: 0, 
        completion_rate: 0 
      },
      recentActivities
    };
  }
}