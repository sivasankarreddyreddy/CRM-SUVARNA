import { seedHealthcareTeams } from "./seed-healthcare-teams";

async function main() {
  try {
    await seedHealthcareTeams();
    console.log("Healthcare teams seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding healthcare teams:", error);
    process.exit(1);
  }
  
  // Exit process when done
  process.exit(0);
}

main();