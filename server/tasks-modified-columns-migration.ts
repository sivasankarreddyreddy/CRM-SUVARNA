import { db } from "./db";

/**
 * Migration to add modifiedAt and modifiedBy columns to the tasks table
 */
export async function addTaskModifiedColumns() {
  try {
    console.log("Adding modifiedAt and modifiedBy columns to tasks table...");

    // Add the modifiedAt column
    await db.execute(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS modified_at TIMESTAMP DEFAULT NOW()
    `);

    // Add the modifiedBy column
    await db.execute(`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS modified_by INTEGER
    `);

    // Update existing tasks to set modifiedBy to createdBy and modifiedAt to createdAt
    await db.execute(`
      UPDATE tasks 
      SET modified_by = created_by, 
          modified_at = created_at 
      WHERE modified_by IS NULL
    `);

    // Make modifiedBy NOT NULL after updating existing records
    await db.execute(`
      ALTER TABLE tasks 
      ALTER COLUMN modified_by SET NOT NULL
    `);

    console.log("Tasks modified columns migration completed successfully!");
    return true;
  } catch (error) {
    console.error("Tasks modified columns migration failed:", error);
    throw error;
  }
}

/**
 * Run the migration
 */
export async function runTasksModifiedColumnsMigration() {
  try {
    await addTaskModifiedColumns();
    console.log("Tasks modified columns migration completed successfully");
  } catch (error) {
    console.error("Tasks modified columns migration failed:", error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runTasksModifiedColumnsMigration();
}