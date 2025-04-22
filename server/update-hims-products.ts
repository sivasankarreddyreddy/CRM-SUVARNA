import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import * as schema from '@shared/schema';
import { eq } from 'drizzle-orm';

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

async function updateHIMSProducts() {
  console.log("Starting HIMS products update...");

  // Define healthcare HIMS products
  const healthcareProducts = [
    {
      name: "HospitalCore EHR - Standard",
      sku: "HC-EHR-STD",
      description: "Complete electronic health records system for small to medium hospitals with patient management, clinical documentation, and basic reporting. Includes 1 year support.",
      price: "499999",
      tax: "18"
    },
    {
      name: "HospitalCore EHR - Enterprise",
      sku: "HC-EHR-ENT",
      description: "Advanced EHR system for large hospitals and multi-facility networks with comprehensive modules, custom workflows, and advanced analytics. Includes 24/7 premium support.",
      price: "1499999",
      tax: "18"
    },
    {
      name: "DiagnosticsLab LIS",
      sku: "DL-LIS-001",
      description: "Laboratory Information System for diagnostic centers with specimen tracking, test ordering, result reporting, and billing integration. Supports barcode scanning and equipment integrations.",
      price: "349999",
      tax: "18"
    },
    {
      name: "PACS Imaging Solution",
      sku: "PACS-IMG-001",
      description: "Picture Archiving and Communication System for radiology departments. Includes image storage, retrieval, and viewing capabilities with web and mobile access.",
      price: "599999",
      tax: "18"
    },
    {
      name: "PharmacyManager Module",
      sku: "PM-MOD-001",
      description: "Comprehensive pharmacy management system with inventory tracking, e-prescriptions, drug interactions checking, and automated dispensing cabinet integration.",
      price: "199999",
      tax: "18"
    },
    {
      name: "PatientConnect Portal",
      sku: "PC-PRT-001",
      description: "Patient engagement portal with appointment scheduling, medical record access, bill payment, and secure messaging with healthcare providers.",
      price: "149999",
      tax: "18"
    },
    {
      name: "MobileDoc Physician App",
      sku: "MD-APP-001",
      description: "Mobile application for physicians to access patient records, document care, order tests, and view results from iOS and Android devices.",
      price: "99999",
      tax: "18"
    },
    {
      name: "TeleCare Platform",
      sku: "TC-PLT-001",
      description: "Telemedicine solution for virtual consultations, remote monitoring, and integrated scheduling with EHR. Supports video, audio, and chat-based interactions.",
      price: "299999",
      tax: "18"
    },
    {
      name: "HealthAnalytics Pro",
      sku: "HA-PRO-001",
      description: "Advanced healthcare analytics platform with operational, clinical, and financial dashboards, custom reporting, and predictive analytics.",
      price: "399999",
      tax: "18"
    },
    {
      name: "ClaimsMaster Billing System",
      sku: "CM-BIL-001",
      description: "Medical billing and claims management system with insurance verification, claim submission, payment posting, and denial management.",
      price: "249999",
      tax: "18"
    }
  ];

  try {
    // Get existing products to update (limited to 5)
    const existingProducts = await db.select().from(schema.products).limit(5);
    console.log(`Found ${existingProducts.length} products to update`);
    
    // Update each product
    for (let i = 0; i < existingProducts.length; i++) {
      const product = existingProducts[i];
      const newData = healthcareProducts[i];
      
      await db.update(schema.products)
        .set({
          name: newData.name,
          sku: newData.sku,
          description: newData.description,
          price: newData.price,
          tax: newData.tax,
          isActive: true
        })
        .where(eq(schema.products.id, product.id));
      
      console.log(`Updated product: ${newData.name}`);
    }
    
    console.log("HIMS products update completed successfully!");
  } catch (error) {
    console.error("Error updating products:", error);
  } finally {
    await pool.end();
  }
}

// Run the function
updateHIMSProducts().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});