import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function seedHIMSProductsQuick() {
  console.log("Starting quick HIMS products seeding...");

  // Get existing products
  const existingProducts = await db.select().from(schema.products);
  console.log(`Found ${existingProducts.length} existing products`);

  // Define healthcare product names with appropriate pricing
  const healthcareProductNames = [
    "HospitalCore EHR - Standard", 
    "HospitalCore EHR - Enterprise",
    "DiagnosticsLab LIS", 
    "PACS Imaging Solution", 
    "PharmacyManager Module",
    "PatientConnect Portal", 
    "MobileDoc Physician App", 
    "TeleCare Platform",
    "HealthAnalytics Pro", 
    "ClaimsMaster Billing System"
  ];

  // Update product names
  for (let i = 0; i < Math.min(existingProducts.length, healthcareProductNames.length); i++) {
    const productToUpdate = existingProducts[i];
    
    try {
      await db.update(schema.products)
        .set({
          name: healthcareProductNames[i],
          sku: `HIMS-${i+1}`,
          description: `Healthcare Information Management System - ${healthcareProductNames[i]}`,
          price: String(Math.floor(Math.random() * 500000) + 100000),
          tax: "18",
          isActive: true
        })
        .where(schema.products.id.equals(productToUpdate.id));
      
      console.log(`Updated product ${i+1}: ${healthcareProductNames[i]}`);
    } catch (error) {
      console.error(`Error updating product ${i+1}:`, error);
    }
  }

  console.log("Quick HIMS products seeding completed!");
  process.exit(0);
}

seedHIMSProductsQuick().catch(error => {
  console.error("Error seeding products:", error);
  process.exit(1);
});