/**
 * This script seeds the healthcare-related vendors and modules in the database
 */
import seedVendorsAndModules from './seed-vendors-modules';

// Self-executing async function
(async () => {
  try {
    await seedVendorsAndModules();
    console.log('Healthcare vendors and modules seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding healthcare vendors and modules:', error);
    process.exit(1);
  }
})();