/**
 * Script to run the opportunity company migration
 * This will update all opportunities with null companyId by matching their name with companies
 */

import { runOpportunityCompanyMigration } from './opportunity-company-migration';

async function main() {
  try {
    console.log("Starting opportunity company migration");
    await runOpportunityCompanyMigration();
    console.log("Migration completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();