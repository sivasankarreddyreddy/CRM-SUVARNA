import { IStorage } from "./storage";
import { db, pool } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
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
import { eq, desc, asc, and, sql, inArray } from "drizzle-orm";

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
  
  async getLeadsByContact(contactId: number): Promise<Lead[]> {
    try {
      // Find all opportunities associated with this contact
      const contactOpportunities = await db
        .select()
        .from(opportunities)
        .where(eq(opportunities.contactId, contactId))
        .execute();
      
      // Extract lead IDs from those opportunities
      const leadIds = contactOpportunities
        .filter(opp => opp.leadId !== null)
        .map(opp => opp.leadId);
      
      if (leadIds.length === 0) {
        return [];
      }
      
      // Get the leads
      const contactLeads = await db
        .select()
        .from(leads)
        .where(inArray(leads.id, leadIds as number[]))
        .execute();
        
      return contactLeads;
    } catch (error) {
      console.error("Error fetching leads by contact:", error);
      return [];
    }
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
    try {
      console.log("DB Storage createQuotation - Received data:", insertQuotation);
      
      // Ensure numeric fields are properly formatted
      const formattedData = {
        ...insertQuotation,
        subtotal: typeof insertQuotation.subtotal === 'string' 
          ? parseFloat(insertQuotation.subtotal) 
          : insertQuotation.subtotal,
        total: typeof insertQuotation.total === 'string' 
          ? parseFloat(insertQuotation.total) 
          : insertQuotation.total,
      };
      
      // Handle optional numeric fields
      if (insertQuotation.tax !== undefined) {
        formattedData.tax = typeof insertQuotation.tax === 'string' 
          ? parseFloat(insertQuotation.tax) 
          : insertQuotation.tax;
      }
      
      if (insertQuotation.discount !== undefined) {
        formattedData.discount = typeof insertQuotation.discount === 'string' 
          ? parseFloat(insertQuotation.discount) 
          : insertQuotation.discount;
      }
      
      console.log("DB Storage createQuotation - Formatted data:", formattedData);
      
      const [quotation] = await db.insert(quotations).values(formattedData).returning();
      console.log("DB Storage createQuotation - Created quotation:", quotation);
      return quotation;
    } catch (error) {
      console.error("DB Storage createQuotation - Error:", error);
      throw error;
    }
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
  
  async getQuotationsByOpportunity(opportunityId: number): Promise<Quotation[]> {
    return await db.select()
      .from(quotations)
      .where(eq(quotations.opportunityId, opportunityId))
      .orderBy(desc(quotations.createdAt));
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
  
  async getActivitiesByLead(leadId: number): Promise<Activity[]> {
    return await db.select()
      .from(activities)
      .where(
        and(
          eq(activities.relatedTo, 'lead'),
          eq(activities.relatedId, leadId)
        )
      )
      .orderBy(desc(activities.createdAt));
  }
  
  async getTasksByLead(leadId: number): Promise<Task[]> {
    return await db.select()
      .from(tasks)
      .where(
        and(
          eq(tasks.relatedTo, 'lead'),
          eq(tasks.relatedId, leadId)
        )
      )
      .orderBy(desc(tasks.createdAt));
  }
  
  async getOpportunitiesByLead(leadId: number): Promise<Opportunity[]> {
    return await db.select()
      .from(opportunities)
      .where(eq(opportunities.leadId, leadId))
      .orderBy(desc(opportunities.createdAt));
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

  // Dashboard Methods
  async getDashboardStats(): Promise<any> {
    // Get total leads count with percentage change
    const totalLeads = await db.select({ count: sql`COUNT(*)` }).from(leads);
    
    // Get last month's leads count for comparison
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    
    const lastMonthLeads = await db.select({ count: sql`COUNT(*)` })
      .from(leads)
      .where(sql`"created_at" < ${lastMonthDate}`);
    
    const leadsCount = Number(totalLeads[0].count);
    const lastMonthLeadsCount = Number(lastMonthLeads[0].count);
    const leadsChange = lastMonthLeadsCount > 0 
      ? ((leadsCount - lastMonthLeadsCount) / lastMonthLeadsCount) * 100 
      : 0;
    
    // Get open opportunities (deals) count
    const openDeals = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(sql`stage != 'closed-won' AND stage != 'closed-lost'`);
    
    // Get last month's open deals count for comparison
    const lastMonthOpenDeals = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(sql`stage != 'closed-won' AND stage != 'closed-lost' AND "created_at" < ${lastMonthDate}`);
    
    const openDealsCount = Number(openDeals[0].count);
    const lastMonthOpenDealsCount = Number(lastMonthOpenDeals[0].count);
    const openDealsChange = lastMonthOpenDealsCount > 0 
      ? ((openDealsCount - lastMonthOpenDealsCount) / lastMonthOpenDealsCount) * 100 
      : 0;
    
    // Get total sales this month (from sales orders)
    const currentMonth = new Date();
    currentMonth.setDate(1); // First day of current month
    
    const salesThisMonth = await db.select({ total: sql`SUM(total)` })
      .from(salesOrders)
      .where(sql`"created_at" >= ${currentMonth}`);
    
    // Get last month's sales for comparison
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    lastMonth.setDate(1); // First day of last month
    
    const endOfLastMonth = new Date(currentMonth);
    endOfLastMonth.setMilliseconds(-1); // Last millisecond of last month
    
    const salesLastMonth = await db.select({ total: sql`SUM(total)` })
      .from(salesOrders)
      .where(sql`"created_at" >= ${lastMonth} AND "created_at" < ${currentMonth}`);
    
    const totalSales = Number(salesThisMonth[0].total) || 0;
    const lastMonthSales = Number(salesLastMonth[0].total) || 0;
    const salesChange = lastMonthSales > 0 
      ? ((totalSales - lastMonthSales) / lastMonthSales) * 100 
      : 0;
    
    // Calculate conversion rate (closed-won opportunities / all opportunities)
    const closedWonOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(sql`stage = 'closed-won'`);
    
    const allOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities);
    
    // Get last month's conversion rate for comparison
    const lastMonthClosedWonOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(sql`stage = 'closed-won' AND "created_at" < ${lastMonthDate}`);
    
    const lastMonthAllOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(sql`"created_at" < ${lastMonthDate}`);
    
    const closedWonCount = Number(closedWonOpps[0].count);
    const allOppsCount = Number(allOpps[0].count);
    const conversionRate = allOppsCount > 0 ? (closedWonCount / allOppsCount) * 100 : 0;
    
    const lastMonthClosedWonCount = Number(lastMonthClosedWonOpps[0].count);
    const lastMonthAllOppsCount = Number(lastMonthAllOpps[0].count);
    const lastMonthConversionRate = lastMonthAllOppsCount > 0 
      ? (lastMonthClosedWonCount / lastMonthAllOppsCount) * 100 
      : 0;
    
    const conversionRateChange = lastMonthConversionRate > 0 
      ? conversionRate - lastMonthConversionRate 
      : 0;
    
    return {
      totalLeads: { 
        value: leadsCount.toString(), 
        change: parseFloat(leadsChange.toFixed(1)) 
      },
      openDeals: { 
        value: openDealsCount.toString(), 
        change: parseFloat(openDealsChange.toFixed(1)) 
      },
      salesMtd: { 
        value: `₹${totalSales.toLocaleString()}`, 
        change: parseFloat(salesChange.toFixed(1)) 
      },
      conversionRate: { 
        value: `${conversionRate.toFixed(1)}%`, 
        change: parseFloat(conversionRateChange.toFixed(1)) 
      }
    };
  }

  async getPipelineData(): Promise<any> {
    // Define the stages and their colors
    const stages = [
      { name: "Qualification", color: "rgb(59, 130, 246)" },
      { name: "Proposal", color: "rgb(79, 70, 229)" },
      { name: "Negotiation", color: "rgb(139, 92, 246)" },
      { name: "Closing", color: "rgb(245, 158, 11)" }
    ];

    // Get opportunity counts and values by stage
    const stageData = await Promise.all(stages.map(async (stage) => {
      const stageOpps = await db.select({
        count: sql`COUNT(*)`,
        value: sql`SUM(value)`
      })
      .from(opportunities)
      .where(sql`LOWER(stage) = LOWER(${stage.name}) AND stage != 'closed-lost'`);
      
      return {
        ...stage,
        count: Number(stageOpps[0].count),
        value: `₹${Number(stageOpps[0].value || 0).toLocaleString()}`
      };
    }));

    // Calculate total value across all stages
    const totalValueResult = await db.select({
      total: sql`SUM(value)`
    })
    .from(opportunities)
    .where(sql`stage != 'closed-lost'`);

    const totalValue = `₹${Number(totalValueResult[0].total || 0).toLocaleString()}`;

    // Calculate percentages based on the highest count
    const maxCount = Math.max(...stageData.map(stage => stage.count));
    
    const stagesWithPercentage = stageData.map(stage => ({
      ...stage,
      percentage: maxCount > 0 ? Math.round((stage.count / maxCount) * 100) : 0
    }));

    return {
      stages: stagesWithPercentage,
      totalValue
    };
  }

  async getRecentOpportunities(): Promise<any> {
    // Get recent opportunities with company names
    const result = await db.select({
      id: opportunities.id,
      name: opportunities.name,
      companyId: opportunities.companyId,
      stage: opportunities.stage,
      value: opportunities.value,
      createdAt: opportunities.createdAt,
    })
    .from(opportunities)
    .orderBy(desc(opportunities.createdAt))
    .limit(4);

    // Get company information for each opportunity
    const oppsWithCompanies = await Promise.all(result.map(async (opp) => {
      const company = opp.companyId ? await this.getCompany(opp.companyId) : null;
      
      // Calculate time difference for createdAt
      const now = new Date();
      const createdAtDate = new Date(opp.createdAt || new Date());
      const diffMs = now.getTime() - createdAtDate.getTime();
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
        value: `₹${Number(opp.value).toLocaleString()}`,
        createdAt: timeAgo
      };
    }));

    return oppsWithCompanies;
  }

  async getTodayTasks(): Promise<any> {
    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    try {
      // Get tasks due today - use proper column names (snake_case)
      const todayTasks = await db.select()
        .from(tasks)
        .where(
          sql`("due_date" = ${today}) OR 
              ("due_date" IS NULL AND "created_at"::date = ${today}::date)`
        )
        .orderBy(asc(tasks.priority))
        .limit(4);

      // Format tasks for display
      return todayTasks.map(task => {
        return {
          id: task.id,
          title: task.title,
          dueTime: "Due today",
          priority: task.priority || "medium",
          completed: task.status === "completed"
        };
      });
    } catch (error) {
      console.error("Error in getTodayTasks:", error);
      return []; // Return empty array instead of failing
    }
  }

  async getRecentActivities(): Promise<any> {
    try {
      // Get recent activities
      const recentActivities = await db.select({
        id: activities.id,
        type: activities.type,
        title: activities.title,
        createdBy: activities.createdBy,
        relatedTo: activities.relatedTo,
        relatedId: activities.relatedId,
        createdAt: activities.createdAt
      })
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(4);

      // Process activities for display
      const result = await Promise.all(recentActivities.map(async (activity) => {
        // Get creator info
        const creator = await this.getUser(activity.createdBy);
        const isYou = activity.type === 'email'; // Just as an example, in a real app this would be compared with the current user
        
        // Get related entity info (company, contact, etc.)
        let target = "";
        if (activity.relatedTo === 'company' && activity.relatedId) {
          const company = await this.getCompany(activity.relatedId);
          target = company?.name || '';
        } else if (activity.relatedTo === 'contact' && activity.relatedId) {
          const contact = await this.getContact(activity.relatedId);
          // Concatenate first and last name for contacts
          target = contact ? `${contact.firstName} ${contact.lastName}` : '';
        } else if (activity.relatedTo === 'lead' && activity.relatedId) {
          const lead = await this.getLead(activity.relatedId);
          // Use a basic fallback name if none exists
          target = lead ? (lead.name || `Lead #${lead.id}`) : '';
        }
        
        // Calculate time ago
        const now = new Date();
        const activityDate = new Date(activity.createdAt || new Date());
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
          isYou,
          target,
          time
        };
      }));
      
      return result;
    } catch (error) {
      console.error("Error in getRecentActivities:", error);
      return []; // Return empty array instead of failing
    }
  }

  async getLeadSources(): Promise<any> {
    try {
      // Aggregate leads by source
      const sourcesResult = await db.execute(sql`
        SELECT 
          COALESCE(source, 'Other') as name,
          COUNT(*) as count
        FROM ${leads}
        GROUP BY COALESCE(source, 'Other')
        ORDER BY count DESC
      `);
      
      // Type assertion to make TypeScript happy
      const sources = sourcesResult.rows as any[];
      
      // Get total lead count
      const totalLeads = await db.select({ count: sql`COUNT(*)` }).from(leads);
      const totalCount = Number(totalLeads[0].count);
      
      // Calculate percentages and assign colors
      const colors = ["#3b82f6", "#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
      
      return sources.map((source: any, index: number) => ({
        name: source.name,
        percentage: totalCount > 0 ? Math.round((Number(source.count) / totalCount) * 100) : 0,
        color: colors[index % colors.length]
      }));
    } catch (error) {
      console.error("Error in getLeadSources:", error);
      return []; // Return empty array instead of failing
    }
  }
}