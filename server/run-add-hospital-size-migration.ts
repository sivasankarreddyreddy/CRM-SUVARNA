import { db } from "./db";
import { sql } from "drizzle-orm";

/**
 * Migration script to add the required_size_of_hospital column to the companies table
 */
export async function addHospitalSizeField() {
  try {
    console.log("Adding required_size_of_hospital column to companies table...");
    
    // Check if the column already exists to prevent errors
    const checkColumnQuery = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'companies' AND column_name = 'required_size_of_hospital'
    `);
    
    if (checkColumnQuery.rows && checkColumnQuery.rows.length === 0) {
      // Column doesn't exist, add it
      await db.execute(sql`
        ALTER TABLE companies
        ADD COLUMN required_size_of_hospital TEXT
      `);
      console.log("Column 'required_size_of_hospital' added successfully.");
    } else {
      console.log("Column 'required_size_of_hospital' already exists. Skipping.");
    }

    console.log("Hospital size field migration completed successfully.");
    return true;
  } catch (error) {
    console.error("Hospital size field migration failed:", error);
    return false;
  }
}

/**
 * Run the hospital size migration
 */
export async function runHospitalSizeMigration() {
  const success = await addHospitalSizeField();
  if (success) {
    console.log("Hospital size migration completed successfully");
  } else {
    console.error("Hospital size migration failed");
    process.exit(1);
  }
}

// Execute the migration immediately in ESM
runHospitalSizeMigration()
  .then(() => {
    console.log("Migration script execution completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script execution failed:", error);
    process.exit(1);
  });