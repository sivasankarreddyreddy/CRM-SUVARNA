import puppeteer from 'puppeteer';
import { Quotation, QuotationItem } from '@shared/schema';

// Function to generate PDF for a quotation
export async function generateQuotationPdf(
  quotation: Quotation, 
  items: QuotationItem[], 
  company?: any, 
  contact?: any
): Promise<Buffer> {
  // Launch a headless browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    // Create a new page
    const page = await browser.newPage();
    
    // Create the HTML content for the PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Quotation ${quotation.quotationNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
          }
          .company-info {
            font-size: 14px;
          }
          .quotation-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #2563eb;
          }
          .quotation-number {
            font-size: 16px;
            margin-bottom: 20px;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #4b5563;
          }
          .client-details, .quotation-details {
            display: flex;
            margin-bottom: 20px;
          }
          .detail-column {
            flex: 1;
          }
          .detail-label {
            font-weight: bold;
            margin-bottom: 5px;
            color: #6b7280;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            color: #4b5563;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }
          .text-right {
            text-align: right;
          }
          .totals {
            margin-left: auto;
            width: 30%;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
          }
          .grand-total {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #ddd;
            padding-top: 5px;
          }
          .notes {
            margin-top: 30px;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 5px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="quotation-title">QUOTATION</div>
            <div class="quotation-number">${quotation.quotationNumber}</div>
          </div>
          <div class="company-info">
            <div><strong>Healthcare Information Management Systems</strong></div>
            <div>123 Medical Plaza, Suite 101</div>
            <div>Bangalore, Karnataka 560001</div>
            <div>India</div>
            <div>Phone: +91 80 1234 5678</div>
            <div>Email: info@himsindia.com</div>
          </div>
        </div>
        
        <div class="client-details">
          <div class="detail-column">
            <div class="detail-label">Client:</div>
            <div><strong>${company?.name || 'N/A'}</strong></div>
            <div>${company?.address || ''}</div>
            <div>${company?.city || ''} ${company?.state || ''} ${company?.zipCode || ''}</div>
            <div>${company?.country || 'India'}</div>
          </div>
          <div class="detail-column">
            <div class="detail-label">Contact Person:</div>
            <div><strong>${contact?.name || 'N/A'}</strong></div>
            <div>${contact?.phone || ''}</div>
            <div>${contact?.email || ''}</div>
          </div>
        </div>
        
        <div class="quotation-details">
          <div class="detail-column">
            <div class="detail-label">Quotation Date:</div>
            <div>${new Date(quotation.createdAt).toLocaleDateString('en-IN')}</div>
          </div>
          <div class="detail-column">
            <div class="detail-label">Valid Until:</div>
            <div>${quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : 'N/A'}</div>
          </div>
          <div class="detail-column">
            <div class="detail-label">Status:</div>
            <div>${quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Items</div>
          <table>
            <thead>
              <tr>
                <th style="width: 40%;">Description</th>
                <th>Quantity</th>
                <th>Unit Price (₹)</th>
                <th>Tax (₹)</th>
                <th>Subtotal (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.tax || '0')}</td>
                  <td>${formatCurrency(item.subtotal)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="totals">
          <div class="total-row">
            <div>Subtotal:</div>
            <div>₹${formatCurrency(quotation.subtotal)}</div>
          </div>
          <div class="total-row">
            <div>Tax:</div>
            <div>₹${formatCurrency(quotation.tax)}</div>
          </div>
          <div class="total-row">
            <div>Discount:</div>
            <div>₹${formatCurrency(quotation.discount)}</div>
          </div>
          <div class="total-row grand-total">
            <div>Total:</div>
            <div>₹${formatCurrency(quotation.total)}</div>
          </div>
        </div>
        
        ${quotation.notes ? `
        <div class="notes">
          <div class="section-title">Notes</div>
          <div>${quotation.notes}</div>
        </div>
        ` : ''}
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>This is a computer-generated document and does not require a signature.</p>
        </div>
      </body>
      </html>
    `;
    
    // Set content to the page
    await page.setContent(htmlContent);
    
    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    return pdfBuffer;
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Helper function to format currency
function formatCurrency(value: string): string {
  return parseFloat(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}