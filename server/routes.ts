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
  insertSalesOrderSchema,
  insertTaskSchema,
  insertActivitySchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Dashboard stats route
  app.get("/api/dashboard/stats", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const stats = {
      totalLeads: { value: "145", change: 12.5 },
      openDeals: { value: "38", change: 8.2 },
      salesMtd: { value: "$48,950", change: -3.1 },
      conversionRate: { value: "18.2%", change: 1.2 },
    };
    
    res.json(stats);
  });

  // Dashboard pipeline data
  app.get("/api/dashboard/pipeline", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const pipeline = {
      stages: [
        { name: "Qualification", value: "$72,500", count: 32, percentage: 70, color: "rgb(59, 130, 246)" },
        { name: "Proposal", value: "$54,200", count: 24, percentage: 60, color: "rgb(79, 70, 229)" },
        { name: "Negotiation", value: "$31,800", count: 15, percentage: 40, color: "rgb(139, 92, 246)" },
        { name: "Closing", value: "$24,500", count: 8, percentage: 30, color: "rgb(245, 158, 11)" },
      ],
      totalValue: "$183,000",
    };
    
    res.json(pipeline);
  });

  // Recent opportunities for dashboard
  app.get("/api/opportunities/recent", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const opportunities = [
      { id: 1, name: "Cloud Migration Service", company: "Acme Corp", stage: "qualification", value: "$12,500", updatedAt: "2 days ago" },
      { id: 2, name: "ERP Implementation", company: "TechGiant Inc", stage: "negotiation", value: "$45,000", updatedAt: "1 day ago" },
      { id: 3, name: "Security Assessment", company: "SecureData LLC", stage: "closing", value: "$8,750", updatedAt: "3 hours ago" },
      { id: 4, name: "Digital Marketing Campaign", company: "DigiFuture Co", stage: "proposal", value: "$18,300", updatedAt: "5 days ago" },
    ];
    
    res.json(opportunities);
  });

  // Tasks for today
  app.get("/api/tasks/today", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const tasks = [
      { id: 1, title: "Call with Acme Corp about renewal", dueTime: "10:30 AM - 11:00 AM", priority: "high", completed: false },
      { id: 2, title: "Prepare proposal for TechGiant", dueTime: "Due today", priority: "medium", completed: false },
      { id: 3, title: "Follow up with DigiFuture leads", dueTime: "2:00 PM - 3:00 PM", priority: "low", completed: false },
      { id: 4, title: "Update sales forecast for Q3", dueTime: "Due today", priority: "medium", completed: false },
    ];
    
    res.json(tasks);
  });

  // Recent activities
  app.get("/api/activities/recent", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const activities = [
      { id: 1, type: "email", title: "sent a proposal to", isYou: true, target: "TechGiant Inc", time: "35 minutes ago" },
      { id: 2, type: "call", title: "Call with", target: "SecureData LLC", time: "1 hour ago" },
      { id: 3, type: "task", title: "Task completed: Update contact information", time: "3 hours ago" },
      { id: 4, type: "lead", title: "New lead: DigiFuture Co contacted via web form", time: "Yesterday at 4:23 PM" },
    ];
    
    res.json(activities);
  });

  // Lead sources data
  app.get("/api/leads/sources", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const leadSources = [
      { name: "Website", percentage: 45, color: "#3b82f6" },
      { name: "Referrals", percentage: 30, color: "#4f46e5" },
      { name: "Email Campaigns", percentage: 15, color: "#f59e0b" },
      { name: "Social Media", percentage: 10, color: "#10b981" },
    ];
    
    res.json(leadSources);
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

  // Lead activities
  app.get("/api/leads/:id/activities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      if (!lead) return res.status(404).send("Lead not found");
      
      // For now, return a sample list of activities
      // In a real app, you would fetch activities related to this lead from the database
      const activities = [
        { 
          id: 1, 
          title: "Initial Contact", 
          type: "email", 
          description: "Sent introduction email about our services", 
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString() 
        },
        { 
          id: 2, 
          type: "call", 
          title: "Discovery Call", 
          description: "30-minute call to discuss requirements and pain points", 
          createdAt: new Date(Date.now() - 86400000).toISOString() 
        },
        { 
          id: 3, 
          type: "meeting", 
          title: "Product Demo", 
          description: "Presented product capabilities and addressed questions", 
          createdAt: new Date().toISOString() 
        }
      ];
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead activities" });
    }
  });

  // Lead tasks
  app.get("/api/leads/:id/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const leadId = parseInt(req.params.id);
      const lead = await storage.getLead(leadId);
      if (!lead) return res.status(404).send("Lead not found");
      
      // For now, return a sample list of tasks
      // In a real app, you would fetch tasks related to this lead from the database
      const tasks = [
        { 
          id: 1, 
          title: "Follow up on proposal", 
          description: "Check if they've reviewed our proposal and address any concerns", 
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          completed: false
        },
        { 
          id: 2, 
          title: "Schedule technical discussion", 
          description: "Set up a meeting with our solutions architect and their IT team", 
          dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
          completed: false
        },
        { 
          id: 3, 
          title: "Send case studies", 
          description: "Share relevant customer success stories in their industry", 
          dueDate: new Date(Date.now() - 86400000).toISOString(),
          completed: true
        }
      ];
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead tasks" });
    }
  });

  // Contacts CRUD routes
  app.get("/api/contacts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const contacts = await storage.getAllContacts();
    res.json(contacts);
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
    res.json(contact);
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
      
      // For now, return a sample list of activities
      const activities = [
        { 
          id: 1, 
          title: "Initial Meeting", 
          type: "meeting", 
          description: "First introductory meeting to discuss needs", 
          createdAt: new Date(Date.now() - 86400000 * 10).toISOString() 
        },
        { 
          id: 2, 
          type: "call", 
          title: "Follow-up Call", 
          description: "Called to discuss proposal details", 
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString() 
        },
        { 
          id: 3, 
          type: "email", 
          title: "Sent Product Information", 
          description: "Emailed detailed product specifications and pricing", 
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString() 
        }
      ];
      
      res.json(activities);
    } catch (error) {
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
      
      // For now, return a sample list of tasks
      const tasks = [
        { 
          id: 1, 
          title: "Schedule product demo", 
          description: "Set up online product demonstration session", 
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          completed: false
        },
        { 
          id: 2, 
          title: "Send follow-up email", 
          description: "Send materials discussed during the call", 
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          completed: false
        },
        { 
          id: 3, 
          title: "Update contact information", 
          description: "Update CRM with new role information", 
          dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          completed: true
        }
      ];
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contact tasks" });
    }
  });
  
  // Contact opportunities
  app.get("/api/contacts/:id/opportunities", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const contactId = parseInt(req.params.id);
      const contact = await storage.getContact(contactId);
      if (!contact) return res.status(404).send("Contact not found");
      
      // For now, return sample opportunities
      const opportunities = [
        {
          id: 1,
          name: "Enterprise Software Deployment",
          stage: "qualification",
          value: "35000",
          closingDate: new Date(Date.now() + 86400000 * 30).toISOString()
        },
        {
          id: 2,
          name: "Cloud Migration Project",
          stage: "proposal",
          value: "47500",
          closingDate: new Date(Date.now() + 86400000 * 45).toISOString()
        },
        {
          id: 3,
          name: "Annual Support Contract",
          stage: "negotiation",
          value: "12000",
          closingDate: new Date(Date.now() + 86400000 * 15).toISOString()
        }
      ];
      
      res.json(opportunities);
    } catch (error) {
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
      const opportunityData = insertOpportunitySchema.parse(req.body);
      const opportunity = await storage.createOpportunity(opportunityData);
      res.status(201).json(opportunity);
    } catch (error) {
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
      
      // For now, return sample activities
      const activities = [
        { 
          id: 1, 
          title: "Proposal Presentation", 
          type: "meeting", 
          description: "Presented solution proposal and timeline", 
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString() 
        },
        { 
          id: 2, 
          type: "call", 
          title: "Budget Discussion", 
          description: "Discussed pricing options and budget constraints", 
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString() 
        },
        { 
          id: 3, 
          type: "email", 
          title: "Contract Review", 
          description: "Sent contract draft for legal review", 
          createdAt: new Date().toISOString() 
        }
      ];
      
      res.json(activities);
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
      
      // For now, return sample tasks
      const tasks = [
        { 
          id: 1, 
          title: "Prepare demo environment", 
          description: "Set up demo environment with customer data sample", 
          dueDate: new Date(Date.now() + 86400000).toISOString(),
          completed: true
        },
        { 
          id: 2, 
          title: "Schedule final proposal review", 
          description: "Internal review before sending final proposal", 
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
          completed: false
        },
        { 
          id: 3, 
          title: "Follow up on pricing approval", 
          description: "Check if discount approval has been processed", 
          dueDate: new Date(Date.now() - 86400000 * 2).toISOString(),
          completed: false
        }
      ];
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch opportunity tasks" });
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
      const quotationData = insertQuotationSchema.parse(req.body);
      const quotation = await storage.createQuotation(quotationData);
      res.status(201).json(quotation);
    } catch (error) {
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
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: "Invalid task data" });
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
      const activityData = insertActivitySchema.parse(req.body);
      const activity = await storage.createActivity(activityData);
      res.status(201).json(activity);
    } catch (error) {
      res.status(400).json({ error: "Invalid activity data" });
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

  const httpServer = createServer(app);

  return httpServer;
}
