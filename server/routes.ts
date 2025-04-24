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
  insertQuotationSchema,
  insertQuotationItemSchema,
  insertSalesOrderSchema,
  insertTaskSchema,
  insertActivitySchema,
  insertAppointmentSchema,
  insertTeamSchema,
  type User,
  type Team,
  tasks as taskTable,
  activities as activityTable,
  opportunities as opportunityTable
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { generateQuotationPdf, generateInvoicePdf } from "./pdf-generator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Users endpoints (for assignments)
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins and sales managers can view the user list
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
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
      // Get team-specific stats if the user is a sales_manager
      if (req.user.role === 'sales_manager') {
        // For sales managers, get stats for their team only
        const stats = await storage.getTeamDashboardStats(req.user.id);
        res.json(stats);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get stats for only their assigned data
        const stats = await storage.getUserDashboardStats(req.user.id);
        res.json(stats);
      } else {
        // For admins, get all stats
        const stats = await storage.getDashboardStats();
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
      if (req.user.role === 'sales_manager') {
        // For sales managers, get pipeline data for their team only
        const pipeline = await storage.getTeamPipelineData(req.user.id);
        res.json(pipeline);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get pipeline data for only their assigned data
        const pipeline = await storage.getUserPipelineData(req.user.id);
        res.json(pipeline);
      } else {
        // For admins, get all pipeline data
        const pipeline = await storage.getPipelineData();
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
      if (req.user.role === 'sales_manager') {
        // For sales managers, get opportunities for their team only
        const opportunities = await storage.getTeamRecentOpportunities(req.user.id);
        res.json(opportunities);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get opportunities they own
        const opportunities = await storage.getUserRecentOpportunities(req.user.id);
        res.json(opportunities);
      } else {
        // For admins, get all opportunities
        const opportunities = await storage.getRecentOpportunities();
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
      if (req.user.role === 'sales_manager') {
        // For sales managers, get tasks for their team only
        const tasks = await storage.getTeamTodayTasks(req.user.id);
        res.json(tasks);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get only their tasks
        const tasks = await storage.getUserTodayTasks(req.user.id);
        res.json(tasks);
      } else {
        // For admins, get all tasks
        const tasks = await storage.getTodayTasks();
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
      if (req.user.role === 'sales_manager') {
        // For sales managers, get activities for their team only
        const activities = await storage.getTeamRecentActivities(req.user.id);
        res.json(activities);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get only activities related to their work
        const activities = await storage.getUserRecentActivities(req.user.id);
        res.json(activities);
      } else {
        // For admins, get all activities
        const activities = await storage.getRecentActivities();
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
      if (req.user.role === 'sales_manager') {
        // For sales managers, get lead sources for their team only
        const leadSources = await storage.getTeamLeadSources(req.user.id);
        res.json(leadSources);
      } else if (req.user.role === 'sales_executive') {
        // For sales executives, get only their lead sources
        const leadSources = await storage.getUserLeadSources(req.user.id);
        res.json(leadSources);
      } else {
        // For admins, get all lead sources
        const leadSources = await storage.getLeadSources();
        res.json(leadSources);
      }
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({ error: "Failed to fetch lead sources data" });
    }
  });

  // Leads CRUD routes
  app.get("/api/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let leads;
      // Filter leads based on user role
      if (req.user.role === 'admin') {
        // Admins see all leads
        leads = await storage.getAllLeads();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see leads assigned to them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all leads
        const allLeads = await storage.getAllLeads();
        
        // Filter leads that are assigned to the manager or any team member
        leads = allLeads.filter(lead => 
          !lead.assignedTo || userIds.includes(lead.assignedTo)
        );
      } else {
        // Sales executives see only their assigned leads
        const allLeads = await storage.getAllLeads();
        leads = allLeads.filter(lead => 
          !lead.assignedTo || lead.assignedTo === req.user.id
        );
      }
      
      res.json(leads);
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
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.status(201).json(lead);
    } catch (error) {
      res.status(400).json({ error: "Invalid lead data" });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const leadData = req.body;
      const updatedLead = await storage.updateLead(id, leadData);
      if (!updatedLead) return res.status(404).send("Lead not found");
      res.json(updatedLead);
    } catch (error) {
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
      let contacts;
      
      // Filter contacts based on user role
      if (req.user.role === 'admin') {
        // Admins see all contacts
        contacts = await storage.getAllContacts();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see contacts based on team-related leads and opportunities
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all contacts
        const allContacts = await storage.getAllContacts();
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
        
        // Get relevant contact IDs from team opportunities
        const contactIdsFromOpps = teamOpportunities
          .filter(opp => opp.contactId)
          .map(opp => opp.contactId);
        
        // Get contacts created by team members
        contacts = allContacts.filter(contact => 
          userIds.includes(contact.createdBy) || 
          (contact.id && contactIdsFromOpps.includes(contact.id))
        );
      } else {
        // Sales executives see only their related contacts
        const allContacts = await storage.getAllContacts();
        const allOpportunities = await storage.getAllOpportunities();
        
        // Get opportunities assigned to user
        const userOpportunities = allOpportunities.filter(opp => 
          opp.assignedTo === req.user.id
        );
        
        // Get contact IDs from user's opportunities
        const contactIdsFromOpps = userOpportunities
          .filter(opp => opp.contactId)
          .map(opp => opp.contactId);
        
        // Get contacts created by user or related to their opportunities
        contacts = allContacts.filter(contact => 
          contact.createdBy === req.user.id || 
          (contact.id && contactIdsFromOpps.includes(contact.id))
        );
      }
      
      // For each contact, fetch company name if companyId exists
      const contactsWithCompanyNames = await Promise.all(
        contacts.map(async (contact) => {
          if (contact.companyId) {
            const company = await storage.getCompany(contact.companyId);
            return {
              ...contact,
              companyName: company ? company.name : null
            };
          }
          return contact;
        })
      );
      
      res.json(contactsWithCompanyNames);
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

  // Opportunities CRUD routes
  app.get("/api/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      let opportunities;
      
      // Filter opportunities based on user role
      if (req.user.role === 'admin') {
        // Admins see all opportunities
        opportunities = await storage.getAllOpportunities();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers see opportunities assigned to them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        // Get all opportunities
        const allOpportunities = await storage.getAllOpportunities();
        
        // Filter opportunities that are assigned to the manager or any team member
        opportunities = allOpportunities.filter(opp => 
          !opp.assignedTo || userIds.includes(opp.assignedTo)
        );
      } else {
        // Sales executives see only their assigned opportunities
        const allOpportunities = await storage.getAllOpportunities();
        opportunities = allOpportunities.filter(opp => 
          !opp.assignedTo || opp.assignedTo === req.user.id
        );
      }
      
      // Enhance opportunities with company and contact names
      const enhancedOpportunities = await Promise.all(
        opportunities.map(async (opp) => {
          const enhancedOpp = { ...opp, companyName: null, contactName: null };
          
          if (opp.companyId) {
            const company = await storage.getCompany(opp.companyId);
            if (company) {
              enhancedOpp.companyName = company.name;
            }
          }
          
          if (opp.contactId) {
            const contact = await storage.getContact(opp.contactId);
            if (contact) {
              enhancedOpp.contactName = `${contact.firstName} ${contact.lastName}`;
            }
          }
          
          return enhancedOpp;
        })
      );
      
      res.json(enhancedOpportunities);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Received opportunity data:", JSON.stringify(req.body, null, 2));
      
      // Explicitly clean the data to match our schema
      const opportunityData = {
        name: req.body.name,
        stage: req.body.stage || "qualification",
        value: req.body.value ? req.body.value.toString() : "0",
        probability: req.body.probability != null ? parseInt(req.body.probability.toString()) : 0,
        expectedCloseDate: req.body.expectedCloseDate ? new Date(req.body.expectedCloseDate) : new Date(),
        notes: req.body.notes || null,
        contactId: req.body.contactId ? parseInt(req.body.contactId.toString()) : null,
        companyId: req.body.companyId ? parseInt(req.body.companyId.toString()) : null,
        leadId: req.body.leadId ? parseInt(req.body.leadId.toString()) : null,
        assignedTo: req.body.assignedTo ? parseInt(req.body.assignedTo.toString()) : null,
        createdBy: req.body.createdBy ? parseInt(req.body.createdBy.toString()) : req.user.id,
      };
      
      console.log("Processed opportunity data:", JSON.stringify(opportunityData, null, 2));
      
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      res.status(400).json({ error: "Invalid opportunity data" });
    }
  });
  
  app.get("/api/opportunities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const opportunity = await storage.getOpportunity(id);
    if (!opportunity) return res.status(404).send("Opportunity not found");
    res.json(opportunity);
  });
  
  app.patch("/api/opportunities/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const opportunityData = req.body;
      const updatedOpportunity = await storage.updateOpportunity(id, opportunityData);
      if (!updatedOpportunity) return res.status(404).send("Opportunity not found");
      res.json(updatedOpportunity);
    } catch (error) {
      res.status(400).json({ error: "Invalid opportunity data" });
    }
  });
  
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
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
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
      const id = parseInt(req.params.id);
      const productData = req.body;
      const updatedProduct = await storage.updateProduct(id, productData);
      if (!updatedProduct) return res.status(404).send("Product not found");
      res.json(updatedProduct);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
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
      
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const appointmentData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(appointmentData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(400).json({ error: "Invalid appointment data" });
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
      
      // Get the appointment first to check permissions
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).send("Appointment not found");
      }
      
      // Check permissions based on user role
      if (req.user.role === 'admin') {
        // Admins can delete any appointment
        const success = await storage.deleteAppointment(id);
        res.status(204).send();
      } else if (req.user.role === 'sales_manager') {
        // Sales managers can delete appointments created by them or their team members
        const teamMemberIds = await storage.getTeamMemberIds(req.user.id);
        const userIds = [...teamMemberIds, req.user.id];
        
        if (userIds.includes(appointment.createdBy) || 
            (appointment.attendeeType === 'user' && userIds.includes(appointment.attendeeId))) {
          const success = await storage.deleteAppointment(id);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      } else {
        // Sales executives can delete only their own appointments
        // or appointments where they are attendees (only if they created it)
        if (appointment.createdBy === req.user.id) {
          const success = await storage.deleteAppointment(id);
          res.status(204).send();
        } else {
          res.status(403).json({ error: "Permission denied" });
        }
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Failed to delete appointment" });
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
      // Add the current user as the creator
      const teamData = {
        ...insertTeamSchema.parse(req.body),
        createdBy: req.user.id
      };
      
      const team = await storage.createTeam(teamData);
      res.status(201).json(team);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(400).json({ error: "Invalid team data" });
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
          ct.full_name as contact_name
        FROM sales_orders so
        LEFT JOIN quotations q ON so.quotation_id = q.id
        LEFT JOIN companies c ON so.company_id = c.id
        LEFT JOIN contacts ct ON so.contact_id = ct.id
        WHERE so.id = $1 AND (so.invoice_date IS NOT NULL OR so.payment_date IS NOT NULL)
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
  app.get('/api/teams', async (req, res) => {
    try {
      // Check if user is authenticated
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get all teams (only admin can see all teams)
      const teams = await storage.getAllTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error getting teams:", error);
      res.status(500).json({ error: "Failed to get teams" });
    }
  });

  app.post('/api/teams', async (req, res) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Permission denied" });
      }

      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Team name is required" });
      }

      const newTeam = await storage.createTeam({
        name,
        description: description || null,
        createdBy: req.user.id
      });

      res.status(201).json(newTeam);
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ error: "Failed to create team" });
    }
  });

  app.patch('/api/teams/:id', async (req, res) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Permission denied" });
      }

      const teamId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedTeam = await storage.updateTeam(teamId, updates);
      
      if (!updatedTeam) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      res.json(updatedTeam);
    } catch (error) {
      console.error("Error updating team:", error);
      res.status(500).json({ error: "Failed to update team" });
    }
  });

  app.delete('/api/teams/:id', async (req, res) => {
    try {
      // Check if user is authenticated and is admin
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }
      
      const user = req.user as any;
      if (user.role !== 'admin') {
        return res.status(403).json({ error: "Permission denied" });
      }

      const teamId = parseInt(req.params.id);
      
      // Check if team exists
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      
      // Delete team
      const success = await storage.deleteTeam(teamId);
      
      if (!success) {
        return res.status(500).json({ error: "Failed to delete team" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting team:", error);
      res.status(500).json({ error: "Failed to delete team" });
    }
  });

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

  const httpServer = createServer(app);

  return httpServer;
}
