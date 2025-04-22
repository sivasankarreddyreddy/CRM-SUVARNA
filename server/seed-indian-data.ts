import { db } from "./db";
import { leads, opportunities, companies } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedIndianSampleData() {
  console.log("Starting Indian sample data seeding...");
  
  // Create or update companies with Indian context
  const companyData = [
    {
      name: "Tata Consultancy Services",
      industry: "Technology",
      website: "https://www.tcs.com",
      phone: "+91-22-67789999",
      address: "9th Floor, Nirmal Building, Nariman Point, Mumbai 400021",
      notes: "Largest Indian IT services company",
      createdBy: 1
    },
    {
      name: "Reliance Industries",
      industry: "Conglomerate",
      website: "https://www.ril.com",
      phone: "+91-22-33555000",
      address: "Maker Chambers IV, 222 Nariman Point, Mumbai 400021",
      notes: "Multinational conglomerate company",
      createdBy: 1
    },
    {
      name: "Infosys Limited",
      industry: "Technology",
      website: "https://www.infosys.com",
      phone: "+91-80-28520261",
      address: "Electronics City, Hosur Road, Bangalore 560100",
      notes: "Leading IT consulting company",
      createdBy: 1
    },
    {
      name: "Bharti Airtel",
      industry: "Telecommunications",
      website: "https://www.airtel.in",
      phone: "+91-124-4222222",
      address: "Bharti Crescent, 1 Nelson Mandela Road, New Delhi 110070",
      notes: "Leading telecom service provider",
      createdBy: 1
    },
    {
      name: "ICICI Bank",
      industry: "Financial Services",
      website: "https://www.icicibank.com",
      phone: "+91-22-33667777",
      address: "ICICI Bank Towers, Bandra-Kurla Complex, Mumbai 400051",
      notes: "Second largest private sector bank",
      createdBy: 1
    },
    {
      name: "Apollo Hospitals",
      industry: "Healthcare",
      website: "https://www.apollohospitals.com",
      phone: "+91-44-28296000",
      address: "No. 21, Greams Lane, Off Greams Road, Chennai 600006",
      notes: "Leading private healthcare provider",
      createdBy: 1
    },
    {
      name: "BYJU'S",
      industry: "Education",
      website: "https://byjus.com",
      phone: "+91-80-67185100",
      address: "IBC Knowledge Park, Tower D, Bangalore 560029",
      notes: "EdTech company with learning apps",
      createdBy: 1
    },
    {
      name: "Indian Oil Corporation",
      industry: "Oil & Gas",
      website: "https://www.iocl.com",
      phone: "+91-11-26260000",
      address: "IndianOil Bhavan, 1 Sri Aurobindo Marg, New Delhi 110016",
      notes: "Largest commercial oil company in India",
      createdBy: 1
    }
  ];
  
  for (const company of companyData) {
    const existingCompany = await db.select().from(companies).where(eq(companies.name, company.name)).limit(1);
    
    if (existingCompany.length === 0) {
      await db.insert(companies).values(company);
      console.log(`Company ${company.name} created`);
    } else {
      await db.update(companies)
        .set({ 
          industry: company.industry,
          website: company.website,
          phone: company.phone,
          address: company.address,
          notes: company.notes
        })
        .where(eq(companies.name, company.name));
      console.log(`Company ${company.name} updated`);
    }
  }
  
  // Define lead data for different teams (with teamId assigned)
  const leadData = [
    // Enterprise Team (Team 1) Leads
    {
      name: "TCS Digital Transformation Project",
      email: "contact@tcs.com",
      phone: "+91-22-67789999",
      companyName: "Tata Consultancy Services",
      status: "new",
      source: "referral",
      teamId: 1,
      assignedTo: 9, // This will be Amit Kumar
      notes: "Looking to implement our solution across their offices",
      createdBy: 1
    },
    {
      name: "Reliance Cloud Migration Initiative",
      email: "it@ril.com",
      phone: "+91-22-33555000",
      companyName: "Reliance Industries",
      status: "qualified",
      source: "conference",
      teamId: 1,
      assignedTo: 10, // This will be Sunil Gupta
      notes: "Interested in our enterprise cloud migration services",
      createdBy: 1
    },
    {
      name: "Infosys Cybersecurity Assessment",
      email: "security@infosys.com",
      phone: "+91-80-28520261",
      companyName: "Infosys Limited",
      status: "qualified",
      source: "website",
      teamId: 1,
      assignedTo: 11, // This will be Neha Verma
      notes: "Need comprehensive security audit services",
      createdBy: 1
    },
    
    // SMB Team (Team 2) Leads
    {
      name: "Local Restaurant Chain CRM Implementation",
      email: "info@tasteofindia.com",
      phone: "+91-11-45678901",
      companyName: "Taste of India Restaurants",
      status: "new",
      source: "website",
      teamId: 2,
      assignedTo: 13, // This will be Riya Agarwal
      notes: "Looking for customer management system",
      createdBy: 1
    },
    {
      name: "Fashion Boutique E-Commerce Development",
      email: "owner@ethnicwear.com",
      phone: "+91-22-23456789",
      companyName: "Ethnic Wear Boutique",
      status: "qualified",
      source: "social_media",
      teamId: 2,
      assignedTo: 14, // This will be Aditya Shah
      notes: "Wants to launch online store",
      createdBy: 1
    },
    
    // Government Team (Team 3) Leads
    {
      name: "Smart City Initiative",
      email: "project@smartcity.gov.in",
      phone: "+91-11-23456789",
      companyName: "Municipal Corporation Delhi",
      status: "qualified",
      source: "government_tender",
      teamId: 3,
      assignedTo: 17, // This will be Sanjay Mohan
      notes: "Smart city technology implementation",
      createdBy: 1
    },
    {
      name: "E-Governance Portal Update",
      email: "it@karnataka.gov.in",
      phone: "+91-80-23456789",
      companyName: "Karnataka State Government",
      status: "new",
      source: "direct_inquiry",
      teamId: 3,
      assignedTo: 18, // This will be Alok Prasad
      notes: "Updating citizen services portal",
      createdBy: 1
    },
    
    // Healthcare Team (Team 4) Leads
    {
      name: "Hospital Management System Implementation",
      email: "it@apollohospitals.com",
      phone: "+91-44-28296000",
      companyName: "Apollo Hospitals",
      status: "qualified",
      source: "industry_event",
      teamId: 4,
      assignedTo: 20, // This will be Vivek Bajaj
      notes: "Comprehensive hospital management solution",
      createdBy: 1
    },
    {
      name: "Telemedicine Platform Integration",
      email: "tech@medanta.org",
      phone: "+91-124-4411411",
      companyName: "Medanta Hospital",
      status: "new",
      source: "website",
      teamId: 4,
      assignedTo: 21, // This will be Sneha Roy
      notes: "Looking to enhance telemedicine capabilities",
      createdBy: 1
    },
    
    // Financial Team (Team 5) Leads
    {
      name: "Banking Security Solutions",
      email: "security@icicibank.com",
      phone: "+91-22-33667777",
      companyName: "ICICI Bank",
      status: "qualified",
      source: "partner_referral",
      teamId: 5,
      assignedTo: 24, // This will be Prakash Sharma
      notes: "Security enhancement for banking applications",
      createdBy: 1
    },
    {
      name: "Investment App Development",
      email: "digital@hdfcbank.com",
      phone: "+91-22-33999000",
      companyName: "HDFC Bank",
      status: "new",
      source: "conference",
      teamId: 5,
      assignedTo: 25, // This will be Shreya Das
      notes: "Looking to develop new investment mobile app",
      createdBy: 1
    },
    
    // Education Team (Team 6) Leads
    {
      name: "Learning Management System Implementation",
      email: "tech@byjus.com",
      phone: "+91-80-67185100",
      companyName: "BYJU'S",
      status: "qualified",
      source: "website",
      teamId: 6,
      assignedTo: 28, // This will be Aryan Nair
      notes: "Enhancing their digital learning platform",
      createdBy: 1
    },
    {
      name: "Virtual Classroom Solution",
      email: "it@amity.edu",
      phone: "+91-120-4392000",
      companyName: "Amity University",
      status: "new",
      source: "education_conference",
      teamId: 6,
      assignedTo: 29, // This will be Ishaan Bose
      notes: "Looking for advanced virtual classroom tools",
      createdBy: 1
    }
  ];
  
  // Add leads
  for (const lead of leadData) {
    const existingLead = await db.select().from(leads).where(eq(leads.name, lead.name)).limit(1);
    
    if (existingLead.length === 0) {
      await db.insert(leads).values(lead);
      console.log(`Lead ${lead.name} created`);
    } else {
      await db.update(leads)
        .set({ 
          email: lead.email,
          phone: lead.phone,
          companyName: lead.companyName,
          status: lead.status,
          source: lead.source,
          teamId: lead.teamId,
          assignedTo: lead.assignedTo,
          notes: lead.notes
        })
        .where(eq(leads.name, lead.name));
      console.log(`Lead ${lead.name} updated`);
    }
  }
  
  // Define opportunity data for each team
  const opportunityData = [
    // Enterprise Team (Team 1) Opportunities
    {
      name: "TCS Data Center Migration",
      companyId: 1, // TCS
      value: "25000000",
      stage: "proposal",
      teamId: 1,
      assignedTo: 9, // Amit Kumar
      closingDate: new Date("2023-08-30"),
      notes: "Proposal submitted, waiting for technical evaluation",
      createdBy: 1
    },
    {
      name: "Reliance Enterprise Software Deployment",
      companyId: 2, // Reliance
      value: "50000000",
      stage: "negotiation",
      teamId: 1,
      assignedTo: 10, // Sunil Gupta
      closingDate: new Date("2023-07-15"),
      notes: "Terms being negotiated, price point is the main discussion",
      createdBy: 1
    },
    
    // SMB Team (Team 2) Opportunities
    {
      name: "Retail Chain POS System",
      companyId: null,
      companyName: "Mumbai Retail Association",
      value: "3500000",
      stage: "qualification",
      teamId: 2,
      assignedTo: 13, // Riya Agarwal
      closingDate: new Date("2023-09-15"),
      notes: "Initial requirements gathered, demonstrating product next week",
      createdBy: 1
    },
    {
      name: "Restaurant Management Software",
      companyId: null,
      companyName: "Taste of India Restaurants",
      value: "1850000",
      stage: "proposal",
      teamId: 2,
      assignedTo: 14, // Aditya Shah
      closingDate: new Date("2023-07-30"),
      notes: "Proposal sent, client reviewing options",
      createdBy: 1
    },
    
    // Government Team (Team 3) Opportunities
    {
      name: "Municipal Corporation Smart City Project",
      companyId: null,
      companyName: "Municipal Corporation Delhi",
      value: "120000000",
      stage: "proposal",
      teamId: 3,
      assignedTo: 17, // Sanjay Mohan
      closingDate: new Date("2023-12-15"),
      notes: "Tender submitted, presentations scheduled for next month",
      createdBy: 1
    },
    {
      name: "E-Governance Portal Modernization",
      companyId: null,
      companyName: "Karnataka State Government",
      value: "45000000",
      stage: "qualification",
      teamId: 3,
      assignedTo: 18, // Alok Prasad
      closingDate: new Date("2023-10-30"),
      notes: "Requirements gathering in progress",
      createdBy: 1
    },
    
    // Healthcare Team (Team 4) Opportunities
    {
      name: "Apollo Hospitals EMR System",
      companyId: 6, // Apollo
      value: "17500000",
      stage: "closing",
      teamId: 4,
      assignedTo: 20, // Vivek Bajaj
      closingDate: new Date("2023-06-30"),
      notes: "Contract being finalized, legal review in progress",
      createdBy: 1
    },
    {
      name: "Telemedicine Platform for Hospital Chain",
      companyId: null,
      companyName: "Medanta Hospital",
      value: "9500000",
      stage: "proposal",
      teamId: 4,
      assignedTo: 21, // Sneha Roy
      closingDate: new Date("2023-08-15"),
      notes: "Demo completed, proposal being reviewed",
      createdBy: 1
    },
    
    // Financial Team (Team 5) Opportunities
    {
      name: "ICICI Bank Cybersecurity Implementation",
      companyId: 5, // ICICI
      value: "22500000",
      stage: "negotiation",
      teamId: 5,
      assignedTo: 24, // Prakash Sharma
      closingDate: new Date("2023-07-30"),
      notes: "Technical requirements finalized, commercial discussions ongoing",
      createdBy: 1
    },
    {
      name: "Digital Banking App Development",
      companyId: null,
      companyName: "HDFC Bank",
      value: "18000000",
      stage: "proposal",
      teamId: 5,
      assignedTo: 25, // Shreya Das
      closingDate: new Date("2023-09-15"),
      notes: "Proposal submitted last week, waiting for feedback",
      createdBy: 1
    },
    
    // Education Team (Team 6) Opportunities
    {
      name: "BYJU'S Learning Platform Enhancement",
      companyId: 7, // BYJU'S
      value: "12000000",
      stage: "qualification",
      teamId: 6,
      assignedTo: 28, // Aryan Nair
      closingDate: new Date("2023-10-15"),
      notes: "Initial requirements gathering session completed",
      createdBy: 1
    },
    {
      name: "University Virtual Classroom Solution",
      companyId: null,
      companyName: "Amity University",
      value: "8500000",
      stage: "proposal",
      teamId: 6,
      assignedTo: 29, // Ishaan Bose
      closingDate: new Date("2023-08-30"),
      notes: "Proposal in preparation, specifications being finalized",
      createdBy: 1
    }
  ];
  
  // Add opportunities
  for (const opportunity of opportunityData) {
    const existingOpportunity = await db.select().from(opportunities).where(eq(opportunities.name, opportunity.name)).limit(1);
    
    if (existingOpportunity.length === 0) {
      await db.insert(opportunities).values(opportunity);
      console.log(`Opportunity ${opportunity.name} created`);
    } else {
      await db.update(opportunities)
        .set({ 
          companyId: opportunity.companyId,
          companyName: opportunity.companyName,
          value: opportunity.value,
          stage: opportunity.stage,
          teamId: opportunity.teamId,
          assignedTo: opportunity.assignedTo,
          closingDate: opportunity.closingDate,
          notes: opportunity.notes
        })
        .where(eq(opportunities.name, opportunity.name));
      console.log(`Opportunity ${opportunity.name} updated`);
    }
  }
  
  console.log("Indian sample data seeding completed!");
}