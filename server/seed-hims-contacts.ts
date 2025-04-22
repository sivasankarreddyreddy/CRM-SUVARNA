import { db } from "./db";
import { contacts, companies } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedHIMSContactsData() {
  console.log("Starting HIMS contacts and companies seeding...");

  // Update all contacts with Indian names and related data
  const updatedContacts = [
    { 
      id: 0,
      firstName: "Rajesh",
      lastName: "Sharma",
      title: "Hospital Director",
      phone: "+91 9876543210",
      email: "rajesh.sharma@apollohospitals.com"
    },
    { 
      id: 1,
      firstName: "Priya",
      lastName: "Patel",
      title: "Chief Medical Officer",
      phone: "+91 9871234567",
      email: "priya.patel@fortishealthcare.com"
    },
    { 
      id: 2,
      firstName: "Vikram",
      lastName: "Singh",
      title: "IT Director",
      phone: "+91 9832456781",
      email: "vikram.singh@maxhealthcare.in"
    },
    { 
      id: 3,
      firstName: "Anita",
      lastName: "Reddy",
      title: "Head of Radiology",
      phone: "+91 9645123789",
      email: "anita.reddy@srldiagnostics.com"
    },
    { 
      id: 4,
      firstName: "Sanjay",
      lastName: "Gupta",
      title: "Lab Director",
      phone: "+91 9712385460",
      email: "sanjay.gupta@metropolishealthcare.com"
    },
    { 
      id: 5,
      firstName: "Meera",
      lastName: "Krishnan",
      title: "Hospital Administrator",
      phone: "+91 9867234515",
      email: "meera.krishnan@aiimsindia.edu"
    },
    { 
      id: 6,
      firstName: "Ravi",
      lastName: "Mehta",
      title: "Procurement Manager",
      phone: "+91 9934217865",
      email: "ravi.mehta@cmch-vellore.edu"
    },
    { 
      id: 7,
      firstName: "Sunita",
      lastName: "Joshi",
      title: "Senior Doctor",
      phone: "+91 9756431280",
      email: "sunita.joshi@tmh.gov.in"
    }
  ];

  // Update all existing contacts
  const allContacts = await db.select().from(contacts);
  
  for (const contact of allContacts) {
    // Get template based on id % number of templates
    const template = updatedContacts[contact.id % updatedContacts.length];
    
    // Get company information for email domain
    const company = await db.select().from(companies).where(eq(companies.id, contact.companyId)).limit(1);
    const companyDomain = company.length > 0 ? 
      company[0].website.replace(/(https?:\/\/)?(www\.)?/, '').toLowerCase() : 
      "healthcare.com";
    
    // Create email with template name and company domain
    const email = `${template.firstName.toLowerCase()}.${template.lastName.toLowerCase()}@${companyDomain}`;
    
    // Update the contact
    await db.update(contacts)
      .set({
        firstName: template.firstName,
        lastName: template.lastName,
        title: template.title,
        phone: template.phone,
        email: email
      })
      .where(eq(contacts.id, contact.id));
    
    console.log(`Updated contact: ${template.firstName} ${template.lastName}`);
  }

  // Update company names and information
  const updatedCompanies = [
    {
      id: 0,
      name: "Apollo Hospitals",
      industry: "Multi-specialty Hospital",
      website: "apollohospitals.com",
      phone: "+91 44 2829 6000",
      address: "Greams Road, Chennai"
    },
    {
      id: 1,
      name: "Fortis Healthcare",
      industry: "Multi-specialty Hospital", 
      website: "fortishealthcare.com",
      phone: "+91 11 4277 6222",
      address: "Bandra Kurla Complex, Mumbai"
    },
    {
      id: 2,
      name: "Max Healthcare",
      industry: "Multi-specialty Hospital",
      website: "maxhealthcare.in",
      phone: "+91 11 4055 4055",
      address: "Saket District, New Delhi"
    },
    {
      id: 3,
      name: "SRL Diagnostics",
      industry: "Diagnostic Center",
      website: "srlworld.com",
      phone: "+91 124 391 4848",
      address: "Sector 44, Noida"
    },
    {
      id: 4,
      name: "Metropolis Healthcare",
      industry: "Diagnostic Center",
      website: "metropolisindia.com",
      phone: "+91 22 3399 3939",
      address: "Andheri West, Mumbai"
    },
    {
      id: 5,
      name: "AIIMS Delhi",
      industry: "Government Hospital",
      website: "aiims.edu",
      phone: "+91 11 2658 8500",
      address: "Ansari Nagar, New Delhi"
    },
    {
      id: 6,
      name: "Christian Medical College",
      industry: "Medical College",
      website: "cmch-vellore.edu",
      phone: "+91 416 222 2102",
      address: "Vellore, Tamil Nadu"
    },
    {
      id: 7,
      name: "Tata Memorial Hospital",
      industry: "Specialty Hospital",
      website: "tmc.gov.in",
      phone: "+91 22 2417 7000",
      address: "Parel, Mumbai"
    },
    {
      id: 8,
      name: "Medanta Medicity",
      industry: "Multi-specialty Hospital",
      website: "medanta.org",
      phone: "+91 124 441 4141",
      address: "Sector 38, Gurugram"
    },
    {
      id: 9,
      name: "Narayana Health",
      industry: "Multi-specialty Hospital",
      website: "narayanahealth.org",
      phone: "+91 80 2216 0361",
      address: "Bommasandra, Bangalore"
    }
  ];

  // Update all existing companies
  const allCompanies = await db.select().from(companies);
  
  for (const company of allCompanies) {
    // Get template based on id % number of templates
    const template = updatedCompanies[company.id % updatedCompanies.length];
    
    // Update the company
    await db.update(companies)
      .set({
        name: template.name,
        industry: template.industry,
        website: template.website,
        phone: template.phone,
        address: template.address
      })
      .where(eq(companies.id, company.id));
    
    console.log(`Updated company: ${template.name}`);
  }

  console.log("HIMS contacts and companies seeding completed!");
}