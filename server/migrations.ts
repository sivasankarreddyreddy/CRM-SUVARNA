import { db, pool } from "./db";
import { sql } from "drizzle-orm";
import { companies, leads } from "@shared/schema";
import { eq } from "drizzle-orm";

// Function to run migrations for teams and user hierarchy
export async function runMigrations() {
  console.log("Running database migrations...");
  
  try {
    // Create teams table if it doesn't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER NOT NULL
      );
    `);
    
    // Add manager_id and team_id columns to users table
    const userTableResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'manager_id';
    `);
    
    if (userTableResult.rowCount === 0) {
      console.log("Adding manager_id and team_id columns to users table");
      await db.execute(sql`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS manager_id INTEGER,
        ADD COLUMN IF NOT EXISTS team_id INTEGER,
        ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      `);
    }
    
    // Add team_id column to leads table
    const leadsTableResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'team_id';
    `);
    
    if (leadsTableResult.rowCount === 0) {
      console.log("Adding team_id column to leads table");
      await db.execute(sql`
        ALTER TABLE leads
        ADD COLUMN IF NOT EXISTS team_id INTEGER;
      `);
    }
    
    // Add company_id column to leads table
    const leadsCompanyIdResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'company_id';
    `);
    
    if (leadsCompanyIdResult.rowCount === 0) {
      console.log("Adding company_id column to leads table");
      await db.execute(sql`
        ALTER TABLE leads
        ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id);
      `);
      
      // Populate company_id based on company_name
      console.log("Populating company_id values for leads based on company names");
      
      // Get all leads with company names and all companies
      const allLeads = await db.execute(sql`
        SELECT id, company_name FROM leads WHERE company_name IS NOT NULL
      `);
      
      const allCompanies = await db.execute(sql`
        SELECT id, name FROM companies
      `);
      
      let updatedCount = 0;
      
      // For each lead, find matching company and update
      for (const lead of allLeads.rows) {
        if (lead.company_name) {
          // Find a matching company by name (case-insensitive)
          const matchingCompany = allCompanies.rows.find(
            company => company.name.toLowerCase() === lead.company_name.toLowerCase()
          );
          
          if (matchingCompany) {
            // Update the lead with the matching company ID
            await db.execute(sql`
              UPDATE leads 
              SET company_id = ${matchingCompany.id} 
              WHERE id = ${lead.id}
            `);
            
            updatedCount++;
          }
        }
      }
      
      console.log(`Updated ${updatedCount} leads with company IDs`);
    }
    
    // Add team_id column to opportunities table
    const opportunitiesTableResult = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'opportunities' AND column_name = 'team_id';
    `);
    
    if (opportunitiesTableResult.rowCount === 0) {
      console.log("Adding team_id column to opportunities table");
      await db.execute(sql`
        ALTER TABLE opportunities
        ADD COLUMN IF NOT EXISTS team_id INTEGER;
      `);
    }
    
    console.log("Database migrations completed successfully");
    return true;
  } catch (error) {
    console.error("Error running migrations:", error);
    return false;
  }
}