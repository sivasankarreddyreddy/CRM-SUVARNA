import PDFDocument from 'pdfkit';
import { Quotation, QuotationItem } from '@shared/schema';
import { format } from 'date-fns';

/**
 * Generates a PDF for a quotation using PDFKit (no browser dependencies)
 */
export async function generateQuotationPdf(
  quotation: Quotation, 
  items: QuotationItem[], 
  company?: any, 
  contact?: any
): Promise<Buffer> {
  // Create a buffer to store PDF data
  return new Promise<Buffer>((resolve, reject) => {
    try {
      // Create a PDF document
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });
      
      // Create an array buffer to collect PDF data chunks
      const chunks: Uint8Array[] = [];
      
      // Collect PDF data chunks
      doc.on('data', (chunk) => chunks.push(chunk));
      
      // When PDF is complete, resolve with the buffer
      doc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      
      // Set up document
      doc.font('Helvetica');
      
      // Add company header
      doc.fontSize(24)
         .fillColor('#1e40af')
         .text('HealthTech Solutions HIMS', { align: 'left' });
      
      // Add quotation header
      doc.moveUp()
         .fontSize(24)
         .fillColor('#1e40af')
         .text('QUOTATION', { align: 'right' });
      
      // Add quotation details
      doc.fontSize(10)
         .fillColor('#666')
         .text(`Number: ${quotation.quotationNumber || ''}`, { align: 'right' })
         .text(`Date: ${formatDate(quotation.createdAt)}`, { align: 'right' })
         .text(`Valid Until: ${formatDate(quotation.validUntil)}`, { align: 'right' });
      
      // Add line separator
      doc.moveDown()
         .lineCap('butt')
         .strokeColor('#eee')
         .lineWidth(1)
         .moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .stroke();
      
      // Add client section
      doc.moveDown()
         .fontSize(10)
         .fillColor('#666')
         .text('CLIENT', { lineGap: 5 });
      
      doc.fontSize(12)
         .fillColor('#000')
         .text(company?.name || 'Client Name', { bold: true })
         .fontSize(10);
      
      if (contact) {
        const contactName = contact.firstName && contact.lastName ? 
          `${contact.firstName} ${contact.lastName}` : 
          (contact.name || 'Contact');
        
        doc.text(contactName);
        
        if (contact.email) {
          doc.text(`Email: ${contact.email}`);
        }
        if (contact.phone) {
          doc.text(`Phone: ${contact.phone}`);
        }
      }
      
      // Add items table
      doc.moveDown(2);
      
      // Table headers
      const tableTop = doc.y;
      const tableHeaders = ['Description', 'Qty', 'Unit Price', 'Tax', 'Amount'];
      const tableWidths = [250, 50, 80, 60, 80];
      
      // Draw table header
      doc.fontSize(10)
         .fillColor('#666')
         .rect(50, tableTop, 500, 20)
         .fillAndStroke('#f9fafb', '#e5e7eb');
      
      let currentX = 50;
      for (let i = 0; i < tableHeaders.length; i++) {
        const align = i === 0 ? 'left' : 'right';
        doc.text(tableHeaders[i], currentX + 5, tableTop + 5, { 
          width: tableWidths[i],
          align: align
        });
        currentX += tableWidths[i];
      }
      
      // Draw table rows
      let tableRowY = tableTop + 20;
      
      for (const item of items) {
        currentX = 50;
        const rowHeight = 25;
        
        // Draw row background and borders
        doc.rect(50, tableRowY, 500, rowHeight)
           .fillAndStroke('#fff', '#e5e7eb');
        
        // Item description
        doc.fillColor('#000')
           .text(item.description || '', currentX + 5, tableRowY + 7, { 
             width: tableWidths[0] - 10,
             align: 'left'
           });
        currentX += tableWidths[0];
        
        // Quantity
        doc.text(item.quantity?.toString() || '', currentX + 5, tableRowY + 7, { 
          width: tableWidths[1] - 10,
          align: 'right'
        });
        currentX += tableWidths[1];
        
        // Unit price
        doc.text(`₹${formatCurrency(item.unitPrice || '0')}`, currentX + 5, tableRowY + 7, { 
          width: tableWidths[2] - 10,
          align: 'right'
        });
        currentX += tableWidths[2];
        
        // Tax
        doc.text(`₹${formatCurrency(item.tax || '0')}`, currentX + 5, tableRowY + 7, { 
          width: tableWidths[3] - 10,
          align: 'right'
        });
        currentX += tableWidths[3];
        
        // Subtotal
        doc.text(`₹${formatCurrency(item.subtotal || '0')}`, currentX + 5, tableRowY + 7, { 
          width: tableWidths[4] - 10,
          align: 'right'
        });
        
        tableRowY += rowHeight;
      }
      
      // Add totals section
      doc.moveDown();
      const totalsStartX = 380;
      const totalsWidth = 170;
      tableRowY += 20;
      
      // Subtotal
      doc.fontSize(10)
         .fillColor('#666')
         .text('Subtotal:', totalsStartX, tableRowY, { width: 70, align: 'left' })
         .moveUp()
         .fillColor('#000')
         .text(`₹${formatCurrency(quotation.subtotal || '0')}`, totalsStartX + 70, tableRowY, { 
           width: 100, 
           align: 'right' 
         });
      
      // Tax (if specified)
      if (quotation.tax && parseFloat(quotation.tax || '0') > 0) {
        tableRowY += 20;
        doc.fillColor('#666')
           .text('Tax:', totalsStartX, tableRowY, { width: 70, align: 'left' })
           .moveUp()
           .fillColor('#000')
           .text(`₹${formatCurrency(quotation.tax || '0')}`, totalsStartX + 70, tableRowY, { 
             width: 100, 
             align: 'right' 
           });
      }
      
      // Discount (if specified)
      if (quotation.discount && parseFloat(quotation.discount || '0') > 0) {
        tableRowY += 20;
        doc.fillColor('#666')
           .text('Discount:', totalsStartX, tableRowY, { width: 70, align: 'left' })
           .moveUp()
           .fillColor('#000')
           .text(`-₹${formatCurrency(quotation.discount || '0')}`, totalsStartX + 70, tableRowY, { 
             width: 100, 
             align: 'right' 
           });
      }
      
      // Total
      tableRowY += 20;
      doc.rect(totalsStartX, tableRowY, totalsWidth, 25)
         .fillAndStroke('#f9fafb', '#e5e7eb');
      
      doc.fontSize(12)
         .fillColor('#1e40af')
         .text('TOTAL:', totalsStartX + 5, tableRowY + 7, { width: 70, align: 'left' })
         .moveUp()
         .text(`₹${formatCurrency(quotation.total || '0')}`, totalsStartX + 70, tableRowY + 7, { 
           width: 100, 
           align: 'right' 
         });
      
      // Add notes section if present
      if (quotation.notes) {
        doc.moveDown(3)
           .fontSize(10)
           .fillColor('#666')
           .text('NOTES', { lineGap: 5 })
           .fillColor('#000')
           .text(quotation.notes || '');
      }
      
      // Add footer
      doc.fontSize(10)
         .fillColor('#666')
         .text('Thank you for your business!', 50, 700, { align: 'center' })
         .text('HealthTech Solutions - HIMS Healthcare Information Management System', 50, 715, { align: 'center' });
      
      // Finalize PDF
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}

function formatDate(date: any): string {
  if (!date) return 'N/A';
  try {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return format(new Date(date), 'dd/MM/yyyy');
  } catch (error) {
    return 'N/A';
  }
}

// Helper function to format currency
function formatCurrency(value: string): string {
  if (!value) return '0.00';
  try {
    return parseFloat(value).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (error) {
    return '0.00';
  }
}