import { addModuleIdColumn } from './module-id-column-migration';

async function main() {
  try {
    await addModuleIdColumn();
    process.exit(0);
  } catch (error) {
    console.error('Error running module ID column migration:', error);
    process.exit(1);
  }
}

main();