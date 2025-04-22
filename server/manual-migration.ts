import { db } from "./db";
import { sql } from "drizzle-orm";

async function runManualMigration() {
  try {
    console.log("Starting manual database schema update...");
    
    // Add leadId column to opportunities table
    await db.execute(sql`
      ALTER TABLE IF EXISTS opportunities 
      ADD COLUMN IF NOT EXISTS lead_id INTEGER REFERENCES leads(id);
    `);
    console.log("Added lead_id to opportunities table (if not exists)");
    
    // Update quotations table
    await db.execute(sql`
      ALTER TABLE IF EXISTS quotations
      ALTER COLUMN opportunity_id DROP NOT NULL;
    `);
    console.log("Made opportunity_id optional in quotations table");
    
    // Update sales_orders table
    await db.execute(sql`
      ALTER TABLE IF EXISTS sales_orders
      ALTER COLUMN quotation_id DROP NOT NULL;
    `);
    console.log("Made quotation_id optional in sales_orders table");
    
    console.log("Manual schema update completed successfully!");
  } catch (error) {
    console.error("Error during manual migration:", error);
  } finally {
    process.exit(0);
  }
}

runManualMigration();