import { db } from './db';
import { vendors, modules, vendorGroups } from '@shared/schema';

/**
 * Seed healthcare-related vendors and modules in the database
 */
export async function seedVendorsAndModules() {
  console.log('Seeding vendors and modules...');
  
  // Check if vendor groups already exist
  const existingVendorGroups = await db.select().from(vendorGroups);
  if (existingVendorGroups.length > 0) {
    console.log(`${existingVendorGroups.length} vendor groups already exist, skipping vendor group seeding`);
  } else {
    // Seed vendor groups
    const vendorGroupsList = [
      {
        name: 'Medical Imaging',
        description: 'Vendors specializing in medical imaging equipment and software',
        isActive: true,
        createdAt: new Date(),
        createdBy: 1,
      },
      {
        name: 'Laboratory Systems',
        description: 'Vendors providing laboratory information systems and equipment',
        isActive: true,
        createdAt: new Date(),
        createdBy: 1,
      },
      {
        name: 'EMR/EHR Systems',
        description: 'Electronic Medical Records and Health Records system providers',
        isActive: true,
        createdAt: new Date(),
        createdBy: 1,
      },
      {
        name: 'Telemedicine',
        description: 'Remote healthcare service technology providers',
        isActive: true,
        createdAt: new Date(),
        createdBy: 1,
      },
      {
        name: 'Healthcare Infrastructure',
        description: 'Hospital and clinic infrastructure technology providers',
        isActive: true,
        createdAt: new Date(),
        createdBy: 1,
      }
    ];
    
    await db.insert(vendorGroups).values(vendorGroupsList);
    console.log(`${vendorGroupsList.length} vendor groups created`);
  }
  
  // Check if vendors already exist
  const existingVendors = await db.select().from(vendors);
  if (existingVendors.length > 0) {
    console.log(`${existingVendors.length} vendors already exist, skipping vendor seeding`);
  } else {
    // Get vendor group ids for association
    const groupIds = await db.select().from(vendorGroups);
    const groupMap = {
      'Medical Imaging': groupIds.find(g => g.name === 'Medical Imaging')?.id,
      'Laboratory Systems': groupIds.find(g => g.name === 'Laboratory Systems')?.id,
      'EMR/EHR Systems': groupIds.find(g => g.name === 'EMR/EHR Systems')?.id,
      'Telemedicine': groupIds.find(g => g.name === 'Telemedicine')?.id,
      'Healthcare Infrastructure': groupIds.find(g => g.name === 'Healthcare Infrastructure')?.id,
    };
    
    // Seed vendors
    const vendorsList = [
      {
        name: 'Suvarna Technologies',
        contactPerson: 'Rahul Mehta',
        email: 'rahul@suvarnatech.com',
        phone: '+91 98765 43210',
        address: '201, Tech Park',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        postalCode: '560001',
        website: 'https://www.suvarnatech.com',
        description: 'Leading healthcare IT company specializing in HIMS solutions for hospitals and diagnostic centers.',
        vendorGroupId: groupMap['EMR/EHR Systems'],
        isActive: true,
        createdAt: new Date(),
        createdBy: 33, // admin user
      },
      {
        name: 'Softhealth Systems',
        contactPerson: 'Priya Sharma',
        email: 'priya@softhealth.in',
        phone: '+91 87654 32109',
        address: '42, Cyber Tower',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        postalCode: '500081',
        website: 'https://www.softhealth.in',
        description: 'Healthcare software development company focused on innovative solutions for the medical sector.',
        vendorGroupId: groupMap['Healthcare Infrastructure'],
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Medprecinct Solutions',
        contactPerson: 'Arjun Kumar',
        email: 'arjun@medprecinct.com',
        phone: '+91 76543 21098',
        address: '304, Innovation Hub',
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '411057',
        website: 'https://www.medprecinct.com',
        description: 'Specialized in AI-powered healthcare information systems with focus on data analytics.',
        vendorGroupId: groupMap['Telemedicine'],
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'A1 Diagnostics Tech',
        contactPerson: 'Sanjay Patel',
        email: 'sanjay@a1diagnostics.com',
        phone: '+91 65432 10987',
        address: '78, Health Center',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400072',
        website: 'https://www.a1diagnostics.com',
        description: 'Pioneers in diagnostic center management software with specialized LIS solutions.',
        vendorGroupId: groupMap['Laboratory Systems'],
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'HealthcareTech India',
        contactPerson: 'Anita Desai',
        email: 'anita@healthcaretech.in',
        phone: '+91 54321 09876',
        address: '55, Medical Square',
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
        postalCode: '110001',
        website: 'https://www.healthcaretech.in',
        description: 'Full-service healthcare IT provider with expertise in hospital management systems.',
        vendorGroupId: groupMap['Medical Imaging'],
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
    ];
    
    for (const vendor of vendorsList) {
      await db.insert(vendors).values(vendor);
    }
    
    console.log(`${vendorsList.length} vendors added successfully`);
  }
  
  // Check if modules already exist
  const existingModules = await db.select().from(modules);
  if (existingModules.length > 0) {
    console.log(`${existingModules.length} modules already exist, skipping module seeding`);
  } else {
    // Seed modules
    const modulesList = [
      {
        name: 'Front Office Management',
        code: 'FO-001',
        description: 'Complete front desk solution for patient registration, admission, discharge, and transfer with queue management.',
        price: '125000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Billing & Finance',
        code: 'BL-002',
        description: 'Comprehensive billing system with insurance claim processing, package management, and financial reporting.',
        price: '195000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Laboratory Information System',
        code: 'LIS-003',
        description: 'End-to-end lab management solution with sample tracking, automated result integration, and report generation.',
        price: '225000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Patient EMR',
        code: 'EMR-004',
        description: 'Electronic Medical Record system with clinical documentation, medical history, test results, and treatment plans.',
        price: '275000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Appointment Scheduling',
        code: 'APT-005',
        description: 'Advanced appointment scheduling with doctor availability, online booking, and SMS/email notifications.',
        price: '95000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Pharmacy Management',
        code: 'PH-006',
        description: 'Complete pharmacy inventory management with prescription tracking, drug interactions, and stock alerts.',
        price: '145000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Radiology Information System',
        code: 'RIS-007',
        description: 'Specialized system for radiology departments with DICOM integration and reporting capabilities.',
        price: '255000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Ward Management',
        code: 'WD-008',
        description: 'In-patient ward management with bed allocation, patient tracking, and nursing station controls.',
        price: '125000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'OT Management',
        code: 'OT-009',
        description: 'Operation theater scheduling, resource allocation, and procedure documentation system.',
        price: '185000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
      {
        name: 'Mobile Patient App',
        code: 'APP-010',
        description: 'Branded mobile application for patients with appointment booking, report access, and telemedicine features.',
        price: '175000',
        tax: 18,
        isActive: true,
        createdAt: new Date(),
        createdBy: 33,
      },
    ];
    
    for (const module of modulesList) {
      await db.insert(modules).values(module);
    }
    
    console.log(`${modulesList.length} modules added successfully`);
  }
}

// This is for direct execution with "node -r esbuild-register server/seed-vendors-modules.ts"
// or when imported from another module
export default seedVendorsAndModules;