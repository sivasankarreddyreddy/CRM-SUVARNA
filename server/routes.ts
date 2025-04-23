import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { z } from "zod";
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
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Users endpoints (for assignments)
  app.get("/api/users", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Only admins and sales managers can view the user list
    if (req.user.role !== 'admin' && req.user.role !== 'sales_manager') {
      return res.status(403).json({ error: "Permission denied" });
    }
    
    storage.getAllUsers().then((users: User[]) => {
      // Remove sensitive information like passwords
      const sanitizedUsers = users.map((user: User) => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        managerId: user.managerId,
        isActive: user.isActive
      }));
      
      res.json(sanitizedUsers);
    }).catch((err: Error) => {
      console.error("Error fetching users:", err);
      res.status(500).json({ error: "Failed to fetch users" });
    });
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
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
  });

  // Dashboard pipeline data
  app.get("/api/dashboard/pipeline", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const pipeline = await storage.getPipelineData();
      res.json(pipeline);
    } catch (error) {
      console.error("Error fetching pipeline data:", error);
      res.status(500).json({ error: "Failed to fetch pipeline data" });
    }
  });

  // Recent opportunities for dashboard
  app.get("/api/opportunities/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const opportunities = await storage.getRecentOpportunities();
      res.json(opportunities);
    } catch (error) {
      console.error("Error fetching recent opportunities:", error);
      res.status(500).json({ error: "Failed to fetch recent opportunities" });
    }
  });

  // Tasks for today
  app.get("/api/tasks/today", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tasks = await storage.getTodayTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching today's tasks:", error);
      res.status(500).json({ error: "Failed to fetch today's tasks" });
    }
  });

  // Recent activities
  app.get("/api/activities/recent", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ error: "Failed to fetch recent activities" });
    }
  });

  // Lead sources data
  app.get("/api/leads/sources", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const leadSources = await storage.getLeadSources();
      res.json(leadSources);
    } catch (error) {
      console.error("Error fetching lead sources:", error);
      res.status(500).json({ error: "Failed to fetch lead sources data" });
    }
  });

  // Leads CRUD routes
  app.get("/api/leads", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const leads = await storage.getAllLeads();
    res.json(leads);
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
    const contacts = await storage.getAllContacts();
    
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
    const companies = await storage.getAllCompanies();
    res.json(companies);
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
    const opportunities = await storage.getAllOpportunities();
    res.json(opportunities);
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
    const quotations = await storage.getAllQuotations();
    res.json(quotations);
  });

  app.post("/api/quotations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      console.log("Creating quotation with data:", req.body);
      
      // Ensure the user ID is included
      const quotationData = insertQuotationSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      
      const quotation = await storage.createQuotation(quotationData);
      res.status(201).json(quotation);
    } catch (error) {
      console.error("Error creating quotation:", error);
      res.status(400).json({ error: "Invalid quotation data" });
    }
  });
  
  app.get("/api/quotations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    const quotation = await storage.getQuotation(id);
    if (!quotation) return res.status(404).send("Quotation not found");
    res.json(quotation);
  });
  
  app.patch("/api/quotations/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const quotationData = req.body;
      const updatedQuotation = await storage.updateQuotation(id, quotationData);
      if (!updatedQuotation) return res.status(404).send("Quotation not found");
      res.json(updatedQuotation);
    } catch (error) {
      res.status(400).json({ error: "Invalid quotation data" });
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
      
      console.log("Creating quotation item:", req.body);
      // Use the right schema from shared/schema.ts
      const itemData = insertQuotationItemSchema.parse({
        ...req.body,
        quotationId
      });
      
      const item = await storage.createQuotationItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      console.error("Error creating quotation item:", error);
      res.status(400).json({ error: "Invalid quotation item data" });
    }
  });

  // Orders CRUD routes
  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const orders = await storage.getAllSalesOrders();
    res.json(orders);
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const orderData = insertSalesOrderSchema.parse(req.body);
      const order = await storage.createSalesOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
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

  // Tasks CRUD routes
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const tasks = await storage.getAllTasks();
    res.json(tasks);
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
    const id = parseInt(req.params.id);
    const task = await storage.getTask(id);
    if (!task) return res.status(404).send("Task not found");
    res.json(task);
  });
  
  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTask(id);
      if (!success) return res.status(404).send("Task not found");
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete task" });
    }
  });

  // Activities CRUD routes
  app.get("/api/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const activities = await storage.getAllActivities();
    res.json(activities);
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
    const id = parseInt(req.params.id);
    const activity = await storage.getActivity(id);
    if (!activity) return res.status(404).send("Activity not found");
    res.json(activity);
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
      const success = await storage.deleteActivity(id);
      if (!success) return res.status(404).send("Activity not found");
      res.status(204).send();
    } catch (error) {
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
    const appointments = await storage.getAllAppointments();
    res.json(appointments);
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
    const id = parseInt(req.params.id);
    const appointment = await storage.getAppointment(id);
    if (!appointment) return res.status(404).send("Appointment not found");
    res.json(appointment);
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
      const success = await storage.deleteAppointment(id);
      if (!success) return res.status(404).send("Appointment not found");
      res.status(204).send();
    } catch (error) {
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

  const httpServer = createServer(app);

  return httpServer;
}
