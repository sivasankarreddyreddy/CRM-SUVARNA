import { pool } from './db';

/**
 * Migration to add the moduleId column to quotation_items and sales_order_items tables
 */
export async function addModuleIdColumn() {
  console.log('Running module ID column migration...');
  
  try {
    // Add moduleId column to quotation_items if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'quotation_items' AND column_name = 'module_id'
        ) THEN
          ALTER TABLE quotation_items ADD COLUMN module_id INTEGER;
          ALTER TABLE quotation_items ADD CONSTRAINT fk_quotation_items_module
            FOREIGN KEY (module_id) REFERENCES modules(id);
        END IF;
      END $$;
    `);
    
    // Add moduleId column to sales_order_items if it doesn't exist
    await pool.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'sales_order_items' AND column_name = 'module_id'
        ) THEN
          ALTER TABLE sales_order_items ADD COLUMN module_id INTEGER;
          ALTER TABLE sales_order_items ADD CONSTRAINT fk_sales_order_items_module
            FOREIGN KEY (module_id) REFERENCES modules(id);
        END IF;
      END $$;
    `);
    
    console.log('Module ID column migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Error in module ID column migration:', error);
    return false;
  }
}