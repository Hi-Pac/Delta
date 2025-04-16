import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import type { Customer, Sale, SaleItem, Product, Return, ReturnItem } from '@shared/schema';

// Extend the jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Helper function to format currency
const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

// Helper function to format date
const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Generate customer list PDF
export const generateCustomerListPDF = (customers: Customer[]) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Al-Haramain Modern Paints - Customer List', 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 26);

  // Create table
  const rows = customers.map(customer => [
    customer.name,
    customer.phone || 'N/A',
    customer.address || 'N/A',
    customer.classification,
    `${customer.discountPercentage}%`,
  ]);

  doc.autoTable({
    head: [['Name', 'Phone', 'Address', 'Classification', 'Discount']],
    body: rows,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [25, 118, 210] },
  });

  // Save the PDF
  doc.save('customer-list.pdf');
};

// Generate customer detail PDF
export const generateCustomerDetailPDF = (
  customer: Customer, 
  sales: Sale[], 
  returns: Return[]
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Customer Details', 14, 20);
  
  // Add customer info
  doc.setFontSize(12);
  doc.text(`Name: ${customer.name}`, 14, 30);
  doc.text(`Phone: ${customer.phone || 'N/A'}`, 14, 36);
  doc.text(`Address: ${customer.address || 'N/A'}`, 14, 42);
  doc.text(`Classification: ${customer.classification}`, 14, 48);
  doc.text(`Discount: ${customer.discountPercentage}%`, 14, 54);
  
  // Sales section
  doc.setFontSize(14);
  doc.text('Sales History', 14, 64);
  
  if (sales.length > 0) {
    const salesRows = sales.map(sale => [
      sale.orderNumber,
      formatDate(sale.date),
      formatCurrency(sale.total),
      sale.status,
    ]);
    
    doc.autoTable({
      head: [['Order #', 'Date', 'Amount', 'Status']],
      body: salesRows,
      startY: 68,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
    });
  } else {
    doc.setFontSize(10);
    doc.text('No sales records found', 14, 68);
  }
  
  // Returns section
  const returnStartY = sales.length > 0 ? doc.previousAutoTable.finalY + 10 : 68;
  
  doc.setFontSize(14);
  doc.text('Returns History', 14, returnStartY);
  
  if (returns.length > 0) {
    const returnsRows = returns.map(returnItem => [
      returnItem.returnNumber,
      formatDate(returnItem.date),
      formatCurrency(returnItem.totalAmount),
      returnItem.status,
    ]);
    
    doc.autoTable({
      head: [['Return #', 'Date', 'Amount', 'Status']],
      body: returnsRows,
      startY: returnStartY + 4,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
    });
  } else {
    doc.setFontSize(10);
    doc.text('No returns records found', 14, returnStartY + 4);
  }

  // Save the PDF
  doc.save(`customer-${customer.id}.pdf`);
};

// Generate sale invoice PDF
export const generateSaleInvoicePDF = (
  sale: Sale, 
  items: SaleItem[], 
  products: Record<number, Product>,
  customer?: Customer
) => {
  const doc = new jsPDF();

  // Add title & logo
  doc.setFontSize(20);
  doc.text('Al-Haramain Modern Paints', 14, 20);
  
  doc.setFontSize(14);
  doc.text('INVOICE', 14, 28);
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Invoice #: ${sale.orderNumber}`, 14, 40);
  doc.text(`Date: ${formatDate(sale.date)}`, 14, 45);
  doc.text(`Status: ${sale.status}`, 14, 50);
  
  // Add customer info if available
  if (customer) {
    doc.text('Bill To:', 120, 40);
    doc.text(customer.name, 120, 45);
    if (customer.address) doc.text(customer.address, 120, 50);
    if (customer.phone) doc.text(`Phone: ${customer.phone}`, 120, 55);
  }
  
  // Create items table
  const tableRows = items.map(item => {
    const product = products[item.productId];
    return [
      product ? product.name : `Product ID ${item.productId}`,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalPrice),
    ];
  });
  
  doc.autoTable({
    head: [['Product', 'Quantity', 'Unit Price', 'Total']],
    body: tableRows,
    startY: 65,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [25, 118, 210] },
  });
  
  // Add totals
  const finalY = doc.previousAutoTable.finalY + 10;
  
  doc.text(`Subtotal: ${formatCurrency(sale.subtotal)}`, 140, finalY);
  doc.text(`Discount: ${formatCurrency(sale.discountAmount)}`, 140, finalY + 5);
  
  doc.setFontSize(12);
  doc.text(`Total: ${formatCurrency(sale.total)}`, 140, finalY + 12);
  
  // Add payment method and notes
  doc.setFontSize(10);
  if (sale.paymentMethod) {
    doc.text(`Payment Method: ${sale.paymentMethod}`, 14, finalY);
  }
  
  if (sale.notes) {
    doc.text('Notes:', 14, finalY + 10);
    doc.text(sale.notes, 14, finalY + 15);
  }
  
  // Add footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 14, pageHeight - 10);

  // Save the PDF
  doc.save(`invoice-${sale.orderNumber}.pdf`);
};

