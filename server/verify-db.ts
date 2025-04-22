import { db } from "./db";
import { sql } from "drizzle-orm";

async function verifyDatabaseTables() {
  try {
    console.log("Verifying database tables...");
    
    // List all tables
    const tables = await db.execute(sql`
      SELECT tablename FROM pg_catalog.pg_tables 
      WHERE schemaname='public'
    `);
    
    console.log("Tables in database:", tables.rows.map(r => r.tablename));
    
    // Check for opportunities table
    const opportunitiesColumns = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'opportunities'
    `);
    
    console.log("Opportunities table columns:", JSON.stringify(opportunitiesColumns.rows, null, 2));
    
    // Sample select query to see if it works
    const leadCount = await db.execute(sql`SELECT COUNT(*) FROM leads`);
    console.log("Lead count:", leadCount.rows[0].count);
    
    // Sample join to verify relationships
    const oppWithLeads = await db.execute(sql`
      SELECT o.id, o.name, o.lead_id, l.name as lead_name 
      FROM opportunities o
      LEFT JOIN leads l ON o.lead_id = l.id
      LIMIT 5
    `);
    
    console.log("Sample opportunities with leads:", JSON.stringify(oppWithLeads.rows, null, 2));
    
    console.log("Database verification completed!");
  } catch (error) {
    console.error("Error during database verification:", error);
  } finally {
    process.exit(0);
  }
}

verifyDatabaseTables();