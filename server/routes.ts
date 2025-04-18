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

  const httpServer = createServer(app);

  return httpServer;
}
