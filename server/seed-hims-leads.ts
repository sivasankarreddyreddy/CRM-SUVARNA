import { db } from "./db";
import { leads } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedHIMSLeadsData() {
  console.log("Starting HIMS leads seeding...");

  // Indian healthcare HIMS leads data
  const healthcareLeads = [
    {
      name: "Apollo Hospitals EHR Implementation",
      email: "it.director@apollohospitals.com",
      phone: "+91 98765 43210",
      companyName: "Apollo Hospitals",
      status: "qualified",
      source: "referral",
      notes: "Seeking comprehensive EHR system for 70+ hospitals across India. Current system is outdated and doesn't support mobile access. Decision timeline: Q3 2023."
    },
    {
      name: "Fortis Healthcare PACS Integration",
      email: "tech.head@fortishealthcare.com",
      phone: "+91 98123 45678",
      companyName: "Fortis Healthcare",
      status: "contacted",
      source: "website",
      notes: "Looking to upgrade radiology PACS system and integrate with existing HIS. Needs centralized image storage for 30+ facilities."
    },
    {
      name: "Max Healthcare EMR Upgrade",
      email: "cio@maxhealthcare.in",
      phone: "+91 89456 12378",
      companyName: "Max Healthcare",
      status: "new",
      source: "trade_show",
      notes: "Met at Healthcare IT Expo. Interested in transitioning from paper records to fully electronic medical records across all departments."
    },
    {
      name: "Manipal Hospitals Telemedicine Platform",
      email: "digital@manipalhospitals.com",
      phone: "+91 77890 12345",
      companyName: "Manipal Hospitals",
      status: "qualified",
      source: "partner_referral",
      notes: "Seeking telemedicine solution to connect rural satellite facilities with main hospitals. Budget approved for Q4."
    },
    {
      name: "AIIMS Delhi Research Module",
      email: "research.director@aiims.edu",
      phone: "+91 98551 23456",
      companyName: "AIIMS Delhi",
      status: "negotiation",
      source: "government_tender",
      notes: "Government tender for research data management module to integrate with existing HIMS. Focused on clinical trials tracking and biospecimen management."
    },
    {
      name: "SRL Diagnostics LIS System",
      email: "operations@srlworld.com",
      phone: "+91 99876 54321",
      companyName: "SRL Diagnostics",
      status: "qualified",
      source: "cold_call",
      notes: "Needs laboratory information system with barcode scanning and integration with billing. Current system causing 15% error rate in sample tracking."
    },
    {
      name: "Metropolis Healthcare Analytics Dashboard",
      email: "data.analytics@metropolisindia.com",
      phone: "+91 88765 43210",
      companyName: "Metropolis Healthcare",
      status: "proposal",
      source: "linkedin",
      notes: "Seeking business intelligence solution for lab test metrics and operational performance. Decision maker is Chief Operating Officer."
    },
    {
      name: "Medanta Hospital HIMS Mobile App",
      email: "innovation@medanta.org",
      phone: "+91 97654 32109",
      companyName: "Medanta Medicity",
      status: "contacted",
      source: "webinar",
      notes: "Looking for mobile app development for doctors to access patient records on the go. Must integrate with existing Oracle-based HIMS."
    },
    {
      name: "Narayana Health Cardiology Module",
      email: "cardiac.it@narayanahealth.org",
      phone: "+91 85432 10987",
      companyName: "Narayana Health",
      status: "new",
      source: "employee_referral",
      notes: "Specialized cardiac care module needed for high-volume heart hospital. Must handle complex surgeries, device tracking, and outcomes reporting."
    },
    {
      name: "CMC Vellore Medical Education Integration",
      email: "dean@cmch-vellore.edu",
      phone: "+91 94321 09876",
      companyName: "Christian Medical College",
      status: "qualified",
      source: "conference",
      notes: "Teaching hospital needing medical education features integrated with patient care HIMS. Student evaluation, case reviews, and academic scheduling."
    },
    {
      name: "Tata Memorial Cancer Registry Module",
      email: "registry@tmc.gov.in",
      phone: "+91 83210 98765",
      companyName: "Tata Memorial Hospital",
      status: "proposal",
      source: "govt_initiative",
      notes: "National cancer registry project requiring specialized oncology data management. Must comply with ICMR guidelines and support research activities."
    },
    {
      name: "Dr. Lal PathLabs Patient Portal",
      email: "digital.transformation@lalpathlabs.com",
      phone: "+91 92109 87654",
      companyName: "Dr. Lal PathLabs",
      status: "contacted",
      source: "email_campaign",
      notes: "Online patient portal for test booking, report access, and payment processing. Integration with existing LIS required."
    },
    {
      name: "Thyrocare Cloud Migration Project",
      email: "cloud.strategy@thyrocare.com",
      phone: "+91 81098 76543",
      companyName: "Thyrocare Technologies",
      status: "new",
      source: "website",
      notes: "Moving on-premise HIMS to cloud infrastructure. Concerned about data security and regulatory compliance."
    },
    {
      name: "PGIMER Chandigarh Multi-facility Management",
      email: "director@pgimer.edu.in",
      phone: "+91 79876 54321",
      companyName: "PGIMER Chandigarh",
      status: "contacted",
      source: "govt_database",
      notes: "Government hospital with multiple satellite facilities needing unified HIMS solution. Must handle high patient volumes and integrate with ABDM."
    },
    {
      name: "Kokilaben Hospital Pharmacy Management",
      email: "pharmacy.director@kokilabenhospital.com",
      phone: "+91 96543 21098",
      companyName: "Kokilaben Hospital",
      status: "qualified",
      source: "industry_event",
      notes: "Pharmacy inventory management and e-prescription module. Needs integration with existing HIMS and automated dispensing cabinets."
    }
  ];

  // Get existing leads to update
  const existingLeads = await db.select().from(leads);
  
  // Update the existing leads with new healthcare HIMS data
  for (let i = 0; i < Math.min(existingLeads.length, healthcareLeads.length); i++) {
    const leadToUpdate = existingLeads[i];
    const newLeadData = healthcareLeads[i];
    
    await db.update(leads)
      .set({
        name: newLeadData.name,
        email: newLeadData.email,
        phone: newLeadData.phone,
        companyName: newLeadData.companyName,
        status: newLeadData.status,
        source: newLeadData.source,
        notes: newLeadData.notes
      })
      .where(eq(leads.id, leadToUpdate.id));
    
    console.log(`Updated lead: ${newLeadData.name}`);
  }
  
  // Create a pool of HIMS-related keywords to use for updating remaining leads
  const himsKeywords = [
    "EHR Implementation", "EMR System", "Hospital Information System", 
    "Telemedicine Platform", "Clinical Management Software", "PACS Integration",
    "Laboratory Information System", "Pharmacy Management Module", "Healthcare Analytics",
    "Patient Portal Development", "Mobile Health App", "Medical Billing System",
    "Clinical Decision Support", "Health Records Digitization", "Medical Staff Management",
    "Healthcare Data Migration", "Medical Inventory Management", "Healthcare Cloud Solutions"
  ];
  
  const himsCompanies = [
    "City Hospital Network", "District Medical Center", "Regional Health Services",
    "University Medical College", "Metro Diagnostics", "Global Health Institutes",
    "Premier Medical Group", "Advanced Healthcare Systems", "Horizon Medical Centers",
    "Wellness Hospital Chain", "City Diagnostic Services", "Prime Healthcare Networks"
  ];
  
  const himsContextNotes = [
    "Seeking to modernize their healthcare IT infrastructure with integrated EHR system.",
    "Current paper-based system causing inefficiencies in patient care workflow.",
    "Looking for specialized modules to handle unique departmental requirements.",
    "Expanding operations require scalable HIMS solution with multi-facility support.",
    "Data migration from legacy systems needed with minimal operational disruption.",
    "Regulatory compliance and data security are primary concerns for implementation.",
    "Potential for long-term support contract following successful implementation.",
    "Budget approved for healthcare IT modernization over next fiscal year.",
    "Executive leadership pushing for digital transformation of all clinical processes.",
    "Phased implementation approach preferred, starting with outpatient departments."
  ];
  
  // Update any remaining leads with HIMS context
  for (let i = healthcareLeads.length; i < existingLeads.length; i++) {
    const leadToUpdate = existingLeads[i];
    
    // Generate HIMS-relevant name and details
    const randomKeyword = himsKeywords[i % himsKeywords.length];
    const randomCompany = himsCompanies[i % himsCompanies.length];
    const randomNotes = himsContextNotes[i % himsContextNotes.length];
    
    await db.update(leads)
      .set({
        name: `${randomCompany} ${randomKeyword}`,
        companyName: randomCompany,
        notes: randomNotes
      })
      .where(eq(leads.id, leadToUpdate.id));
    
    console.log(`Updated remaining lead: ${randomCompany} ${randomKeyword}`);
  }

  console.log("HIMS leads seeding completed!");
}