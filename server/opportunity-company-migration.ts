import { db } from './db';
import { opportunities, companies } from '@shared/schema';
import { eq, like, ilike, or } from 'drizzle-orm';

/**
 * Migration script to update opportunities that have null companyId
 * This script will attempt to match an opportunity with a company based on name similarity
 */
export async function updateOpportunitiesWithCompanyIds() {
  console.log("Starting migration to update opportunities with missing company IDs...");
  
  try {
    // 1. Get all opportunities with null companyId
    const opportunitiesWithNullCompany = await db
      .select()
      .from(opportunities)
      .where(eq(opportunities.companyId, null as any));
    
    console.log(`Found ${opportunitiesWithNullCompany.length} opportunities with null companyId`);
    
    if (opportunitiesWithNullCompany.length === 0) {
      console.log("No opportunities need updating. Migration complete.");
      return;
    }
    
    // 2. Get all companies
    const allCompanies = await db.select().from(companies);
    console.log(`Found ${allCompanies.length} companies to match against`);
    
    // 3. For each opportunity, try to find a matching company
    let updatedCount = 0;
    let skippedCount = 0;
    
    for (const opportunity of opportunitiesWithNullCompany) {
      if (!opportunity.name) {
        console.log(`Skipping opportunity ID ${opportunity.id} - has no name`);
        skippedCount++;
        continue;
      }
      
      // Try to find matching company by name
      const matchingCompany = allCompanies.find(company => {
        // Case insensitive check if company name appears in opportunity name or vice versa
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
        const updateResult = await db
          .update(opportunities)
          .set({ companyId: matchingCompany.id })
          .where(eq(opportunities.id, opportunity.id));
        
        console.log(`Updated opportunity ID ${opportunity.id}`);
        updatedCount++;
      } else {
        console.log(`No company match found for opportunity "${opportunity.name}" (ID: ${opportunity.id})`);
        skippedCount++;
      }
    }
    
    console.log("\nMigration summary:");
    console.log(`- Total opportunities processed: ${opportunitiesWithNullCompany.length}`);
    console.log(`- Successfully updated: ${updatedCount}`);
    console.log(`- Skipped (no match found): ${skippedCount}`);
    console.log("Migration complete.");
    
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

// Function to run the migration independently
export async function runOpportunityCompanyMigration() {
  try {
    await updateOpportunitiesWithCompanyIds();
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

// In ESM, we can't use require.main === module, so we'll check if imported by another module
// This is only meant to be executed directly from run-opportunity-company-migration.ts