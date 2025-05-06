/**
 * Direct SQL migration to update opportunities with missing company IDs
 * This script bypasses Drizzle ORM to work directly with SQL for the migration
 */

import { pool } from './db';

async function runSqlMigration() {
  console.log("Starting SQL migration to update opportunities with missing company IDs...");
  const client = await pool.connect();
  
  try {
    // Step 1: Get all opportunities with null company_id
    const opportunitiesResult = await client.query(
      `SELECT * FROM opportunities WHERE company_id IS NULL`
    );
    
    const opportunities = opportunitiesResult.rows;
    console.log(`Found ${opportunities.length} opportunities with null company_id`);
    
    if (opportunities.length === 0) {
      console.log("No opportunities need updating. Migration complete.");
      return;
    }
    
    // Step 2: Get all companies
    const companiesResult = await client.query(
      `SELECT * FROM companies ORDER BY name`
    );
    
    const companies = companiesResult.rows;
    console.log(`Found ${companies.length} companies to match against`);
    
    // Step 3: For each opportunity, try to find a matching company
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const opportunity of opportunities) {
      if (!opportunity.name) {
        console.log(`Skipping opportunity ID ${opportunity.id} - has no name`);
        skippedCount++;
        continue;
      }
      
      // Find a company whose name appears in the opportunity name, or vice versa
      const matchingCompany = companies.find(company => {
        // Case insensitive check
        const oppNameLower = opportunity.name.toLowerCase();
        const compNameLower = company.name.toLowerCase();
        
        return (
          oppNameLower.includes(compNameLower) || 
          compNameLower.includes(oppNameLower)
        );
      });
      
      if (matchingCompany) {
        console.log(`Found company match: "${matchingCompany.name}" (ID: ${matchingCompany.id}) for opportunity "${opportunity.name}" (ID: ${opportunity.id})`);
        
        // Update the opportunity with the matching company ID
        const updateResult = await client.query(
          `UPDATE opportunities SET company_id = $1 WHERE id = $2`,
          [matchingCompany.id, opportunity.id]
        );
        
        if (updateResult.rowCount > 0) {
          console.log(`Updated opportunity ID ${opportunity.id}`);
          updatedCount++;
        } else {
          console.log(`Failed to update opportunity ID ${opportunity.id}`);
          skippedCount++;
        }
      } else {
        console.log(`No company match found for opportunity "${opportunity.name}" (ID: ${opportunity.id})`);
        skippedCount++;
      }
    }
    
    console.log("\nMigration summary:");
    console.log(`- Total opportunities processed: ${opportunities.length}`);
    console.log(`- Successfully updated: ${updatedCount}`);
    console.log(`- Skipped (no match found): ${skippedCount}`);
    console.log("Migration complete.");
    
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute the migration
runSqlMigration()
  .then(() => {
    console.log("Migration successfully completed");
    process.exit(0);
  })
  .catch(error => {
    console.error("Migration failed:", error);
    process.exit(1);
  });