import { db } from "./db";
import { contacts, companies } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedHIMSContactsData() {
  console.log("Starting HIMS contacts and companies seeding...");

  // Indian healthcare contact data
  const healthcareContacts = [
    {
      firstName: "Rajesh",
      lastName: "Sharma",
      title: "Hospital Director",
      phone: "+91 9876543210",
      notes: "Senior administrator with 15+ years of experience in hospital management"
    },
    {
      firstName: "Priya",
      lastName: "Patel",
      title: "Chief Medical Officer",
      phone: "+91 9871234567",
      notes: "Board-certified physician with focus on healthcare quality management"
    },
    {
      firstName: "Vikram",
      lastName: "Singh",
      title: "IT Director",
      phone: "+91 9832456781",
      notes: "Technology expert specializing in healthcare systems integration"
    },
    {
      firstName: "Anita",
      lastName: "Reddy",
      title: "Head of Radiology",
      phone: "+91 9645123789",
      notes: "Radiology specialist interested in digital imaging solutions"
    },
    {
      firstName: "Sanjay",
      lastName: "Gupta",
      title: "Lab Director",
      phone: "+91 9712385460",
      notes: "Pathology expert looking for laboratory information systems"
    },
    {
      firstName: "Meera",
      lastName: "Krishnan",
      title: "Hospital Administrator",
      phone: "+91 9867234515",
      notes: "Focused on operational efficiency and process improvement"
    },
    {
      firstName: "Ravi",
      lastName: "Mehta",
      title: "Procurement Manager",
      phone: "+91 9934217865",
      notes: "Manages procurement for medical equipment and IT systems"
    },
    {
      firstName: "Sunita",
      lastName: "Joshi",
      title: "Senior Doctor",
      phone: "+91 9756431280",
      notes: "Physician interested in telemedicine solutions"
    },
    {
      firstName: "Kiran",
      lastName: "Kumar",
      title: "CTO",
      phone: "+91 9834567210",
      notes: "Technology leader with experience in healthcare digital transformation"
    },
    {
      firstName: "Deepa",
      lastName: "Nair",
      title: "Medical Superintendent",
      phone: "+91 9976541230",
      notes: "Oversees hospital operations and patient care quality"
    },
    {
      firstName: "Amit",
      lastName: "Verma",
      title: "Finance Director",
      phone: "+91 9865432107",
      notes: "Financial planning expert for healthcare institutions"
    },
    {
      firstName: "Neha",
      lastName: "Agarwal",
      title: "Quality Manager",
      phone: "+91 9745321890",
      notes: "Specialist in healthcare accreditation and quality control"
    }
  ];

  // Indian healthcare company data
  const healthcareCompanies = [
    {
      name: "Apollo Hospitals",
      industry: "Multi-specialty Hospital",
      website: "apollohospitals.com",
      phone: "+91 44 2829 6000",
      address: "Greams Road, Chennai",
      notes: "Leading private healthcare provider with hospitals across India"
    },
    {
      name: "Fortis Healthcare",
      industry: "Multi-specialty Hospital",
      website: "fortishealthcare.com",
      phone: "+91 11 4277 6222",
      address: "Bandra Kurla Complex, Mumbai",
      notes: "Multi-specialty healthcare provider with presence in Delhi NCR and other metros"
    },
    {
      name: "Max Healthcare",
      industry: "Multi-specialty Hospital",
      website: "maxhealthcare.in",
      phone: "+91 11 4055 4055",
      address: "Saket District, New Delhi",
      notes: "Leading hospital chain in North India with super-specialty centers"
    },
    {
      name: "SRL Diagnostics",
      industry: "Diagnostic Center",
      website: "srlworld.com",
      phone: "+91 124 391 4848",
      address: "Sector 44, Noida",
      notes: "India's largest diagnostics chain with over 400 laboratories"
    },
    {
      name: "Metropolis Healthcare",
      industry: "Diagnostic Center",
      website: "metropolisindia.com",
      phone: "+91 22 3399 3939",
      address: "Andheri West, Mumbai",
      notes: "Leading diagnostics company with extensive network across India"
    },
    {
      name: "AIIMS Delhi",
      industry: "Government Hospital",
      website: "aiims.edu",
      phone: "+91 11 2658 8500",
      address: "Ansari Nagar, New Delhi",
      notes: "Premier government medical institution and hospital"
    },
    {
      name: "Christian Medical College",
      industry: "Medical College",
      website: "cmch-vellore.edu",
      phone: "+91 416 222 2102",
      address: "Vellore, Tamil Nadu",
      notes: "Leading medical college and teaching hospital in South India"
    },
    {
      name: "Tata Memorial Hospital",
      industry: "Specialty Hospital",
      website: "tmc.gov.in",
      phone: "+91 22 2417 7000",
      address: "Parel, Mumbai",
      notes: "India's premier cancer care and research center"
    },
    {
      name: "Medanta Medicity",
      industry: "Multi-specialty Hospital",
      website: "medanta.org",
      phone: "+91 124 441 4141",
      address: "Sector 38, Gurugram",
      notes: "Multi-super specialty institute led by renowned physicians"
    },
    {
      name: "Narayana Health",
      industry: "Multi-specialty Hospital",
      website: "narayanahealth.org",
      phone: "+91 80 2216 0361",
      address: "Bommasandra, Bangalore",
      notes: "Affordable healthcare provider known for cardiac care"
    },
    {
      name: "Manipal Hospitals",
      industry: "Multi-specialty Hospital",
      website: "manipalhospitals.com",
      phone: "+91 80 2502 4444",
      address: "HAL Airport Road, Bangalore",
      notes: "Tertiary care hospital chain with academic background"
    },
    {
      name: "Kokilaben Hospital",
      industry: "Multi-specialty Hospital",
      website: "kokilabenhospital.com",
      phone: "+91 22 4269 6969",
      address: "Andheri West, Mumbai",
      notes: "Advanced multi-specialty tertiary care hospital"
    },
    {
      name: "PGIMER Chandigarh",
      industry: "Government Hospital",
      website: "pgimer.edu.in",
      phone: "+91 172 2746018",
      address: "Sector 12, Chandigarh",
      notes: "Premier medical and research institution in North India"
    },
    {
      name: "Dr. Lal PathLabs",
      industry: "Diagnostic Center",
      website: "lalpathlabs.com",
      phone: "+91 11 3988 7777",
      address: "Block E, Sector 18, Noida",
      notes: "Diagnostic chain with over 200 clinical laboratories"
    },
    {
      name: "Thyrocare Technologies",
      industry: "Diagnostic Center",
      website: "thyrocare.com",
      phone: "+91 22 2762 2762",
      address: "D-37/1, TTC Industrial Area, Navi Mumbai",
      notes: "Specialized in preventive healthcare diagnostics"
    }
  ];

  // Create or update companies
  for (const companyData of healthcareCompanies) {
    // Check if company exists by name (simple match)
    const existingCompanies = await db.select().from(companies).where(eq(companies.name, companyData.name));
    
    if (existingCompanies.length > 0) {
      // Update existing company
      await db.update(companies)
        .set({
          industry: companyData.industry,
          website: companyData.website,
          phone: companyData.phone,
          address: companyData.address,
          notes: companyData.notes
        })
        .where(eq(companies.name, companyData.name));
      
      console.log(`Updated company: ${companyData.name}`);
    } else {
      // Find a company to replace
      const oldCompany = await db.select().from(companies).limit(1);
      if (oldCompany.length > 0) {
        await db.update(companies)
          .set({
            name: companyData.name,
            industry: companyData.industry,
            website: companyData.website,
            phone: companyData.phone,
            address: companyData.address,
            notes: companyData.notes
          })
          .where(eq(companies.id, oldCompany[0].id));
        
        console.log(`Replaced company with: ${companyData.name}`);
      } else {
        // Handle error - no companies to update
        console.log(`Could not find a company to replace with ${companyData.name}`);
      }
    }
  }
  
  // Get all companies for contact-company association
  const updatedCompanies = await db.select().from(companies);
  
  // Create or update contacts
  let contactIndex = 0;
  for (const contactData of healthcareContacts) {
    // We'll distribute contacts among companies
    const companyIndex = contactIndex % updatedCompanies.length;
    const company = updatedCompanies[companyIndex];
    
    // Generate email based on name and company
    const email = `${contactData.firstName.toLowerCase()}.${contactData.lastName.toLowerCase()}@${company.website}`;
    
    // Check if we have an existing contact at this index
    const existingContacts = await db.select().from(contacts).limit(1).offset(contactIndex);
    
    if (existingContacts.length > 0) {
      // Update existing contact
      await db.update(contacts)
        .set({
          firstName: contactData.firstName,
          lastName: contactData.lastName,
          title: contactData.title,
          phone: contactData.phone,
          email: email,
          companyId: company.id,
          notes: contactData.notes
        })
        .where(eq(contacts.id, existingContacts[0].id));
      
      console.log(`Updated contact: ${contactData.firstName} ${contactData.lastName}`);
    } else {
      // Find any contact to replace
      const oldContact = await db.select().from(contacts).limit(1);
      if (oldContact.length > 0) {
        await db.update(contacts)
          .set({
            firstName: contactData.firstName,
            lastName: contactData.lastName,
            title: contactData.title,
            phone: contactData.phone,
            email: email,
            companyId: company.id,
            notes: contactData.notes
          })
          .where(eq(contacts.id, oldContact[0].id));
        
        console.log(`Replaced contact with: ${contactData.firstName} ${contactData.lastName}`);
      } else {
        // Handle error - no contacts to update
        console.log(`Could not find a contact to replace with ${contactData.firstName} ${contactData.lastName}`);
      }
    }
    
    contactIndex++;
  }
  
  // Update any remaining contacts with Indian names pattern
  const remainingContacts = await db.select().from(contacts).offset(healthcareContacts.length);
  
  const indianFirstNames = ["Arjun", "Deepak", "Rahul", "Sunil", "Anil", "Nikhil", "Vivek", "Rohit", "Ajay", "Vinod"];
  const indianLastNames = ["Patel", "Sharma", "Singh", "Kumar", "Reddy", "Shah", "Joshi", "Nair", "Mehta", "Verma"];
  const indianTitles = ["Doctor", "Head Nurse", "Medical Officer", "Resident Doctor", "IT Manager", "Administrative Officer", "Facility Manager"];
  
  let index = 0;
  for (const contact of remainingContacts) {
    const firstName = indianFirstNames[index % indianFirstNames.length];
    const lastName = indianLastNames[index % indianLastNames.length];
    const title = indianTitles[index % indianTitles.length];
    const companyId = updatedCompanies[index % updatedCompanies.length].id;
    const company = updatedCompanies[index % updatedCompanies.length];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${company.website}`;
    
    await db.update(contacts)
      .set({
        firstName: firstName,
        lastName: lastName,
        title: title,
        email: email,
        companyId: companyId,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`
      })
      .where(eq(contacts.id, contact.id));
    
    console.log(`Updated remaining contact to: ${firstName} ${lastName}`);
    index++;
  }

  console.log("HIMS contacts and companies seeding completed!");
}