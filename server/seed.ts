import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { seedTeamsData } from "./seed-teams";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  console.log("Starting database seeding...");
  
  // Seed users with different roles
  const users = [
    {
      username: "admin",
      password: await hashPassword("admin123"),
      fullName: "Admin User",
      email: "admin@example.com",
      role: "admin",
    },
    {
      username: "manager",
      password: await hashPassword("sales123"),
      fullName: "Sales Manager",
      email: "manager@example.com",
      role: "sales_manager",
    },
    {
      username: "sales",
      password: await hashPassword("exec123"),
      fullName: "Sales Executive",
      email: "sales@example.com",
      role: "sales_executive",
    },
  ];

  // Create users
  const createdUsers = [];
  for (const userData of users) {
    const existingUser = await storage.getUserByUsername(userData.username);
    if (!existingUser) {
      const user = await storage.createUser(userData);
      console.log(`Created user: ${user.username}`);
      createdUsers.push(user);
    } else {
      console.log(`User ${userData.username} already exists`);
      createdUsers.push(existingUser);
    }
  }

  // Set the admin user ID for created_by fields
  const adminUserId = createdUsers[0].id;

  // Seed companies
  const companies = [
    {
      name: "Acme Corp",
      industry: "Technology",
      website: "https://acme.example.com",
      phone: "123-456-7890",
      address: "123 Tech Blvd, San Francisco, CA 94107",
      notes: "Leading tech company in cloud solutions",
      createdBy: adminUserId,
    },
    {
      name: "TechGiant Inc",
      industry: "Technology",
      website: "https://techgiant.example.com",
      phone: "555-123-4567",
      address: "555 Market St, San Francisco, CA 94105",
      notes: "Enterprise software provider",
      createdBy: adminUserId,
    },
    {
      name: "SecureData LLC",
      industry: "Cybersecurity",
      website: "https://securedata.example.com",
      phone: "888-555-1234",
      address: "888 Security Rd, Boston, MA 02110",
      notes: "Cybersecurity and data protection solutions",
      createdBy: adminUserId,
    },
    {
      name: "DigiFuture Co",
      industry: "Digital Marketing",
      website: "https://digifuture.example.com",
      phone: "777-888-9999",
      address: "777 Innovation Dr, Austin, TX 78701",
      notes: "Digital marketing and brand strategy",
      createdBy: adminUserId,
    },
    {
      name: "GlobalTech Inc",
      industry: "Manufacturing",
      website: "https://globaltech.example.com",
      phone: "222-333-4444",
      address: "222 Industry Ave, Detroit, MI 48226",
      notes: "Industrial automation solutions",
      createdBy: adminUserId,
    },
  ];

  const createdCompanies = [];
  for (const companyData of companies) {
    const company = await storage.createCompany(companyData);
    console.log(`Created company: ${company.name}`);
    createdCompanies.push(company);
  }

  // Seed contacts (associated with companies)
  const contacts = [
    {
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@acme.example.com",
      phone: "123-456-7890",
      title: "CTO",
      companyId: createdCompanies[0].id,
      notes: "Technical decision maker, interested in cloud solutions",
      createdBy: adminUserId,
    },
    {
      firstName: "Emily",
      lastName: "Johnson",
      email: "emily.johnson@techgiant.example.com",
      phone: "555-987-6543",
      title: "VP of Operations",
      companyId: createdCompanies[1].id,
      notes: "Key stakeholder for enterprise software decisions",
      createdBy: adminUserId,
    },
    {
      firstName: "Michael",
      lastName: "Brown",
      email: "michael.brown@securedata.example.com",
      phone: "888-222-3333",
      title: "CISO",
      companyId: createdCompanies[2].id,
      notes: "Primary contact for security-related decisions",
      createdBy: adminUserId,
    },
    {
      firstName: "Sarah",
      lastName: "Davis",
      email: "sarah.davis@digifuture.example.com",
      phone: "777-444-5555",
      title: "Marketing Director",
      companyId: createdCompanies[3].id,
      notes: "Interested in digital marketing strategies",
      createdBy: adminUserId,
    },
    {
      firstName: "Robert",
      lastName: "Wilson",
      email: "robert.wilson@acme.example.com",
      phone: "123-555-7777",
      title: "IT Manager",
      companyId: createdCompanies[0].id,
      notes: "Technical evaluator for cloud solutions",
      createdBy: adminUserId,
    },
  ];

  const createdContacts = [];
  for (const contactData of contacts) {
    const contact = await storage.createContact(contactData);
    console.log(`Created contact: ${contact.firstName} ${contact.lastName}`);
    createdContacts.push(contact);
  }

  // Find user IDs for assignment
  const salesUserId = createdUsers.find(u => u.username === "sales")?.id || adminUserId;
  const managerUserId = createdUsers.find(u => u.username === "manager")?.id || adminUserId;

  // Seed leads
  const leads = [
    {
      name: "Cloud Migration Project",
      email: "alex.thompson@newprospect.example.com",
      phone: "444-555-6666",
      companyName: "NewProspect Solutions",
      source: "Website",
      status: "new",
      assignedTo: salesUserId,
      notes: "Interested in cloud migration services, looking for a quote",
      createdBy: adminUserId,
    },
    {
      name: "Security Assessment",
      email: "jennifer.lopez@futuretech.example.com",
      phone: "222-333-4444",
      companyName: "FutureTech Innovations",
      source: "Trade Show",
      status: "contacted",
      assignedTo: salesUserId,
      notes: "Met at CyberSec Conference, needs a security assessment",
      createdBy: adminUserId,
    },
    {
      name: "Digital Transformation",
      email: "david.miller@innovate.example.com",
      phone: "777-888-9999",
      companyName: "Innovate Inc",
      source: "Referral",
      status: "qualified",
      assignedTo: managerUserId,
      notes: "Referred by TechGiant Inc, looking for digital transformation consultation",
      createdBy: adminUserId,
    },
    {
      name: "ERP Implementation",
      email: "linda.chen@modernbiz.example.com",
      phone: "555-666-7777",
      companyName: "ModernBiz Corp",
      source: "Email Campaign",
      status: "unqualified",
      assignedTo: salesUserId,
      notes: "Responded to our ERP email campaign, but budget is too small",
      createdBy: adminUserId,
    },
  ];

  const createdLeads = [];
  for (const leadData of leads) {
    const lead = await storage.createLead(leadData);
    console.log(`Created lead: ${lead.name}`);
    createdLeads.push(lead);
  }

  // Seed products
  const products = [
    {
      name: "Cloud Storage Plan - Basic",
      sku: "CLD-BAS-001",
      description: "Basic cloud storage plan with 100GB storage",
      price: "99.99",
      tax: "10",
      isActive: true,
      createdBy: adminUserId,
    },
    {
      name: "Cloud Storage Plan - Premium",
      sku: "CLD-PRE-002",
      description: "Premium cloud storage plan with 1TB storage and advanced security features",
      price: "199.99",
      tax: "10",
      isActive: true,
      createdBy: adminUserId,
    },
    {
      name: "Security Audit Service",
      sku: "SEC-AUD-001",
      description: "Comprehensive security audit and vulnerability assessment",
      price: "499.99",
      tax: "10",
      isActive: true,
      createdBy: adminUserId,
    },
    {
      name: "Website Development",
      sku: "WEB-DEV-001",
      description: "Custom website development with responsive design",
      price: "999.99",
      tax: "10",
      isActive: true,
      createdBy: adminUserId,
    },
    {
      name: "Mobile App Development",
      sku: "MOB-DEV-001",
      description: "Custom mobile application development for iOS and Android",
      price: "1499.99",
      tax: "10",
      isActive: false,
      createdBy: adminUserId,
    },
  ];

  const createdProducts = [];
  for (const productData of products) {
    const product = await storage.createProduct(productData);
    console.log(`Created product: ${product.name}`);
    createdProducts.push(product);
  }

  // Seed opportunities
  const opportunities = [
    {
      name: "Cloud Migration Service",
      contactId: createdContacts[0].id,
      companyId: createdCompanies[0].id,
      value: "12500",
      stage: "qualification",
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
      probability: 30,
      notes: "Initial discovery completed, preparing solution proposal",
      assignedTo: salesUserId,
      createdBy: adminUserId,
    },
    {
      name: "ERP Implementation",
      contactId: createdContacts[1].id,
      companyId: createdCompanies[1].id,
      value: "45000",
      stage: "negotiation",
      expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
      probability: 70,
      notes: "Proposal accepted, finalizing contract terms",
      assignedTo: managerUserId,
      createdBy: adminUserId,
    },
    {
      name: "Security Assessment",
      contactId: createdContacts[2].id,
      companyId: createdCompanies[2].id,
      value: "8750",
      stage: "proposal",
      expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days in the future
      probability: 50,
      notes: "Sent proposal, awaiting feedback",
      assignedTo: salesUserId,
      createdBy: adminUserId,
    },
    {
      name: "Digital Marketing Campaign",
      contactId: createdContacts[3].id,
      companyId: createdCompanies[3].id,
      value: "18300",
      stage: "qualification",
      expectedCloseDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days in the future
      probability: 20,
      notes: "Initial discussion, identifying needs",
      assignedTo: salesUserId,
      createdBy: adminUserId,
    },
  ];

  const createdOpportunities = [];
  for (const opportunityData of opportunities) {
    const opportunity = await storage.createOpportunity(opportunityData);
    console.log(`Created opportunity: ${opportunity.name}`);
    createdOpportunities.push(opportunity);
  }

  // Seed quotations
  const quotations = [
    {
      quotationNumber: "QT-2023-001",
      companyId: createdCompanies[0].id,
      contactId: createdContacts[0].id,
      opportunityId: createdOpportunities[0].id,
      subtotal: "11500",
      tax: "1000",
      total: "12500",
      status: "draft",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
      notes: "Cloud migration services quotation",
      createdBy: adminUserId,
    },
    {
      quotationNumber: "QT-2023-002",
      companyId: createdCompanies[1].id,
      contactId: createdContacts[1].id,
      opportunityId: createdOpportunities[1].id,
      subtotal: "40909",
      tax: "4091",
      total: "45000",
      status: "sent",
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
      notes: "ERP implementation services quotation",
      createdBy: adminUserId,
    },
    {
      quotationNumber: "QT-2023-003",
      companyId: createdCompanies[2].id,
      contactId: createdContacts[2].id,
      opportunityId: createdOpportunities[2].id,
      subtotal: "7955",
      tax: "795",
      total: "8750",
      status: "viewed",
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days in the future
      notes: "Security assessment services quotation",
      createdBy: adminUserId,
    },
  ];

  const createdQuotations = [];
  for (const quotationData of quotations) {
    const quotation = await storage.createQuotation(quotationData);
    console.log(`Created quotation: ${quotation.quotationNumber}`);
    createdQuotations.push(quotation);
  }

  // Seed quotation items
  const quotationItems = [
    {
      quotationId: createdQuotations[0].id,
      productId: createdProducts[1].id,
      description: "Premium Cloud Storage Plan - Annual Subscription",
      quantity: 25,
      unitPrice: "199.99",
      subtotal: "4999.75",
    },
    {
      quotationId: createdQuotations[0].id,
      productId: createdProducts[2].id,
      description: "Security Audit Service - One-time",
      quantity: 1,
      unitPrice: "499.99",
      subtotal: "499.99",
    },
    {
      quotationId: createdQuotations[0].id,
      productId: createdProducts[0].id,
      description: "Cloud Migration Consulting - 50 hours",
      quantity: 50,
      unitPrice: "120",
      subtotal: "6000",
    },
    {
      quotationId: createdQuotations[1].id,
      productId: createdProducts[0].id,
      description: "ERP Implementation - Basic Package",
      quantity: 1,
      unitPrice: "25000",
      subtotal: "25000",
    },
    {
      quotationId: createdQuotations[1].id,
      productId: createdProducts[0].id,
      description: "ERP Custom Development - 150 hours",
      quantity: 150,
      unitPrice: "110",
      subtotal: "16500",
    },
    {
      quotationId: createdQuotations[1].id,
      productId: createdProducts[0].id,
      description: "ERP User Training - 5 days",
      quantity: 5,
      unitPrice: "2000",
      subtotal: "10000",
    },
    {
      quotationId: createdQuotations[2].id,
      productId: createdProducts[2].id,
      description: "Security Audit Service - Comprehensive",
      quantity: 1,
      unitPrice: "4999.99",
      subtotal: "4999.99",
    },
    {
      quotationId: createdQuotations[2].id,
      productId: createdProducts[0].id,
      description: "Vulnerability Assessment - 25 hours",
      quantity: 25,
      unitPrice: "120",
      subtotal: "3000",
    },
  ];

  for (const itemData of quotationItems) {
    const item = await storage.createQuotationItem(itemData);
    console.log(`Created quotation item for quotation ${item.quotationId}`);
  }

  // Seed sales orders
  const salesOrders = [
    {
      orderNumber: "ORD-2023-001",
      companyId: createdCompanies[0].id,
      contactId: createdContacts[0].id,
      quotationId: createdQuotations[0].id,
      subtotal: "11500",
      tax: "1000",
      total: "12500",
      status: "pending",
      orderDate: new Date(),
      notes: "Approved by John Smith",
      createdBy: adminUserId,
    },
    {
      orderNumber: "ORD-2023-002",
      companyId: createdCompanies[1].id,
      contactId: createdContacts[1].id,
      quotationId: createdQuotations[1].id,
      subtotal: "40909",
      tax: "4091",
      total: "45000",
      status: "processing",
      orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      notes: "First payment received",
      createdBy: adminUserId,
    },
  ];

  const createdOrders = [];
  for (const orderData of salesOrders) {
    const order = await storage.createSalesOrder(orderData);
    console.log(`Created sales order: ${order.orderNumber}`);
    createdOrders.push(order);
  }

  // Seed sales order items - copying from the corresponding quotations
  for (let i = 0; i < 3; i++) {
    // Items for first order (from first quotation)
    const itemData = quotationItems[i];
    await storage.createSalesOrderItem({
      salesOrderId: createdOrders[0].id,
      productId: itemData.productId,
      description: itemData.description,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      subtotal: itemData.subtotal,
    });
    console.log(`Created sales order item for order ${createdOrders[0].id}`);
  }

  for (let i = 3; i < 6; i++) {
    // Items for second order (from second quotation)
    const itemData = quotationItems[i];
    await storage.createSalesOrderItem({
      salesOrderId: createdOrders[1].id,
      productId: itemData.productId,
      description: itemData.description,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice,
      subtotal: itemData.subtotal,
    });
    console.log(`Created sales order item for order ${createdOrders[1].id}`);
  }

  // Seed tasks
  const tasks = [
    {
      title: "Call with Acme Corp about renewal",
      description: "Discuss cloud storage renewal and potential upgrade",
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      priority: "high",
      status: "pending",
      assignedTo: salesUserId,
      relatedTo: "opportunity",
      relatedId: createdOpportunities[0].id,
      createdBy: adminUserId,
    },
    {
      title: "Prepare proposal for TechGiant",
      description: "Finalize the ERP implementation proposal with updated pricing",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      priority: "medium",
      status: "pending",
      assignedTo: managerUserId,
      relatedTo: "opportunity",
      relatedId: createdOpportunities[1].id,
      createdBy: adminUserId,
    },
    {
      title: "Follow up with Security lead",
      description: "Follow up on the sent quotation for security assessment",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      priority: "medium",
      status: "pending",
      assignedTo: salesUserId,
      relatedTo: "quotation",
      relatedId: createdQuotations[2].id,
      createdBy: adminUserId,
    },
    {
      title: "Update sales forecast for Q3",
      description: "Compile all ongoing opportunities and create a forecast for Q3",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      priority: "medium",
      status: "pending",
      assignedTo: managerUserId,
      relatedTo: null,
      relatedId: null,
      createdBy: adminUserId,
    },
  ];

  for (const taskData of tasks) {
    const task = await storage.createTask(taskData);
    console.log(`Created task: ${task.title}`);
  }

  // Seed activities
  const activities = [
    {
      type: "email",
      title: "Sent proposal to TechGiant Inc",
      description: "Sent the ERP implementation proposal",
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      relatedTo: "opportunity",
      relatedId: createdOpportunities[1].id,
      createdBy: managerUserId,
    },
    {
      type: "call",
      title: "Call with SecureData LLC",
      description: "Discussed security assessment requirements and timeline",
      completedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      relatedTo: "opportunity",
      relatedId: createdOpportunities[2].id,
      createdBy: salesUserId,
    },
    {
      type: "task",
      title: "Updated contact information",
      description: "Updated contact information for all TechGiant contacts",
      completedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      relatedTo: "company",
      relatedId: createdCompanies[1].id,
      createdBy: salesUserId,
    },
    {
      type: "lead",
      title: "New lead from DigiFuture Co",
      description: "Potential client interested in cloud services",
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      relatedTo: "lead",
      relatedId: createdLeads[0].id,
      createdBy: adminUserId,
    },
  ];

  for (const activityData of activities) {
    const activity = await storage.createActivity(activityData);
    console.log(`Created activity: ${activity.type} - ${activity.description}`);
  }

  // Seed teams data with hierarchical structure
  console.log("Starting team data seeding...");
  await seedTeamsData();

  console.log("Database seeding completed successfully!");
}