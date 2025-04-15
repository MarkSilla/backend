import jsPDF from 'jspdf';

const generateReceipt = (order, currency = '₱') => {
  try {
    if (!order || !order.items || !Array.isArray(order.items)) {
      throw new Error('Invalid order data: items array is missing or not an array');
    }
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Add receipt title and number
    doc.setFontSize(22);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text("RECEIPT", 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Receipt #: ${order._id.substring(order._id.length - 8)}`, pageWidth - 20, 25, { align: 'right' });

    // Add date
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, pageWidth - 20, 32, { align: 'right' });

    // Add a separator line
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, 40, pageWidth - 20, 40);

    // Add billing details section
    doc.setFontSize(11);
    doc.setTextColor(44, 62, 80);
    doc.setFont('helvetica', 'bold');
    doc.text("CUSTOMER DETAILS", 20, 50);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text(`${order.firstName} ${order.lastName}`, 20, 58);
    doc.text(`Phone: ${order.phone || 'N/A'}`, 20, 64);
    doc.text(`Department: ${order.department || 'N/A'}`, 20, 70);
    doc.text(`Program: ${order.program || 'N/A'}`, 20, 76);

    // Add order details on the right
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text("ORDER DETAILS", pageWidth - 80, 50);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(`Order ID: ${order._id}`, pageWidth - 80, 58);
    doc.text(`Status: ${order.status}`, pageWidth - 80, 64);
    doc.text(`Payment: ${order.payment === 'paid' || order.status === 'Received' ? 'Paid' : 'Pending'}`, pageWidth - 80, 70);
    doc.text(`Method: ${order.paymentMethod || 'N/A'}`, pageWidth - 80, 76);

    // Add second separator
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, 85, pageWidth - 20, 85);

    // Add table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 90, pageWidth - 40, 10, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text("ITEM", 25, 96);
    doc.text("SIZE", 95, 96);
    doc.text("QTY", 115, 96);
    doc.text("PRICE", 135, 96);
    doc.text("TOTAL", 175, 96);

    // Draw table rows
    let y = 105;
    let subtotal = 0; // Initialize subtotal
    order.items.forEach((item, index) => {
      // Add subtle alternating row background
      if (index % 2 !== 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      // Make sure item name doesn't overflow
      const itemName = item.name.length > 30 ? item.name.substring(0, 28) + '...' : item.name;
      doc.text(itemName, 25, y);
      doc.text(item.size || '-', 95, y);
      doc.text(item.quantity.toString(), 115, y);
      doc.text(`${currency} ${item.price.toFixed(2)}`, 135, y);
      doc.text(`${currency} ${(item.price * item.quantity).toFixed(2)}`, 175, y);

      subtotal += item.price * item.quantity; // Add to subtotal
      y += 10;
    });

    // Add payment status indicator
    const subtotalY = y + 10; // Define subtotalY based on the last row of the table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);

    if (order.payment === 'paid' || order.status === 'Received') {
      doc.setTextColor(46, 125, 50); // Green
      doc.text("PAID", pageWidth - 20, subtotalY - 5, { align: 'right' });
    } else {
      doc.setTextColor(211, 47, 47); // Red
      doc.text("PENDING", pageWidth - 20, subtotalY - 5, { align: 'right' });
    }

    // Add subtotal, tax, and total
    y = subtotalY + 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    doc.text("Subtotal:", 135, y);
    doc.text(`${currency} ${subtotal.toFixed(2)}`, 175, y);

    y += 7;
    doc.text("Tax:", 135, y);
    doc.text(`${currency} 0.00`, 175, y);

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(44, 62, 80);
    doc.text("TOTAL:", 135, y);
    doc.text(`${currency} ${subtotal.toFixed(2)}`, 175, y);

    // Add footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont('helvetica', 'normal');
    doc.text("Thank you for your order!", pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Return the PDF as a Blob URL
    const pdfBlob = doc.output('blob');
    return URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Error generating receipt:", error);
    throw error;
  }
};

export default generateReceipt;