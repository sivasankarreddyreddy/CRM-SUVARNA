import { db } from "./db";
import { leads, opportunities, companies, products } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedHIMSData() {
  console.log("Starting HIMS data seeding...");
  
  // Create or update companies with HIMS context
  const companyData = [
    {
      name: "Apollo Hospitals",
      industry: "Healthcare",
      website: "https://www.apollohospitals.com",
      phone: "+91-44-28296000",
      address: "No. 21, Greams Lane, Off Greams Road, Chennai 600006",
      notes: "Leading private healthcare provider with hospitals across India",
      createdBy: 1
    },
    {
      name: "Fortis Healthcare",
      industry: "Healthcare",
      website: "https://www.fortishealthcare.com",
      phone: "+91-124-4921021",
      address: "Escorts Heart Institute and Research Centre, Okhla Road, New Delhi 110025",
      notes: "Multi-specialty healthcare provider with presence in Delhi NCR and other metros",
      createdBy: 1
    },
    {
      name: "Max Healthcare",
      industry: "Healthcare",
      website: "https://www.maxhealthcare.in",
      phone: "+91-11-40554055",
      address: "1, Press Enclave Road, Saket, New Delhi 110017",
      notes: "Leading hospital chain in North India with super-specialty centers",
      createdBy: 1
    },
    {
      name: "SRL Diagnostics",
      industry: "Diagnostics",
      website: "https://www.srlworld.com",
      phone: "+91-124-3914848",
      address: "Plot No. 1, Sector 18, Gurugram 122015",
      notes: "India's largest diagnostics chain with over 400 laboratories",
      createdBy: 1
    },
    {
      name: "Metropolis Healthcare",
      industry: "Diagnostics",
      website: "https://www.metropolisindia.com",
      phone: "+91-22-33993939",
      address: "250-D, Udyog Bhavan, Worli, Mumbai 400030",
      notes: "Leading diagnostics company with extensive network across India",
      createdBy: 1
    },
    {
      name: "AIIMS Delhi",
      industry: "Government Healthcare",
      website: "https://www.aiims.edu",
      phone: "+91-11-26588500",
      address: "Ansari Nagar East, New Delhi 110029",
      notes: "Premier government medical institution and hospital",
      createdBy: 1
    },
    {
      name: "Christian Medical College",
      industry: "Medical Education",
      website: "https://www.cmch-vellore.edu",
      phone: "+91-416-2222102",
      address: "Ida Scudder Road, Vellore 632004",
      notes: "Leading medical college and teaching hospital in South India",
      createdBy: 1
    },
    {
      name: "Tata Memorial Hospital",
      industry: "Specialty Healthcare",
      website: "https://tmc.gov.in",
      phone: "+91-22-24177000",
      address: "Dr. E Borges Road, Parel, Mumbai 400012",
      notes: "India's premier cancer care and research center",
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
  
  // Create HIMS-related products
  const productData = [
    {
      name: "MediTrack EHR",
      description: "Electronic Health Record system for hospitals and clinics",
      price: "1500000",
      sku: "HIMS-EHR-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack PACS",
      description: "Picture Archiving and Communication System for radiology",
      price: "2200000",
      sku: "HIMS-PACS-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack LIS",
      description: "Laboratory Information System for diagnostic labs",
      price: "1800000",
      sku: "HIMS-LIS-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack RIS",
      description: "Radiology Information System for diagnostic centers",
      price: "1600000",
      sku: "HIMS-RIS-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack HMS",
      description: "Complete Hospital Management System",
      price: "3500000",
      sku: "HIMS-HMS-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack Telemedicine",
      description: "Integrated telemedicine platform for remote consultations",
      price: "1200000",
      sku: "HIMS-TELE-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack Mobile",
      description: "Mobile app for doctors and patients",
      price: "800000",
      sku: "HIMS-MOB-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack Analytics",
      description: "Healthcare analytics and reporting platform",
      price: "1200000",
      sku: "HIMS-ANLY-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack Cloud",
      description: "Cloud hosting for HIMS systems",
      price: "600000",
      sku: "HIMS-CLD-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack Implementation",
      description: "Professional implementation services",
      price: "500000",
      sku: "HIMS-IMPL-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack Training",
      description: "Staff training program",
      price: "300000",
      sku: "HIMS-TRN-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    },
    {
      name: "MediTrack Support Premium",
      description: "Premium 24/7 support package",
      price: "450000",
      sku: "HIMS-SUP-001",
      isActive: true,
      tax: "18",
      createdBy: 1
    }
  ];
  
  for (const product of productData) {
    const existingProduct = await db.select().from(products).where(eq(products.name, product.name)).limit(1);
    
    if (existingProduct.length === 0) {
      await db.insert(products).values(product);
      console.log(`Product ${product.name} created`);
    } else {
      await db.update(products)
        .set({ 
          description: product.description,
          price: product.price,
          sku: product.sku,
          isActive: product.isActive,
          tax: product.tax
        })
        .where(eq(products.name, product.name));
      console.log(`Product ${product.name} updated`);
    }
  }
  
  // Define lead data for different teams (with teamId assigned)
  const leadData = [
    // Hospital Enterprise Team (Team 1) Leads
    {
      name: "Apollo Hospitals EHR Implementation",
      email: "it@apollohospitals.com",
      phone: "+91-44-28296000",
      companyName: "Apollo Hospitals",
      status: "qualified",
      source: "referral",
      teamId: 1,
      assignedTo: 9, // This will be Amit Gupta
      notes: "Looking for a comprehensive EHR system for their Chennai and Hyderabad branches",
      createdBy: 1
    },
    {
      name: "Fortis Healthcare PACS Upgrade",
      email: "tech@fortishealthcare.com",
      phone: "+91-124-4921021",
      companyName: "Fortis Healthcare",
      status: "qualified",
      source: "conference",
      teamId: 1,
      assignedTo: 10, // This will be Sanjay Verma
      notes: "Current PACS system is outdated, looking for modern solution with cloud integration",
      createdBy: 1
    },
    {
      name: "Max Healthcare HMS Implementation",
      email: "systems@maxhealthcare.in",
      phone: "+91-11-40554055",
      companyName: "Max Healthcare",
      status: "new",
      source: "website",
      teamId: 1,
      assignedTo: 11, // This will be Kavita Joshi
      notes: "Need comprehensive hospital management system for their expanding network",
      createdBy: 1
    },
    
    // Diagnostic Centers Team (Team 2) Leads
    {
      name: "SRL Diagnostics LIS Integration",
      email: "tech@srlworld.com",
      phone: "+91-124-3914848",
      companyName: "SRL Diagnostics",
      status: "qualified",
      source: "website",
      teamId: 2,
      assignedTo: 13, // This will be Neha Agarwal
      notes: "Looking for LIS that can integrate with their existing systems",
      createdBy: 1
    },
    {
      name: "Metropolis RIS Deployment",
      email: "it@metropolisindia.com",
      phone: "+91-22-33993939",
      companyName: "Metropolis Healthcare",
      status: "qualified",
      source: "partner_referral",
      teamId: 2,
      assignedTo: 14, // This will be Vivek Shah
      notes: "Expanding radiology operations and need modern RIS",
      createdBy: 1
    },
    {
      name: "Thyrocare PACS Solution",
      email: "tech@thyrocare.com",
      phone: "+91-22-30906060",
      companyName: "Thyrocare Technologies",
      status: "new",
      source: "cold_call",
      teamId: 2,
      assignedTo: 15, // This will be Riya Kapoor
      notes: "Looking for cost-effective PACS solution for their diagnostic centers",
      createdBy: 1
    },
    
    // Government Health Team (Team 3) Leads
    {
      name: "AIIMS Delhi EHR Implementation",
      email: "it@aiims.edu",
      phone: "+91-11-26588500",
      companyName: "AIIMS Delhi",
      status: "qualified",
      source: "government_tender",
      teamId: 3,
      assignedTo: 17, // This will be Suresh Kumar
      notes: "Government tender for EHR implementation at premier medical institution",
      createdBy: 1
    },
    {
      name: "Punjab Health Department Telemedicine",
      email: "director@punjabhealth.gov.in",
      phone: "+91-172-2621169",
      companyName: "Punjab Health Department",
      status: "new",
      source: "direct_inquiry",
      teamId: 3,
      assignedTo: 18, // This will be Anita Rao
      notes: "State-wide telemedicine initiative for rural areas",
      createdBy: 1
    },
    
    // Specialty Clinics Team (Team 4) Leads
    {
      name: "Tata Memorial Hospital Oncology Module",
      email: "it@tmh.gov.in",
      phone: "+91-22-24177000",
      companyName: "Tata Memorial Hospital",
      status: "qualified",
      source: "industry_event",
      teamId: 4,
      assignedTo: 20, // This will be Divya Menon
      notes: "Specialized oncology module for cancer treatment center",
      createdBy: 1
    },
    {
      name: "LVPEI Ophthalmology HIMS",
      email: "tech@lvpei.org",
      phone: "+91-40-30612020",
      companyName: "L V Prasad Eye Institute",
      status: "new",
      source: "website",
      teamId: 4,
      assignedTo: 21, // This will be Arjun Nair
      notes: "Specialized HIMS for ophthalmology practice",
      createdBy: 1
    },
    
    // Medical Colleges Team (Team 5) Leads
    {
      name: "CMC Vellore Training Module",
      email: "systems@cmch-vellore.edu",
      phone: "+91-416-2222102",
      companyName: "Christian Medical College",
      status: "qualified",
      source: "educational_conference",
      teamId: 5,
      assignedTo: 24, // This will be Anjali Bose
      notes: "HIMS with medical student training modules",
      createdBy: 1
    },
    {
      name: "JIPMER Academic HIMS",
      email: "director@jipmer.edu.in",
      phone: "+91-413-2272380",
      companyName: "JIPMER",
      status: "new",
      source: "email_campaign",
      teamId: 5,
      assignedTo: 25, // This will be Rajat Das
      notes: "HIMS with academic research and publication tracking",
      createdBy: 1
    },
    
    // Rural Healthcare Team (Team 6) Leads
    {
      name: "Karnataka PHC Network",
      email: "health-commissioner@karnataka.gov.in",
      phone: "+91-80-22210651",
      companyName: "Karnataka Health Department",
      status: "qualified",
      source: "government_initiative",
      teamId: 6,
      assignedTo: 28, // This will be Manish Mohan
      notes: "HIMS for network of Primary Health Centers in rural Karnataka",
      createdBy: 1
    },
    {
      name: "Rural Telemedicine Project Maharashtra",
      email: "healthtech@maharashtra.gov.in",
      phone: "+91-22-22025456",
      companyName: "Maharashtra Health Services",
      status: "new",
      source: "government_initiative",
      teamId: 6,
      assignedTo: 29, // This will be Asha Patil
      notes: "Telemedicine solution for rural Maharashtra",
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
    // Hospital Enterprise Team (Team 1) Opportunities
    {
      name: "Apollo Hospitals EHR System",
      companyId: 1, // Apollo
      value: "12500000",
      stage: "proposal",
      teamId: 1,
      assignedTo: 9, // Amit Gupta
      expectedCloseDate: new Date("2023-08-30"),
      probability: 60,
      notes: "Comprehensive EHR system for multi-location deployment",
      createdBy: 1
    },
    {
      name: "Fortis Healthcare PACS and RIS",
      companyId: 2, // Fortis
      value: "9800000",
      stage: "negotiation",
      teamId: 1,
      assignedTo: 10, // Sanjay Verma
      expectedCloseDate: new Date("2023-07-15"),
      probability: 75,
      notes: "Integrated PACS and RIS solution with cloud archiving",
      createdBy: 1
    },
    
    // Diagnostic Centers Team (Team 2) Opportunities
    {
      name: "SRL Diagnostics LIS Implementation",
      companyId: 4, // SRL
      value: "7500000",
      stage: "qualification",
      teamId: 2,
      assignedTo: 13, // Neha Agarwal
      expectedCloseDate: new Date("2023-09-15"),
      probability: 45,
      notes: "Nation-wide LIS deployment with integration services",
      createdBy: 1
    },
    {
      name: "Metropolis Healthcare Analytics Platform",
      companyId: 5, // Metropolis
      value: "4200000",
      stage: "proposal",
      teamId: 2,
      assignedTo: 14, // Vivek Shah
      expectedCloseDate: new Date("2023-07-30"),
      probability: 55,
      notes: "Business intelligence and analytics for diagnostic data",
      createdBy: 1
    },
    
    // Government Health Team (Team 3) Opportunities
    {
      name: "AIIMS Delhi HMS Implementation",
      companyId: 6, // AIIMS
      value: "42000000",
      stage: "proposal",
      teamId: 3,
      assignedTo: 17, // Suresh Kumar
      expectedCloseDate: new Date("2023-12-15"),
      probability: 50,
      notes: "Large-scale HMS implementation for AIIMS Delhi",
      createdBy: 1
    },
    {
      name: "Punjab Telemedicine Network",
      companyId: null,
      value: "28000000",
      stage: "qualification",
      teamId: 3,
      assignedTo: 18, // Anita Rao
      expectedCloseDate: new Date("2023-10-30"),
      probability: 35,
      notes: "State-wide telemedicine infrastructure deployment",
      createdBy: 1
    },
    
    // Specialty Clinics Team (Team 4) Opportunities
    {
      name: "Tata Memorial Oncology HIMS",
      companyId: 8, // Tata Memorial
      value: "15000000",
      stage: "closing",
      teamId: 4,
      assignedTo: 20, // Divya Menon
      expectedCloseDate: new Date("2023-06-30"),
      probability: 85,
      notes: "Specialized oncology module integration with existing systems",
      createdBy: 1
    },
    {
      name: "LVPEI Ophthalmology System",
      companyId: null,
      value: "8500000",
      stage: "proposal",
      teamId: 4,
      assignedTo: 21, // Arjun Nair
      expectedCloseDate: new Date("2023-08-15"),
      probability: 60,
      notes: "Custom ophthalmology-focused HIMS with image management",
      createdBy: 1
    },
    
    // Medical Colleges Team (Team 5) Opportunities
    {
      name: "CMC Vellore Academic HIMS",
      companyId: 7, // CMC
      value: "22500000",
      stage: "negotiation",
      teamId: 5,
      assignedTo: 24, // Anjali Bose
      expectedCloseDate: new Date("2023-07-30"),
      probability: 70,
      notes: "Integrated academic and clinical HIMS for medical college",
      createdBy: 1
    },
    {
      name: "JIPMER Research Module Integration",
      companyId: null,
      value: "6800000",
      stage: "proposal",
      teamId: 5,
      assignedTo: 25, // Rajat Das
      expectedCloseDate: new Date("2023-09-15"),
      probability: 50,
      notes: "Research module integration with existing HIMS",
      createdBy: 1
    },
    
    // Rural Healthcare Team (Team 6) Opportunities
    {
      name: "Karnataka Rural PHC Network",
      companyId: null,
      value: "32000000",
      stage: "qualification",
      teamId: 6,
      assignedTo: 28, // Manish Mohan
      expectedCloseDate: new Date("2023-10-15"),
      probability: 40,
      notes: "HIMS deployment across 200+ rural primary health centers",
      createdBy: 1
    },
    {
      name: "Maharashtra Telemedicine Project",
      companyId: null,
      value: "18500000",
      stage: "proposal",
      teamId: 6,
      assignedTo: 29, // Asha Patil
      expectedCloseDate: new Date("2023-08-30"),
      probability: 55,
      notes: "Telemedicine infrastructure for 100 remote locations",
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
          value: opportunity.value,
          stage: opportunity.stage,
          teamId: opportunity.teamId,
          assignedTo: opportunity.assignedTo,
          expectedCloseDate: opportunity.expectedCloseDate,
          probability: opportunity.probability,
          notes: opportunity.notes
        })
        .where(eq(opportunities.name, opportunity.name));
      console.log(`Opportunity ${opportunity.name} updated`);
    }
  }
  
  console.log("HIMS data seeding completed!");
}