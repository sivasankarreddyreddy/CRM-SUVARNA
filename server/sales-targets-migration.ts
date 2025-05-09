import { db } from "./db";
import { sql } from "drizzle-orm";

// Function to create the sales_targets table
export async function createSalesTargetsTable() {
  console.log("Creating sales_targets table...");
  
  try {
    // Create sales_targets table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sales_targets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE SET NULL,
        month INTEGER NOT NULL,
        year INTEGER NOT NULL,
        year_type TEXT NOT NULL DEFAULT 'calendar',
        target_amount DECIMAL(12,2) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        created_by INTEGER NOT NULL,
        notes TEXT
      );
    `);
    
    console.log("Sales targets table created successfully");
    return true;
  } catch (error) {
    console.error("Error creating sales_targets table:", error);
    return false;
  }
}