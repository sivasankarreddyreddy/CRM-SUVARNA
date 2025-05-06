/**
 * Migration script to add the contact_person_id and mobile_number columns to the tasks table
 */
import { pool } from "./db";

/**
 * Add the contact_person_id and mobile_number fields to the tasks table
 */
export async function addTaskFields() {
  console.log("Adding contact_person_id and mobile_number columns to tasks table...");
  
  try {
    // Check if the columns already exist
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' 
      AND column_name IN ('contact_person_id', 'mobile_number')
    `);
    
    const existingColumns = checkResult.rows.map(row => row.column_name);
    let queries = [];
    
    // Add contact_person_id column if it doesn't exist
    if (!existingColumns.includes('contact_person_id')) {
      queries.push(`
        ALTER TABLE tasks
        ADD COLUMN contact_person_id INTEGER REFERENCES contacts(id)
      `);
    }
    
    // Add mobile_number column if it doesn't exist
    if (!existingColumns.includes('mobile_number')) {
      queries.push(`
        ALTER TABLE tasks
        ADD COLUMN mobile_number TEXT
      `);
    }
    
    // Execute the queries if any
    if (queries.length > 0) {
      for (const query of queries) {
        await pool.query(query);
      }
      console.log("Task fields added successfully.");
    } else {
      console.log("Task fields already exist, skipping migration.");
    }
    
    return true;
  } catch (error) {
    console.error("Error adding task fields:", error);
    throw error;
  }
}

/**
 * Run the task fields migration
 */
export async function runTaskFieldsMigration() {
  try {
    await addTaskFields();
    console.log("Task fields migration completed successfully");
    return true;
  } catch (error) {
    console.error("Task fields migration failed:", error);
    return false;
  }
}

// Execute the migration immediately in ESM
runTaskFieldsMigration()
  .then(() => {
    console.log("Migration script execution completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration script execution failed:", error);
    process.exit(1);
  });