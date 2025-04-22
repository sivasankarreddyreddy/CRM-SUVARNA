import { db } from "./db";
import { products } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function seedHIMSProductsData() {
  console.log("Starting HIMS products seeding...");

  // Healthcare-specific HIMS products data
  const himsProducts = [
    {
      name: "HospitalCore EHR - Standard",
      sku: "HC-EHR-STD",
      description: "Comprehensive electronic health record system for small to medium hospitals with up to 100 beds. Includes patient management, clinical documentation, order management, and basic reporting.",
      price: "850000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "HospitalCore EHR - Enterprise",
      sku: "HC-EHR-ENT",
      description: "Advanced electronic health record system for large hospitals with 100+ beds. Includes all standard features plus multi-facility management, advanced analytics, and API integrations.",
      price: "1850000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "DiagnosticsLab LIS",
      sku: "DL-LIS-001",
      description: "Laboratory information system for diagnostic centers and hospital labs. Features include specimen tracking, test catalog management, quality control, and integration with diagnostic equipment.",
      price: "550000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "PACS Imaging Solution",
      sku: "PACS-001",
      description: "Picture archiving and communication system for radiology departments. Includes image storage, viewing, distribution, and integration with radiology information systems.",
      price: "750000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "PharmacyManager Module",
      sku: "PM-001",
      description: "Pharmacy management system for hospital pharmacies. Features include inventory management, drug interactions, e-prescribing, and automated dispensing integration.",
      price: "350000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "PatientConnect Portal",
      sku: "PC-001",
      description: "Patient engagement portal allowing online appointment scheduling, test results access, prescription refills, and secure messaging with healthcare providers.",
      price: "250000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "MobileDoc Physician App",
      sku: "MD-001",
      description: "Mobile application for physicians to access patient records, document notes, place orders, and review results from smartphones and tablets.",
      price: "180000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "TeleCare Platform",
      sku: "TC-001",
      description: "Telemedicine solution enabling virtual consultations, remote patient monitoring, and online healthcare delivery with integrated EHR and billing.",
      price: "480000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "HealthAnalytics Pro",
      sku: "HA-001",
      description: "Healthcare analytics platform providing dashboards and insights for clinical quality, operational efficiency, and financial performance.",
      price: "350000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "ClaimsMaster Billing System",
      sku: "CM-001",
      description: "Medical billing and claims management system with insurance verification, coding assistance, and revenue cycle management features.",
      price: "400000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "Implementation Services - Basic",
      sku: "IS-BAS-001",
      description: "Basic implementation package including system setup, data migration, and core user training for single-facility deployments.",
      price: "150000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "Implementation Services - Premium",
      sku: "IS-PRE-001",
      description: "Premium implementation package including system setup, comprehensive data migration, workflow optimization, advanced training, and go-live support for multi-facility deployments.",
      price: "450000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "Annual Support & Maintenance - Standard",
      sku: "SM-STD-001",
      description: "Standard support package including software updates, help desk access during business hours, and system monitoring for one year.",
      price: "120000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "Annual Support & Maintenance - Premium",
      sku: "SM-PRE-001",
      description: "Premium support package including software updates, 24/7 help desk access, system monitoring, quarterly health checks, and priority resolution for one year.",
      price: "280000.00",
      tax: "18",
      isActive: true
    },
    {
      name: "Healthcare Interoperability Module",
      sku: "HI-001",
      description: "Integration module enabling data exchange with other healthcare systems using FHIR, HL7, and other healthcare data standards. Compliant with national health digitization initiatives.",
      price: "320000.00",
      tax: "18",
      isActive: true
    }
  ];

  // Get existing products to update
  const existingProducts = await db.select().from(products);
  
  // Update the existing products with new healthcare HIMS data
  for (let i = 0; i < Math.min(existingProducts.length, himsProducts.length); i++) {
    const productToUpdate = existingProducts[i];
    const newProductData = himsProducts[i];
    
    await db.update(products)
      .set({
        name: newProductData.name,
        sku: newProductData.sku,
        description: newProductData.description,
        price: newProductData.price,
        tax: newProductData.tax,
        isActive: newProductData.isActive
      })
      .where(eq(products.id, productToUpdate.id));
    
    console.log(`Updated product: ${newProductData.name}`);
  }
  
  console.log("HIMS products seeding completed!");
}