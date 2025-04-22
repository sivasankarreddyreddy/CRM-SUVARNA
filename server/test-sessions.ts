import { db } from "./db";
import { sql } from "drizzle-orm";

async function testSessionTable() {
  try {
    console.log("Testing session table schema...");
    
    // Get current structure
    const result = await db.execute(sql`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'session';
    `);
    
    console.log("Session table structure:", JSON.stringify(result.rows, null, 2));
    
    // Temporarily skip sessions table in schema
    const testQuery = await db.execute(sql`SELECT NOW() as time`);
    console.log("Database connection test:", testQuery.rows[0]);
    
    console.log("Session test completed!");
  } catch (error) {
    console.error("Error during session test:", error);
  } finally {
    process.exit(0);
  }
}

testSessionTable();