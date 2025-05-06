import { db, pool } from "../db";
import { companies, leads } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * This migration adds a company_id column to the leads table
 * and populates it based on the company name if possible
 */
export async function addCompanyIdToLeads() {
  console.log("Starting manual migration: Adding company_id column to leads table");
  
  try {
    // First, check if the column already exists
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='leads' AND column_name='company_id'
    `;
    
    const { rows: columnCheck } = await pool.query(checkQuery);
    
    if (columnCheck.length === 0) {
      console.log("Column company_id doesn't exist yet, creating it...");
      
      // Add the company_id column to the leads table
      await pool.query(`
        ALTER TABLE leads 
        ADD COLUMN company_id INTEGER REFERENCES companies(id)
      `);
      
      console.log("Column company_id added to leads table");
      
      // Get all the leads with company names
      const allLeads = await db.select().from(leads).where(eq(leads.companyName, leads.companyName));
      const allCompanies = await db.select().from(companies);
      
      let updatedCount = 0;
      let notFoundCount = 0;
      
      // For each lead with a company name, try to find a matching company and update the company_id
      for (const lead of allLeads) {
        if (lead.companyName) {
          // Find a matching company by name (case-insensitive)
          const matchingCompany = allCompanies.find(
            company => company.name.toLowerCase() === lead.companyName?.toLowerCase()
          );
          
          if (matchingCompany) {
            // Update the lead with the matching company ID
            await db
              .update(leads)
              .set({ companyId: matchingCompany.id })
              .where(eq(leads.id, lead.id));
            
            updatedCount++;
          } else {
            notFoundCount++;
          }
        }
      }
      
      console.log(`Migration complete. Updated ${updatedCount} leads with company IDs. ${notFoundCount} companies not found.`);
    } else {
      console.log("Column company_id already exists in leads table, skipping migration");
    }
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}