// Generate returns PDF
export const generateReturnPDF = (
  returnData: Return, 
  items: ReturnItem[], 
  products: Record<number, Product>,
  customer?: Customer
) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);
  doc.text('Al-Haramain Modern Paints', 14, 20);
  
  doc.setFontSize(14);
  doc.text('RETURN RECEIPT', 14, 28);
  
  // Add return details
  doc.setFontSize(10);
  doc.text(`Return #: ${returnData.returnNumber}`, 14, 40);
  doc.text(`Date: ${formatDate(returnData.date)}`, 14, 45);
  doc.text(`Status: ${returnData.status}`, 14, 50);
  
  // Add customer info if available
  if (customer) {
    doc.text('Customer:', 120, 40);
    doc.text(customer.name, 120, 45);
    if (customer.phone) doc.text(`Phone: ${customer.phone}`, 120, 50);
  }
  
  // Related invoice
  if (returnData.saleId) {
    doc.text(`Related Invoice ID: ${returnData.saleId}`, 14, 55);
  }
  
  // Create items table
  const tableRows = items.map(item => {
    const product = products[item.productId];
    return [
      product ? product.name : `Product ID ${item.productId}`,
      item.quantity.toString(),
      formatCurrency(item.unitPrice),
      formatCurrency(item.totalPrice),
    ];
  });
  
  doc.autoTable({
    head: [['Product', 'Quantity', 'Unit Price', 'Total']],
    body: tableRows,
    startY: 65,
    theme: 'grid',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [25, 118, 210] },
  });
  
  // Add total and reason
  const finalY = doc.previousAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.text(`Total Return Amount: ${formatCurrency(returnData.totalAmount)}`, 120, finalY);
  
  if (returnData.reason) {
    doc.setFontSize(10);
    doc.text('Return Reason:', 14, finalY);
    doc.text(returnData.reason, 14, finalY + 5);
  }

  // Save the PDF
  doc.save(`return-${returnData.returnNumber}.pdf`);
};

// Generate product list PDF
export const generateProductListPDF = (products: Product[], categories: Record<number, string>) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.text('Al-Haramain Modern Paints - Product List', 14, 20);
  
  // Add date
  doc.setFontSize(10);
  doc.text(`Generated on: ${formatDate(new Date())}`, 14, 26);

  // Create table
  const rows = products.map(product => [
    product.name,
    categories[product.categoryId || 0] || 'Uncategorized',
    product.color || 'N/A',
    product.batch || 'N/A',
    formatCurrency(product.price),
    product.quantity.toString(),
  ]);

  doc.autoTable({
    head: [['Name', 'Category', 'Color', 'Batch', 'Price', 'Quantity']],
    body: rows,
    startY: 30,
    theme: 'grid',
    styles: { fontSize: 9 },
    headStyles: { fillColor: [25, 118, 210] },
  });

  // Save the PDF
  doc.save('product-list.pdf');
};
