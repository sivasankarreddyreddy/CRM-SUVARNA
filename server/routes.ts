import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
import { sql } from "drizzle-orm";
import { 
  insertLeadSchema, 
  insertContactSchema, 
  insertCompanySchema, 
  insertOpportunitySchema,
  insertProductSchema,
  insertProductModuleSchema,
  insertModuleSchema,
  insertVendorSchema,
  insertQuotationSchema,
  insertQuotationItemSchema,
  insertSalesOrderSchema,
  insertTaskSchema,
  insertActivitySchema,
  insertAppointmentSchema,
  insertTeamSchema,
  insertSalesTargetSchema,
  type User,
  type Team,
  tasks as taskTable,
  activities as activityTable,
  opportunities as opportunityTable,
  vendors as vendorTable,
  modules as moduleTable,
  productModules as productModuleTable
} from "@shared/schema";
import { FilterParams, PaginatedResponse } from "@shared/filter-types";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { generateQuotationPdf, generateInvoicePdf } from "./pdf-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Users endpoints (for assignments)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // For read-only basic user info, allow all authenticated users
    // Sales executives need this to see assignments on leads
    
    try {
      // Check if we should include team relationships
      const includeTeam = req.query.includeTeam === 'true';
      
      let users;
      if (includeTeam) {
        try {
          // Get users with their team information
          users = await storage.getUsersWithTeam();
        } catch (error) {
          console.error("Error fetching users with team:", error);
          // Fallback to regular user list if the join query fails
          users = await storage.getAllUsers();
          users = users.map((user: User) => ({
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            role: user.role,
            teamId: user.teamId,
            managerId: user.managerId,
            isActive: user.isActive,
            // Add empty team info
            team: null,
            manager: null
          }));
        }
      } else {
        // Get regular user list
        users = await storage.getAllUsers();
        
        // Remove sensitive information like passwords
        users = users.map((user: User) => ({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          teamId: user.teamId,
          managerId: user.managerId,
          isActive: user.isActive
        }));
      }
      
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Get users by manager
  app.get("/api/managers/:id/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const managerId = parseInt(req.params.id);
      
      // If not admin or the manager themselves, deny access
      if (req.user.role !== 'admin' && req.user.id !== managerId) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      // Verify the manager exists and is a sales_manager
      const manager = await storage.getUser(managerId);
      if (!manager) return res.status(404).json({ error: "Manager not found" });
      if (manager.role !== 'sales_manager' && req.user.role !== 'admin') {
        return res.status(400).json({ error: "User is not a sales manager" });
      }
      
      const teamMembers = await storage.getUsersByManager(managerId);
      res.json(teamMembers);
    } catch (err: any) {
      console.error("Error fetching manager members:", err);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });

  // Dashboard stats route
  app.get("/api/dashboard/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get the period from query parameter
      const period = req.query.period as string || 'thisMonth';
      
      // Get team-specific stats if the user is a sales_manager
      if (req.user.role === 'sales_manager') {
        // For sales managers, get stats for their team only
        const stats = await storage.getTeamDashboardStats(req.user.id, period);
        res.json(stats);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get stats for only their assigned data
        const stats = await storage.getUserDashboardStats(req.user.id, period);
        res.json(stats);
      } else {
        // For admins, get all stats
        const stats = await storage.getDashboardStats(period);
        res.json(stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Dashboard pipeline data
  app.get("/api/dashboard/pipeline", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get the period from query parameter
      const period = req.query.period as string || 'thisMonth';
      
      if (req.user.role === 'sales_manager') {
        // For sales managers, get pipeline data for their team only
        const pipeline = await storage.getTeamPipelineData(req.user.id, period);
        res.json(pipeline);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get pipeline data for only their assigned data
        const pipeline = await storage.getUserPipelineData(req.user.id, period);
        res.json(pipeline);
      } else {
        // For admins, get all pipeline data
        const pipeline = await storage.getPipelineData(period);
        res.json(pipeline);
      }
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
  });

  // Recent opportunities for dashboard
  app.get("/api/opportunities/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get the period from query parameter
      const period = req.query.period as string || 'thisMonth';
      
      if (req.user.role === 'sales_manager') {
        // For sales managers, get opportunities for their team only
        const opportunities = await storage.getTeamRecentOpportunities(req.user.id, period);
        res.json(opportunities);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get opportunities they own
        const opportunities = await storage.getUserRecentOpportunities(req.user.id, period);
        res.json(opportunities);
      } else {
        // For admins, get all opportunities
        const opportunities = await storage.getRecentOpportunities(period);
        res.json(opportunities);
      }
    } catch (error) {
      console.error("Error fetching recent opportunities:", error);
      res.status(500).json({ error: "Failed to fetch recent opportunities" });
    }
  });

  // Tasks for today
  app.get("/api/tasks/today", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get the period from query parameter
      const period = req.query.period as string || 'thisMonth';
      
      if (req.user.role === 'sales_manager') {
        // For sales managers, get tasks for their team only
        const tasks = await storage.getTeamTodayTasks(req.user.id, period);
        res.json(tasks);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get only their tasks
        const tasks = await storage.getUserTodayTasks(req.user.id, period);
        res.json(tasks);
      } else {
        // For admins, get all tasks
        const tasks = await storage.getTodayTasks(period);
        res.json(tasks);
      }
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      res.status(500).json({ error: "Failed to fetch today's tasks" });
    }
  });

  // Recent activities
  app.get("/api/activities/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get the period from query parameter
      const period = req.query.period as string || 'thisMonth';
      
      if (req.user.role === 'sales_manager') {
        // For sales managers, get activities for their team only
        const activities = await storage.getTeamRecentActivities(req.user.id, period);
        res.json(activities);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get only activities related to their work
        const activities = await storage.getUserRecentActivities(req.user.id, period);
        res.json(activities);
      } else {
        // For admins, get all activities
        const activities = await storage.getRecentActivities(period);
        res.json(activities);
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  });

  // Lead sources data
  app.get("/api/leads/sources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get the period from query parameter
      const period = req.query.period as string || 'thisMonth';
      
      if (req.user.role === 'sales_manager') {
        // For sales managers, get lead sources for their team only
        const leadSources = await storage.getTeamLeadSources(req.user.id, period);
        res.json(leadSources);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get only their lead sources
        const leadSources = await storage.getUserLeadSources(req.user.id, period);
        res.json(leadSources);
      } else {
        // For admins, get all lead sources
        const leadSources = await storage.getLeadSources(period);
        res.json(leadSources);
      }
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({ error: "Failed to fetch lead sources data" });
    }
  });
  
  // Vendor financial statistics for dashboard
  app.get("/api/vendors/financials", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get the period from query parameter
      const period = req.query.period as string || 'thisMonth';
      const vendorStats = await storage.getVendorFinancials(period);
      res.json(vendorStats);
    } catch (error) {
      console.error("Error fetching vendor financials:", error);
      res.status(500).json({ error: "Failed to fetch vendor financial data" });
    }
  });

  // Leads CRUD routes with filtering, pagination and sorting
  app.get("/api/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Extract filter parameters from query string
      const filterParams: FilterParams = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        search: req.query.search as string,
        column: req.query.column as string,
        direction: (req.query.direction as 'asc' | 'desc') || 'desc',
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        status: req.query.status as string
      };
      
      // Use the new filtered leads method
      const paginatedLeads = await storage.getFilteredLeads(filterParams, req.user);
      
      res.json(paginatedLeads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const lead = await storage.getLead(id);
    if (!lead) return res.status(404).send("Lead not found");
    res.json(lead);
  });

  app.post("/api/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Make sure createdBy is set
      if (!req.body.createdBy) {
        req.body.createdBy = req.user?.id;
      }
      
      // Set team ID based on user if not provided
      if (!req.body.teamId && req.user?.teamId) {
        req.body.teamId = req.user.teamId;
      }
      
      // Ensure status is set
      if (!req.body.status) {
        req.body.status = "new";
      }
      
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Lead creation error:", error);
      res.status(400).json({ error: "Invalid lead data", message: (error as Error).message });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const leadData = req.body;
      
      // If company ID is provided, get the company name from the DB
      if (leadData.companyId) {
        try {
          const company = await storage.getCompany(leadData.companyId);
          if (company) {
            leadData.companyName = company.name;
          }
        } catch (err) {
          console.error("Error getting company details for lead update:", err);
          // Continue even if we can't get company name
        }
      }
      
      // If company ID is null, ensure companyName is cleared as well
      if (leadData.companyId === null) {
        leadData.companyName = null;
      }
      
      const updatedLead = await storage.updateLead(id, leadData);
      if (!updatedLead) return res.status(404).send("Lead not found");
      
      // If updatedLead doesn't have a company name but has a company ID,
      // fetch the company name before returning
      if (updatedLead.companyId && !updatedLead.companyName) {
        const company = await storage.getCompany(updatedLead.companyId);
        if (company) {
          updatedLead.companyName = company.name;
        }
      }
      
      res.json(updatedLead);
    } catch (error) {
      console.error("Error updating lead:", error);
      res.status(400).json({ error: "Invalid lead data" });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteLead(id);
      if (!success) return res.status(404).send("Lead not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });
  
  // Lead assignment endpoint
  app.patch("/api/leads/:id/assign", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins and sales managers can assign leads
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const leadId = parseInt(req.params.id);
      const { assignedTo, assignmentNotes } = req.body;
      
      // Get the lead to be assigned
      const lead = await storage.getLead(leadId);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      
      // Get the user to assign to
      const assignee = await storage.getUser(assignedTo);
      if (!assignee) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update the lead with the new assignment
      const updatedLead = await storage.updateLead(leadId, { 
        assignedTo,
        // If the lead was previously unassigned, set status to "new"
        status: lead.assignedTo ? lead.status : "new" 
      });
      
      // Log the assignment activity
      await storage.createActivity({
        type: "assignment",
        title: `Lead assigned to ${assignee.fullName}`,
        description: assignmentNotes || `Lead was assigned by ${req.user.fullName}`,
        relatedTo: "lead",
        relatedId: leadId,
        createdBy: req.user.id
      });
      
      // Return the updated lead
      res.json(updatedLead);
    } catch (error) {
      console.error("Error assigning lead:", error);
      res.status(500).json({ error: "Failed to assign lead" });
    }
  });
  
  // Bulk lead assignment endpoint
  app.post("/api/leads/bulk-assign", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins and sales managers can assign leads
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const { leadIds, assignedTo, notes } = req.body;
      
      // Get the user to assign to
      const assignee = await storage.getUser(assignedTo);
      if (!assignee) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update each lead
      const results = await Promise.all(
        leadIds.map(async (leadId: number) => {
          try {
            const lead = await storage.getLead(leadId);
            if (!lead) return { id: leadId, success: false, error: "Lead not found" };
            
            // Update the lead assignment
            await storage.updateLead(leadId, { assignedTo });
            
            // Log the activity
            await storage.createActivity({
              type: "assignment",
              title: `Lead assigned to ${assignee.fullName}`,
              description: notes || `Bulk assignment by ${req.user.fullName}`,
              relatedTo: "lead",
              relatedId: leadId,
              createdBy: req.user.id
            });
            
            return { id: leadId, success: true };
          } catch (err) {
            return { id: leadId, success: false, error: (err as Error).message };
          }
        })
      );
      
      // Return results
      res.json({
        success: results.every(r => r.success),
        results
      });
    } catch (error) {
      console.error("Error in bulk lead assignment:", error);
      res.status(500).json({ error: "Failed to perform bulk assignment" });
    }
  });

  // Lead activities
  app.get("/api/leads/:id/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      if (!lead) return res.status(404).send("Lead not found");
      
      // Fetch activities related to this lead from the database
      const activities = await storage.getActivitiesByLead(leadId);
      
      res.json(activities || []);
    } catch (error) {
      console.error("Error fetching lead activities:", error);
      res.status(500).json({ error: "Failed to fetch lead activities" });
    }
  });
  
  // Lead opportunities
  app.get("/api/leads/:id/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      if (!lead) return res.status(404).send("Lead not found");
      
      // Fetch opportunities related to this lead from the database
      const opportunities = await storage.getOpportunitiesByLead(leadId);
      
      res.json(opportunities || []);
    } catch (error) {
      console.error("Error fetching lead opportunities:", error);
      res.status(500).json({ error: "Failed to fetch lead opportunities" });
    }
  });

  // Lead tasks
  app.get("/api/leads/:id/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      if (!lead) return res.status(404).send("Lead not found");
      
      // Fetch tasks related to this lead from the database
      const tasks = await storage.getTasksByLead(leadId);
      
      res.json(tasks || []);
    } catch (error) {
      console.error("Error fetching lead tasks:", error);
      res.status(500).json({ error: "Failed to fetch lead tasks" });
    }
  });

  // Contacts CRUD routes
  app.get("/api/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Extract filter parameters from query string
      const filterParams: FilterParams = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        search: req.query.search as string,
        column: req.query.column as string,
        direction: (req.query.direction as 'asc' | 'desc') || 'desc',
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        status: req.query.status as string
      };
      
      // Use the new filtered contacts method with pagination, filtering, and sorting
      const paginatedContacts = await storage.getFilteredContacts(filterParams, req.user);
      
      res.json(paginatedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      res.status(500).json({ error: "Failed to fetch contacts" });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const contactData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(contactData);
      res.status(201).json(contact);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact data" });
    }
  });
  
  app.get("/api/contacts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const contact = await storage.getContact(id);
    if (!contact) return res.status(404).send("Contact not found");
    
    // Create response object with contact data
    const contactResponse = { ...contact, companyName: null };
    
    // Fetch company name if companyId exists
    if (contact.companyId) {
      const company = await storage.getCompany(contact.companyId);
      if (company) {
        contactResponse.companyName = company.name;
      }
    }
    
    res.json(contactResponse);
  });
  
  app.patch("/api/contacts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const contactData = req.body;
      const updatedContact = await storage.updateContact(id, contactData);
      if (!updatedContact) return res.status(404).send("Contact not found");
      res.json(updatedContact);
    } catch (error) {
      res.status(400).json({ error: "Invalid contact data" });
    }
  });
  
  app.delete("/api/contacts/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContact(id);
      if (!success) return res.status(404).send("Contact not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete contact" });
    }
  });
  
  // Contact activities
  app.get("/api/contacts/:id/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      if (!contact) return res.status(404).send("Contact not found");
      
      // Get activities related to this contact from the database
      const contactActivities = await db
        .select()
        .from(activityTable)
        .where(
          and(
            eq(activityTable.relatedTo, "contact"),
            eq(activityTable.relatedId, contactId)
          )
        )
        .orderBy(desc(activityTable.createdAt));
      
      res.json(contactActivities.length ? contactActivities : []);
    } catch (error) {
      console.error("Error fetching contact activities:", error);
      res.status(500).json({ error: "Failed to fetch contact activities" });
    }
  });

  // Contact tasks
  app.get("/api/contacts/:id/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      if (!contact) return res.status(404).send("Contact not found");
      
      // Get tasks related to this contact from the database
      const contactTasks = await db
        .select()
        .from(taskTable)
        .where(
          and(
            eq(taskTable.relatedTo, "contact"),
            eq(taskTable.relatedId, contactId)
          )
        )
        .orderBy(desc(taskTable.createdAt));
      
      res.json(contactTasks.length ? contactTasks : []);
    } catch (error) {
      console.error("Error fetching contact tasks:", error);
      res.status(500).json({ error: "Failed to fetch contact tasks" });
    }
  });
  
  // Contact leads
  app.get("/api/contacts/:id/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      if (!contact) return res.status(404).send("Contact not found");
      
      // Get leads related to this contact
      const contactLeads = await storage.getLeadsByContact(contactId);
      res.json(contactLeads.length ? contactLeads : []);
    } catch (error) {
      console.error("Error fetching contact leads:", error);
      res.status(500).json({ error: "Failed to fetch leads for contact" });
    }
  });
  
  // Contact opportunities
  app.get("/api/contacts/:id/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      if (!contact) return res.status(404).send("Contact not found");
      
      // Get opportunities related to this contact from the database
      const contactOpportunities = await db
        .select()
        .from(opportunityTable)
        .where(eq(opportunityTable.contactId, contactId))
        .orderBy(desc(opportunityTable.createdAt));
      
      res.json(contactOpportunities.length ? contactOpportunities : []);
    } catch (error) {
      console.error("Error fetching contact opportunities:", error);
      res.status(500).json({ error: "Failed to fetch contact opportunities" });
    }
  });

  // Companies CRUD routes
  app.get("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let companies;
      
      // Filter companies based on user role
      if (req.user.role === 'admin') {
        // Admins see all companies
        companies = await storage.getAllCompanies();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see companies based on team-related leads and opportunities
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all companies, leads, and opportunities
        const allCompanies = await storage.getAllCompanies();
        const allLeads = await storage.getAllLeads();
        const allOpportunities = await storage.getAllOpportunities();
        
        // Get leads assigned to team
        const teamLeads = allLeads.filter(lead => 
          lead.assignedTo && userIds.includes(lead.assignedTo)
        );
        
        // Get opportunities assigned to team
        const teamOpportunities = allOpportunities.filter(opp => 
          opp.assignedTo && userIds.includes(opp.assignedTo)
        );
        
        // Get relevant company IDs from team leads and opportunities
        const companyIdsFromLeads = teamLeads
          .filter(lead => lead.companyId)
          .map(lead => lead.companyId);
          
        const companyIdsFromOpps = teamOpportunities
          .filter(opp => opp.companyId)
          .map(opp => opp.companyId);
        
        const relevantCompanyIds = [...new Set([...companyIdsFromLeads, ...companyIdsFromOpps])];
        
        // Get companies created by team members or associated with team leads/opportunities
        companies = allCompanies.filter(company => 
          userIds.includes(company.createdBy) || 
          (company.id && relevantCompanyIds.includes(company.id))
        );
      } else {
        // Sales executives see only their related companies
        const allCompanies = await storage.getAllCompanies();
        const allLeads = await storage.getAllLeads();
        const allOpportunities = await storage.getAllOpportunities();
        
        // Get leads assigned to user
        const userLeads = allLeads.filter(lead => 
          lead.assignedTo === req.user.id
        );
        
        // Get opportunities assigned to user
        const userOpportunities = allOpportunities.filter(opp => 
          opp.assignedTo === req.user.id
        );
        
        // Get relevant company IDs from user's leads and opportunities
        const companyIdsFromLeads = userLeads
          .filter(lead => lead.companyId)
          .map(lead => lead.companyId);
          
        const companyIdsFromOpps = userOpportunities
          .filter(opp => opp.companyId)
          .map(opp => opp.companyId);
        
        const relevantCompanyIds = [...new Set([...companyIdsFromLeads, ...companyIdsFromOpps])];
        
        // Get companies created by user or associated with user's leads/opportunities
        companies = allCompanies.filter(company => 
          company.createdBy === req.user.id || 
          (company.id && relevantCompanyIds.includes(company.id))
        );
      }
      
      res.json(companies);
    } catch (error) {
      console.error("Error fetching companies:", error);
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyData = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(companyData);
      res.status(201).json(company);
    } catch (error) {
      res.status(400).json({ error: "Invalid company data" });
    }
  });
  
  app.get("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const company = await storage.getCompany(id);
    if (!company) return res.status(404).send("Company not found");
    res.json(company);
  });
  
  app.patch("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const companyData = req.body;
      const updatedCompany = await storage.updateCompany(id, companyData);
      if (!updatedCompany) return res.status(404).send("Company not found");
      res.json(updatedCompany);
    } catch (error) {
      res.status(400).json({ error: "Invalid company data" });
    }
  });
  
  app.delete("/api/companies/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCompany(id);
      if (!success) return res.status(404).send("Company not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete company" });
    }
  });
  
  // Company contacts
  app.get("/api/companies/:id/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      if (!company) return res.status(404).send("Company not found");
      
      // For now, return a sample list of contacts
      const contacts = [
        { 
          id: 1, 
          firstName: "John", 
          lastName: "Smith",
          title: "CTO",
          email: "john.smith@example.com",
          phone: "212-555-1234",
          companyName: company.name
        },
        { 
          id: 2, 
          firstName: "Emily", 
          lastName: "Johnson",
          title: "Procurement Manager",
          email: "emily.johnson@example.com",
          phone: "212-555-5678",
          companyName: company.name
        },
        { 
          id: 3, 
          firstName: "Michael", 
          lastName: "Brown",
          title: "CEO",
          email: "michael.brown@example.com",
          phone: "212-555-9012",
          companyName: company.name
        }
      ];
      
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company contacts" });
    }
  });
  
  // Company opportunities
  app.get("/api/companies/:id/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyId = parseInt(req.params.id);
      const company = await storage.getCompany(companyId);
      if (!company) return res.status(404).send("Company not found");
      
      // For now, return sample opportunities
      const opportunities = [
        {
          id: 1,
          name: "Enterprise Solution Deployment",
          stage: "proposal",
          value: "85000",
          closingDate: new Date(Date.now() + 86400000 * 60).toISOString()
        },
        {
          id: 2,
          name: "IT Infrastructure Upgrade",
          stage: "qualification",
          value: "120000",
          closingDate: new Date(Date.now() + 86400000 * 90).toISOString()
        },
        {
          id: 3,
          name: "Cloud Migration Project",
          stage: "negotiation",
          value: "95000",
          closingDate: new Date(Date.now() + 86400000 * 30).toISOString()
        }
      ];
      
      res.json(opportunities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company opportunities" });
    }
  });

  // Opportunities CRUD routes with filtering, pagination, and sorting
  app.get("/api/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Extract filter parameters from query string
      const filterParams: FilterParams = {
        page: parseInt(req.query.page as string) || 1,
        pageSize: parseInt(req.query.pageSize as string) || 10,
        search: req.query.search as string,
        column: req.query.column as string,
        direction: (req.query.direction as 'asc' | 'desc') || 'desc',
        fromDate: req.query.fromDate as string,
        toDate: req.query.toDate as string,
        status: req.query.status as string
      };
      
      // Use the new filtered opportunities method
      const paginatedOpportunities = await storage.getFilteredOpportunities(filterParams, req.user);
      
      res.json(paginatedOpportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Received opportunity data:", JSON.stringify(req.body, null, 2));
      
      // Process company data - if we have a company object instead of just companyId
      let companyId = null;
      if (req.body.company && typeof req.body.company === 'object' && req.body.company.id) {
        companyId = parseInt(req.body.company.id.toString());
        console.log("POST opportunity - extracted companyId from company object:", companyId);
      } else if (req.body.companyId) {
        companyId = parseInt(req.body.companyId.toString());
      }
      
      // Similarly process contact data
      let contactId = null;
      if (req.body.contact && typeof req.body.contact === 'object' && req.body.contact.id) {
        contactId = parseInt(req.body.contact.id.toString());
        console.log("POST opportunity - extracted contactId from contact object:", contactId);
      } else if (req.body.contactId) {
        contactId = parseInt(req.body.contactId.toString());
      }
      
      // Explicitly clean the data to match our schema
      const opportunityData = {
        name: req.body.name,
        stage: req.body.stage || "qualification",
        value: req.body.value ? req.body.value.toString() : "0",
        probability: req.body.probability != null ? parseInt(req.body.probability.toString()) : 0,
        expectedCloseDate: req.body.expectedCloseDate ? new Date(req.body.expectedCloseDate) : new Date(),
        notes: req.body.notes || null,
        contactId: contactId,
        companyId: companyId,
        leadId: req.body.leadId ? parseInt(req.body.leadId.toString()) : null,
        assignedTo: req.body.assignedTo ? parseInt(req.body.assignedTo.toString()) : null,
        createdBy: req.body.createdBy ? parseInt(req.body.createdBy.toString()) : req.user.id,
      };
      
      console.log("Processed opportunity data:", JSON.stringify(opportunityData, null, 2));
      
      const opportunity = await storage.createOpportunity(opportunityData);
      
      // After creating, fetch the full opportunity with company and contact data
      // using the enhanced getOpportunity method directly from storage
      const enhancedOpportunity = await storage.getOpportunity(opportunity.id);
      
      console.log("POST opportunity - created successfully:", JSON.stringify({
        id: opportunity.id,
        name: opportunity.name,
        companyId: opportunity.companyId,
        company: enhancedOpportunity.company ? { 
          id: enhancedOpportunity.company.id,
          name: enhancedOpportunity.company.name
        } : null
      }));
      
      // Return the enhanced opportunity with all related data
      res.status(201).json(enhancedOpportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      res.status(400).json({ error: "Invalid opportunity data" });
    }
  });
  
  app.get("/api/opportunities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      // The getOpportunity method now automatically enhances the opportunity with company, contact, and lead data
      const opportunity = await storage.getOpportunity(id);
      
      if (!opportunity) {
        return res.status(404).send("Opportunity not found");
      }
      
      // Log meaningful data for debugging
      console.log("Sending enhanced opportunity:", JSON.stringify({
        id: opportunity.id,
        name: opportunity.name,
        companyId: opportunity.companyId,
        companyName: opportunity.companyName,
        company: opportunity.company ? {
          id: opportunity.company.id,
          name: opportunity.company.name
        } : null
      }));
      
      // Send the enhanced opportunity directly from the database layer
      res.json(opportunity);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      res.status(500).json({ error: "Failed to fetch opportunity details" });
    }
  });
  
  app.patch("/api/opportunities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const opportunityData = req.body;
      
      console.log("PATCH opportunity - received data:", JSON.stringify(opportunityData));
      
      // If we have a company object instead of companyId, extract the ID
      if (opportunityData.company && typeof opportunityData.company === 'object' && opportunityData.company.id) {
        opportunityData.companyId = opportunityData.company.id;
        console.log("PATCH opportunity - extracted companyId from company object:", opportunityData.companyId);
        delete opportunityData.company; // Remove the company object before update
      }
      
      // Make sure companyId is properly formatted as a number if it exists
      if (opportunityData.companyId) {
        // Convert to number if it's a string
        if (typeof opportunityData.companyId === 'string') {
          opportunityData.companyId = parseInt(opportunityData.companyId, 10);
          console.log("PATCH opportunity - converted companyId to number:", opportunityData.companyId);
        }
      }
      
      // Similarly handle contact data
      if (opportunityData.contact && typeof opportunityData.contact === 'object' && opportunityData.contact.id) {
        opportunityData.contactId = opportunityData.contact.id;
        console.log("PATCH opportunity - extracted contactId from contact object:", opportunityData.contactId);
        delete opportunityData.contact; // Remove the contact object
      }
      
      if (opportunityData.contactId && typeof opportunityData.contactId === 'string') {
        opportunityData.contactId = parseInt(opportunityData.contactId, 10);
      }
      
      // Remove any other nested objects that aren't part of the database schema
      delete opportunityData.lead;
      delete opportunityData.companyName;
      
      const updatedOpportunity = await storage.updateOpportunity(id, opportunityData);
      if (!updatedOpportunity) return res.status(404).send("Opportunity not found");
      
      // After updating, fetch the full opportunity with company and contact data directly
      // using the enhanced getOpportunity method
      const enhancedOpportunity = await storage.getOpportunity(id);
      
      console.log("PATCH opportunity - updated successfully:", JSON.stringify({
        id: updatedOpportunity.id,
        name: updatedOpportunity.name,
        companyId: updatedOpportunity.companyId,
        company: enhancedOpportunity.company ? { 
          id: enhancedOpportunity.company.id,
          name: enhancedOpportunity.company.name
        } : null
      }));
      
      // Return the enhanced opportunity object with company details
      res.json(enhancedOpportunity);
    } catch (error) {
      console.error("PATCH opportunity - error:", error);
      res.status(400).json({ error: "Invalid opportunity data" });
    }
  });
  
  // Helper function to get an enhanced opportunity with company/contact data
  async function getEnhancedOpportunity(opportunity: any) {
    let company = null;
    let contact = null;
    let lead = null;
    
    if (opportunity.companyId) {
      company = await storage.getCompany(opportunity.companyId);
    } else {
      // Try to find by name matching
      const companies = await storage.getAllCompanies();
      if (companies && companies.length > 0 && opportunity.name) {
        const potentialMatch = companies.find(c => 
          opportunity.name.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(opportunity.name.toLowerCase())
        );
        
        if (potentialMatch) {
          company = potentialMatch;
        }
      }
    }
    
    if (opportunity.contactId) {
      contact = await storage.getContact(opportunity.contactId);
    }

    if (opportunity.leadId) {
      lead = await storage.getLead(opportunity.leadId);
    }
    
    return {
      ...opportunity,
      company,
      contact,
      lead,
      companyName: company ? company.name : null
    };
  }
  
  app.delete("/api/opportunities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOpportunity(id);
      if (!success) return res.status(404).send("Opportunity not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete opportunity" });
    }
  });
  
  // Opportunity activities and tasks
  app.get("/api/opportunities/:id/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const opportunityId = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(opportunityId);
      if (!opportunity) return res.status(404).send("Opportunity not found");
      
      // Get activities from the database related to this opportunity
      const activities = await storage.getAllActivities();
      
      // Filter activities that might be related to this opportunity
      // In a real implementation, we would have a direct relation in the database
      const opportunityActivities = activities.filter(activity => 
        activity.relatedTo === 'opportunity' && 
        activity.relatedId === opportunityId
      );
      
      res.json(opportunityActivities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunity activities" });
    }
  });
  
  app.get("/api/opportunities/:id/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const opportunityId = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(opportunityId);
      if (!opportunity) return res.status(404).send("Opportunity not found");
      
      // Get tasks from the database related to this opportunity
      const tasks = await storage.getAllTasks();
      
      // Filter tasks that might be related to this opportunity
      // In a real implementation, we would have a direct relation in the database
      const opportunityTasks = tasks.filter(task => 
        task.relatedTo === 'opportunity' && 
        task.relatedId === opportunityId
      );
      
      res.json(opportunityTasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunity tasks" });
    }
  });
  
  // Get quotations by opportunity ID
  app.get("/api/opportunities/:id/quotations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const opportunityId = parseInt(req.params.id);
      const opportunity = await storage.getOpportunity(opportunityId);
      if (!opportunity) return res.status(404).send("Opportunity not found");
      
      // Get quotations related to this opportunity using the dedicated method
      const quotations = await storage.getQuotationsByOpportunity(opportunityId);
      res.json(quotations);
    } catch (error) {
      console.error("Error fetching quotations for opportunity:", error);
      res.status(500).json({ error: "Failed to fetch quotations for opportunity" });
    }
  });

  // Products CRUD routes
  app.get("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const products = await storage.getAllProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Product creation request body:", JSON.stringify(req.body));
      const productData = insertProductSchema.parse(req.body);
      console.log("Parsed product data:", JSON.stringify(productData));
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Product validation error:", error);
      res.status(400).json({ error: "Invalid product data", details: error.message || "Validation failed" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
  });
  
  app.patch("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Product update request body:", JSON.stringify(req.body));
      const id = parseInt(req.params.id);
      const productData = req.body;
      const updatedProduct = await storage.updateProduct(id, productData);
      if (!updatedProduct) return res.status(404).send("Product not found");
      res.json(updatedProduct);
    } catch (error) {
      console.error("Product update error:", error);
      res.status(400).json({ error: "Invalid product data", details: error.message || "Validation failed" });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) return res.status(404).send("Product not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  
  // Get modules for a specific product
  app.get("/api/products/:id/modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const productId = parseInt(req.params.id);
      const modules = await storage.getProductModules(productId);
      res.json(modules);
    } catch (error) {
      console.error(`Error fetching modules for product ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch product modules" });
    }
  });
  
  // Associate a module with a product
  app.post("/api/products/:id/modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Product module association request body:", JSON.stringify(req.body));
      const productId = parseInt(req.params.id);
      const productModuleData = {
        ...req.body,
        productId: productId,
        moduleId: parseInt(req.body.moduleId) || null
      };
      
      console.log("Parsed product module data:", JSON.stringify(productModuleData));
      const validatedData = insertProductModuleSchema.parse(productModuleData);
      console.log("Validated product module data:", JSON.stringify(validatedData));
      
      const productModule = await storage.createProductModule(validatedData);
      res.status(201).json(productModule);
    } catch (error) {
      console.error(`Error adding module to product ${req.params.id}:`, error);
      res.status(400).json({ 
        error: "Invalid product-module data",
        details: error.message || "Validation failed" 
      });
    }
  });
  
  // Delete all modules for a product (used during product update)
  app.delete("/api/products/:id/modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const productId = parseInt(req.params.id);
      
      // Get all product-module relationships for this product
      const modules = await storage.getProductModules(productId);
      
      // Delete each product-module relationship
      for (const module of modules) {
        if (module.productModuleId) {
          await storage.deleteProductModule(module.productModuleId);
        }
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(`Error removing modules from product ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to remove product modules" });
    }
  });
  
  // Associate a module with a product (legacy endpoint)
  app.post("/api/product-modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const productModuleData = insertProductModuleSchema.parse(req.body);
      const productModule = await storage.createProductModule(productModuleData);
      res.status(201).json(productModule);
    } catch (error) {
      console.error("Error creating product-module relationship:", error);
      res.status(400).json({ error: "Invalid product-module data" });
    }
  });
  
  // Remove a module from a product (legacy endpoint)
  app.delete("/api/product-modules/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProductModule(id);
      if (!success) return res.status(404).send("Product-module relationship not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product-module relationship" });
    }
  });
  
  // Modules CRUD routes
  app.get("/api/modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const modules = await storage.getAllModules();
      res.json(modules);
    } catch (error) {
      console.error("Error fetching modules:", error);
      res.status(500).json({ error: "Failed to fetch modules" });
    }
  });
  
  app.post("/api/modules", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const moduleData = insertModuleSchema.parse(req.body);
      const module = await storage.createModule(moduleData);
      res.status(201).json(module);
    } catch (error) {
      console.error("Error creating module:", error);
      res.status(400).json({ error: "Invalid module data" });
    }
  });
  
  app.get("/api/modules/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getModule(id);
      if (!module) return res.status(404).send("Module not found");
      res.json(module);
    } catch (error) {
      console.error(`Error fetching module ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch module" });
    }
  });
  
  app.patch("/api/modules/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const moduleData = req.body;
      const updatedModule = await storage.updateModule(id, moduleData);
      if (!updatedModule) return res.status(404).send("Module not found");
      res.json(updatedModule);
    } catch (error) {
      console.error(`Error updating module ${req.params.id}:`, error);
      res.status(400).json({ error: "Invalid module data" });
    }
  });
  
  app.delete("/api/modules/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteModule(id);
      if (!success) return res.status(404).send("Module not found");
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting module ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete module" });
    }
  });
  
  // Vendors CRUD routes
  app.get("/api/vendors", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const vendors = await storage.getAllVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Failed to fetch vendors" });
    }
  });
  
  app.post("/api/vendors", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const vendorData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(vendorData);
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(400).json({ error: "Invalid vendor data" });
    }
  });
  
  app.get("/api/vendors/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const vendor = await storage.getVendor(id);
      if (!vendor) return res.status(404).send("Vendor not found");
      res.json(vendor);
    } catch (error) {
      console.error(`Error fetching vendor ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to fetch vendor" });
    }
  });
  
  app.patch("/api/vendors/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const vendorData = req.body;
      const updatedVendor = await storage.updateVendor(id, vendorData);
      if (!updatedVendor) return res.status(404).send("Vendor not found");
      res.json(updatedVendor);
    } catch (error) {
      console.error(`Error updating vendor ${req.params.id}:`, error);
      res.status(400).json({ error: "Invalid vendor data" });
    }
  });
  
  app.delete("/api/vendors/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVendor(id);
      if (!success) return res.status(404).send("Vendor not found");
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting vendor ${req.params.id}:`, error);
      res.status(500).json({ error: "Failed to delete vendor" });
    }
  });
  
  // Modules CRUD routes - commented out due to duplicate definition (already defined above)

  // Quotations CRUD routes
  app.get("/api/quotations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let quotations;
      
      // Filter quotations based on user role
      if (req.user.role === 'admin') {
        // Admins see all quotations
        quotations = await storage.getAllQuotations();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see quotations created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all quotations
        const allQuotations = await storage.getAllQuotations();
        
        // Filter quotations that are created by the manager or any team member
        quotations = allQuotations.filter(quotation => 
          userIds.includes(quotation.createdBy)
        );
      } else {
        // Sales executives see only their created quotations
        const allQuotations = await storage.getAllQuotations();
        quotations = allQuotations.filter(quotation => 
          quotation.createdBy === req.user.id
        );
      }
      
      // Get all companies
      const companies = await storage.getAllCompanies();
      
      // Add company name to each quotation
      const enhancedQuotations = quotations.map(quotation => {
        const company = companies.find(c => c.id === quotation.companyId);
        return {
          ...quotation,
          company: company ? company.name : null
        };
      });
      
      res.json(enhancedQuotations);
    } catch (error) {
      console.error("Error fetching quotations:", error);
      res.status(500).json({ error: "Failed to fetch quotations" });
    }
  });
  
  // Get a single quotation with company and contact details
  app.get("/api/quotations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(404).send("Quotation not found");
      }
      
      // Get company and contact information if available
      let company = null;
      let contact = null;
      let opportunity = null;
      
      if (quotation.companyId) {
        company = await storage.getCompany(quotation.companyId);
      }
      
      if (quotation.contactId) {
        contact = await storage.getContact(quotation.contactId);
      }

      if (quotation.opportunityId) {
        opportunity = await storage.getOpportunity(quotation.opportunityId);
      }
      
      // Create an enhanced quotation object with company and contact details
      const enhancedQuotation = {
        ...quotation,
        company,
        contact,
        opportunity
      };
      
      res.json(enhancedQuotation);
    } catch (error) {
      console.error('Error fetching quotation:', error);
      res.status(500).json({ error: "Failed to fetch quotation" });
    }
  });
  
  // Generate PDF for a quotation
  app.get("/api/quotations/:id/pdf", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const quotation = await storage.getQuotation(id);
      
      if (!quotation) {
        return res.status(404).send('Quotation not found');
      }
      
      // Get quotation items
      const items = await storage.getQuotationItems(id);
      
      // Get company and contact information if available
      let company = null;
      let contact = null;
      
      if (quotation.companyId) {
        company = await storage.getCompany(quotation.companyId);
      }
      
      if (quotation.contactId) {
        contact = await storage.getContact(quotation.contactId);
      }
      
      // Generate PDF
      const pdfBuffer = await generateQuotationPdf(quotation, items, company, contact);
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Quotation-${quotation.quotationNumber}.pdf"`);
      
      // Send the PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating PDF:', error);
      res.status(500).send('Error generating PDF');
    }
  });

  app.post("/api/quotations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    // Debug the request
    console.log("\n=== QUOTATION CREATION ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    
    try {
      // Extract only the fields we need for minimal database insertion
      const quotationNumber = req.body.quotationNumber || `QT-${Date.now()}`;
      const createdById = req.user.id;
      
      // Clean and parse the numeric values
      const subtotal = typeof req.body.subtotal === 'string' 
        ? parseFloat(req.body.subtotal) 
        : (req.body.subtotal || 0);
        
      const tax = typeof req.body.tax === 'string' 
        ? parseFloat(req.body.tax) 
        : (req.body.tax || 0);
        
      const discount = typeof req.body.discount === 'string' 
        ? parseFloat(req.body.discount) 
        : (req.body.discount || 0);
        
      const total = typeof req.body.total === 'string' 
        ? parseFloat(req.body.total) 
        : (req.body.total || 0);
      
      // Optional additional fields  
      const status = req.body.status || "draft";
      const notes = req.body.notes || "";
      const validUntil = req.body.validUntil ? new Date(req.body.validUntil) : null;
      
      // Foreign keys - ensure empty strings are converted to null
      const opportunityId = req.body.opportunityId === "" ? null : 
                           (req.body.opportunityId ? parseInt(req.body.opportunityId) : null);
      
      const companyId = req.body.companyId === "" ? null : 
                       (req.body.companyId ? parseInt(req.body.companyId) : null);
      
      const contactId = req.body.contactId === "" ? null : 
                       (req.body.contactId ? parseInt(req.body.contactId) : null);
      
      // Direct database query
      const query = `
        INSERT INTO quotations 
        (quotation_number, created_by, opportunity_id, company_id, contact_id, 
         subtotal, tax, discount, total, status, valid_until, notes, created_at) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW()) 
        RETURNING *
      `;
        
      console.log("Executing SQL with params:", { 
        quotationNumber, createdById, opportunityId, companyId, contactId,
        subtotal, tax, discount, total, status, validUntil, notes
      });
      
      // Use pool query which is simpler than drizzle
      const result = await pool.query(query, [
        quotationNumber, createdById, opportunityId, companyId, contactId,
        subtotal, tax, discount, total, status, validUntil, notes
      ]);
      
      // Get the created quotation
      if (result && result.rows && result.rows.length > 0) {
        const quotation = result.rows[0];
        console.log("SUCCESS: Quotation created:", quotation);
        res.status(201).json(quotation);
      } else {
        throw new Error("Database insert returned no rows");
      }
    } catch (sqlError) {
      const error = sqlError as {
        message?: string;
        code?: string;
        detail?: string;
      };
      
      console.error("ERROR CREATING QUOTATION:", error);
      
      // Send a clear error response
      res.status(400).json({ 
        error: "Failed to create quotation",
        message: error.message || "Unknown error",
        code: error.code,
        detail: error.detail
      });
    }
  });
  
  // (Endpoint relocated above with enhanced functionality)
  
  app.patch("/api/quotations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      
      // First check if the quotation exists
      const existingQuotation = await storage.getQuotation(id);
      if (!existingQuotation) {
        return res.status(404).send("Quotation not found");
      }
      
      console.log("\n=== QUOTATION UPDATE ===");
      console.log("Request body:", JSON.stringify(req.body, null, 2));
      
      // Extract the values to update, ensuring proper data types
      const updateFields = [];
      const updateValues = [];
      let paramCounter = 1;
      
      // Add fields that are present in the request body
      if (req.body.quotationNumber !== undefined) {
        updateFields.push(`quotation_number = $${paramCounter++}`);
        updateValues.push(req.body.quotationNumber);
      }
      
      if (req.body.opportunityId !== undefined) {
        updateFields.push(`opportunity_id = $${paramCounter++}`);
        // Convert empty string to null for opportunityId
        updateValues.push(req.body.opportunityId === "" ? null : req.body.opportunityId);
      }
      
      if (req.body.contactId !== undefined) {
        updateFields.push(`contact_id = $${paramCounter++}`);
        // Convert empty string to null for contactId
        updateValues.push(req.body.contactId === "" ? null : req.body.contactId);
      }
      
      if (req.body.companyId !== undefined) {
        updateFields.push(`company_id = $${paramCounter++}`);
        // Convert empty string to null for companyId
        updateValues.push(req.body.companyId === "" ? null : req.body.companyId);
      }
      
      if (req.body.subtotal !== undefined) {
        updateFields.push(`subtotal = $${paramCounter++}`);
        updateValues.push(typeof req.body.subtotal === 'string' 
          ? parseFloat(req.body.subtotal) 
          : req.body.subtotal);
      }
      
      if (req.body.tax !== undefined) {
        updateFields.push(`tax = $${paramCounter++}`);
        updateValues.push(typeof req.body.tax === 'string' 
          ? parseFloat(req.body.tax) 
          : req.body.tax);
      }
      
      if (req.body.discount !== undefined) {
        updateFields.push(`discount = $${paramCounter++}`);
        updateValues.push(typeof req.body.discount === 'string' 
          ? parseFloat(req.body.discount) 
          : req.body.discount);
      }
      
      if (req.body.total !== undefined) {
        updateFields.push(`total = $${paramCounter++}`);
        updateValues.push(typeof req.body.total === 'string' 
          ? parseFloat(req.body.total) 
          : req.body.total);
      }
      
      if (req.body.status !== undefined) {
        updateFields.push(`status = $${paramCounter++}`);
        updateValues.push(req.body.status);
      }
      
      if (req.body.validUntil !== undefined) {
        updateFields.push(`valid_until = $${paramCounter++}`);
        updateValues.push(req.body.validUntil ? new Date(req.body.validUntil) : null);
      }
      
      if (req.body.notes !== undefined) {
        updateFields.push(`notes = $${paramCounter++}`);
        updateValues.push(req.body.notes);
      }
      
      // If no fields to update, return the existing quotation
      if (updateFields.length === 0) {
        return res.json(existingQuotation);
      }
      
      // Add the WHERE clause parameter
      updateValues.push(id);
      
      // Construct and execute the update query with correct parameter numbering
      const query = `
        UPDATE quotations 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramCounter}
        RETURNING *
      `;
      
      console.log("Executing update SQL:", query);
      console.log("With values:", updateValues);
      
      const result = await pool.query(query, updateValues);
      
      if (result && result.rows && result.rows.length > 0) {
        const updatedQuotation = result.rows[0];
        console.log("SUCCESS: Quotation updated:", updatedQuotation);
        res.json(updatedQuotation);
      } else {
        throw new Error("Database update returned no rows");
      }
    } catch (error: any) {
      console.error("ERROR UPDATING QUOTATION:", error);
      res.status(400).json({ 
        error: "Invalid quotation data",
        message: error.message || "Unknown error"
      });
    }
  });
  
  app.delete("/api/quotations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteQuotation(id);
      if (!success) return res.status(404).send("Quotation not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quotation" });
    }
  });
  
  // Quotation Items
  app.get("/api/quotations/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const quotationId = parseInt(req.params.id);
      const quotation = await storage.getQuotation(quotationId);
      if (!quotation) return res.status(404).send("Quotation not found");
      
      const items = await storage.getQuotationItems(quotationId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quotation items" });
    }
  });
  
  app.post("/api/quotations/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const quotationId = parseInt(req.params.id);
      const quotation = await storage.getQuotation(quotationId);
      if (!quotation) return res.status(404).send("Quotation not found");
      
      console.log("Creating quotation item - original data:", req.body);
      
      // Get the product ID and quantity as integers
      const productId = parseInt(req.body.productId);
      const quantity = parseInt(req.body.quantity);
      
      // Convert numeric values to strings for the database
      // The schema expects strings for numeric fields
      const unitPrice = String(typeof req.body.unitPrice === 'string' 
        ? parseFloat(req.body.unitPrice) 
        : req.body.unitPrice);
        
      const tax = String(req.body.tax 
        ? (typeof req.body.tax === 'string' ? parseFloat(req.body.tax) : req.body.tax) 
        : '0');
        
      const subtotal = String(typeof req.body.subtotal === 'string' 
        ? parseFloat(req.body.subtotal) 
        : req.body.subtotal);
      
      // Description field
      const description = req.body.description || '';
      
      // Direct SQL insert approach that bypasses schema validation
      const query = `
        INSERT INTO quotation_items 
        (quotation_id, product_id, description, quantity, unit_price, tax, subtotal) 
        VALUES 
        ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `;
        
      console.log("SQL params for quotation item:", { 
        quotationId, productId, description, quantity, 
        unitPrice, tax, subtotal 
      });
      
      try {
        const result = await pool.query(query, [
          quotationId,
          productId, 
          description,
          quantity,
          unitPrice,
          tax,
          subtotal
        ]);
        
        if (result && result.rows && result.rows.length > 0) {
          const item = result.rows[0];
          console.log("Quotation item created successfully:", item);
          res.status(201).json(item);
        } else {
          throw new Error("Database insert returned no rows");
        }
      } catch (sqlError) {
        const error = sqlError as { 
          detail?: string; 
          message?: string; 
          code?: string; 
        };
        
        console.error("SQL error creating quotation item:", error);
        res.status(400).json({ 
          error: "Database error creating quotation item", 
          detail: error.detail || error.message || "Unknown error",
          code: error.code
        });
      }
    } catch (error: any) {
      console.error("Error creating quotation item:", error.message);
      res.status(500).json({ 
        error: "Server error creating quotation item", 
        message: error.message 
      });
    }
  });

  // Orders CRUD routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Determine SQL query parameters based on user role
      let sqlQuery = `
        SELECT 
          so.id,
          so.order_number AS "orderNumber",
          so.quotation_id AS "quotationId",
          so.opportunity_id AS "opportunityId",
          so.contact_id AS "contactId",
          so.company_id AS "companyId",
          so.subtotal,
          so.tax,
          so.discount,
          so.total,
          so.status,
          so.order_date AS "orderDate",
          so.notes,
          so.created_at AS "createdAt",
          so.created_by AS "createdBy",
          q.quotation_number AS "quotationNumber",
          c.name AS "companyName"
        FROM 
          sales_orders so
        LEFT JOIN 
          quotations q ON so.quotation_id = q.id
        LEFT JOIN 
          companies c ON so.company_id = c.id
      `;
      
      let whereClause = '';
      let queryParams: any[] = [];
      
      if (req.user.role === 'admin') {
        // Admins see all orders - no filter needed
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see orders created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        whereClause = ' WHERE so.created_by = ANY($1)';
        queryParams.push(userIds);
      } else {
        // Sales executives see only their created orders
        whereClause = ' WHERE so.created_by = $1';
        queryParams.push(req.user.id);
      }
      
      // Complete the query
      sqlQuery = sqlQuery + whereClause + ' ORDER BY so.id DESC';
      
      // Execute the SQL query with appropriate filtering
      const result = await pool.query(sqlQuery, queryParams);
      
      console.log("Enhanced orders data from SQL query:", result.rows.slice(0, 2));
      
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching orders with SQL:", error);
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("POST /api/orders - received data:", req.body);
      
      try {
        // Add the current user as the creator
        const orderDataWithUser = {
          ...req.body,
          createdBy: req.user.id
        };
        
        console.log("POST /api/orders - processed data with user:", orderDataWithUser);
        
        const orderData = insertSalesOrderSchema.parse(orderDataWithUser);
        console.log("POST /api/orders - parsed data:", orderData);
        
        const order = await storage.createSalesOrder(orderData);
        console.log("POST /api/orders - created order:", order);
        
        res.status(201).json(order);
      } catch (validationError) {
        console.error("POST /api/orders - validation error:", validationError);
        res.status(400).json({ 
          error: "Invalid order data", 
          details: validationError.errors || validationError.message || "Validation failed"
        });
      }
    } catch (error) {
      console.error("POST /api/orders - error:", error);
      res.status(500).json({ 
        error: "Server error", 
        message: error.message || "Unknown server error"
      });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const order = await storage.getSalesOrder(id);
    if (!order) return res.status(404).send("Order not found");
    res.json(order);
  });
  
  app.patch("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const orderData = req.body;
      const updatedOrder = await storage.updateSalesOrder(id, orderData);
      if (!updatedOrder) return res.status(404).send("Order not found");
      res.json(updatedOrder);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
    }
  });
  


  app.delete("/api/orders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSalesOrder(id);
      if (!success) return res.status(404).send("Order not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete order" });
    }
  });
  
  // Sales Order Items
  app.get("/api/orders/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getSalesOrder(orderId);
      if (!order) return res.status(404).send("Order not found");
      
      const items = await storage.getSalesOrderItems(orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });
  
  // Add items to a sales order
  app.post("/api/orders/:id/items", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getSalesOrder(orderId);
      if (!order) return res.status(404).send("Order not found");
      
      // Set the sales order ID in the item data
      const itemData = {
        ...req.body,
        salesOrderId: orderId
      };
      
      console.log("Creating sales order item:", itemData);
      const item = await storage.createSalesOrderItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating sales order item:", error);
      res.status(400).json({ error: "Failed to create sales order item" });
    }
  });

  // Tasks CRUD routes
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let tasks;
      
      // Filter tasks based on user role
      if (req.user.role === 'admin') {
        // Admins see all tasks
        tasks = await storage.getAllTasks();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see tasks created by them or their team members
        // and tasks assigned to them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all tasks
        const allTasks = await storage.getAllTasks();
        
        // Filter tasks that are created by or assigned to the manager or any team member
        tasks = allTasks.filter(task => 
          userIds.includes(task.createdBy) || 
          (task.assignedTo && userIds.includes(task.assignedTo))
        );
      } else {
        // Sales executives see only their created or assigned tasks
        const allTasks = await storage.getAllTasks();
        tasks = allTasks.filter(task => 
          task.createdBy === req.user.id || 
          task.assignedTo === req.user.id
        );
      }
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("POST /api/tasks - received data:", req.body);
      
      const taskData = insertTaskSchema.parse(req.body);
      console.log("POST /api/tasks - parsed data:", taskData);
      
      const task = await storage.createTask(taskData);
      console.log("POST /api/tasks - created task:", task);
      
      res.status(201).json(task);
    } catch (error) {
      console.error("POST /api/tasks - error:", error);
      if (error.errors) {
        // If it's a zod validation error
        res.status(400).json({ error: "Invalid task data", details: error.errors });
      } else {
        res.status(400).json({ error: "Invalid task data", message: error.message });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const taskData = req.body;
      const updatedTask = await storage.updateTask(id, taskData);
      if (!updatedTask) return res.status(404).send("Task not found");
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
    }
  });
  
  app.get("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const task = await storage.getTask(id);
      
      if (!task) {
        return res.status(404).send("Task not found");
      }
      
      // Check permissions based on user role
      if (req.user.role === 'admin') {
        // Admins can view any task
        res.json(task);
      } else if (req.user.role === 'sales_manager') {
        // Sales managers can view tasks created by them or their team members
        // or tasks assigned to them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        if (userIds.includes(task.createdBy) || 
            (task.assignedTo && userIds.includes(task.assignedTo))) {
          res.json(task);
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      } else {
        // Sales executives can view only their own tasks
        // or tasks assigned to them
        if (task.createdBy === req.user.id || 
            (task.assignedTo && task.assignedTo === req.user.id)) {
          res.json(task);
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      }
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ error: "Failed to fetch task" });
    }
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      
      // Get the task first to check permissions
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).send("Task not found");
      }
      
      // Check permissions based on user role
      if (req.user.role === 'admin') {
        // Admins can delete any task
        const success = await storage.deleteTask(id);
        res.status(204).send();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers can delete tasks created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        if (userIds.includes(task.createdBy)) {
          const success = await storage.deleteTask(id);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      } else {
        // Sales executives can delete only their own tasks
        if (task.createdBy === req.user.id) {
          const success = await storage.deleteTask(id);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Activities CRUD routes
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let activities;
      
      // Filter activities based on user role
      if (req.user.role === 'admin') {
        // Admins see all activities
        activities = await storage.getAllActivities();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see activities created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all activities
        const allActivities = await storage.getAllActivities();
        
        // Filter activities that are created by the manager or any team member
        activities = allActivities.filter(activity => 
          userIds.includes(activity.createdBy)
        );
      } else {
        // Sales executives see only their created activities
        const allActivities = await storage.getAllActivities();
        activities = allActivities.filter(activity => 
          activity.createdBy === req.user.id
        );
      }
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.post("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("POST /api/activities - received data:", req.body);
      
      const activityData = insertActivitySchema.parse(req.body);
      console.log("POST /api/activities - parsed data:", activityData);
      
      const activity = await storage.createActivity(activityData);
      console.log("POST /api/activities - created activity:", activity);
      
      res.status(201).json(activity);
    } catch (error) {
      console.error("POST /api/activities - error:", error);
      if (error.errors) {
        // If it's a zod validation error
        res.status(400).json({ error: "Invalid activity data", details: error.errors });
      } else {
        res.status(400).json({ error: "Invalid activity data", message: error.message });
      }
    }
  });
  
  app.get("/api/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const activity = await storage.getActivity(id);
      
      if (!activity) {
        return res.status(404).send("Activity not found");
      }
      
      // Check permissions based on user role
      if (req.user.role === 'admin') {
        // Admins can view any activity
        res.json(activity);
      } else if (req.user.role === 'sales_manager') {
        // Sales managers can view activities created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        if (userIds.includes(activity.createdBy)) {
          res.json(activity);
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      } else {
        // Sales executives can view only their own activities
        if (activity.createdBy === req.user.id) {
          res.json(activity);
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ error: "Failed to fetch activity" });
    }
  });
  
  app.patch("/api/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const activityData = req.body;
      const updatedActivity = await storage.updateActivity(id, activityData);
      if (!updatedActivity) return res.status(404).send("Activity not found");
      res.json(updatedActivity);
    } catch (error) {
      res.status(400).json({ error: "Invalid activity data" });
    }
  });
  
  app.delete("/api/activities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      
      // Get the activity first to check permissions
      const activity = await storage.getActivity(id);
      if (!activity) {
        return res.status(404).send("Activity not found");
      }
      
      // Check permissions based on user role
      if (req.user.role === 'admin') {
        // Admins can delete any activity
        const success = await storage.deleteActivity(id);
        res.status(204).send();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers can delete activities created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        if (userIds.includes(activity.createdBy)) {
          const success = await storage.deleteActivity(id);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      } else {
        // Sales executives can delete only their own activities
        if (activity.createdBy === req.user.id) {
          const success = await storage.deleteActivity(id);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      res.status(500).json({ error: "Failed to delete activity" });
    }
  });

  // Sales Reports API
  app.get("/api/reports/sales", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get period from query parameters, default to 'monthly'
      const period = req.query.period as string || 'monthly';
      const reportData = await storage.getSalesReportData(period);
      res.json(reportData);
    } catch (error) {
      console.error("Error fetching sales report data:", error);
      res.status(500).json({ error: "Failed to fetch sales report data" });
    }
  });

  // Activity Reports API
  app.get("/api/reports/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Get period from query parameters, default to 'monthly'
      const period = req.query.period as string || 'monthly';
      const reportData = await storage.getActivityReportData(period);
      res.json(reportData);
    } catch (error) {
      console.error("Error fetching activity report data:", error);
      res.status(500).json({ error: "Failed to fetch activity report data" });
    }
  });

  // Appointment CRUD endpoints
  app.get("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let appointments;
      
      // Filter appointments based on user role
      if (req.user.role === 'admin') {
        // Admins see all appointments
        appointments = await storage.getAllAppointments();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see appointments created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all appointments
        const allAppointments = await storage.getAllAppointments();
        
        // Filter appointments that are created by or involve the manager or any team member
        appointments = allAppointments.filter(appointment => 
          userIds.includes(appointment.createdBy) || 
          (appointment.attendeeType === 'user' && userIds.includes(appointment.attendeeId))
        );
      } else {
        // Sales executives see only appointments they created or are involved in
        const allAppointments = await storage.getAllAppointments();
        appointments = allAppointments.filter(appointment => 
          appointment.createdBy === req.user.id || 
          (appointment.attendeeType === 'user' && appointment.attendeeId === req.user.id)
        );
      }
      
      // Enhance appointments with attendee names
      for (const appointment of appointments) {
        if (appointment.attendeeType === 'lead') {
          const lead = await storage.getLead(appointment.attendeeId);
          if (lead) {
            appointment.attendeeName = lead.name;
          }
        } else if (appointment.attendeeType === 'contact') {
          const contact = await storage.getContact(appointment.attendeeId);
          if (contact) {
            appointment.attendeeName = `${contact.firstName} ${contact.lastName}`;
          }
        } else if (appointment.attendeeType === 'user') {
          const user = await storage.getUser(appointment.attendeeId);
          if (user) {
            appointment.attendeeName = user.fullName;
          }
        }
      }
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Appointment create request body:", req.body);
      
      // Add createdBy field to the appointment data
      const appointmentData = {
        ...req.body,
        createdBy: req.user.id
      };
      
      try {
        const validatedData = insertAppointmentSchema.parse(appointmentData);
        console.log("Validated appointment data:", validatedData);
        const appointment = await storage.createAppointment(validatedData);
        res.status(201).json(appointment);
      } catch (validationError) {
        console.error("Appointment validation error:", validationError);
        res.status(400).json({ error: "Invalid appointment data", details: validationError });
      }
    } catch (error) {
      console.error("Appointment creation error:", error);
      res.status(500).json({ error: "Server error creating appointment" });
    }
  });
  
  app.get("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        return res.status(404).send("Appointment not found");
      }
      
      // Check permissions based on user role
      if (req.user.role === 'admin') {
        // Admins can view any appointment
        res.json(appointment);
      } else if (req.user.role === 'sales_manager') {
        // Sales managers can view appointments created by them or their team members
        // or appointments where they or their team members are attendees
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        if (userIds.includes(appointment.createdBy) || 
            (appointment.attendeeType === 'user' && userIds.includes(appointment.attendeeId))) {
          res.json(appointment);
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      } else {
        // Sales executives can view only their own appointments
        // or appointments where they are attendees
        if (appointment.createdBy === req.user.id || 
            (appointment.attendeeType === 'user' && appointment.attendeeId === req.user.id)) {
          res.json(appointment);
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });
  
  app.patch("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const appointmentData = req.body;
      const updatedAppointment = await storage.updateAppointment(id, appointmentData);
      if (!updatedAppointment) return res.status(404).send("Appointment not found");
      res.json(updatedAppointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
    }
  });
  
  app.delete("/api/appointments/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      console.log(`Trying to delete appointment with ID: ${id}`);
      
      // Get the appointment first to check permissions
      const appointment = await storage.getAppointment(id);
      
      if (!appointment) {
        console.error(`Appointment with ID ${id} not found`);
        // Even if the appointment is not found, return success to handle the case
        // where it might have been deleted already
        return res.status(204).send();
      }
      
      console.log(`Found appointment:`, appointment);
      
      // Check permissions based on user role
      if (req.user.role === 'admin') {
        // Admins can delete any appointment
        console.log(`Admin user deleting appointment`);
        const success = await storage.deleteAppointment(id);
        console.log(`Delete result: ${success}`);
        res.status(204).send();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers can delete appointments created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        if (userIds.includes(appointment.createdBy) || 
            (appointment.attendeeType === 'user' && userIds.includes(appointment.attendeeId))) {
          console.log(`Sales manager deleting appointment`);
          const success = await storage.deleteAppointment(id);
          console.log(`Delete result: ${success}`);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      } else {
        // Sales executives can delete only their own appointments
        // or appointments where they are attendees (only if they created it)
        if (appointment.createdBy === req.user.id) {
          console.log(`Sales executive deleting appointment`);
          const success = await storage.deleteAppointment(id);
          console.log(`Delete result: ${success}`);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      // Return success even if there was an error to gracefully handle issues
      res.status(204).send();
    }
  });

  // Appointments by attendee
  app.get("/api/appointments/by-attendee/:type/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const attendeeType = req.params.type;
      const attendeeId = parseInt(req.params.id);
      const appointments = await storage.getAppointmentsByAttendee(attendeeType, attendeeId);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Sales Targets routes
  app.get("/api/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let targets;
      
      // Filter targets based on user role
      if (req.user.role === 'admin') {
        // Admins see all targets
        targets = await storage.getAllSalesTargets();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see targets for their team
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        
        // Get all targets
        const allTargets = await storage.getAllSalesTargets();
        
        // Filter targets for team members only
        targets = allTargets.filter(target => 
          teamMemberIds.includes(target.userId) || target.userId === req.user.id
        );
      } else {
        // Sales executives see only their own targets
        targets = await storage.getSalesTargetsByUser(req.user.id);
      }
      
      res.json(targets || []);
    } catch (error) {
      console.error("Error fetching sales targets:", error);
      res.status(500).json({ error: "Failed to fetch sales targets" });
    }
  });
  
  app.get("/api/sales-targets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const targetId = parseInt(req.params.id);
      if (isNaN(targetId)) {
        return res.status(400).json({ error: "Invalid target ID" });
      }
      
      const target = await storage.getSalesTarget(targetId);
      
      if (!target) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      
      // Check if the user has permission to view this target
      if (req.user.role !== 'admin' && 
          req.user.role !== 'sales_manager' && 
          target.userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to view this target" });
      }
      
      res.json(target);
    } catch (error) {
      console.error("Error fetching sales target:", error);
      res.status(500).json({ error: "Failed to fetch sales target" });
    }
  });
  
  app.get("/api/users/:userId/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
      }
      
      // Check if the user has permission to view these targets
      if (req.user.role !== 'admin' && 
          req.user.role !== 'sales_manager' && 
          userId !== req.user.id) {
        return res.status(403).json({ error: "You don't have permission to view these targets" });
      }
      
      const targets = await storage.getSalesTargetsByUser(userId);
      res.json(targets || []);
    } catch (error) {
      console.error("Error fetching user sales targets:", error);
      res.status(500).json({ error: "Failed to fetch user sales targets" });
    }
  });
  
  app.get("/api/companies/:companyId/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyId = parseInt(req.params.companyId);
      if (isNaN(companyId)) {
        return res.status(400).json({ error: "Invalid company ID" });
      }
      
      const targets = await storage.getSalesTargetsByCompany(companyId);
      
      // Filter targets based on user role
      let filteredTargets = targets;
      if (req.user.role === 'sales_executive') {
        // Sales executives see only their own targets
        filteredTargets = targets.filter(target => target.userId === req.user.id);
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see targets for their team
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        // Filter targets for team members only
        filteredTargets = targets.filter(target => 
          teamMemberIds.includes(target.userId) || target.userId === req.user.id
        );
      }
      
      res.json(filteredTargets || []);
    } catch (error) {
      console.error("Error fetching company sales targets:", error);
      res.status(500).json({ error: "Failed to fetch company sales targets" });
    }
  });
  
  app.post("/api/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Validate the request body using the schema
      const parseResult = insertSalesTargetSchema.safeParse({
        ...req.body,
        createdBy: req.user.id
      });
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid sales target data", 
          details: parseResult.error 
        });
      }
      
      // Check if the user has permission to create targets
      if (req.user.role === 'sales_executive' && parseResult.data.userId !== req.user.id) {
        return res.status(403).json({ 
          error: "Sales executives can only create targets for themselves" 
        });
      }
      
      // For sales managers, check if the target is for themselves or a team member
      if (req.user.role === 'sales_manager') {
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        if (parseResult.data.userId !== req.user.id && !teamMemberIds.includes(parseResult.data.userId)) {
          return res.status(403).json({ 
            error: "You can only create targets for yourself or your team members" 
          });
        }
      }
      
      // Create the sales target
      const newTarget = await storage.createSalesTarget(parseResult.data);
      res.status(201).json(newTarget);
    } catch (error) {
      console.error("Error creating sales target:", error);
      res.status(500).json({ error: "Failed to create sales target" });
    }
  });
  
  app.patch("/api/sales-targets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const targetId = parseInt(req.params.id);
      if (isNaN(targetId)) {
        return res.status(400).json({ error: "Invalid target ID" });
      }
      
      // Get the existing target
      const existingTarget = await storage.getSalesTarget(targetId);
      if (!existingTarget) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      
      // Check if the user has permission to update this target
      if (req.user.role === 'sales_executive' && existingTarget.userId !== req.user.id) {
        return res.status(403).json({ 
          error: "Sales executives can only update their own targets" 
        });
      }
      
      // For sales managers, check if the target is for themselves or a team member
      if (req.user.role === 'sales_manager') {
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        if (existingTarget.userId !== req.user.id && !teamMemberIds.includes(existingTarget.userId)) {
          return res.status(403).json({ 
            error: "You can only update targets for yourself or your team members" 
          });
        }
      }
      
      // Update the target
      const updatedTarget = await storage.updateSalesTarget(targetId, req.body);
      if (!updatedTarget) {
        return res.status(404).json({ error: "Failed to update sales target" });
      }
      
      res.json(updatedTarget);
    } catch (error) {
      console.error("Error updating sales target:", error);
      res.status(500).json({ error: "Failed to update sales target" });
    }
  });
  
  app.delete("/api/sales-targets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const targetId = parseInt(req.params.id);
      if (isNaN(targetId)) {
        return res.status(400).json({ error: "Invalid target ID" });
      }
      
      // Get the existing target
      const existingTarget = await storage.getSalesTarget(targetId);
      if (!existingTarget) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      
      // Check if the user has permission to delete this target
      if (req.user.role === 'sales_executive') {
        return res.status(403).json({ 
          error: "Sales executives cannot delete targets" 
        });
      }
      
      // For sales managers, check if the target is for themselves or a team member
      if (req.user.role === 'sales_manager') {
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        if (existingTarget.userId !== req.user.id && !teamMemberIds.includes(existingTarget.userId)) {
          return res.status(403).json({ 
            error: "You can only delete targets for yourself or your team members" 
          });
        }
      }
      
      // Delete the target
      const success = await storage.deleteSalesTarget(targetId);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete sales target" });
      }
      
      res.sendStatus(204);
    } catch (error) {
      console.error("Error deleting sales target:", error);
      res.status(500).json({ error: "Failed to delete sales target" });
    }
  });

  // Teams CRUD routes
  app.get("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins and sales managers can view all teams
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });
  
  app.post("/api/teams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can create teams
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      console.log("Team creation request body:", req.body);
      
      // Validate the team data
      if (!req.body.name) {
        return res.status(400).json({ error: "Team name is required" });
      }
      
      // Add the current user as the creator
      const teamData = {
        name: req.body.name,
        description: req.body.description || null,
        createdBy: req.user.id
      };
      
      console.log("Creating team with data:", teamData);
      
      // Create the team
      const team = await storage.createTeam(teamData);
      console.log("Team created successfully:", team);
      
      // Return the created team
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      
      // Provide more detailed error message
      let errorMessage = "Invalid team data";
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      res.status(400).json({ error: errorMessage });
    }
  });
  
  app.get("/api/teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Can only view teams if you're admin, manager, or a member of the team
    const id = parseInt(req.params.id);
    
    try {
      const team = await storage.getTeam(id);
      if (!team) return res.status(404).send("Team not found");
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager' && req.user.teamId !== id) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: "Failed to fetch team" });
    }
  });
  
  app.patch("/api/teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can update teams
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const teamData = req.body;
      const updatedTeam = await storage.updateTeam(id, teamData);
      if (!updatedTeam) return res.status(404).send("Team not found");
      res.json(updatedTeam);
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(400).json({ error: "Invalid team data" });
    }
  });
  
  app.delete("/api/teams/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can delete teams
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTeam(id);
      if (!success) return res.status(404).send("Team not found");
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ error: "Failed to delete team" });
    }
  });
  
  // Team members endpoints
  app.get("/api/teams/:id/members", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const teamId = parseInt(req.params.id);
    
    try {
      const team = await storage.getTeam(teamId);
      if (!team) return res.status(404).send("Team not found");
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager' && req.user.teamId !== teamId) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const members = await storage.getTeamMembers(teamId);
      
      // Remove sensitive information
      const sanitizedMembers = members.map(member => ({
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        role: member.role,
        isActive: member.isActive
      }));
      
      res.json(sanitizedMembers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      res.status(500).json({ error: "Failed to fetch team members" });
    }
  });
  
  // Team leads endpoint
  app.get("/api/teams/:id/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const teamId = parseInt(req.params.id);
    
    try {
      const team = await storage.getTeam(teamId);
      if (!team) return res.status(404).send("Team not found");
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager' && req.user.teamId !== teamId) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const leads = await storage.getTeamLeads(teamId);
      res.json(leads);
    } catch (error) {
      console.error("Error fetching team leads:", error);
      res.status(500).json({ error: "Failed to fetch team leads" });
    }
  });
  
  // Team opportunities endpoint
  app.get("/api/teams/:id/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const teamId = parseInt(req.params.id);
    
    try {
      const team = await storage.getTeam(teamId);
      if (!team) return res.status(404).send("Team not found");
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager' && req.user.teamId !== teamId) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const opportunities = await storage.getTeamOpportunities(teamId);
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching team opportunities:", error);
      res.status(500).json({ error: "Failed to fetch team opportunities" });
    }
  });
  
  // User team assignment endpoint
  app.patch("/api/users/:id/assign-team", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can assign users to teams
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      const { teamId } = req.body;
      
      if (teamId === undefined) {
        return res.status(400).json({ error: "Team ID is required" });
      }
      
      // If teamId is not null, verify the team exists
      if (teamId !== null) {
        const team = await storage.getTeam(teamId);
        if (!team) return res.status(404).json({ error: "Team not found" });
      }
      
      // Update the user's team
      const updatedUser = await storage.updateUser(userId, { teamId });
      if (!updatedUser) return res.status(404).json({ error: "User not found" });
      
      // Create activity log
      await storage.createActivity({
        type: "team_assignment",
        title: `User assigned to ${teamId ? 'team' : 'no team'}`,
        description: `User was ${teamId ? 'assigned to a team' : 'removed from team'} by ${req.user.fullName}`,
        relatedTo: "user",
        relatedId: userId,
        createdBy: req.user.id
      });
      
      res.json({ 
        success: true, 
        message: `User ${updatedUser.fullName} ${teamId ? 'assigned to team' : 'removed from team'}` 
      });
    } catch (error) {
      console.error("Error assigning user to team:", error);
      res.status(500).json({ error: "Failed to assign user to team" });
    }
  });
  
  // User manager assignment endpoint
  app.patch("/api/users/:id/assign-manager", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can assign managers
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      const { managerId } = req.body;
      
      if (managerId === undefined) {
        return res.status(400).json({ error: "Manager ID is required" });
      }
      
      // If managerId is not null, verify the manager exists and has a sales_manager role
      if (managerId !== null) {
        const manager = await storage.getUser(managerId);
        if (!manager) return res.status(404).json({ error: "Manager not found" });
        if (manager.role !== 'sales_manager') {
          return res.status(400).json({ error: "Assigned user is not a sales manager" });
        }
      }
      
      // Update the user's manager
      const updatedUser = await storage.updateUser(userId, { managerId });
      if (!updatedUser) return res.status(404).json({ error: "User not found" });
      
      // Create activity log
      await storage.createActivity({
        type: "manager_assignment",
        title: `User assigned to ${managerId ? 'manager' : 'no manager'}`,
        description: `User was ${managerId ? 'assigned to a manager' : 'removed from manager'} by ${req.user.fullName}`,
        relatedTo: "user",
        relatedId: userId,
        createdBy: req.user.id
      });
      
      res.json({ 
        success: true, 
        message: `User ${updatedUser.fullName} ${managerId ? 'assigned to manager' : 'removed from manager'}` 
      });
    } catch (error) {
      console.error("Error assigning manager to user:", error);
      res.status(500).json({ error: "Failed to assign manager to user" });
    }
  });
  
  // General endpoint for updating user information
  app.patch("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins can update user information
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const userId = parseInt(req.params.id);
      
      // Get allowed fields for update
      const updates: Record<string, any> = {};
      
      // Check each field that can be updated
      if (req.body.role !== undefined) {
        updates.role = req.body.role;
      }
      
      if (req.body.isActive !== undefined) {
        updates.isActive = req.body.isActive;
      }
      
      if (req.body.fullName !== undefined) {
        updates.fullName = req.body.fullName;
      }
      
      if (req.body.email !== undefined) {
        updates.email = req.body.email;
      }
      
      // If nothing to update, return error
      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }
      
      console.log(`Updating user ${userId} with:`, updates);
      
      // Update the user
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) return res.status(404).json({ error: "User not found" });
      
      // Create activity log
      await storage.createActivity({
        type: "user_update",
        title: `User information updated`,
        description: `User information was updated by ${req.user.fullName}`,
        relatedTo: "user",
        relatedId: userId,
        createdBy: req.user.id
      });
      
      // If active status changed, add specific entry
      if ('isActive' in updates) {
        await storage.createActivity({
          type: "user_status",
          title: `User ${updates.isActive ? 'activated' : 'deactivated'}`,
          description: `User was ${updates.isActive ? 'activated' : 'deactivated'} by ${req.user.fullName}`,
          relatedTo: "user",
          relatedId: userId,
          createdBy: req.user.id
        });
      }
      
      res.json({
        success: true,
        user: updatedUser,
        message: `User ${updatedUser.fullName} updated successfully`
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Convert order to invoice
  app.post("/api/orders/:id/generate-invoice", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getSalesOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // In a real world scenario, we would perform more complex
      // business logic here, like updating inventory, creating financial records, etc.
      
      // Set the invoice date to now to mark this as a proper invoice
      const invoiceDate = new Date();
      
      // Update the order status and set the invoice_date
      const updatedOrder = await storage.updateSalesOrder(orderId, { 
        status: "processing",
        invoiceDate: invoiceDate
      });
      
      // Log the activity
      await storage.createActivity({
        type: "order",
        title: `Invoice generated for order ${order.orderNumber}`,
        description: `Order ${order.orderNumber} has been converted to an invoice`,
        relatedTo: "order",
        relatedId: orderId,
        createdBy: req.user.id
      });
      
      res.json({ 
        success: true, 
        order: updatedOrder,
        message: `Invoice for order ${order.orderNumber} generated successfully`
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ error: "Failed to generate invoice" });
    }
  });

  // Invoice endpoints
  app.get("/api/invoices", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      // Base query to get orders that have been converted to invoices
      let query = `
        SELECT 
          so.id,
          so.order_number,
          CONCAT('INV-', so.order_number) as invoice_number,
          so.quotation_id,
          so.opportunity_id,
          so.company_id,
          so.contact_id,
          so.total,
          so.status,
          so.order_date,
          so.created_at,
          so.created_by,
          q.quotation_number,
          c.name as company_name
        FROM sales_orders so
        LEFT JOIN quotations q ON so.quotation_id = q.id
        LEFT JOIN companies c ON so.company_id = c.id
        WHERE (so.invoice_date IS NOT NULL OR so.payment_date IS NOT NULL)
      `;
      
      // Add team-based filtering based on user role
      const queryParams = [];
      let paramIndex = 1;
      
      if (req.user.role === 'admin') {
        // Admins see all invoices - no additional filters
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see invoices created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        query += ` AND so.created_by = ANY($${paramIndex++})`;
        queryParams.push(userIds);
      } else {
        // Sales executives see only their created invoices
        query += ` AND so.created_by = $${paramIndex++}`;
        queryParams.push(req.user.id);
      }
      
      // Add sorting
      query += ` ORDER BY so.created_at DESC`;
      
      // Execute the query with parameters
      const invoices = await pool.query(query, queryParams);
      res.json(invoices.rows);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Failed to fetch invoices" });
    }
  });
  
  // Get a single invoice by ID
  app.get("/api/invoices/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.id);
      
      // Determine query based on user role
      let query = `
        SELECT 
          so.id,
          so.order_number,
          CONCAT('INV-', so.order_number) as invoice_number,
          so.quotation_id,
          so.opportunity_id,
          so.company_id,
          so.contact_id,
          so.total,
          so.subtotal,
          so.tax,
          so.discount,
          so.status,
          so.notes,
          so.order_date,
          so.invoice_date,
          so.payment_date,
          so.created_at,
          so.created_by,
          q.quotation_number,
          c.name as company_name,
          CONCAT(ct.first_name, ' ', ct.last_name) as contact_name
        FROM sales_orders so
        LEFT JOIN quotations q ON so.quotation_id = q.id
        LEFT JOIN companies c ON so.company_id = c.id
        LEFT JOIN contacts ct ON so.contact_id = ct.id
        WHERE so.id = $1
      `;
      
      const queryParams = [orderId];
      let paramIndex = 2;
      
      // Add access control filters
      if (req.user.role !== 'admin') {
        if (req.user.role === 'sales_manager') {
          // Get list of team members
          const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
          const userIds = [...teamMemberIds, req.user.id];
          
          query += ` AND so.created_by = ANY($${paramIndex++})`;
          queryParams.push(userIds);
        } else {
          // Sales executives can only see their own invoices
          query += ` AND so.created_by = $${paramIndex++}`;
          queryParams.push(req.user.id);
        }
      }
      
      const result = await pool.query(query, queryParams);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error fetching invoice:", error);
      res.status(500).json({ error: "Failed to fetch invoice" });
    }
  });

  // Generate PDF for an invoice
  app.get("/api/invoices/:id/pdf", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getSalesOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Generate an invoice number if not provided
      const invoiceNumber = `INV-${order.orderNumber}`;
      
      // Get related data needed for the invoice
      const orderItems = await storage.getSalesOrderItems(orderId);
      
      let company = null;
      if (order.companyId) {
        company = await storage.getCompany(order.companyId);
      }
      
      let contact = null;
      if (order.contactId) {
        contact = await storage.getContact(order.contactId);
      }
      
      // Generate the PDF
      const pdfBuffer = await generateInvoicePdf(order, orderItems, company, contact, invoiceNumber);
      
      // Set response headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoiceNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      
      // Send the PDF
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating invoice PDF:", error);
      res.status(500).json({ error: "Failed to generate invoice PDF" });
    }
  });

  // Send invoice via email endpoint
  app.post("/api/invoices/:id/email", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.id);
      const { email, message } = req.body;
      
      const order = await storage.getSalesOrder(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Generate an invoice number
      const invoiceNumber = `INV-${order.orderNumber}`;
      
      // In a real implementation, this would send an actual email with the PDF attached
      // For now, we'll just simulate the email sending
      
      // Log the activity
      await storage.createActivity({
        type: "email",
        title: `Invoice ${invoiceNumber} sent via email`,
        description: `Invoice for order ${order.orderNumber} was sent to ${email}`,
        relatedTo: "order",
        relatedId: orderId,
        createdBy: req.user.id
      });
      
      res.json({ 
        success: true, 
        message: `Invoice ${invoiceNumber} sent to ${email}`
      });
    } catch (error) {
      console.error("Error sending invoice email:", error);
      res.status(500).json({ error: "Failed to send invoice email" });
    }
  });

  // Mark invoice as paid endpoint
  app.patch("/api/invoices/:id/mark-paid", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getSalesOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      // Update the order status to completed (paid)
      const updatedOrder = await storage.updateSalesOrder(orderId, { 
        status: "completed",
        paymentDate: new Date()
      });
      
      // Log the payment activity
      await storage.createActivity({
        type: "payment",
        title: `Payment received for Order ${order.orderNumber}`,
        description: `Order marked as paid by ${req.user.fullName}`,
        relatedTo: "order",
        relatedId: orderId,
        createdBy: req.user.id
      });
      
      res.json({ 
        success: true, 
        order: updatedOrder,
        message: `Order ${order.orderNumber} marked as paid`
      });
    } catch (error) {
      console.error("Error marking invoice as paid:", error);
      res.status(500).json({ error: "Failed to mark invoice as paid" });
    }
  });

  /* --- Team Management Routes --- */
  // Team management routes were moved to the "Teams CRUD routes" section above

  app.patch('/api/users/:id/assign-team', async (req, res) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Permission denied" });
      }

      const userId = parseInt(req.params.id);
      const { teamId } = req.body;
      
      // Check if user exists
      const userToUpdate = await storage.getUser(userId);
      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // If teamId is provided, check if team exists
      if (teamId !== null) {
        const team = await storage.getTeam(teamId);
        if (!team) {
          return res.status(404).json({ error: "Team not found" });
        }
      }
      
      // Update user's team
      const updatedUser = await storage.updateUser(userId, { teamId: teamId || null });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user's team" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error assigning user to team:", error);
      res.status(500).json({ error: "Failed to assign user to team" });
    }
  });

  app.patch('/api/users/:id/assign-manager', async (req, res) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Permission denied" });
      }

      const userId = parseInt(req.params.id);
      const { managerId } = req.body;
      
      // Check if user exists
      const userToUpdate = await storage.getUser(userId);
      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // If managerId is provided, check if manager exists and is a manager
      if (managerId !== null) {
        const manager = await storage.getUser(managerId);
        if (!manager) {
          return res.status(404).json({ error: "Manager not found" });
        }
        
        if (manager.role !== 'sales_manager' && manager.role !== 'admin') {
          return res.status(400).json({ error: "Selected user is not a manager" });
        }
        
        // Prevent circular reporting relationship
        if (managerId === userId) {
          return res.status(400).json({ error: "User cannot be their own manager" });
        }
      }
      
      // Update user's manager
      const updatedUser = await storage.updateUser(userId, { managerId: managerId || null });
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user's manager" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error assigning manager:", error);
      res.status(500).json({ error: "Failed to assign manager" });
    }
  });

  // Update user role endpoint
  app.patch('/api/users/:id', async (req, res) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Permission denied" });
      }

      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      // Check if user exists
      const userToUpdate = await storage.getUser(userId);
      if (!userToUpdate) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user
      const updatedUser = await storage.updateUser(userId, updates);
      
      if (!updatedUser) {
        return res.status(500).json({ error: "Failed to update user" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Sales Targets routes
  app.get("/api/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let salesTargets;
      
      // Filter targets based on user role
      if (req.user.role === 'admin') {
        // Admins see all targets
        salesTargets = await storage.getAllSalesTargets();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see targets for them and their team
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const allTargets = await storage.getAllSalesTargets();
        
        // Filter targets that are for the manager or any team member
        salesTargets = allTargets.filter(target => 
          target.userId === req.user.id || teamMemberIds.includes(target.userId)
        );
      } else {
        // Sales executives see only their targets
        salesTargets = await storage.getSalesTargetsByUser(req.user.id);
      }
      
      res.json(salesTargets);
    } catch (error) {
      console.error("Error fetching sales targets:", error);
      res.status(500).json({ error: "Failed to fetch sales targets" });
    }
  });
  
  app.get("/api/sales-targets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const targetId = parseInt(req.params.id);
      const target = await storage.getSalesTarget(targetId);
      
      if (!target) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager' && target.userId !== req.user.id) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      res.json(target);
    } catch (error) {
      console.error("Error fetching sales target:", error);
      res.status(500).json({ error: "Failed to fetch sales target" });
    }
  });
  
  app.get("/api/users/:userId/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const userId = parseInt(req.params.userId);
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager' && req.user.id !== userId) {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const targets = await storage.getSalesTargetsByUser(userId);
      res.json(targets);
    } catch (error) {
      console.error("Error fetching user sales targets:", error);
      res.status(500).json({ error: "Failed to fetch user sales targets" });
    }
  });
  
  app.get("/api/companies/:companyId/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const companyId = parseInt(req.params.companyId);
      const targets = await storage.getSalesTargetsByCompany(companyId);
      
      if (req.user.role === 'sales_executive') {
        // Filter to only show the user's targets
        const filteredTargets = targets.filter(target => target.userId === req.user.id);
        res.json(filteredTargets);
      } else {
        res.json(targets);
      }
    } catch (error) {
      console.error("Error fetching company sales targets:", error);
      res.status(500).json({ error: "Failed to fetch company sales targets" });
    }
  });
  
  app.post("/api/sales-targets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      // Add the creating user's ID
      req.body.createdBy = req.user.id;
      
      const targetData = insertSalesTargetSchema.parse(req.body);
      const target = await storage.createSalesTarget(targetData);
      res.status(201).json(target);
    } catch (error) {
      console.error("Error creating sales target:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      
      res.status(500).json({ error: "Failed to create sales target" });
    }
  });
  
  app.patch("/api/sales-targets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const targetId = parseInt(req.params.id);
      const target = await storage.getSalesTarget(targetId);
      
      if (!target) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      
      // Check permissions
      if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
        return res.status(403).json({ error: "Permission denied" });
      }
      
      const updates = req.body;
      delete updates.id; // Don't allow modifying the ID
      delete updates.createdAt; // Don't allow modifying the creation date
      delete updates.createdBy; // Don't allow modifying the creator
      
      const updatedTarget = await storage.updateSalesTarget(targetId, updates);
      res.json(updatedTarget);
    } catch (error) {
      console.error("Error updating sales target:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      
      res.status(500).json({ error: "Failed to update sales target" });
    }
  });
  
  app.delete("/api/sales-targets/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    try {
      const targetId = parseInt(req.params.id);
      const success = await storage.deleteSalesTarget(targetId);
      
      if (!success) {
        return res.status(404).json({ error: "Sales target not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sales target:", error);
      res.status(500).json({ error: "Failed to delete sales target" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
