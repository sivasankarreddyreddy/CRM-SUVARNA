import { db, pool } from './db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  console.log('Running lead migration - adding contactId column to leads table...');
  
  try {
    // Use a raw SQL query to add the column if it doesn't exist
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'leads' AND column_name = 'contact_id'
        ) THEN
          ALTER TABLE leads ADD COLUMN contact_id integer REFERENCES contacts(id);
        END IF;
      END $$;
    `);
    
    console.log('Lead migration completed successfully!');
  } catch (error) {
    console.error('Error running lead migration:', error);
    throw error;
  }
}

export async function migrateLeads() {
  try {
    await runMigration();
  } catch (error) {
    console.error('Failed to run lead migration:', error);
  } finally {
    // Don't close the pool here as it's used elsewhere
  }
}