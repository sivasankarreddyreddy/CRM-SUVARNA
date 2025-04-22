import { db, pool } from "./db";
import { sql } from "drizzle-orm";

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