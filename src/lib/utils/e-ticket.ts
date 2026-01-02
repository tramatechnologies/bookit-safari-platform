import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate QR code data URL for a booking
 */
export const generateQRCodeDataURL = async (bookingId: string, bookingNumber: string): Promise<string> => {
  try {
    // Create QR code data
    const qrData = JSON.stringify({
      bookingId,
      bookingNumber,
      timestamp: Date.now(),
    });
    
    // Generate QR code as data URL
    const dataURL = await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    
    return dataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback to external service
    const qrData = JSON.stringify({
      bookingId,
      bookingNumber,
      timestamp: Date.now(),
    });
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  }
};

/**
 * Generate and download e-ticket PDF
 */
export const generateETicketPDF = async (
  booking: {
    id: string;
    booking_number: string;
    passenger_name: string;
    passenger_phone: string;
    passenger_email?: string | null;
    seat_numbers: number[];
    total_amount_tzs: number;
    status: string;
    created_at: string;
  },
  schedule: {
    departure_date: string;
    departure_time: string;
    arrival_time?: string | null;
    route?: {
      departure_region?: { name: string } | null;
      destination_region?: { name: string } | null;
      departure_terminal?: string | null;
      arrival_terminal?: string | null;
      operator?: {
        company_name: string;
        logo_url?: string | null;
      } | null;
    } | null;
    bus?: {
      plate_number?: string | null;
      bus_type?: string | null;
    } | null;
  }
): Promise<void> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [210, 297], // A4 size
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Colors
  const primaryColor = [0, 128, 128]; // Teal
  const secondaryColor = [255, 193, 7]; // Amber
  const textColor = [51, 51, 51];
  const mutedColor = [128, 128, 128];

  // Header with gradient effect
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('BOOKIT SAFARI', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('E-TICKET', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Booking #${booking.booking_number}`, pageWidth / 2, 40, { align: 'center' });

  yPos = 60;

  // Booking Status Badge
  doc.setFillColor(...(booking.status === 'confirmed' ? [0, 128, 0] : [128, 128, 128]));
  doc.roundedRect(pageWidth - margin - 30, yPos - 5, 30, 8, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.status.toUpperCase(), pageWidth - margin - 15, yPos, { align: 'center' });

  yPos += 15;

  // Trip Information Section
  doc.setTextColor(...textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Trip Information', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text('From:', margin, yPos);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(
    schedule.route?.departure_region?.name || 'N/A',
    margin + 20,
    yPos
  );
  if (schedule.route?.departure_terminal) {
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(`Terminal: ${schedule.route.departure_terminal}`, margin + 20, yPos);
  }

  yPos += 10;
  doc.setTextColor(...mutedColor);
  doc.setFontSize(10);
  doc.text('To:', margin, yPos);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(
    schedule.route?.destination_region?.name || 'N/A',
    margin + 20,
    yPos
  );
  if (schedule.route?.arrival_terminal) {
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text(`Terminal: ${schedule.route.arrival_terminal}`, margin + 20, yPos);
  }

  yPos += 10;
  doc.setTextColor(...mutedColor);
  doc.text('Date:', margin, yPos);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'normal');
  const departureDate = new Date(schedule.departure_date);
  doc.text(
    departureDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    margin + 20,
    yPos
  );

  yPos += 6;
  doc.setTextColor(...mutedColor);
  doc.text('Departure Time:', margin, yPos);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(schedule.departure_time.substring(0, 5) || 'N/A', margin + 40, yPos);

  yPos += 15;

  // Operator & Bus Information
  if (schedule.route?.operator) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Operator', margin, yPos);
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(schedule.route.operator.company_name, margin, yPos);
    yPos += 10;
  }

  if (schedule.bus) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Bus Information', margin, yPos);
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (schedule.bus.plate_number) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Plate: ${schedule.bus.plate_number}`, margin, yPos);
      yPos += 6;
    }
    if (schedule.bus.bus_type) {
      doc.setFont('helvetica', 'normal');
      doc.text(`Type: ${schedule.bus.bus_type}`, margin, yPos);
      yPos += 10;
    }
  }

  // Passenger Information Section
  yPos += 5;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('Passenger Information', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...mutedColor);
  doc.text('Name:', margin, yPos);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(booking.passenger_name, margin + 20, yPos);

  yPos += 6;
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Phone:', margin, yPos);
  doc.setTextColor(...textColor);
  doc.text(booking.passenger_phone, margin + 20, yPos);

  if (booking.passenger_email) {
    yPos += 6;
    doc.setTextColor(...mutedColor);
    doc.text('Email:', margin, yPos);
    doc.setTextColor(...textColor);
    doc.text(booking.passenger_email, margin + 20, yPos);
  }

  yPos += 8;
  doc.setTextColor(...mutedColor);
  doc.text('Seats:', margin, yPos);
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.text(
    booking.seat_numbers.map((s) => s.toString()).join(', '),
    margin + 20,
    yPos
  );

  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount:', margin, yPos);
  doc.setFontSize(16);
  doc.setTextColor(...primaryColor);
  doc.text(
    `TZS ${booking.total_amount_tzs.toLocaleString()}`,
    pageWidth - margin,
    yPos,
    { align: 'right' }
  );

  // QR Code Section
  yPos += 20;
  const qrSize = 40;
  const qrX = pageWidth - margin - qrSize;
  const qrY = yPos;

  try {
    const qrDataURL = await generateQRCodeDataURL(booking.id, booking.booking_number);
    doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Draw placeholder if QR code fails
    doc.setFillColor(200, 200, 200);
    doc.rect(qrX, qrY, qrSize, qrSize, 'F');
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text('QR Code', qrX + qrSize / 2, qrY + qrSize / 2, { align: 'center' });
  }

  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.setFont('helvetica', 'normal');
  doc.text('Scan for verification', qrX + qrSize / 2, qrY + qrSize + 5, { align: 'center' });

  // Footer
  const footerY = pageHeight - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY, pageWidth - margin, footerY);
  
  yPos = footerY + 5;
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text(
    'This is an electronic ticket. Please arrive at least 30 minutes before departure.',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 4;
  doc.text(
    `Booked on: ${new Date(booking.created_at).toLocaleString('en-US')}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  yPos += 4;
  doc.text(
    'For support, contact: support@bookitsafari.com',
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );

  // Download the PDF
  doc.save(`ticket-${booking.booking_number}.pdf`);
};

