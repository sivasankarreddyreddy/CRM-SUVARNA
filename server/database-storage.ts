import { IStorage } from "./storage";
import { db, pool } from "./db";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { FilterParams, PaginatedResponse } from "@shared/filter-types";
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
  InsertModule,
  InsertOpportunity,
  InsertProduct,
  InsertProductModule,
  InsertQuotation,
  InsertQuotationItem,
  InsertSalesOrder,
  InsertSalesOrderItem,
  InsertSalesTarget,
  InsertTask,
  InsertTeam,
  InsertUser,
  InsertVendor,
  InsertVendorGroup,
  Lead,
  Module,
  Opportunity,
  Product,
  ProductModule,
  Quotation,
  QuotationItem,
  SalesOrder,
  SalesOrderItem,
  SalesTarget,
  Task,
  Team,
  User,
  Vendor,
  VendorGroup,
  activities,
  appointments,
  companies,
  contacts,
  leads,
  modules,
  opportunities,
  productModules,
  products,
  quotationItems,
  quotations,
  salesOrderItems,
  salesOrders,
  salesTargets,
  tasks,
  teams,
  users,
  vendorGroups,
  vendors
} from "@shared/schema";
import { eq, desc, asc, and, sql, inArray, gte, lte, or, like, count, isNull } from "drizzle-orm";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }
  
  /**
   * Helper method to calculate date ranges based on the selected period
   */
  getPeriodDateRange(period: string): { 
    startDate: Date; 
    endDate: Date; 
    comparisonStartDate: Date; 
    comparisonEndDate: Date;
  } {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date;
    let endDate: Date = new Date(now);
    let comparisonStartDate: Date;
    let comparisonEndDate: Date;
    
    switch (period) {
      case 'today':
        startDate = today;
        comparisonStartDate = new Date(today);
        comparisonStartDate.setDate(comparisonStartDate.getDate() - 1);
        comparisonEndDate = new Date(comparisonStartDate);
        break;
        
      case 'yesterday':
        startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 1);
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        comparisonStartDate = new Date(startDate);
        comparisonStartDate.setDate(comparisonStartDate.getDate() - 1);
        comparisonEndDate = new Date(comparisonStartDate);
        comparisonEndDate.setHours(23, 59, 59, 999);
        break;
        
      case 'thisWeek':
        const dayOfWeek = today.getDay();
        const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
        startDate = new Date(today.setDate(diff));
        comparisonStartDate = new Date(startDate);
        comparisonStartDate.setDate(comparisonStartDate.getDate() - 7);
        comparisonEndDate = new Date(endDate);
        comparisonEndDate.setDate(comparisonEndDate.getDate() - 7);
        break;
        
      case 'lastWeek':
        const lastWeekDay = today.getDay();
        const lastWeekDiff = today.getDate() - lastWeekDay - 6; // Last week's Monday
        startDate = new Date(today.setDate(lastWeekDiff));
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        comparisonStartDate = new Date(startDate);
        comparisonStartDate.setDate(comparisonStartDate.getDate() - 7);
        comparisonEndDate = new Date(endDate);
        comparisonEndDate.setDate(comparisonEndDate.getDate() - 7);
        break;
        
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        comparisonStartDate = new Date(startDate);
        comparisonStartDate.setMonth(comparisonStartDate.getMonth() - 1);
        comparisonEndDate = new Date(endDate);
        comparisonEndDate.setMonth(comparisonEndDate.getMonth() - 1);
        break;
        
      case 'last3Months':
        startDate = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        endDate.setHours(23, 59, 59, 999);
        comparisonStartDate = new Date(startDate);
        comparisonStartDate.setMonth(comparisonStartDate.getMonth() - 3);
        comparisonEndDate = new Date(endDate);
        comparisonEndDate.setMonth(comparisonEndDate.getMonth() - 3);
        break;
        
      case 'thisYear':
        startDate = new Date(today.getFullYear(), 0, 1);
        comparisonStartDate = new Date(today.getFullYear() - 1, 0, 1);
        comparisonEndDate = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
        
      case 'lastYear':
        startDate = new Date(today.getFullYear() - 1, 0, 1);
        endDate = new Date(today.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        comparisonStartDate = new Date(today.getFullYear() - 2, 0, 1);
        comparisonEndDate = new Date(today.getFullYear() - 2, 11, 31, 23, 59, 59, 999);
        break;
        
      case 'thisMonth':
      default:
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        comparisonStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        comparisonEndDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
        break;
    }
    
    return { startDate, endDate, comparisonStartDate, comparisonEndDate };
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
    const query = `
      SELECT 
        u.id, u.username, u.full_name, u.email, u.role, u.team_id, u.manager_id, u.is_active,
        t.id as team_id, t.name as team_name, t.description as team_description,
        m.id as manager_id, m.full_name as manager_name
      FROM users u
      LEFT JOIN teams t ON u.team_id = t.id
      LEFT JOIN users m ON u.manager_id = m.id
      ORDER BY u.full_name
    `;
    
    const result = await db.execute(query);
    return result.rows;
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
  
  /**
   * Get leads with filtering, sorting, and pagination
   */
  async getFilteredLeads(params: FilterParams, currentUser: User): Promise<PaginatedResponse<Lead>> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        column = "createdAt",
        direction = "desc",
        fromDate,
        toDate,
        status,
        source,
        assignedTo
      } = params;
      
      console.log("Lead filter params:", params);
      
      // Use Drizzle ORM approach instead of raw SQL
      let query = db.select().from(leads);
      let countQuery = db.select({ count: count() }).from(leads);
      
      // Build filters
      const filters = [];
      
      // Role-based access filtering
      if (currentUser.role === 'sales_executive') {
        // Sales executives only see leads assigned to them
        filters.push(eq(leads.assignedTo, currentUser.id));
      } else if (currentUser.role === 'sales_manager') {
        // Build a multi-level hierarchical structure to get all team members at any level
        // Get all users first
        const users = await this.getAllUsers();
        
        // Create reporting maps for tracking the entire hierarchy
        const reportingMap = new Map();
        const directReportsMap = new Map();
        
        // Build the reporting maps
        users.forEach(user => {
          if (user.managerId) {
            reportingMap.set(user.id, user.managerId);
            
            // Add to direct reports map
            if (!directReportsMap.has(user.managerId)) {
              directReportsMap.set(user.managerId, []);
            }
            directReportsMap.get(user.managerId).push(user.id);
          }
        });
        
        // Function to recursively get all reports (direct and indirect)
        const getAllReports = (managerId) => {
          const allReports = new Set();
          const directReports = directReportsMap.get(managerId) || [];
          
          // Add direct reports
          directReports.forEach(reportId => {
            allReports.add(reportId);
            
            // Recursively add their reports
            const subReports = getAllReports(reportId);
            subReports.forEach(subReportId => allReports.add(subReportId));
          });
          
          return allReports;
        };
        
        // Get all team members in the hierarchy reporting to this manager (at all levels)
        const teamMemberIdsSet = getAllReports(currentUser.id);
        const teamMemberIds = Array.from(teamMemberIdsSet);
        
        if (teamMemberIds.length > 0) {
          // Include the manager's own leads and leads assigned to anyone in their hierarchy
          filters.push(
            or(
              inArray(leads.assignedTo, teamMemberIds),
              eq(leads.assignedTo, currentUser.id)
            )
          );
        } else {
          filters.push(eq(leads.assignedTo, currentUser.id));
        }
      }
      
      // Apply search filter if provided
      if (search) {
        filters.push(
          or(
            like(leads.name, `%${search}%`),
            like(leads.email, `%${search}%`),
            like(leads.phone, `%${search}%`),
            like(leads.notes, `%${search}%`)
          )
        );
      }
      
      // Apply date range filters if provided
      if (fromDate && fromDate !== 'all' && toDate && toDate !== 'all') {
        filters.push(
          and(
            gte(leads.createdAt, new Date(fromDate)),
            lte(leads.createdAt, new Date(toDate))
          )
        );
      } else if (fromDate && fromDate !== 'all') {
        filters.push(gte(leads.createdAt, new Date(fromDate)));
      } else if (toDate && toDate !== 'all') {
        filters.push(lte(leads.createdAt, new Date(toDate)));
      }
      
      // Apply status filter if provided
      if (status && status !== 'all') {
        filters.push(eq(leads.status, status));
      }
      
      // Apply source filter if provided
      if (source && source !== 'all') {
        filters.push(eq(leads.source, source));
      }
      
      // Apply assignedTo filter if provided
      if (assignedTo && assignedTo !== 'all') {
        if (assignedTo === 'unassigned') {
          // Handle the special 'unassigned' case
          filters.push(or(
            isNull(leads.assignedTo),
            eq(leads.assignedTo, 0)
          ));
        } else {
          // Filter by the specific user ID
          filters.push(eq(leads.assignedTo, parseInt(assignedTo)));
        }
      }
      
      // Apply combined filters to queries
      if (filters.length > 0) {
        const combinedFilter = and(...filters);
        query = query.where(combinedFilter);
        countQuery = countQuery.where(combinedFilter);
      }
      
      // Apply sorting
      if (direction === 'asc') {
        switch (column) {
          case 'name':
            query = query.orderBy(asc(leads.name));
            break;
          case 'email':
            query = query.orderBy(asc(leads.email));
            break;
          case 'phone':
            query = query.orderBy(asc(leads.phone));
            break;
          case 'source':
            query = query.orderBy(asc(leads.source));
            break;
          case 'status':
            query = query.orderBy(asc(leads.status));
            break;
          case 'createdAt':
          default:
            query = query.orderBy(asc(leads.createdAt));
            break;
        }
      } else {
        switch (column) {
          case 'name':
            query = query.orderBy(desc(leads.name));
            break;
          case 'email':
            query = query.orderBy(desc(leads.email));
            break;
          case 'phone':
            query = query.orderBy(desc(leads.phone));
            break;
          case 'source':
            query = query.orderBy(desc(leads.source));
            break;
          case 'status':
            query = query.orderBy(desc(leads.status));
            break;
          case 'createdAt':
          default:
            query = query.orderBy(desc(leads.createdAt));
            break;
        }
      }
      
      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query.limit(pageSize).offset(offset);
      
      // Execute the queries
      const [leadsResult, countResult] = await Promise.all([
        query,
        countQuery
      ]);
      
      const totalCount = Number(countResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Enhance leads with company and contact information
      const enhancedLeads = await Promise.all(
        leadsResult.map(async (lead) => {
          const enhanced = { ...lead, companyName: null };
          
          if (lead.companyId) {
            const company = await this.getCompany(lead.companyId);
            if (company) {
              enhanced.companyName = company.name;
            }
          }
          
          return enhanced;
        })
      );
      
      // Return paginated response
      return {
        data: enhancedLeads,
        totalCount,
        page,
        pageSize,
        totalPages
      };
      
    } catch (error) {
      console.error("Error in getFilteredLeads:", error);
      throw error;
    }
  }

  async getLead(id: number): Promise<Lead | undefined> {
    try {
      // First, get the basic lead data
      const [lead] = await db.select().from(leads).where(eq(leads.id, id));
      
      if (!lead) return undefined;
      
      // Create an enriched lead object with possible nested data
      const enrichedLead = { ...lead } as any; // Use any temporarily for the enhanced object
      
      // If the lead has a companyId, fetch the company details
      if (enrichedLead.companyId) {
        const [company] = await db
          .select()
          .from(companies)
          .where(eq(companies.id, enrichedLead.companyId));
          
        if (company) {
          // Add the full company object to the lead for conversion process
          enrichedLead.company = company;
          
          // Also ensure the companyName field is populated with the actual company name
          enrichedLead.companyName = company.name;
          
          console.log(`Adding company ${company.name} (id: ${company.id}) to lead ${lead.id}`);
        }
      }
      
      // If the lead has a contactId, fetch the contact details
      if (enrichedLead.contactId) {
        const [contact] = await db
          .select()
          .from(contacts)
          .where(eq(contacts.id, enrichedLead.contactId));
          
        if (contact) {
          // Add the full contact object to the lead for conversion process
          enrichedLead.contact = contact;
          console.log(`Adding contact ${contact.firstName} ${contact.lastName} (id: ${contact.id}) to lead ${lead.id}`);
        } else {
          console.log(`Contact with ID ${enrichedLead.contactId} not found for lead ${lead.id}`);
        }
      } else {
        console.log(`Lead ${lead.id} does not have a contactId assigned`);
        
        // If no contactId but a companyId exists, try to find related contacts from the company
        if (enrichedLead.companyId) {
          const companyContacts = await db
            .select()
            .from(contacts)
            .where(eq(contacts.companyId, enrichedLead.companyId))
            .limit(1);
            
          if (companyContacts.length > 0) {
            const primaryContact = companyContacts[0];
            console.log(`Found company contact ${primaryContact.firstName} ${primaryContact.lastName} (id: ${primaryContact.id}) for lead ${lead.id}`);
            
            // Add the contact to the lead
            enrichedLead.contact = primaryContact;
            
            // Update the lead's contactId in the database
            try {
              await db.execute(sql`
                UPDATE leads
                SET contact_id = ${primaryContact.id}
                WHERE id = ${lead.id}
              `);
              console.log(`Updated lead ${lead.id} with contactId ${primaryContact.id}`);
            } catch (error) {
              console.error("Error updating lead with contact information:", error);
            }
              
            // Update the in-memory enrichedLead object
            enrichedLead.contactId = primaryContact.id;
          }
        }
      }
      
      console.log(`Enriched lead data for lead ${lead.id}:`, {
        id: enrichedLead.id,
        name: enrichedLead.name, 
        companyId: enrichedLead.companyId,
        contactId: enrichedLead.contactId,
        hasCompany: !!enrichedLead.company,
        hasContact: !!enrichedLead.contact
      });
      
      return enrichedLead as Lead;
    } catch (error) {
      console.error("Error fetching lead:", error);
      return undefined;
    }
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
  
  /**
   * Get contacts with filtering, sorting, and pagination
   */
  async getFilteredContacts(params: FilterParams, currentUser: User): Promise<PaginatedResponse<any>> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        column = "createdAt",
        direction = "desc",
        fromDate,
        toDate,
        status,
      } = params;
      
      // Use Drizzle ORM approach instead of raw SQL
      let query = db.select().from(contacts);
      let countQuery = db.select({ count: count() }).from(contacts);
      
      // Build filters
      const filters = [];
      
      // Role-based access filtering
      if (currentUser.role === 'sales_executive') {
        // Sales executives only see contacts created by them
        filters.push(eq(contacts.createdBy, currentUser.id));
      } else if (currentUser.role === 'sales_manager') {
        // Get the IDs of all team members managed by this manager
        const teamMemberIds = await this.getTeamMemberIds(currentUser.id);
        
        if (teamMemberIds.length > 0) {
          filters.push(
            or(
              inArray(contacts.createdBy, teamMemberIds),
              eq(contacts.createdBy, currentUser.id)
            )
          );
        } else {
          filters.push(eq(contacts.createdBy, currentUser.id));
        }
      }
      
      // Apply search filter if provided
      if (search) {
        filters.push(
          or(
            like(contacts.firstName, `%${search}%`),
            like(contacts.lastName, `%${search}%`),
            like(contacts.email, `%${search}%`),
            like(contacts.phone, `%${search}%`),
            like(contacts.title, `%${search}%`)
          )
        );
      }
      
      // Apply date range filters if provided
      if (fromDate && fromDate !== 'all' && toDate && toDate !== 'all') {
        filters.push(
          and(
            gte(contacts.createdAt, new Date(fromDate)),
            lte(contacts.createdAt, new Date(toDate))
          )
        );
      } else if (fromDate && fromDate !== 'all') {
        filters.push(gte(contacts.createdAt, new Date(fromDate)));
      } else if (toDate && toDate !== 'all') {
        filters.push(lte(contacts.createdAt, new Date(toDate)));
      }
      
      // Apply status filter if provided
      if (status && status !== 'all') {
        // No status field on contacts currently
      }
      
      // Apply combined filters to queries
      if (filters.length > 0) {
        const combinedFilter = and(...filters);
        query = query.where(combinedFilter);
        countQuery = countQuery.where(combinedFilter);
      }
      
      // Apply sorting
      if (direction === 'asc') {
        switch (column) {
          case 'firstName':
            query = query.orderBy(asc(contacts.firstName));
            break;
          case 'lastName':
            query = query.orderBy(asc(contacts.lastName));
            break;
          case 'email':
            query = query.orderBy(asc(contacts.email));
            break;
          case 'title':
            query = query.orderBy(asc(contacts.title));
            break;
          case 'createdAt':
          default:
            query = query.orderBy(asc(contacts.createdAt));
            break;
        }
      } else {
        switch (column) {
          case 'firstName':
            query = query.orderBy(desc(contacts.firstName));
            break;
          case 'lastName':
            query = query.orderBy(desc(contacts.lastName));
            break;
          case 'email':
            query = query.orderBy(desc(contacts.email));
            break;
          case 'title':
            query = query.orderBy(desc(contacts.title));
            break;
          case 'createdAt':
          default:
            query = query.orderBy(desc(contacts.createdAt));
            break;
        }
      }
      
      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query.limit(pageSize).offset(offset);
      
      // Execute the queries
      const [contactsResult, countResult] = await Promise.all([
        query,
        countQuery
      ]);
      
      const totalCount = Number(countResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Enhance contacts with company information
      const enhancedContacts = await Promise.all(
        contactsResult.map(async (contact) => {
          const enhanced = { ...contact, companyName: null };
          
          if (contact.companyId) {
            const company = await this.getCompany(contact.companyId);
            if (company) {
              enhanced.companyName = company.name;
            }
          }
          
          return enhanced;
        })
      );
      
      // Return paginated response
      return {
        data: enhancedContacts,
        totalCount,
        page,
        pageSize,
        totalPages
      };
      
    } catch (error) {
      console.error("Error in getFilteredContacts:", error);
      throw error;
    }
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
  
  /**
   * Get companies with filtering, sorting, and pagination
   */
  async getFilteredCompanies(params: FilterParams, currentUser: User): Promise<PaginatedResponse<Company>> {
    try {
      const {
        page = 1,
        pageSize = 10,
        search,
        column = "createdAt",
        direction = "desc",
        fromDate,
        toDate,
        status,
        industry
      } = params;
      
      // Use Drizzle ORM approach instead of raw SQL
      let query = db.select().from(companies);
      let countQuery = db.select({ count: count() }).from(companies);
      
      // Apply filters
      const filters = [];
      
      // Apply search filter if provided
      if (search) {
        filters.push(
          or(
            like(companies.name, `%${search}%`),
            like(companies.industry, `%${search}%`)
          )
        );
      }
      
      // Apply date range filters if provided
      if (fromDate && fromDate !== 'all' && toDate && toDate !== 'all') {
        filters.push(
          and(
            gte(companies.createdAt, new Date(fromDate)),
            lte(companies.createdAt, new Date(toDate))
          )
        );
      } else if (fromDate && fromDate !== 'all') {
        filters.push(gte(companies.createdAt, new Date(fromDate)));
      } else if (toDate && toDate !== 'all') {
        filters.push(lte(companies.createdAt, new Date(toDate)));
      }
      
      // Apply industry filter if provided
      if (industry && industry !== 'all') {
        filters.push(eq(companies.industry, industry));
      }
      
      // Apply combined filters to queries
      if (filters.length > 0) {
        const combinedFilter = and(...filters);
        query = query.where(combinedFilter);
        countQuery = countQuery.where(combinedFilter);
      }
      
      // Apply sorting
      if (direction === 'asc') {
        switch (column) {
          case 'name':
            query = query.orderBy(asc(companies.name));
            break;
          case 'industry':
            query = query.orderBy(asc(companies.industry));
            break;
          case 'phone':
            query = query.orderBy(asc(companies.phone));
            break;
          case 'createdAt':
          default:
            query = query.orderBy(asc(companies.createdAt));
            break;
        }
      } else {
        switch (column) {
          case 'name':
            query = query.orderBy(desc(companies.name));
            break;
          case 'industry':
            query = query.orderBy(desc(companies.industry));
            break;
          case 'phone':
            query = query.orderBy(desc(companies.phone));
            break;
          case 'createdAt':
          default:
            query = query.orderBy(desc(companies.createdAt));
            break;
        }
      }
      
      // Apply pagination
      const offset = (page - 1) * pageSize;
      query = query.limit(pageSize).offset(offset);
      
      // Execute the queries
      const [companiesResult, countResult] = await Promise.all([
        query,
        countQuery
      ]);
      
      const totalCount = Number(countResult[0]?.count ?? 0);
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Return paginated response
      return {
        data: companiesResult,
        totalCount,
        page,
        pageSize,
        totalPages
      };
      
    } catch (error) {
      console.error("Error in getFilteredCompanies:", error);
      throw error;
    }
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
  
  // Vendor Group methods
  async getAllVendorGroups(): Promise<VendorGroup[]> {
    return await db.select().from(vendorGroups).orderBy(asc(vendorGroups.name));
  }
  
  /**
   * Get vendor groups with filtering, sorting, and pagination
   */
  async getFilteredVendorGroups(params: FilterParams): Promise<PaginatedResponse<VendorGroup>> {
    try {
      const { 
        page = 1, 
        pageSize = 10, 
        search = '',
        column = 'createdAt',
        direction = 'desc',
        fromDate,
        toDate
      } = params;
      
      // Base query for vendor groups
      const baseQueryStr = `
        SELECT * 
        FROM vendor_groups
      `;
      
      // Count query
      const countQueryStr = `
        SELECT COUNT(*) 
        FROM vendor_groups
      `;
      
      // Build WHERE clauses
      let whereConditions = [];
      let queryParams: any[] = [];
      let paramCount = 1;
      
      // Search term
      if (search) {
        whereConditions.push(`
          (name ILIKE $${paramCount} OR 
           description ILIKE $${paramCount})
        `);
        queryParams.push(`%${search}%`);
        paramCount++;
      }
      
      // Date filters
      if (fromDate) {
        whereConditions.push(`created_at >= $${paramCount}`);
        queryParams.push(fromDate);
        paramCount++;
      }
      
      if (toDate) {
        whereConditions.push(`created_at <= $${paramCount}`);
        queryParams.push(toDate);
        paramCount++;
      }
      
      // Combine WHERE clauses
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Add sorting
      const sortColumn = column === 'name' ? 'name' :
                       column === 'description' ? 'description' :
                       'created_at';
                         
      const sortDirection = direction === 'asc' ? 'ASC' : 'DESC';
      const orderClause = `ORDER BY ${sortColumn} ${sortDirection}`;
      
      // Add pagination
      const limitOffsetClause = `LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(pageSize, (page - 1) * pageSize);
      
      // Construct final queries
      const finalQuery = `${baseQueryStr} ${whereClause} ${orderClause} ${limitOffsetClause}`;
      const countQuery = `${countQueryStr} ${whereClause}`;
      
      // Execute queries
      const { rows: vendorGroups } = await pool.query(finalQuery, queryParams);
      const { rows: countResult } = await pool.query(countQuery, queryParams.slice(0, paramCount - 1));
      
      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Process the returned data to use camelCase keys
      const formattedVendorGroups = vendorGroups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        createdAt: group.created_at,
        createdBy: group.created_by,
        modifiedAt: group.modified_at,
        modifiedBy: group.modified_by
      }));
      
      return {
        data: formattedVendorGroups,
        meta: {
          currentPage: page,
          pageSize,
          totalCount,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error getting filtered vendor groups:', error);
      throw error;
    }
  }
  
  async getVendorGroup(id: number): Promise<VendorGroup | undefined> {
    const [vendorGroup] = await db.select().from(vendorGroups).where(eq(vendorGroups.id, id));
    return vendorGroup;
  }
  
  async createVendorGroup(insertVendorGroup: InsertVendorGroup): Promise<VendorGroup> {
    const [vendorGroup] = await db.insert(vendorGroups).values(insertVendorGroup).returning();
    return vendorGroup;
  }
  
  async updateVendorGroup(id: number, updates: Partial<VendorGroup>): Promise<VendorGroup | undefined> {
    const [updatedVendorGroup] = await db
      .update(vendorGroups)
      .set({
        ...updates,
        modifiedAt: new Date()
      })
      .where(eq(vendorGroups.id, id))
      .returning();
    return updatedVendorGroup;
  }
  
  async deleteVendorGroup(id: number): Promise<boolean> {
    const result = await db.delete(vendorGroups).where(eq(vendorGroups.id, id));
    return result.rowCount > 0;
  }

  // Vendor methods
  async getAllVendors(): Promise<any[]> {
    const result = await db
      .select({
        ...vendors,
        vendorGroupName: vendorGroups.name
      })
      .from(vendors)
      .leftJoin(vendorGroups, eq(vendors.vendorGroupId, vendorGroups.id))
      .orderBy(asc(vendors.name));
    
    return result;
  }
  
  async getVendor(id: number): Promise<any | undefined> {
    console.log(`Fetching vendor with ID: ${id}`);
    
    // Execute the query
    const result = await db
      .select({
        ...vendors,
        vendorGroupName: vendorGroups.name
      })
      .from(vendors)
      .leftJoin(vendorGroups, eq(vendors.vendorGroupId, vendorGroups.id))
      .where(eq(vendors.id, id));
    
    console.log(`getVendor query result:`, result);
    
    // Return the first (and should be only) vendor
    if (result && result.length > 0) {
      return result[0];
    }
    
    console.log(`No vendor found with ID: ${id}`);
    return undefined;
  }
  
  async getVendorsByGroup(groupId: number): Promise<any[]> {
    return await db
      .select({
        ...vendors,
        vendorGroupName: vendorGroups.name
      })
      .from(vendors)
      .leftJoin(vendorGroups, eq(vendors.vendorGroupId, vendorGroups.id))
      .where(eq(vendors.vendorGroupId, groupId))
      .orderBy(asc(vendors.name));
  }
  
  async createVendor(insertVendor: InsertVendor): Promise<Vendor> {
    const [vendor] = await db.insert(vendors).values(insertVendor).returning();
    return vendor;
  }
  
  async updateVendor(id: number, updates: Partial<Vendor>): Promise<Vendor | undefined> {
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        ...updates,
        modifiedAt: new Date()
      })
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }
  
  async deleteVendor(id: number): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return result.rowCount > 0;
  }
  
  /**
   * Get vendors with filtering, sorting, and pagination
   */
  async getFilteredVendors(params: FilterParams): Promise<PaginatedResponse<any>> {
    try {
      const { 
        page = 1, 
        pageSize = 10, 
        search = '',
        column = 'createdAt',
        direction = 'desc',
        fromDate,
        toDate,
        status
      } = params;
      
      // Base query for vendors with vendor group names
      const baseQueryStr = `
        SELECT v.*, vg.name as vendor_group_name
        FROM vendors v
        LEFT JOIN vendor_groups vg ON v.vendor_group_id = vg.id
      `;
      
      // Count query
      const countQueryStr = `
        SELECT COUNT(*) 
        FROM vendors v
      `;
      
      // Build WHERE clauses
      let whereConditions = [];
      let queryParams: any[] = [];
      let paramCount = 1;
      
      // Search term
      if (search) {
        whereConditions.push(`
          (v.name ILIKE $${paramCount} OR 
           v.contact_person ILIKE $${paramCount} OR 
           v.email ILIKE $${paramCount} OR 
           v.phone ILIKE $${paramCount})
        `);
        queryParams.push(`%${search}%`);
        paramCount++;
      }
      
      // Date filters
      if (fromDate) {
        whereConditions.push(`v.created_at >= $${paramCount}`);
        queryParams.push(fromDate);
        paramCount++;
      }
      
      if (toDate) {
        whereConditions.push(`v.created_at <= $${paramCount}`);
        queryParams.push(toDate);
        paramCount++;
      }
      
      // Status filter
      if (status) {
        whereConditions.push(`v.status = $${paramCount}`);
        queryParams.push(status);
        paramCount++;
      }
      
      // Combine WHERE clauses
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Add sorting
      const sortColumn = column === 'vendorGroupName' ? 'vg.name' :
                         column === 'name' ? 'v.name' :
                         column === 'contactPerson' ? 'v.contact_person' :
                         column === 'email' ? 'v.email' :
                         column === 'phone' ? 'v.phone' :
                         column === 'status' ? 'v.status' :
                         'v.created_at';
                         
      const sortDirection = direction === 'asc' ? 'ASC' : 'DESC';
      const orderClause = `ORDER BY ${sortColumn} ${sortDirection}`;
      
      // Add pagination
      const limitOffsetClause = `LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      queryParams.push(pageSize, (page - 1) * pageSize);
      
      // Construct final queries
      const finalQuery = `${baseQueryStr} ${whereClause} ${orderClause} ${limitOffsetClause}`;
      const countQuery = `${countQueryStr} ${whereClause}`;
      
      // Execute queries
      const { rows: vendors } = await pool.query(finalQuery, queryParams);
      const { rows: countResult } = await pool.query(countQuery, queryParams.slice(0, paramCount - 1));
      
      const totalCount = parseInt(countResult[0].count);
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Process the returned data to use camelCase keys
      const formattedVendors = vendors.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        vendorGroupId: vendor.vendor_group_id,
        vendorGroupName: vendor.vendor_group_name,
        contactPerson: vendor.contact_person,
        email: vendor.email,
        phone: vendor.phone,
        address: vendor.address,
        city: vendor.city,
        state: vendor.state,
        country: vendor.country,
        pincode: vendor.pincode,
        website: vendor.website,
        status: vendor.status,
        notes: vendor.notes,
        createdAt: vendor.created_at,
        createdBy: vendor.created_by,
        modifiedAt: vendor.modified_at,
        modifiedBy: vendor.modified_by
      }));
      
      return {
        data: formattedVendors,
        meta: {
          currentPage: page,
          pageSize,
          totalCount,
          totalPages
        }
      };
    } catch (error) {
      console.error('Error getting filtered vendors:', error);
      throw error;
    }
  }
  
  // Module methods
  async getAllModules(): Promise<Module[]> {
    return await db.select().from(modules).orderBy(asc(modules.name));
  }
  
  async getModule(id: number): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }
  
  async getFilteredModules(params: FilterParams): Promise<PaginatedResponse<Module>> {
    try {
      // Base query parts for modules
      const baseQueryStr = `
        SELECT m.* 
        FROM modules m
      `;
      
      const countQueryStr = `SELECT COUNT(*) FROM modules m`;
      
      // Build WHERE clauses
      let whereConditions = [];
      
      // Search filter
      if (params.search) {
        whereConditions.push(`(
          m.name ILIKE '%${params.search}%' OR 
          m.description ILIKE '%${params.search}%'
        )`);
      }
      
      // Add date range filter
      if (params.fromDate && params.toDate) {
        whereConditions.push(`m.created_at BETWEEN '${params.fromDate}'::timestamp AND '${params.toDate}'::timestamp`);
      } else if (params.fromDate) {
        whereConditions.push(`m.created_at >= '${params.fromDate}'::timestamp`);
      } else if (params.toDate) {
        whereConditions.push(`m.created_at <= '${params.toDate}'::timestamp`);
      }
      
      // Combine WHERE conditions
      let whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Build ORDER BY clause
      let orderBy = 'ORDER BY m.name ASC';
      if (params.column && params.direction) {
        const column = params.column === 'createdAt' ? 'm.created_at' : `m.${params.column}`;
        orderBy = `ORDER BY ${column} ${params.direction.toUpperCase()}`;
      }
      
      // Build LIMIT and OFFSET for pagination
      const limit = params.pageSize || 10;
      const offset = ((params.page || 1) - 1) * limit;
      const pagination = `LIMIT ${limit} OFFSET ${offset}`;
      
      // Execute count query
      const countResult = await db.execute(countQueryStr + (whereClause ? ` ${whereClause}` : ''));
      const totalCount = countResult.rows && countResult.rows[0] && countResult.rows[0].count 
        ? parseInt(countResult.rows[0].count) 
        : 0;
      
      // Execute main query
      const modulesResult = await db.execute(
        baseQueryStr + (whereClause ? ` ${whereClause}` : '') + ` ${orderBy} ${pagination}`
      );
      
      console.log("Raw modules result structure:", {
        hasRows: !!modulesResult.rows,
        rowCount: modulesResult.rowCount,
        rowsLength: modulesResult.rows ? modulesResult.rows.length : 0,
        sampleRow: modulesResult.rows && modulesResult.rows.length > 0 ? 
          Object.keys(modulesResult.rows[0]).join(', ') : 'None'
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      
      // Process results into proper format
      const processedModules = modulesResult.rows.map((row: any) => {
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          price: row.price,
          isActive: row.is_active,
          createdAt: row.created_at,
          createdBy: row.created_by,
          modifiedAt: row.modified_at,
          modifiedBy: row.modified_by
        };
      });
      
      const result = {
        data: processedModules,
        totalCount,
        page: params.page || 1,
        pageSize: limit,
        totalPages
      };
      
      console.log("Final modules result structure:", {
        hasData: !!result.data,
        dataType: typeof result.data,
        isArray: Array.isArray(result.data),
        dataLength: Array.isArray(result.data) ? result.data.length : 0,
        sampleItem: result.data && result.data.length > 0 ? 
          Object.keys(result.data[0]).join(', ') : 'None'
      });
      
      return result;
    } catch (error) {
      console.error("Error in getFilteredModules:", error);
      throw error;
    }
  }
  
  async createModule(insertModule: InsertModule): Promise<Module> {
    const [module] = await db.insert(modules).values(insertModule).returning();
    return module;
  }
  
  async updateModule(id: number, updates: Partial<Module>): Promise<Module | undefined> {
    const [updatedModule] = await db
      .update(modules)
      .set({
        ...updates,
        modifiedAt: new Date()
      })
      .where(eq(modules.id, id))
      .returning();
    return updatedModule;
  }
  
  async deleteModule(id: number): Promise<boolean> {
    const result = await db.delete(modules).where(eq(modules.id, id));
    return result.rowCount > 0;
  }

  // Product methods
  async getAllProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    try {
      // Use SQL query to get product with vendor name
      const productResult = await db.execute(`
        SELECT p.*, v.name as vendor_name 
        FROM products p
        LEFT JOIN vendors v ON p.vendor_id = v.id
        WHERE p.id = ${id}
      `);
      
      if (!productResult.rows || productResult.rows.length === 0) {
        return undefined;
      }
      
      const row = productResult.rows[0];
      
      // Map the result to include vendor name
      return {
        id: row.id,
        name: row.name,
        description: row.description,
        category: row.category,
        price: row.price,
        vendorId: row.vendor_id,
        vendorName: row.vendor_name,
        isActive: row.is_active,
        createdAt: row.created_at,
        createdBy: row.created_by,
        modifiedAt: row.modified_at,
        modifiedBy: row.modified_by
      };
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      return undefined;
    }
  }
  
  async getFilteredProducts(params: FilterParams): Promise<PaginatedResponse<Product>> {
    try {
      // Base query parts for products with vendor join for vendor name
      const baseQueryStr = `
        SELECT p.*, v.name as vendor_name 
        FROM products p
        LEFT JOIN vendors v ON p.vendor_id = v.id
      `;
      
      const countQueryStr = `SELECT COUNT(*) FROM products p`;
      
      // Build WHERE clauses
      let whereConditions = [];
      
      // Search filter
      if (params.search) {
        whereConditions.push(`(
          p.name ILIKE '%${params.search}%' OR 
          p.description ILIKE '%${params.search}%' OR
          p.category ILIKE '%${params.search}%'
        )`);
      }
      
      // Add date range filter
      if (params.fromDate && params.toDate) {
        whereConditions.push(`p.created_at BETWEEN '${params.fromDate}'::timestamp AND '${params.toDate}'::timestamp`);
      } else if (params.fromDate) {
        whereConditions.push(`p.created_at >= '${params.fromDate}'::timestamp`);
      } else if (params.toDate) {
        whereConditions.push(`p.created_at <= '${params.toDate}'::timestamp`);
      }
      
      // Category filter
      if (params.category) {
        whereConditions.push(`p.category = '${params.category}'`);
      }
      
      // Combine WHERE conditions
      let whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Build ORDER BY clause
      let orderBy = 'ORDER BY p.created_at DESC';
      if (params.column && params.direction) {
        const column = params.column === 'createdAt' ? 'p.created_at' : `p.${params.column}`;
        orderBy = `ORDER BY ${column} ${params.direction.toUpperCase()}`;
      }
      
      // Build LIMIT and OFFSET for pagination
      const limit = params.pageSize || 10;
      const offset = ((params.page || 1) - 1) * limit;
      const pagination = `LIMIT ${limit} OFFSET ${offset}`;
      
      // Execute count query
      const countResult = await db.execute(countQueryStr + (whereClause ? ` ${whereClause}` : ''));
      const totalCount = countResult.rows && countResult.rows[0] && countResult.rows[0].count 
        ? parseInt(countResult.rows[0].count) 
        : 0;
      
      // Execute main query
      const productsResult = await db.execute(
        baseQueryStr + (whereClause ? ` ${whereClause}` : '') + ` ${orderBy} ${pagination}`
      );
      
      console.log("Raw products result structure:", {
        hasRows: !!productsResult.rows,
        rowCount: productsResult.rowCount,
        rowsLength: productsResult.rows ? productsResult.rows.length : 0,
        sampleRow: productsResult.rows && productsResult.rows.length > 0 ? 
          Object.keys(productsResult.rows[0]).join(', ') : 'None'
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      
      // Process results into proper format
      const processedProducts = productsResult.rows.map((row: any) => {
        return {
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          price: row.price,
          vendorId: row.vendor_id,
          vendorName: row.vendor_name, // Add vendor name from the join
          isActive: row.is_active,
          createdAt: row.created_at,
          createdBy: row.created_by,
          modifiedAt: row.modified_at,
          modifiedBy: row.modified_by
        };
      });
      
      return {
        data: processedProducts,
        totalCount,
        page: params.page || 1,
        pageSize: limit,
        totalPages
      };
    } catch (error) {
      console.error("Error in getFilteredProducts:", error);
      throw error;
    }
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
  
  async getProductModules(productId: number): Promise<any[]> {
    try {
      console.log(`Fetching modules for product ID ${productId}`);
      
      // Get all product-module relationships for this product
      const productModuleRelations = await db
        .select({
          id: productModules.id,
          productId: productModules.productId,
          moduleId: productModules.moduleId,
          createdAt: productModules.createdAt,
          createdBy: productModules.createdBy
        })
        .from(productModules)
        .where(eq(productModules.productId, productId));
      
      console.log(`Found ${productModuleRelations.length} product-module relations`, productModuleRelations);
      
      // Get all module IDs
      const moduleIds = productModuleRelations.map(pm => pm.moduleId);
      
      if (moduleIds.length === 0) {
        console.log(`No modules found for product ${productId}`);
        return [];
      }
      
      // Get the actual module details
      const modulesData = await db
        .select()
        .from(modules)
        .where(inArray(modules.id, moduleIds));
      
      console.log(`Found ${modulesData.length} modules matching the module IDs`, 
        { moduleIds, modules: modulesData.map(m => ({ id: m.id, name: m.name })) });
      
      // Merge product-module relationship data with module data
      const enhancedModules = modulesData.map(module => {
        // Find the corresponding product-module relation
        const relation = productModuleRelations.find(pm => pm.moduleId === module.id);
        
        return {
          ...module,
          productModuleId: relation ? relation.id : undefined
        };
      });
      
      console.log(`Returning ${enhancedModules.length} enhanced modules`, 
        enhancedModules.map(m => ({ id: m.id, name: m.name, productModuleId: m.productModuleId })));
        
      return enhancedModules;
    } catch (error) {
      console.error(`Error getting modules for product ${productId}:`, error);
      return [];
    }
  }
  

  
  // Product Module methods
  async createProductModule(insertProductModule: InsertProductModule): Promise<ProductModule> {
    const [productModule] = await db.insert(productModules).values(insertProductModule).returning();
    return productModule;
  }
  
  async deleteProductModule(id: number): Promise<boolean> {
    const result = await db.delete(productModules).where(eq(productModules.id, id));
    return result.rowCount > 0;
  }

  // Opportunity methods
  async getAllOpportunities(): Promise<any[]> {
    try {
      // Get all opportunities first
      const opportunitiesList = await db.select().from(opportunities).orderBy(desc(opportunities.createdAt));
      
      // Enhance each opportunity with company information
      const enhancedOpportunities = await Promise.all(
        opportunitiesList.map(async (opportunity) => {
          const enhanced = { ...opportunity, company: null };
          
          // If opportunity has companyId, get the company data
          if (opportunity.companyId) {
            const company = await this.getCompany(opportunity.companyId);
            if (company) {
              enhanced.company = {
                id: company.id,
                name: company.name
              };
            }
          } 
          // If opportunity has leadId but no companyId, try to get company from lead
          else if (opportunity.leadId) {
            const lead = await this.getLead(opportunity.leadId);
            if (lead && lead.companyId) {
              const company = await this.getCompany(lead.companyId);
              if (company) {
                enhanced.company = {
                  id: company.id,
                  name: company.name
                };
                
                // Consider updating the opportunity with this companyId
                // for performance in future queries
                console.log(`Opportunity ${opportunity.id} has lead with company ${company.id}, but opportunity's companyId is null. Consider running migration.`);
              }
            }
          }
          
          return enhanced;
        })
      );
      
      return enhancedOpportunities;
    } catch (error) {
      console.error("Error in getAllOpportunities:", error);
      return [];
    }
  }
  
  /**
   * Get opportunities with filtering, sorting, and pagination
   */
  async getFilteredOpportunities(params: FilterParams, currentUser: User): Promise<PaginatedResponse<any>> {
    try {
      // Base query parts for opportunities with joins
      const baseQueryStr = `
        SELECT o.*, 
          l.name as lead_name, l.email as lead_email, l.phone as lead_phone,
          c.name as company_name,
          COALESCE(ct.first_name, '') || ' ' || COALESCE(ct.last_name, '') as contact_name, 
          COALESCE(ct.email, '') as contact_email,
          u.full_name as assigned_to_name
        FROM opportunities o
        LEFT JOIN leads l ON o.lead_id = l.id
        LEFT JOIN companies c ON o.company_id = c.id
        LEFT JOIN contacts ct ON o.contact_id = ct.id
        LEFT JOIN users u ON o.assigned_to = u.id
      `;
      
      const countQueryStr = `
        SELECT COUNT(*) FROM opportunities o
        LEFT JOIN leads l ON o.lead_id = l.id
        LEFT JOIN companies c ON o.company_id = c.id
        LEFT JOIN contacts ct ON o.contact_id = ct.id
        LEFT JOIN users u ON o.assigned_to = u.id
      `;
      
      // Build WHERE clauses
      let whereConditions = [];
      
      // Filter opportunities based on user role
      if (currentUser.role === 'admin') {
        // Admins see all opportunities - no additional filtering needed
      } else if (currentUser.role === 'sales_manager') {
        // Build multi-level team hierarchy - get all users at any level reporting to this manager
        // Get all users first
        const users = await this.getAllUsers();
        
        // Create reporting maps for tracking the entire hierarchy
        const reportingMap = new Map();
        const directReportsMap = new Map();
        
        // Build the reporting maps
        users.forEach(user => {
          if (user.managerId) {
            reportingMap.set(user.id, user.managerId);
            
            // Add to direct reports map
            if (!directReportsMap.has(user.managerId)) {
              directReportsMap.set(user.managerId, []);
            }
            directReportsMap.get(user.managerId).push(user.id);
          }
        });
        
        // Function to recursively get all reports (direct and indirect)
        const getAllReports = (managerId) => {
          const allReports = new Set();
          const directReports = directReportsMap.get(managerId) || [];
          
          // Add direct reports
          directReports.forEach(reportId => {
            allReports.add(reportId);
            
            // Recursively add their reports
            const subReports = getAllReports(reportId);
            subReports.forEach(subReportId => allReports.add(subReportId));
          });
          
          return allReports;
        };
        
        // Get all team members in the hierarchy reporting to this manager (at all levels)
        const teamMemberIdsSet = getAllReports(currentUser.id);
        const teamMemberIds = Array.from(teamMemberIdsSet);
        const userIds = [...teamMemberIds, currentUser.id];
        
        if (userIds.length > 0) {
          whereConditions.push(`(o.assigned_to IS NULL OR o.assigned_to IN (${userIds.join(',')}))`);
        }
      } else {
        // Sales executives see only their assigned opportunities
        whereConditions.push(`(o.assigned_to IS NULL OR o.assigned_to = ${currentUser.id})`);
      }
      
      // Add search filter
      if (params.search) {
        const searchTerm = `%${params.search}%`;
        whereConditions.push(`(
          o.name ILIKE '${searchTerm}' OR 
          o.notes ILIKE '${searchTerm}' OR
          c.name ILIKE '${searchTerm}' OR
          l.name ILIKE '${searchTerm}' OR
          COALESCE(ct.first_name, '') || ' ' || COALESCE(ct.last_name, '') ILIKE '${searchTerm}'
        )`);
      }
      
      // Add stage filter
      if (params.status) {
        whereConditions.push(`o.stage = '${params.status}'`);
      }
      
      // Add date range filter
      if (params.fromDate && params.toDate) {
        whereConditions.push(`o.created_at BETWEEN '${params.fromDate}'::timestamp AND '${params.toDate}'::timestamp`);
      } else if (params.fromDate) {
        whereConditions.push(`o.created_at >= '${params.fromDate}'::timestamp`);
      } else if (params.toDate) {
        whereConditions.push(`o.created_at <= '${params.toDate}'::timestamp`);
      }
      
      // Combine WHERE conditions
      let whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Build ORDER BY clause
      let orderBy = 'ORDER BY o.created_at DESC';
      if (params.column && params.direction) {
        // Handle special cases for joined columns
        let column = '';
        switch(params.column) {
          case 'createdAt':
            column = 'o.created_at';
            break;
          case 'leadName':
            column = 'l.name';
            break;
          case 'companyName':
            column = 'c.name';
            break;
          case 'contactName':
            column = 'COALESCE(ct.first_name, "") || " " || COALESCE(ct.last_name, \'\')';
            break;
          case 'assignedToName':
            column = 'u.full_name';
            break;
          default:
            column = `o.${params.column}`;
        }
        orderBy = `ORDER BY ${column} ${params.direction.toUpperCase()}`;
      }
      
      // Build LIMIT and OFFSET for pagination
      const limit = params.pageSize || 10;
      const offset = ((params.page || 1) - 1) * limit;
      const pagination = `LIMIT ${limit} OFFSET ${offset}`;
      
      // Execute count query
      const countQuery = `${countQueryStr} ${whereClause}`;
      const countResult = await db.execute(countQuery);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Execute data query
      const dataQuery = `${baseQueryStr} ${whereClause} ${orderBy} ${pagination}`;
      const dataResult = await db.execute(dataQuery);
      
      // Process results
      const opportunities = dataResult.rows.map((row: any) => {
        return {
          id: row.id,
          name: row.name,
          stage: row.stage,
          value: row.value,
          probability: row.probability,
          expectedCloseDate: row.expected_close_date,
          notes: row.notes,
          contactId: row.contact_id,
          companyId: row.company_id,
          teamId: row.team_id,
          assignedTo: row.assigned_to,
          createdAt: row.created_at,
          leadId: row.lead_id,
          createdBy: row.created_by,
          
          // Enriched data
          lead: row.lead_id ? {
            id: row.lead_id,
            name: row.lead_name,
            email: row.lead_email,
            phone: row.lead_phone
          } : null,
          company: row.company_id ? {
            id: row.company_id,
            name: row.company_name
          } : null,
          companyName: row.company_name,
          contact: row.contact_id ? {
            id: row.contact_id,
            name: row.contact_name,
            email: row.contact_email
          } : null,
          assignedToName: row.assigned_to_name
        };
      });
      
      return {
        data: opportunities,
        meta: {
          total: totalCount,
          page: params.page || 1,
          pageSize: limit,
          pageCount: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error("Error getting filtered opportunities:", error);
      throw error;
    }
  }

  async getOpportunity(id: number): Promise<any> {
    try {
      // First get the opportunity
      const [opportunity] = await db.select().from(opportunities).where(eq(opportunities.id, id));
      if (!opportunity) return undefined;
      
      console.log("RAW DB opportunity object:", JSON.stringify(opportunity));
      
      // Enhance the opportunity with company, contact, and lead data
      const enhancedOpportunity = { ...opportunity };
      
      // First get the lead data if leadId exists (we need this first to possibly get company info from lead)
      let lead = null;
      if (opportunity.leadId) {
        lead = await this.getLead(opportunity.leadId);
        if (lead) {
          enhancedOpportunity.lead = lead;
          
          // If opportunity has no companyId but lead has one, use the lead's company data
          if (!opportunity.companyId && lead.companyId) {
            console.log(`Opportunity has no companyId, but lead (${lead.id}) has companyId: ${lead.companyId}`);
            enhancedOpportunity.companyId = lead.companyId; // Update the companyId from lead
          }
        }
      }
      
      // Add company data if companyId exists (either from opportunity or inherited from lead)
      if (enhancedOpportunity.companyId) {
        const company = await this.getCompany(enhancedOpportunity.companyId);
        if (company) {
          enhancedOpportunity.company = company;
          enhancedOpportunity.companyName = company.name;
          console.log(`Found company data: ${company.name} (ID: ${company.id})`);
        }
      } 
      // If name-based matching should be tried
      else if (opportunity.name) {
        // Try to match company by name similarity
        const companies = await this.getAllCompanies();
        const matchingCompany = companies.find(c => 
          opportunity.name.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(opportunity.name.toLowerCase())
        );
        
        if (matchingCompany) {
          console.log(`Found company match by name: ${matchingCompany.name} (ID: ${matchingCompany.id})`);
          enhancedOpportunity.company = matchingCompany;
          enhancedOpportunity.companyName = matchingCompany.name;
          // Update the companyId for consistency
          enhancedOpportunity.companyId = matchingCompany.id;
        }
      }
      
      // Add contact data if contactId exists
      if (opportunity.contactId) {
        const contact = await this.getContact(opportunity.contactId);
        if (contact) {
          enhancedOpportunity.contact = contact;
        }
      }
      
      // Log the enhanced opportunity
      console.log("Enhanced opportunity with related entities:", JSON.stringify({
        id: enhancedOpportunity.id,
        name: enhancedOpportunity.name,
        companyId: enhancedOpportunity.companyId,
        company: enhancedOpportunity.company ? { 
          id: enhancedOpportunity.company.id,
          name: enhancedOpportunity.company.name
        } : null,
        leadId: enhancedOpportunity.leadId,
        lead: enhancedOpportunity.lead ? {
          id: enhancedOpportunity.lead.id,
          name: enhancedOpportunity.lead.name,
          companyId: enhancedOpportunity.lead.companyId
        } : null
      }));
      
      return enhancedOpportunity;
    } catch (error) {
      console.error("Error in getOpportunity:", error);
      return undefined;
    }
  }

  async createOpportunity(insertOpportunity: InsertOpportunity): Promise<Opportunity> {
    try {
      console.log("createOpportunity - Received data:", JSON.stringify(insertOpportunity));
      
      // If opportunity has a leadId but no companyId, try to get companyId from lead
      if (insertOpportunity.leadId) {
        const lead = await this.getLead(insertOpportunity.leadId);
        if (lead) {
          // Update the lead status to "converted" when creating an opportunity from a lead
          await db.execute(sql`
            UPDATE leads
            SET status = 'converted'
            WHERE id = ${insertOpportunity.leadId}
          `);
          console.log(`Updated lead ${insertOpportunity.leadId} status to 'converted'`);
          
          // Use companyId from lead if opportunity doesn't have one
          if (!insertOpportunity.companyId && lead.companyId) {
            console.log(`Opportunity has leadId ${insertOpportunity.leadId} but no companyId. Using lead's companyId: ${lead.companyId}`);
            insertOpportunity.companyId = lead.companyId;
          }
        }
      }
      
      // If still no companyId but we have a name that might match a company
      if (!insertOpportunity.companyId && insertOpportunity.name) {
        // Try to match company by name similarity
        const companies = await this.getAllCompanies();
        const matchingCompany = companies.find(c => 
          insertOpportunity.name.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(insertOpportunity.name.toLowerCase())
        );
        
        if (matchingCompany) {
          console.log(`Found company match by name: ${matchingCompany.name} (ID: ${matchingCompany.id})`);
          insertOpportunity.companyId = matchingCompany.id;
        }
      }
      
      console.log("createOpportunity - Processed data:", JSON.stringify(insertOpportunity));
      const [opportunity] = await db.insert(opportunities).values(insertOpportunity).returning();
      
      // Return the enhanced opportunity with all related data
      return opportunity;
    } catch (error) {
      console.error("Error in createOpportunity:", error);
      throw error;
    }
  }

  async updateOpportunity(id: number, updates: Partial<Opportunity>): Promise<Opportunity | undefined> {
    try {
      console.log("updateOpportunity - received updates:", JSON.stringify(updates));
      
      // First get the existing opportunity data
      const existingOpportunity = await this.getOpportunity(id);
      if (!existingOpportunity) {
        console.error(`Opportunity with ID ${id} not found for update`);
        return undefined;
      }
      
      // Create a clean updates object with properly typed values
      const cleanUpdates: Record<string, any> = {};
      
      // Handle string fields
      if (updates.name !== undefined) cleanUpdates.name = updates.name;
      if (updates.stage !== undefined) cleanUpdates.stage = updates.stage;
      if (updates.notes !== undefined) cleanUpdates.notes = updates.notes;
      
      // Handle numeric fields
      if (updates.probability !== undefined) {
        cleanUpdates.probability = typeof updates.probability === 'string' 
          ? parseFloat(updates.probability)
          : updates.probability;
      }
      
      if (updates.value !== undefined) {
        cleanUpdates.value = updates.value;
      }
      
      // Handle IDs - make sure they're properly converted to numbers
      if (updates.leadId !== undefined) {
        cleanUpdates.leadId = typeof updates.leadId === 'string'
          ? parseInt(updates.leadId, 10)
          : updates.leadId;
          
        // If leadId is changed and we have a new valid lead, check for company information
        if (cleanUpdates.leadId && cleanUpdates.leadId !== existingOpportunity.leadId) {
          const lead = await this.getLead(cleanUpdates.leadId);
          if (lead && lead.companyId) {
            console.log(`Lead ${lead.id} has companyId ${lead.companyId}, updating opportunity companyId`);
            cleanUpdates.companyId = lead.companyId;
          }
        }
      }
      
      // Handle companyId, but ensure we're not overriding a value we just set from leadId
      if (updates.companyId !== undefined && cleanUpdates.companyId === undefined) {
        cleanUpdates.companyId = typeof updates.companyId === 'string'
          ? parseInt(updates.companyId, 10)
          : updates.companyId;
      }
      
      if (updates.contactId !== undefined) {
        cleanUpdates.contactId = typeof updates.contactId === 'string'
          ? parseInt(updates.contactId, 10)
          : updates.contactId;
      }
      
      if (updates.assignedTo !== undefined) {
        cleanUpdates.assignedTo = typeof updates.assignedTo === 'string'
          ? parseInt(updates.assignedTo, 10)
          : updates.assignedTo;
      }
      
      // Handle date fields
      if (updates.expectedCloseDate !== undefined) {
        cleanUpdates.expectedCloseDate = 
          updates.expectedCloseDate instanceof Date 
            ? updates.expectedCloseDate
            : typeof updates.expectedCloseDate === 'string'
              ? new Date(updates.expectedCloseDate)
              : updates.expectedCloseDate;
      }
      
      // Ensure we don't include any unintended objects
      if (updates.company !== undefined) delete cleanUpdates.company;
      if (updates.contact !== undefined) delete cleanUpdates.contact;
      if (updates.lead !== undefined) delete cleanUpdates.lead;
      
      console.log("updateOpportunity - clean updates:", JSON.stringify(cleanUpdates));
      
      // Only proceed with the update if we have changes to make
      if (Object.keys(cleanUpdates).length === 0) {
        console.log("No changes to apply in updateOpportunity");
        return existingOpportunity;
      }
      
      const [updatedOpportunity] = await db
        .update(opportunities)
        .set(cleanUpdates)
        .where(eq(opportunities.id, id))
        .returning();
      
      console.log("updateOpportunity - result:", JSON.stringify(updatedOpportunity));
      
      // Return the full enhanced opportunity with company, contact and lead data
      return await this.getOpportunity(id);
    } catch (error) {
      console.error("Error in updateOpportunity:", error);
      return undefined;
    }
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
  
  async getFilteredQuotations(params: FilterParams, currentUser: User): Promise<PaginatedResponse<any>> {
    try {
      // Base query parts for quotations with joins
      const baseQueryStr = `
        SELECT q.*, 
          o.name as opportunity_name,
          c.name as company_name,
          u.full_name as created_by_name
        FROM quotations q
        LEFT JOIN opportunities o ON q.opportunity_id = o.id
        LEFT JOIN companies c ON o.company_id = c.id
        LEFT JOIN users u ON q.created_by = u.id
      `;
      
      const countQueryStr = `
        SELECT COUNT(*) FROM quotations q
        LEFT JOIN opportunities o ON q.opportunity_id = o.id
        LEFT JOIN companies c ON o.company_id = c.id
        LEFT JOIN users u ON q.created_by = u.id
      `;
      
      // Build WHERE clauses
      let whereConditions = [];
      
      // Filter quotations based on user role
      if (currentUser.role === 'admin') {
        // Admins see all quotations - no additional filtering needed
      } else if (currentUser.role === 'sales_manager') {
        // Build multi-level team hierarchy - get all team members at any level reporting to this manager
        // Get all users first
        const users = await this.getAllUsers();
        
        // Create reporting maps for tracking the entire hierarchy
        const reportingMap = new Map();
        const directReportsMap = new Map();
        
        // Build the reporting maps
        users.forEach(user => {
          if (user.managerId) {
            reportingMap.set(user.id, user.managerId);
            
            // Add to direct reports map
            if (!directReportsMap.has(user.managerId)) {
              directReportsMap.set(user.managerId, []);
            }
            directReportsMap.get(user.managerId).push(user.id);
          }
        });
        
        // Function to recursively get all reports (direct and indirect)
        const getAllReports = (managerId) => {
          const allReports = new Set();
          const directReports = directReportsMap.get(managerId) || [];
          
          // Add direct reports
          directReports.forEach(reportId => {
            allReports.add(reportId);
            
            // Recursively add their reports
            const subReports = getAllReports(reportId);
            subReports.forEach(subReportId => allReports.add(subReportId));
          });
          
          return allReports;
        };
        
        // Get all team members in the hierarchy reporting to this manager (at all levels)
        const teamMemberIdsSet = getAllReports(currentUser.id);
        const teamMemberIds = Array.from(teamMemberIdsSet);
        const userIds = [...teamMemberIds, currentUser.id];
        
        if (userIds.length > 0) {
          whereConditions.push(`(q.created_by IN (${userIds.join(',')}))`);
        }
      } else {
        // Sales executives see only their created quotations
        whereConditions.push(`(q.created_by = ${currentUser.id})`);
      }
      
      // Add search filter
      if (params.search) {
        const searchTerm = `%${params.search}%`;
        whereConditions.push(`(
          q.quotation_number ILIKE '${searchTerm}' OR 
          q.notes ILIKE '${searchTerm}' OR
          o.name ILIKE '${searchTerm}' OR
          c.name ILIKE '${searchTerm}'
        )`);
      }
      
      // Add status filter
      if (params.status) {
        whereConditions.push(`q.status = '${params.status}'`);
      }
      
      // Add date range filter
      if (params.fromDate && params.toDate) {
        whereConditions.push(`q.created_at BETWEEN '${params.fromDate}'::timestamp AND '${params.toDate}'::timestamp`);
      } else if (params.fromDate) {
        whereConditions.push(`q.created_at >= '${params.fromDate}'::timestamp`);
      } else if (params.toDate) {
        whereConditions.push(`q.created_at <= '${params.toDate}'::timestamp`);
      }
      
      // Combine WHERE conditions
      let whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Build ORDER BY clause
      let orderBy = 'ORDER BY q.created_at DESC';
      if (params.column && params.direction) {
        // Handle special cases for joined columns
        let column = '';
        switch(params.column) {
          case 'createdAt':
            column = 'q.created_at';
            break;
          case 'opportunityName':
            column = 'o.name';
            break;
          case 'companyName':
            column = 'c.name';
            break;
          default:
            column = `q.${params.column}`;
        }
        orderBy = `ORDER BY ${column} ${params.direction.toUpperCase()}`;
      }
      
      // Build LIMIT and OFFSET for pagination
      const limit = params.pageSize || 10;
      const offset = ((params.page || 1) - 1) * limit;
      const pagination = `LIMIT ${limit} OFFSET ${offset}`;
      
      // Execute count query
      const countQuery = `${countQueryStr} ${whereClause}`;
      const countResult = await db.execute(countQuery);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Execute data query
      const dataQuery = `${baseQueryStr} ${whereClause} ${orderBy} ${pagination}`;
      const dataResult = await db.execute(dataQuery);
      
      // Process results
      const quotations = dataResult.rows.map((row: any) => {
        return {
          id: row.id,
          quotationNumber: row.quotation_number,
          opportunityId: row.opportunity_id,
          opportunityName: row.opportunity_name,
          companyName: row.company_name,
          totalAmount: row.total_amount,
          status: row.status,
          createdAt: row.created_at,
          createdBy: row.created_by,
          createdByName: row.created_by_name,
          validUntil: row.valid_until,
          notes: row.notes
        };
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        data: quotations,
        totalCount,
        page: params.page || 1,
        pageSize: limit,
        totalPages
      };
    } catch (error) {
      console.error("Error in getFilteredQuotations:", error);
      throw error;
    }
  }

  async createQuotation(insertQuotation: InsertQuotation): Promise<Quotation> {
    try {
      console.log("DB Storage createQuotation - Received data:", insertQuotation);
      
      // Create a properly formatted object with the correct types for database insertion
      // Start with the required fields
      const insertData: Record<string, any> = {
        quotationNumber: insertQuotation.quotationNumber,
        createdBy: insertQuotation.createdBy,
        status: insertQuotation.status || "draft",
        // Ensure numeric fields are properly formatted
        subtotal: typeof insertQuotation.subtotal === 'string' 
          ? parseFloat(insertQuotation.subtotal) 
          : insertQuotation.subtotal,
        total: typeof insertQuotation.total === 'string' 
          ? parseFloat(insertQuotation.total) 
          : insertQuotation.total,
      };
      
      // Handle optional fields one by one
      if (insertQuotation.tax !== undefined) {
        insertData.tax = typeof insertQuotation.tax === 'string' 
          ? parseFloat(insertQuotation.tax) 
          : insertQuotation.tax;
      }
      
      if (insertQuotation.discount !== undefined) {
        insertData.discount = typeof insertQuotation.discount === 'string' 
          ? parseFloat(insertQuotation.discount) 
          : insertQuotation.discount;
      }
      
      if (insertQuotation.opportunityId !== undefined) {
        insertData.opportunityId = insertQuotation.opportunityId;
      }
      
      if (insertQuotation.companyId !== undefined) {
        insertData.companyId = insertQuotation.companyId;
      }
      
      if (insertQuotation.contactId !== undefined) {
        insertData.contactId = insertQuotation.contactId;
      }
      
      if (insertQuotation.notes !== undefined) {
        insertData.notes = insertQuotation.notes;
      }
      
      // Handle date field carefully
      if (insertQuotation.validUntil instanceof Date) {
        insertData.validUntil = insertQuotation.validUntil;
        console.log("Date object used for validUntil:", insertData.validUntil);
      } else if (insertQuotation.validUntil !== undefined) {
        try {
          insertData.validUntil = new Date(insertQuotation.validUntil);
          console.log("String converted to Date for validUntil:", insertData.validUntil);
        } catch (dateError) {
          console.error("Failed to convert validUntil to Date:", dateError);
          // Skip adding the field if conversion fails
        }
      }
      
      console.log("DB Storage createQuotation - Final insert data:", insertData);
      
      // Drizzle expects an array for .values() but we have a single object
      // Use .values([insertData]) instead of .values(insertData)
      const [quotation] = await db.insert(quotations).values([insertData as any]).returning();
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
    try {
      // Build a query that selects only the columns we know exist in the table
      // This is a safer approach than using select() which tries to select all columns
      return await db.select({
        id: quotationItems.id, 
        quotationId: quotationItems.quotationId,
        productId: quotationItems.productId,
        moduleId: quotationItems.moduleId,
        description: quotationItems.description,
        quantity: quotationItems.quantity,
        unitPrice: quotationItems.unitPrice,
        tax: quotationItems.tax,
        subtotal: quotationItems.subtotal
      })
      .from(quotationItems)
      .where(eq(quotationItems.quotationId, quotationId));
    } catch (error) {
      console.error('Error getting quotation items:', error);
      throw error;
    }
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
  
  async getFilteredSalesOrders(params: FilterParams, currentUser: User): Promise<PaginatedResponse<any>> {
    try {
      // Base query parts for sales orders with joins
      const baseQueryStr = `
        SELECT so.*, 
          q.quotation_number,
          o.name as opportunity_name,
          c.name as company_name,
          COALESCE(ct.first_name, '') || ' ' || COALESCE(ct.last_name, '') as contact_name,
          u.full_name as created_by_name
        FROM sales_orders so
        LEFT JOIN quotations q ON so.quotation_id = q.id
        LEFT JOIN opportunities o ON q.opportunity_id = o.id
        LEFT JOIN companies c ON so.company_id = c.id OR o.company_id = c.id
        LEFT JOIN contacts ct ON so.contact_id = ct.id
        LEFT JOIN users u ON so.created_by = u.id
      `;
      
      const countQueryStr = `
        SELECT COUNT(*) FROM sales_orders so
        LEFT JOIN quotations q ON so.quotation_id = q.id
        LEFT JOIN opportunities o ON q.opportunity_id = o.id
        LEFT JOIN companies c ON so.company_id = c.id OR o.company_id = c.id
        LEFT JOIN contacts ct ON so.contact_id = ct.id
        LEFT JOIN users u ON so.created_by = u.id
      `;
      
      // Build WHERE clauses
      let whereConditions = [];
      
      // Filter sales orders based on user role
      if (currentUser.role === 'admin') {
        // Admins see all sales orders - no additional filtering needed
      } else if (currentUser.role === 'sales_manager') {
        // Sales managers see sales orders created by them or their team members
        const teamMemberIds = await this.getTeamMemberIds(currentUser.id);
        const userIds = [...teamMemberIds, currentUser.id];
        
        if (userIds.length > 0) {
          whereConditions.push(`(so.created_by IN (${userIds.join(',')}))`);
        }
      } else {
        // Sales executives see only their created sales orders
        whereConditions.push(`(so.created_by = ${currentUser.id})`);
      }
      
      // Add search filter
      if (params.search) {
        const searchTerm = `%${params.search}%`;
        whereConditions.push(`(
          so.order_number ILIKE '${searchTerm}' OR 
          so.notes ILIKE '${searchTerm}' OR
          o.name ILIKE '${searchTerm}' OR
          c.name ILIKE '${searchTerm}' OR
          COALESCE(ct.first_name, '') || ' ' || COALESCE(ct.last_name, '') ILIKE '${searchTerm}'
        )`);
      }
      
      // Add status filter
      if (params.status) {
        whereConditions.push(`so.status = '${params.status}'`);
      }
      
      // Add date range filter
      if (params.fromDate && params.toDate) {
        whereConditions.push(`so.created_at BETWEEN '${params.fromDate}'::timestamp AND '${params.toDate}'::timestamp`);
      } else if (params.fromDate) {
        whereConditions.push(`so.created_at >= '${params.fromDate}'::timestamp`);
      } else if (params.toDate) {
        whereConditions.push(`so.created_at <= '${params.toDate}'::timestamp`);
      }
      
      // Combine WHERE conditions
      let whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';
      
      // Build ORDER BY clause
      let orderBy = 'ORDER BY so.created_at DESC';
      if (params.column && params.direction) {
        // Handle special cases for joined columns
        let column = '';
        switch(params.column) {
          case 'createdAt':
            column = 'so.created_at';
            break;
          case 'opportunityName':
            column = 'o.name';
            break;
          case 'companyName':
            column = 'c.name';
            break;
          case 'contactName':
            column = 'COALESCE(ct.first_name, "") || " " || COALESCE(ct.last_name, \'\')';
            break;
          default:
            column = `so.${params.column}`;
        }
        orderBy = `ORDER BY ${column} ${params.direction.toUpperCase()}`;
      }
      
      // Build LIMIT and OFFSET for pagination
      const limit = params.pageSize || 10;
      const offset = ((params.page || 1) - 1) * limit;
      const pagination = `LIMIT ${limit} OFFSET ${offset}`;
      
      // Execute count query
      const countQuery = `${countQueryStr} ${whereClause}`;
      const countResult = await db.execute(countQuery);
      const totalCount = parseInt(countResult.rows[0].count);
      
      // Execute data query
      const dataQuery = `${baseQueryStr} ${whereClause} ${orderBy} ${pagination}`;
      const dataResult = await db.execute(dataQuery);
      
      // Process results
      const salesOrders = dataResult.rows.map((row: any) => {
        return {
          id: row.id,
          orderNumber: row.order_number,
          quotationId: row.quotation_id,
          quotationNumber: row.quotation_number,
          opportunityId: row.opportunity_id,
          opportunityName: row.opportunity_name,
          companyId: row.company_id,
          companyName: row.company_name,
          contactId: row.contact_id,
          contactName: row.contact_name,
          totalAmount: row.total_amount,
          status: row.status,
          createdAt: row.created_at,
          createdBy: row.created_by,
          createdByName: row.created_by_name,
          notes: row.notes
        };
      });
      
      // Calculate total pages
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        data: salesOrders,
        totalCount,
        page: params.page || 1,
        pageSize: limit,
        totalPages
      };
    } catch (error) {
      console.error("Error in getFilteredSalesOrders:", error);
      throw error;
    }
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
  async getSalesOrderItems(orderId: number): Promise<any[]> {
    try {
      // Use simpler query structure to avoid Drizzle ORM issues
      const items = await db.select({
        id: salesOrderItems.id,
        salesOrderId: salesOrderItems.salesOrderId,
        productId: salesOrderItems.productId,
        moduleId: salesOrderItems.moduleId,
        description: salesOrderItems.description,
        quantity: salesOrderItems.quantity,
        unitPrice: salesOrderItems.unitPrice,
        tax: salesOrderItems.tax,
        subtotal: salesOrderItems.subtotal
      })
      .from(salesOrderItems)
      .where(eq(salesOrderItems.salesOrderId, orderId));
      
      return items;
    } catch (error) {
      console.error('Error getting sales order items:', error);
      // Return empty array on error rather than throwing
      return [];
    }
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
    try {
      // Get sales totals by period
      let timeFilter;
      switch (period) {
        case "weekly":
          timeFilter = sql`DATE_TRUNC("week", created_at)`;
          break;
        case "quarterly":
          timeFilter = sql`DATE_TRUNC("quarter", created_at)`;
          break;
        case "yearly":
          timeFilter = sql`DATE_TRUNC("year", created_at)`;
          break;
        case "monthly":
        default:
          timeFilter = sql`DATE_TRUNC("month", created_at)`;
      }

      // Get sales by time period
      const salesByPeriod = await db.execute(sql`
        SELECT 
          ${timeFilter} as time_period,
          SUM(CAST(total as decimal)) as total_sales
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

      // Ensure we have some default data even if the DB is empty
      const defaultData = {
        salesByPeriod: salesByPeriod.length ? salesByPeriod : [{ time_period: new Date(), total_sales: 0 }],
        topProducts: topProducts.length ? topProducts : [{ name: 'No products', total_quantity: 0, total_revenue: 0 }],
        salesByCompany: salesByCompany.length ? salesByCompany : [{ name: 'No companies', total_sales: 0 }],
        opportunityConversion: opportunityConversion[0] || { 
          total_opportunities: 0, 
          converted_opportunities: 0, 
          conversion_rate: 0 
        }
      };
      
      return defaultData;
    } catch (error) {
      console.error("Error in getSalesReportData:", error);
      // Return minimal data structure to prevent frontend errors
      return {
        salesByPeriod: [{ time_period: new Date(), total_sales: 0 }],
        topProducts: [{ name: 'No products', total_quantity: 0, total_revenue: 0 }],
        salesByCompany: [{ name: 'No companies', total_sales: 0 }],
        opportunityConversion: { 
          total_opportunities: 0, 
          converted_opportunities: 0, 
          conversion_rate: 0 
        }
      };
    }
  }

  async getActivityReportData(period: string = 'monthly'): Promise<any> {
    try {
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
        case "weekly":
          timeFilter = sql`DATE_TRUNC("week", created_at)`;
          break;
        case "quarterly":
          timeFilter = sql`DATE_TRUNC("quarter", created_at)`;
          break;
        case "yearly":
          timeFilter = sql`DATE_TRUNC("year", created_at)`;
          break;
        case "monthly":
        default:
          timeFilter = sql`DATE_TRUNC("month", created_at)`;
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

      // Ensure we have some default data even if the DB is empty
      const defaultData = {
        activityByType: activityByType.length ? activityByType : [{ type: 'No activities', count: 0 }],
        activityByPeriod: activityByPeriod.length ? activityByPeriod : [{ time_period: new Date(), activity_count: 0 }],
        activityByUser: activityByUser.length ? activityByUser : [{ username: 'No users', activity_count: 0 }],
        taskCompletionRate: taskCompletionRate[0] || { 
          total_tasks: 0, 
          completed_tasks: 0, 
          completion_rate: 0 
        },
        recentActivities: recentActivities.length ? recentActivities : []
      };
      
      return defaultData;
    } catch (error) {
      console.error("Error in getActivityReportData:", error);
      // Return minimal data structure to prevent frontend errors
      return {
        activityByType: [{ type: 'No activities', count: 0 }],
        activityByPeriod: [{ time_period: new Date(), activity_count: 0 }],
        activityByUser: [{ username: 'No users', activity_count: 0 }],
        taskCompletionRate: { 
          total_tasks: 0, 
          completed_tasks: 0, 
          completion_rate: 0 
        },
        recentActivities: []
      };
    }
  }

  // Dashboard Methods
  async getDashboardStats(period: string = 'thisMonth'): Promise<any> {
    // Calculate date ranges based on period
    const { startDate, endDate, comparisonStartDate, comparisonEndDate } = this.getPeriodDateRange(period);
    
    // Get total leads count with percentage change for the selected period
    const totalLeads = await db.select({ count: sql`COUNT(*)` })
      .from(leads)
      .where(
        and(
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        )
      );
    
    // Get comparison period leads count
    const comparisonLeads = await db.select({ count: sql`COUNT(*)` })
      .from(leads)
      .where(
        and(
          sql`"created_at" >= ${comparisonStartDate}`,
          sql`"created_at" <= ${comparisonEndDate}`
        )
      );
    
    const leadsCount = Number(totalLeads[0].count);
    const comparisonLeadsCount = Number(comparisonLeads[0].count);
    const leadsChange = comparisonLeadsCount > 0 
      ? ((leadsCount - comparisonLeadsCount) / comparisonLeadsCount) * 100 
      : 0;
    
    // Get open opportunities (deals) count for the selected period
    const openDeals = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(
        and(
          sql`stage != 'closed-won' AND stage != 'closed-lost'`,
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        )
      );
    
    // Get comparison period open deals count
    const comparisonOpenDeals = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(
        and(
          sql`stage != 'closed-won' AND stage != 'closed-lost'`,
          sql`"created_at" >= ${comparisonStartDate}`,
          sql`"created_at" <= ${comparisonEndDate}`
        )
      );
    
    const openDealsCount = Number(openDeals[0].count);
    const comparisonOpenDealsCount = Number(comparisonOpenDeals[0].count);
    const openDealsChange = comparisonOpenDealsCount > 0 
      ? ((openDealsCount - comparisonOpenDealsCount) / comparisonOpenDealsCount) * 100 
      : 0;
    
    // Get total sales for the selected period
    const salesThisPeriod = await db.select({ total: sql`SUM(total)` })
      .from(salesOrders)
      .where(
        and(
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        )
      );
    
    // Get comparison period sales
    const comparisonSales = await db.select({ total: sql`SUM(total)` })
      .from(salesOrders)
      .where(
        and(
          sql`"created_at" >= ${comparisonStartDate}`,
          sql`"created_at" <= ${comparisonEndDate}`
        )
      );
    
    const totalSales = Number(salesThisPeriod[0].total) || 0;
    const comparisonPeriodSales = Number(comparisonSales[0].total) || 0;
    const salesChange = comparisonPeriodSales > 0 
      ? ((totalSales - comparisonPeriodSales) / comparisonPeriodSales) * 100 
      : 0;
    
    // Calculate conversion rate (closed-won opportunities / all opportunities) for the selected period
    const closedWonOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(and(
        sql`stage = 'closed-won'`,
        sql`"created_at" >= ${startDate}`,
        sql`"created_at" <= ${endDate}`
      ));
    
    const allOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(and(
        sql`"created_at" >= ${startDate}`,
        sql`"created_at" <= ${endDate}`
      ));
    
    // Get comparison period conversion rate
    const comparisonClosedWonOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(and(
        sql`stage = 'closed-won'`,
        sql`"created_at" >= ${comparisonStartDate}`,
        sql`"created_at" <= ${comparisonEndDate}`
      ));
    
    const comparisonAllOpps = await db.select({ count: sql`COUNT(*)` })
      .from(opportunities)
      .where(and(
        sql`"created_at" >= ${comparisonStartDate}`,
        sql`"created_at" <= ${comparisonEndDate}`
      ));
    
    const closedWonCount = Number(closedWonOpps[0].count);
    const allOppsCount = Number(allOpps[0].count);
    const conversionRate = allOppsCount > 0 ? (closedWonCount / allOppsCount) * 100 : 0;
    
    const comparisonClosedWonCount = Number(comparisonClosedWonOpps[0].count);
    const comparisonAllOppsCount = Number(comparisonAllOpps[0].count);
    const comparisonConversionRate = comparisonAllOppsCount > 0 
      ? (comparisonClosedWonCount / comparisonAllOppsCount) * 100 
      : 0;
    
    const conversionRateChange = comparisonConversionRate > 0 
      ? conversionRate - comparisonConversionRate 
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

  async getPipelineData(period: string = 'thisMonth'): Promise<any> {
    // Define the stages and their colors
    const stages = [
      { name: "Qualification", color: "rgb(59, 130, 246)" },
      { name: "Proposal", color: "rgb(79, 70, 229)" },
      { name: "Negotiation", color: "rgb(139, 92, 246)" },
      { name: "Closing", color: "rgb(245, 158, 11)" }
    ];

    // Calculate date ranges based on period
    const { startDate, endDate } = this.getPeriodDateRange(period);

    // Get opportunity counts and values by stage for the selected period
    const stageData = await Promise.all(stages.map(async (stage) => {
      const stageOpps = await db.select({
        count: sql`COUNT(*)`,
        value: sql`SUM(value)`
      })
      .from(opportunities)
      .where(and(
        sql`LOWER(stage) = LOWER(${stage.name}) AND stage != 'closed-lost'`,
        sql`"created_at" >= ${startDate}`,
        sql`"created_at" <= ${endDate}`
      ));
      
      return {
        ...stage,
        count: Number(stageOpps[0].count),
        value: `₹${Number(stageOpps[0].value || 0).toLocaleString()}`
      };
    }));

    // Calculate total value across all stages for the selected period
    const totalValueResult = await db.select({
      total: sql`SUM(value)`
    })
    .from(opportunities)
    .where(and(
      sql`stage != 'closed-lost'`,
      sql`"created_at" >= ${startDate}`,
      sql`"created_at" <= ${endDate}`
    ));

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

  async getRecentOpportunities(period: string = 'thisMonth'): Promise<any> {
    // Calculate date ranges based on period
    const { startDate, endDate } = this.getPeriodDateRange(period);
    
    // Get recent opportunities with company names for the selected period
    const result = await db.select({
      id: opportunities.id,
      name: opportunities.name,
      companyId: opportunities.companyId,
      stage: opportunities.stage,
      value: opportunities.value,
      createdAt: opportunities.createdAt,
    })
    .from(opportunities)
    .where(and(
      sql`"created_at" >= ${startDate}`,
      sql`"created_at" <= ${endDate}`
    ))
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

  async getRecentActivities(period: string = 'thisMonth'): Promise<any> {
    try {
      // Calculate date range based on the selected period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
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
      .where(
        and(
          gte(activities.createdAt, startDate),
          lte(activities.createdAt, endDate)
        )
      )
      .orderBy(desc(activities.createdAt))
      .limit(10);

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

  async getLeadSources(period: string = 'thisMonth'): Promise<any> {
    try {
      // Calculate date ranges based on period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Aggregate leads by source within the selected period
      const sourcesResult = await db.execute(sql`
        SELECT 
          COALESCE(source, 'Other') as name,
          COUNT(*) as count
        FROM ${leads}
        WHERE "created_at" >= ${startDate} AND "created_at" <= ${endDate}
        GROUP BY COALESCE(source, 'Other')
        ORDER BY count DESC
      `);
      
      // Type assertion to make TypeScript happy
      const sources = sourcesResult.rows as any[];
      
      // Get total lead count for the selected period
      const totalLeads = await db.select({ count: sql`COUNT(*)` })
        .from(leads)
        .where(and(
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        ));
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

  /**
   * Get team members managed by a specific manager
   */
  async getTeamMembersByManager(managerId: number): Promise<User[]> {
    try {
      return await db.select()
        .from(users)
        .where(eq(users.managerId, managerId))
        .orderBy(asc(users.fullName));
    } catch (error) {
      console.error("Error in getTeamMembersByManager:", error);
      return [];
    }
  }

  /**
   * Get team member IDs for a specific manager (for filtering data)
   */
  async getTeamMemberIds(managerId: number): Promise<number[]> {
    try {
      const teamMembers = await this.getTeamMembersByManager(managerId);
      return teamMembers.map(member => member.id);
    } catch (error) {
      console.error("Error in getTeamMemberIds:", error);
      return [];
    }
  }

  /**
   * Get dashboard stats filtered for a specific team manager
   */
  async getTeamDashboardStats(managerId: number): Promise<any> {
    try {
      // Build multi-level team hierarchy to get all users reporting to this manager
      // Get all users
      const users = await this.getAllUsers();
      
      // Create reporting maps for tracking the entire hierarchy
      const reportingMap = new Map();
      const directReportsMap = new Map();
      
      // Build the reporting maps
      users.forEach(user => {
        if (user.managerId) {
          reportingMap.set(user.id, user.managerId);
          
          // Add to direct reports map
          if (!directReportsMap.has(user.managerId)) {
            directReportsMap.set(user.managerId, []);
          }
          directReportsMap.get(user.managerId).push(user.id);
        }
      });
      
      // Function to recursively get all reports (direct and indirect)
      const getAllReports = (managerId) => {
        const allReports = new Set();
        const directReports = directReportsMap.get(managerId) || [];
        
        // Add direct reports
        directReports.forEach(reportId => {
          allReports.add(reportId);
          
          // Recursively add their reports
          const subReports = getAllReports(reportId);
          subReports.forEach(subReportId => allReports.add(subReportId));
        });
        
        return allReports;
      };
      
      // Get all team members in the hierarchy reporting to this manager (at all levels)
      const teamMemberIdsSet = getAllReports(managerId);
      const teamMemberIds = Array.from(teamMemberIdsSet);
      const userIds = [...teamMemberIds, managerId];
      
      // Calculate the date ranges for current and previous periods
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Current month range
      const startDate = new Date(currentYear, currentMonth, 1);
      const endDate = new Date(currentYear, currentMonth + 1, 0);
      
      // Previous month range (for comparison)
      const prevStartDate = new Date(currentYear, currentMonth - 1, 1);
      const prevEndDate = new Date(currentYear, currentMonth, 0);
      
      // Filter stats based on team membership for current period
      const totalLeads = await db
        .select({ count: sql`COUNT(*)` })
        .from(leads)
        .where(
          and(
            inArray(leads.assignedTo, userIds),
            sql`"created_at" >= ${startDate}`,
            sql`"created_at" <= ${endDate}`
          )
        );
      
      // Previous period leads for comparison
      const prevTotalLeads = await db
        .select({ count: sql`COUNT(*)` })
        .from(leads)
        .where(
          and(
            inArray(leads.assignedTo, userIds),
            sql`"created_at" >= ${prevStartDate}`,
            sql`"created_at" <= ${prevEndDate}`
          )
        );
        
      // Open opportunities (deals) for current period  
      const openDeals = await db
        .select({ count: sql`COUNT(*)` })
        .from(opportunities)
        .where(
          and(
            inArray(opportunities.assignedTo, userIds),
            sql`stage != 'closed-won' AND stage != 'closed-lost'`,
            sql`"created_at" >= ${startDate}`,
            sql`"created_at" <= ${endDate}`
          )
        );
      
      // Previous period open deals for comparison
      const prevOpenDeals = await db
        .select({ count: sql`COUNT(*)` })
        .from(opportunities)
        .where(
          and(
            inArray(opportunities.assignedTo, userIds),
            sql`stage != 'closed-won' AND stage != 'closed-lost'`,
            sql`"created_at" >= ${prevStartDate}`,
            sql`"created_at" <= ${prevEndDate}`
          )
        );
      
      // Total sales for current period
      const salesThisPeriod = await db
        .select({ total: sql`SUM(total)` })
        .from(salesOrders)
        .where(
          and(
            inArray(salesOrders.createdBy, userIds),
            sql`"created_at" >= ${startDate}`,
            sql`"created_at" <= ${endDate}`
          )
        );
      
      // Previous period sales for comparison
      const prevSalesThisPeriod = await db
        .select({ total: sql`SUM(total)` })
        .from(salesOrders)
        .where(
          and(
            inArray(salesOrders.createdBy, userIds),
            sql`"created_at" >= ${prevStartDate}`,
            sql`"created_at" <= ${prevEndDate}`
          )
        );
      
      // Conversion rate calculation
      // Current period closed-won opportunities
      const closedWonOpps = await db
        .select({ count: sql`COUNT(*)` })
        .from(opportunities)
        .where(
          and(
            inArray(opportunities.assignedTo, userIds),
            sql`stage = 'closed-won'`,
            sql`"created_at" >= ${startDate}`,
            sql`"created_at" <= ${endDate}`
          )
        );
      
      // Current period all opportunities
      const allOpps = await db
        .select({ count: sql`COUNT(*)` })
        .from(opportunities)
        .where(
          and(
            inArray(opportunities.assignedTo, userIds),
            sql`"created_at" >= ${startDate}`,
            sql`"created_at" <= ${endDate}`
          )
        );
      
      // Previous period closed-won opportunities
      const prevClosedWonOpps = await db
        .select({ count: sql`COUNT(*)` })
        .from(opportunities)
        .where(
          and(
            inArray(opportunities.assignedTo, userIds),
            sql`stage = 'closed-won'`,
            sql`"created_at" >= ${prevStartDate}`,
            sql`"created_at" <= ${prevEndDate}`
          )
        );
      
      // Previous period all opportunities
      const prevAllOpps = await db
        .select({ count: sql`COUNT(*)` })
        .from(opportunities)
        .where(
          and(
            inArray(opportunities.assignedTo, userIds),
            sql`"created_at" >= ${prevStartDate}`,
            sql`"created_at" <= ${prevEndDate}`
          )
        );
      
      // Calculate metrics and changes
      const leadsCount = Number(totalLeads[0].count);
      const prevLeadsCount = Number(prevTotalLeads[0].count);
      const leadsChange = prevLeadsCount > 0 
        ? ((leadsCount - prevLeadsCount) / prevLeadsCount) * 100 
        : 0;
      
      const openDealsCount = Number(openDeals[0].count);
      const prevOpenDealsCount = Number(prevOpenDeals[0].count);
      const openDealsChange = prevOpenDealsCount > 0 
        ? ((openDealsCount - prevOpenDealsCount) / prevOpenDealsCount) * 100 
        : 0;
      
      const totalSales = Number(salesThisPeriod[0].total) || 0;
      const prevTotalSales = Number(prevSalesThisPeriod[0].total) || 0;
      const salesChange = prevTotalSales > 0 
        ? ((totalSales - prevTotalSales) / prevTotalSales) * 100 
        : 0;
      
      const closedWonCount = Number(closedWonOpps[0].count);
      const allOppsCount = Number(allOpps[0].count);
      const conversionRate = allOppsCount > 0 ? (closedWonCount / allOppsCount) * 100 : 0;
      
      const prevClosedWonCount = Number(prevClosedWonOpps[0].count);
      const prevAllOppsCount = Number(prevAllOpps[0].count);
      const prevConversionRate = prevAllOppsCount > 0 ? (prevClosedWonCount / prevAllOppsCount) * 100 : 0;
      const conversionChange = prevConversionRate > 0 
        ? ((conversionRate - prevConversionRate) / prevConversionRate) * 100 
        : 0;
      
      // Format the change values with + or - sign
      const formatChange = (change) => {
        return (change >= 0 ? '+' : '') + change.toFixed(0) + '%';
      };
      
      return {
        totalLeads: {
          value: leadsCount.toString(),
          change: formatChange(leadsChange)
        },
        openDeals: {
          value: openDealsCount.toString(),
          change: formatChange(openDealsChange)
        },
        sales: {
          value: "₹" + totalSales.toLocaleString('en-IN'),
          change: formatChange(salesChange)
        },
        conversionRate: {
          value: conversionRate.toFixed(1) + "%",
          change: formatChange(conversionChange)
        }
      };
    } catch (error) {
      console.error("Error in getTeamDashboardStats:", error);
      return {
        totalLeads: { value: "0", change: "0%" },
        openDeals: { value: "0", change: "0%" },
        sales: { value: "₹0", change: "0%" },
        conversionRate: { value: "0.0%", change: "0%" }
      };
    }
  }

  /**
   * Get dashboard stats for a specific user
   */
  async getUserDashboardStats(userId: number): Promise<any> {
    try {
      // Filter stats based on user assignment
      const totalLeads = await db
        .select({ count: sql`COUNT(*)` })
        .from(leads)
        .where(eq(leads.assignedTo, userId));
        
      const totalOpportunities = await db
        .select({ count: sql`COUNT(*)` })
        .from(opportunities)
        .where(eq(opportunities.assignedTo, userId));
        
      const totalTasks = await db
        .select({ count: sql`COUNT(*)` })
        .from(tasks)
        .where(eq(tasks.assignedTo, userId));
        
      const totalQuotations = await db
        .select({ count: sql`COUNT(*)` })
        .from(quotations)
        .where(eq(quotations.createdBy, userId));
      
      // Get change percentages (simplified - using static values for now)
      return {
        totalLeads: {
          value: totalLeads[0].count.toString(),
          change: "+5%"
        },
        totalOpportunities: {
          value: totalOpportunities[0].count.toString(),
          change: "+3%"
        },
        totalTasks: {
          value: totalTasks[0].count.toString(),
          change: "-2%"
        },
        conversions: {
          value: totalQuotations[0].count.toString(),
          change: "+4%"
        }
      };
    } catch (error) {
      console.error("Error in getUserDashboardStats:", error);
      return {
        totalLeads: { value: "0", change: "0%" },
        totalOpportunities: { value: "0", change: "0%" },
        totalTasks: { value: "0", change: "0%" },
        conversions: { value: "0", change: "0%" }
      };
    }
  }

  /**
   * Get pipeline data filtered for a specific team manager
   */
  async getTeamPipelineData(managerId: number, period: string = 'thisMonth'): Promise<any> {
    try {
      // Calculate date ranges based on period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Build multi-level team hierarchy to get all users reporting to this manager
      // Get all users
      const users = await this.getAllUsers();
      
      // Create reporting maps for tracking the entire hierarchy
      const reportingMap = new Map();
      const directReportsMap = new Map();
      
      // Build the reporting maps
      users.forEach(user => {
        if (user.managerId) {
          reportingMap.set(user.id, user.managerId);
          
          // Add to direct reports map
          if (!directReportsMap.has(user.managerId)) {
            directReportsMap.set(user.managerId, []);
          }
          directReportsMap.get(user.managerId).push(user.id);
        }
      });
      
      // Function to recursively get all reports (direct and indirect)
      const getAllReports = (managerId) => {
        const allReports = new Set();
        const directReports = directReportsMap.get(managerId) || [];
        
        // Add direct reports
        directReports.forEach(reportId => {
          allReports.add(reportId);
          
          // Recursively add their reports
          const subReports = getAllReports(reportId);
          subReports.forEach(subReportId => allReports.add(subReportId));
        });
        
        return allReports;
      };
      
      // Get all team members in the hierarchy reporting to this manager (at all levels)
      const teamMemberIdsSet = getAllReports(managerId);
      const teamMemberIds = Array.from(teamMemberIdsSet);
      const userIds = [...teamMemberIds, managerId];
      
      // Get all opportunities for this team within the selected period
      const teamOpportunities = await db
        .select()
        .from(opportunities)
        .where(and(
          inArray(opportunities.assignedTo, userIds),
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        ));
      
      // Group by stage
      const stages = ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
      const result = {
        stages: stages.map(stage => {
          const stageOpps = teamOpportunities.filter(opp => opp.stage === stage.toLowerCase().replace(' ', '_'));
          const value = stageOpps.reduce((sum, opp) => sum + (parseFloat(opp.amount) || 0), 0);
          return {
            name: stage,
            count: stageOpps.length,
            value: `₹${value.toLocaleString('en-IN')}`
          };
        })
      };
      
      return result;
    } catch (error) {
      console.error("Error in getTeamPipelineData:", error);
      return { stages: [] };
    }
  }

  /**
   * Get pipeline data for a specific user
   */
  async getUserPipelineData(userId: number, period: string = 'thisMonth'): Promise<any> {
    try {
      // Calculate date ranges based on period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Get all opportunities for this user within the selected period
      const userOpportunities = await db
        .select()
        .from(opportunities)
        .where(and(
          eq(opportunities.assignedTo, userId),
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        ));
      
      // Group by stage
      const stages = ['Qualification', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];
      const result = {
        stages: stages.map(stage => {
          const stageOpps = userOpportunities.filter(opp => opp.stage === stage.toLowerCase().replace(' ', '_'));
          const value = stageOpps.reduce((sum, opp) => sum + (parseFloat(opp.amount) || 0), 0);
          return {
            name: stage,
            count: stageOpps.length,
            value: `₹${value.toLocaleString('en-IN')}`
          };
        })
      };
      
      return result;
    } catch (error) {
      console.error("Error in getUserPipelineData:", error);
      return { stages: [] };
    }
  }

  /**
   * Get recent opportunities filtered for a team
   */
  async getTeamRecentOpportunities(managerId: number, period: string = 'thisMonth'): Promise<any[]> {
    try {
      // Calculate date ranges based on period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Build multi-level team hierarchy to get all users reporting to this manager
      // Get all users
      const users = await this.getAllUsers();
      
      // Create reporting maps for tracking the entire hierarchy
      const reportingMap = new Map();
      const directReportsMap = new Map();
      
      // Build the reporting maps
      users.forEach(user => {
        if (user.managerId) {
          reportingMap.set(user.id, user.managerId);
          
          // Add to direct reports map
          if (!directReportsMap.has(user.managerId)) {
            directReportsMap.set(user.managerId, []);
          }
          directReportsMap.get(user.managerId).push(user.id);
        }
      });
      
      // Function to recursively get all reports (direct and indirect)
      const getAllReports = (managerId) => {
        const allReports = new Set();
        const directReports = directReportsMap.get(managerId) || [];
        
        // Add direct reports
        directReports.forEach(reportId => {
          allReports.add(reportId);
          
          // Recursively add their reports
          const subReports = getAllReports(reportId);
          subReports.forEach(subReportId => allReports.add(subReportId));
        });
        
        return allReports;
      };
      
      // Get all team members in the hierarchy reporting to this manager (at all levels)
      const teamMemberIdsSet = getAllReports(managerId);
      const teamMemberIds = Array.from(teamMemberIdsSet);
      const userIds = [...teamMemberIds, managerId];
      
      // Get recent opportunities for the team within the selected period
      const recentOpps = await db
        .select()
        .from(opportunities)
        .where(and(
          inArray(opportunities.assignedTo, userIds),
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        ))
        .orderBy(desc(opportunities.createdAt))
        .limit(5);
        
      // Enhance with company information
      return await Promise.all(recentOpps.map(async (opp) => {
        let companyName = "Unknown";
        
        if (opp.companyId) {
          const [company] = await db
            .select()
            .from(companies)
            .where(eq(companies.id, opp.companyId));
            
          if (company) {
            companyName = company.name;
          }
        }
        
        return {
          id: opp.id,
          name: opp.name,
          company: companyName,
          amount: `₹${parseFloat(opp.amount || "0").toLocaleString('en-IN')}`,
          stage: opp.stage?.replace(/_/g, ' ') || 'Unknown',
          probability: `${opp.probability || 0}%`
        };
      }));
    } catch (error) {
      console.error("Error in getTeamRecentOpportunities:", error);
      return [];
    }
  }

  /**
   * Get recent opportunities for a specific user
   */
  async getUserRecentOpportunities(userId: number, period: string = 'thisMonth'): Promise<any[]> {
    try {
      // Calculate date ranges based on period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Get recent opportunities for the user within the selected period
      const recentOpps = await db
        .select()
        .from(opportunities)
        .where(and(
          eq(opportunities.assignedTo, userId),
          sql`"created_at" >= ${startDate}`,
          sql`"created_at" <= ${endDate}`
        ))
        .orderBy(desc(opportunities.createdAt))
        .limit(5);
        
      // Enhance with company information
      return await Promise.all(recentOpps.map(async (opp) => {
        let companyName = "Unknown";
        
        if (opp.companyId) {
          const [company] = await db
            .select()
            .from(companies)
            .where(eq(companies.id, opp.companyId));
            
          if (company) {
            companyName = company.name;
          }
        }
        
        return {
          id: opp.id,
          name: opp.name,
          company: companyName,
          amount: `₹${parseFloat(opp.amount || "0").toLocaleString('en-IN')}`,
          stage: opp.stage?.replace(/_/g, ' ') || 'Unknown',
          probability: `${opp.probability || 0}%`
        };
      }));
    } catch (error) {
      console.error("Error in getUserRecentOpportunities:", error);
      return [];
    }
  }

  /**
   * Get today's tasks filtered for a team
   */
  async getTeamTodayTasks(managerId: number): Promise<any[]> {
    try {
      // Build multi-level team hierarchy to get all users reporting to this manager
      // Get all users
      const users = await this.getAllUsers();
      
      // Create reporting maps for tracking the entire hierarchy
      const reportingMap = new Map();
      const directReportsMap = new Map();
      
      // Build the reporting maps
      users.forEach(user => {
        if (user.managerId) {
          reportingMap.set(user.id, user.managerId);
          
          // Add to direct reports map
          if (!directReportsMap.has(user.managerId)) {
            directReportsMap.set(user.managerId, []);
          }
          directReportsMap.get(user.managerId).push(user.id);
        }
      });
      
      // Function to recursively get all reports (direct and indirect)
      const getAllReports = (managerId) => {
        const allReports = new Set();
        const directReports = directReportsMap.get(managerId) || [];
        
        // Add direct reports
        directReports.forEach(reportId => {
          allReports.add(reportId);
          
          // Recursively add their reports
          const subReports = getAllReports(reportId);
          subReports.forEach(subReportId => allReports.add(subReportId));
        });
        
        return allReports;
      };
      
      // Get all team members in the hierarchy reporting to this manager (at all levels)
      const teamMemberIdsSet = getAllReports(managerId);
      const teamMemberIds = Array.from(teamMemberIdsSet);
      const userIds = [...teamMemberIds, managerId];
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Convert user IDs array to string for SQL query
      const userIdList = userIds.join(',');
      
      // Use Drizzle ORM queries instead of raw SQL
      const todayTasks = await db
        .select()
        .from(tasks)
        .where(
          and(
            inArray(tasks.assignedTo, userIds),
            sql`DATE(due_date) = ${today}`
          )
        )
        .orderBy(asc(tasks.dueDate));
        
      // Enhance with assignee information
      return await Promise.all(todayTasks.map(async (task) => {
        let assigneeName = "Unassigned";
        
        if (task.assignedTo) {
          const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, task.assignedTo));
            
          if (user) {
            assigneeName = user.fullName;
          }
        }
        
        return {
          id: task.id,
          title: task.title,
          status: task.status,
          priority: task.priority,
          assignee: assigneeName,
          dueTime: new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
      }));
    } catch (error) {
      console.error("Error in getTeamTodayTasks:", error);
      return [];
    }
  }

  /**
   * Get today's tasks for a specific user
   */
  async getUserTodayTasks(userId: number): Promise<any[]> {
    try {
      // Get today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Get tasks for today for the user
      const todayTasks = await db
        .select()
        .from(tasks)
        .where(and(
          eq(tasks.assignedTo, userId),
          sql`DATE(${tasks.dueDate}) = ${today}`
        ))
        .orderBy(asc(tasks.dueDate));
        
      // Return formatted tasks
      return todayTasks.map((task) => ({
        id: task.id,
        title: task.title,
        status: task.status,
        priority: task.priority,
        dueTime: new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }));
    } catch (error) {
      console.error("Error in getUserTodayTasks:", error);
      return [];
    }
  }

  /**
   * Get recent activities filtered for a team
   */
  async getTeamRecentActivities(managerId: number, period: string = 'thisMonth'): Promise<any[]> {
    try {
      // Calculate date range based on the selected period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Build multi-level team hierarchy to get all users reporting to this manager
      // Get all users
      const users = await this.getAllUsers();
      
      // Create reporting maps for tracking the entire hierarchy
      const reportingMap = new Map();
      const directReportsMap = new Map();
      
      // Build the reporting maps
      users.forEach(user => {
        if (user.managerId) {
          reportingMap.set(user.id, user.managerId);
          
          // Add to direct reports map
          if (!directReportsMap.has(user.managerId)) {
            directReportsMap.set(user.managerId, []);
          }
          directReportsMap.get(user.managerId).push(user.id);
        }
      });
      
      // Function to recursively get all reports (direct and indirect)
      const getAllReports = (managerId) => {
        const allReports = new Set();
        const directReports = directReportsMap.get(managerId) || [];
        
        // Add direct reports
        directReports.forEach(reportId => {
          allReports.add(reportId);
          
          // Recursively add their reports
          const subReports = getAllReports(reportId);
          subReports.forEach(subReportId => allReports.add(subReportId));
        });
        
        return allReports;
      };
      
      // Get all team members in the hierarchy reporting to this manager (at all levels)
      const teamMemberIdsSet = getAllReports(managerId);
      const teamMemberIds = Array.from(teamMemberIdsSet);
      const userIds = [...teamMemberIds, managerId];
      
      // Get recent activities for the team within the selected period using SQL
      const activitiesResult = await db.execute(sql`
        SELECT * FROM activities
        WHERE created_by = ANY(ARRAY[${sql.join(userIds)}])
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        ORDER BY created_at DESC
        LIMIT 10
      `);
      
      // Type assertion for the results
      const recentActivities = activitiesResult.rows as any[];
        
      // Enhance with user information
      return await Promise.all(recentActivities.map(async (activity) => {
        let userName = "Unknown User";
        let isYou = false;
        let target = "";
        
        // Get creator information
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, activity.createdBy));
          
        if (user) {
          userName = user.fullName;
          isYou = user.id === managerId;
        }
        
        // Get related entity information based on relatedTo and relatedId
        if (activity.relatedTo && activity.relatedId) {
          switch (activity.relatedTo) {
            case 'lead':
              const [lead] = await db.select().from(leads).where(eq(leads.id, activity.relatedId));
              if (lead) target = lead.name;
              break;
            case 'opportunity':
              const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, activity.relatedId));
              if (opp) target = opp.name;
              break;
            case 'contact':
              const [contact] = await db.select().from(contacts).where(eq(contacts.id, activity.relatedId));
              if (contact) target = `${contact.firstName} ${contact.lastName}`;
              break;
            default:
              target = `#${activity.relatedId}`;
          }
        }
        
        // Calculate time difference
        const now = new Date();
        const createdAt = new Date(activity.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let time;
        if (diffDays > 0) {
          time = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
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
    } catch (error) {
      console.error("Error in getTeamRecentActivities:", error);
      return [];
    }
  }

  /**
   * Get recent activities for a specific user
   */
  async getUserRecentActivities(userId: number, period: string = 'thisMonth'): Promise<any[]> {
    try {
      // Calculate date range based on the selected period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Get recent activities for the user within the selected period
      const recentActivities = await db
        .select()
        .from(activities)
        .where(and(
          eq(activities.createdBy, userId),
          gte(activities.createdAt, startDate),
          lte(activities.createdAt, endDate)
        ))
        .orderBy(desc(activities.createdAt))
        .limit(10);
        
      // Enhance with related information
      return await Promise.all(recentActivities.map(async (activity) => {
        let target = "";
        
        // Get related entity information based on relatedTo and relatedId
        if (activity.relatedTo && activity.relatedId) {
          switch (activity.relatedTo) {
            case 'lead':
              const [lead] = await db.select().from(leads).where(eq(leads.id, activity.relatedId));
              if (lead) target = lead.name;
              break;
            case 'opportunity':
              const [opp] = await db.select().from(opportunities).where(eq(opportunities.id, activity.relatedId));
              if (opp) target = opp.name;
              break;
            case 'contact':
              const [contact] = await db.select().from(contacts).where(eq(contacts.id, activity.relatedId));
              if (contact) target = `${contact.firstName} ${contact.lastName}`;
              break;
            default:
              target = `#${activity.relatedId}`;
          }
        }
        
        // Calculate time difference
        const now = new Date();
        const createdAt = new Date(activity.createdAt);
        const diffMs = now.getTime() - createdAt.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        let time;
        if (diffDays > 0) {
          time = `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          time = `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        } else {
          time = `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        }
        
        return {
          id: activity.id,
          type: activity.type,
          title: activity.title,
          isYou: true, // Always true since we're filtering for the user's activities
          target,
          time
        };
      }));
    } catch (error) {
      console.error("Error in getUserRecentActivities:", error);
      return [];
    }
  }

  /**
   * Get lead sources data filtered for a team
   */
  async getTeamLeadSources(managerId: number, period: string = 'thisMonth'): Promise<any[]> {
    try {
      // Calculate date ranges based on period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Build multi-level team hierarchy to get all users reporting to this manager
      // Get all users
      const users = await this.getAllUsers();
      
      // Create reporting maps for tracking the entire hierarchy
      const reportingMap = new Map();
      const directReportsMap = new Map();
      
      // Build the reporting maps
      users.forEach(user => {
        if (user.managerId) {
          reportingMap.set(user.id, user.managerId);
          
          // Add to direct reports map
          if (!directReportsMap.has(user.managerId)) {
            directReportsMap.set(user.managerId, []);
          }
          directReportsMap.get(user.managerId).push(user.id);
        }
      });
      
      // Function to recursively get all reports (direct and indirect)
      const getAllReports = (managerId) => {
        const allReports = new Set();
        const directReports = directReportsMap.get(managerId) || [];
        
        // Add direct reports
        directReports.forEach(reportId => {
          allReports.add(reportId);
          
          // Recursively add their reports
          const subReports = getAllReports(reportId);
          subReports.forEach(subReportId => allReports.add(subReportId));
        });
        
        return allReports;
      };
      
      // Get all team members in the hierarchy reporting to this manager (at all levels)
      const teamMemberIdsSet = getAllReports(managerId);
      const teamMemberIds = Array.from(teamMemberIdsSet);
      const userIds = [...teamMemberIds, managerId];
      
      // Convert user IDs array to string for SQL query
      const userIdList = userIds.join(',');
      
      // Use proper Drizzle ORM query instead of raw SQL
      const teamLeads = await db
        .select()
        .from(leads)
        .where(
          and(
            inArray(leads.assignedTo, userIds),
            gte(leads.createdAt, startDate),
            lte(leads.createdAt, endDate)
          )
        );
      
      // Group leads by source
      const sourcesMap = new Map();
      
      // Count leads by source
      teamLeads.forEach(lead => {
        const sourceName = lead.source || 'Other';
        const currentCount = sourcesMap.get(sourceName) || 0;
        sourcesMap.set(sourceName, currentCount + 1);
      });
      
      // Convert to array format needed for UI
      const sources = Array.from(sourcesMap.entries()).map(([name, count]) => ({
        name,
        count
      }));
      
      // Sort by count in descending order
      sources.sort((a, b) => b.count - a.count);
      
      // Total leads count
      const totalCount = teamLeads.length;
      
      // Calculate percentages and assign colors
      const colors = ["#3b82f6", "#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
      
      return sources.map((source: any, index: number) => ({
        name: source.name,
        percentage: totalCount > 0 ? Math.round((Number(source.count) / totalCount) * 100) : 0,
        color: colors[index % colors.length]
      }));
    } catch (error) {
      console.error("Error in getTeamLeadSources:", error);
      return [];
    }
  }

  /**
   * Get lead sources data for a specific user
   */
  async getUserLeadSources(userId: number, period: string = 'thisMonth'): Promise<any[]> {
    try {
      // Calculate date ranges based on period
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Aggregate leads by source for this user within the selected period
      const sourcesResult = await db.execute(sql`
        SELECT 
          COALESCE(source, 'Other') as name,
          COUNT(*) as count
        FROM ${leads}
        WHERE assigned_to = ${userId}
          AND "created_at" >= ${startDate}
          AND "created_at" <= ${endDate}
        GROUP BY COALESCE(source, 'Other')
        ORDER BY count DESC
      `);
      
      // Type assertion to make TypeScript happy
      const sources = sourcesResult.rows as any[];
      
      // Get total lead count for this user
      const totalLeads = await db
        .select({ count: sql`COUNT(*)` })
        .from(leads)
        .where(eq(leads.assignedTo, userId));
        
      const totalCount = Number(totalLeads[0].count);
      
      // Calculate percentages and assign colors
      const colors = ["#3b82f6", "#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
      
      return sources.map((source: any, index: number) => ({
        name: source.name,
        percentage: totalCount > 0 ? Math.round((Number(source.count) / totalCount) * 100) : 0,
        color: colors[index % colors.length]
      }));
    } catch (error) {
      console.error("Error in getUserLeadSources:", error);
      return [];
    }
  }
  
  /**
   * Get vendor financial statistics for dashboard display
   */
  async getVendorFinancials(period: string = 'thisMonth'): Promise<any> {
    try {
      const { startDate, endDate } = this.getPeriodDateRange(period);
      
      // Step 1: Get all vendors
      const allVendors = await db.select().from(vendors).orderBy(asc(vendors.name));
      
      // Step 2: Prepare result container for vendor statistics
      const vendorStats = await Promise.all(allVendors.map(async (vendor) => {
        // Get all products for this vendor
        const vendorProducts = await db
          .select()
          .from(products)
          .where(eq(products.vendorId, vendor.id));
        
        const productIds = vendorProducts.map(product => product.id);
        
        // If vendor has no products, return basic info
        if (productIds.length === 0) {
          return {
            id: vendor.id,
            name: vendor.name,
            productCount: 0,
            opportunityCount: 0,
            quotationCount: 0,
            salesOrderCount: 0,
            totalOpportunityValue: "0",
            totalSalesValue: "0",
            conversionRate: 0,
            color: "#3b82f6" // Default color
          };
        }
        
        // Get quotation items for these products using Drizzle ORM instead of raw SQL
        let quotationItemsForVendor = [];
        if (productIds.length > 0) {
          quotationItemsForVendor = await db
            .select()
            .from(quotationItems)
            .where(inArray(quotationItems.productId, productIds));
        }
        
        // Get unique quotation IDs
        const quotationIds = [...new Set(quotationItemsForVendor.map(item => item.quotationId))];
        
        // Get quotations
        const quotationsData = quotationIds.length > 0 
          ? await db
              .select()
              .from(quotations)
              .where(
                and(
                  inArray(quotations.id, quotationIds),
                  gte(quotations.createdAt, startDate),
                  lte(quotations.createdAt, endDate)
                )
              )
          : [];
        
        // Get opportunities related to these quotations
        const opportunityIds = [...new Set(quotationsData.map(q => q.opportunityId).filter(Boolean) as number[])];
        
        const opportunitiesData = opportunityIds.length > 0
          ? await db
              .select()
              .from(opportunities)
              .where(inArray(opportunities.id, opportunityIds))
          : [];
        
        // Get sales orders from these quotations
        const salesOrdersData = quotationIds.length > 0
          ? await db
              .select()
              .from(salesOrders)
              .where(
                and(
                  inArray(salesOrders.quotationId, quotationIds),
                  eq(salesOrders.status, 'completed')
                )
              )
          : [];
        
        // Calculate financial metrics
        const totalOpportunityValue = opportunitiesData.reduce((sum, opp) => {
          const value = parseFloat(opp.value?.toString() || '0');
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        
        const totalSalesValue = salesOrdersData.reduce((sum, order) => {
          const value = parseFloat(order.total?.toString() || '0');
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
        
        // Calculate conversion rate (sales orders / quotations)
        const conversionRate = quotationsData.length > 0
          ? (salesOrdersData.length / quotationsData.length) * 100
          : 0;
        
        return {
          id: vendor.id,
          name: vendor.name,
          productCount: vendorProducts.length,
          opportunityCount: opportunitiesData.length,
          quotationCount: quotationsData.length,
          salesOrderCount: salesOrdersData.length,
          totalOpportunityValue: totalOpportunityValue.toFixed(2),
          totalSalesValue: totalSalesValue.toFixed(2),
          conversionRate: Math.round(conversionRate)
        };
      }));
      
      // Assign colors to vendors
      const colors = ["#3b82f6", "#4f46e5", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];
      const vendorStatsWithColors = vendorStats.map((vendor, index) => ({
        ...vendor,
        color: colors[index % colors.length]
      }));
      
      // Sort by total sales value (descending)
      return vendorStatsWithColors.sort((a, b) => 
        parseFloat(b.totalSalesValue) - parseFloat(a.totalSalesValue)
      );
    } catch (error) {
      console.error("Error getting vendor financial stats:", error);
      return [];
    }
  }

  // Sales Targets methods
  async getAllSalesTargets(): Promise<SalesTarget[]> {
    try {
      return await db.select().from(salesTargets)
        .orderBy(desc(salesTargets.createdAt));
    } catch (error) {
      console.error("Error in getAllSalesTargets:", error);
      return [];
    }
  }

  async getSalesTarget(id: number): Promise<SalesTarget | undefined> {
    try {
      const [target] = await db.select().from(salesTargets)
        .where(eq(salesTargets.id, id));
      return target;
    } catch (error) {
      console.error("Error in getSalesTarget:", error);
      return undefined;
    }
  }

  async getSalesTargetsByUser(userId: number): Promise<SalesTarget[]> {
    try {
      return await db.select().from(salesTargets)
        .where(eq(salesTargets.userId, userId))
        .orderBy(desc(salesTargets.createdAt));
    } catch (error) {
      console.error("Error in getSalesTargetsByUser:", error);
      return [];
    }
  }

  async getSalesTargetsByCompany(companyId: number): Promise<SalesTarget[]> {
    try {
      return await db.select().from(salesTargets)
        .where(eq(salesTargets.companyId, companyId))
        .orderBy(desc(salesTargets.createdAt));
    } catch (error) {
      console.error("Error in getSalesTargetsByCompany:", error);
      return [];
    }
  }

  async createSalesTarget(insertTarget: InsertSalesTarget): Promise<SalesTarget> {
    try {
      // Set createdAt if not provided
      if (!insertTarget.createdAt) {
        insertTarget.createdAt = new Date();
      }

      const [target] = await db.insert(salesTargets)
        .values(insertTarget)
        .returning();
      
      return target;
    } catch (error) {
      console.error("Error in createSalesTarget:", error);
      throw error;
    }
  }

  async updateSalesTarget(id: number, updates: Partial<SalesTarget>): Promise<SalesTarget | undefined> {
    try {
      const [updatedTarget] = await db.update(salesTargets)
        .set(updates)
        .where(eq(salesTargets.id, id))
        .returning();
      
      return updatedTarget;
    } catch (error) {
      console.error("Error in updateSalesTarget:", error);
      return undefined;
    }
  }

  async deleteSalesTarget(id: number): Promise<boolean> {
    try {
      const result = await db.delete(salesTargets)
        .where(eq(salesTargets.id, id));
      
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("Error in deleteSalesTarget:", error);
      return false;
    }
  }
}