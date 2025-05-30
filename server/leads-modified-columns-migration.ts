import { Pool } from '@neondatabase/serverless';
import ws from "ws";
import { neonConfig } from '@neondatabase/serverless';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/**
 * Migration to add modifiedAt and modifiedBy columns to the leads table
 */
export async function addLeadModifiedColumns() {
  const client = await pool.connect();
  
  try {
    console.log("Adding modifiedAt and modifiedBy columns to leads table...");
    
    // Check if columns already exist
    const checkModifiedAt = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'modified_at'
    `);
    
    const checkModifiedBy = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'leads' AND column_name = 'modified_by'
    `);
    
    // Add modifiedAt column if it doesn't exist
    if (checkModifiedAt.rows.length === 0) {
      await client.query(`
        ALTER TABLE leads 
        ADD COLUMN modified_at TIMESTAMP
      `);
      console.log("Added modified_at column to leads table");
    } else {
      console.log("modified_at column already exists in leads table");
    }
    
    // Add modifiedBy column if it doesn't exist
    if (checkModifiedBy.rows.length === 0) {
      await client.query(`
        ALTER TABLE leads 
        ADD COLUMN modified_by INTEGER REFERENCES users(id)
      `);
      console.log("Added modified_by column to leads table");
    } else {
      console.log("modified_by column already exists in leads table");
    }
    
    // Create lead_history table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS lead_history (
        id SERIAL PRIMARY KEY,
        lead_id INTEGER NOT NULL REFERENCES leads(id),
        action TEXT NOT NULL,
        field_name TEXT,
        old_value TEXT,
        new_value TEXT,
        changed_at TIMESTAMP DEFAULT NOW(),
        changed_by INTEGER NOT NULL REFERENCES users(id),
        notes TEXT
      )
    `);
    console.log("Created or verified lead_history table");
    
    console.log("Leads modified columns migration completed successfully!");
    
  } catch (error) {
    console.error("Leads modified columns migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run the migration
 */
export async function runLeadsModifiedColumnsMigration() {
  try {
    await addLeadModifiedColumns();
    console.log("✅ Leads modified columns migration completed successfully");
  } catch (error) {
    console.error("❌ Leads modified columns migration failed:", error);
    process.exit(1);
  }
}