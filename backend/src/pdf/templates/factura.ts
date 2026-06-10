// ============================================
// Factura Template — Customer Invoice
// ============================================

import { rgb } from 'pdf-lib';
import { PdfGenerator, formatCurrency, formatDate, BusinessInfo } from '../index.js';

interface PaymentRecord {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: Date;
}

interface PropertyRecord {
  id: string;
  name: string;
  type: string;
  address: string;
  zone: string;
  priceNight: number;
  rules: string[];
  ownerName: string;
  ownerCedula: string;
  ownerPhone: string;
  ownerEmail: string;
}

interface ReservationWithData {
  id: string;
  customerName: string;
  customerCedula: string;
  customerPhone: string;
  customerEmail: string;
  dateStart: Date;
  dateEnd: Date;
  priceTotal: number;
  status: string;
  additionalServices: string[];
  property: PropertyRecord;
  payments: PaymentRecord[];
}

/**
 * Generate a factura (invoice) PDF for a reservation
 */
export async function createFactura(reservation: ReservationWithData): Promise<Uint8Array> {
  const generator = new PdfGenerator();
  const doc = await generator.createDocument();
  const page = doc.addPage();

  const businessInfo: BusinessInfo = {
    businessName: 'Lorens Nieto',
    nit: '123456789-0',
    address: 'Valledupar, Cesar',
    phone: '+57 300 000 0000',
    email: 'contacto@lorensnieto.com',
  };

  // === HEADER ===
  generator.addHeader(page, businessInfo);

  // === TITLE ===
  let currentY = 660;
  generator.drawSectionTitle(page, 'FACTURA DE SERVICIOS', currentY);
  currentY -= 25;

  // === Document info ===
  generator.drawField(page, 'Factura No.:', reservation.id, currentY);
  currentY = generator.drawField(page, 'Fecha de emisión:', formatDate(new Date()), currentY);

  currentY -= 10;

  // === Customer info ===
  generator.drawSectionTitle(page, 'DATOS DEL CLIENTE', currentY, 11);
  currentY -= 5;
  currentY = generator.drawField(page, 'Nombre:', reservation.customerName, currentY);
  currentY = generator.drawField(page, 'CC/NIT:', reservation.customerCedula, currentY);
  currentY = generator.drawField(page, 'Teléfono:', reservation.customerPhone, currentY);
  currentY = generator.drawField(page, 'Email:', reservation.customerEmail, currentY);

  currentY -= 10;

  // === Property info ===
  generator.drawSectionTitle(page, 'DATOS DE LA PROPIEDAD', currentY, 11);
  currentY -= 5;
  currentY = generator.drawField(page, 'Propiedad:', reservation.property.name, currentY);
  currentY = generator.drawField(
    page,
    'Tipo:',
    reservation.property.type === 'casa_campo' ? 'Casa de Campo' : 'Apartamento',
    currentY
  );
  currentY = generator.drawField(page, 'Dirección:', reservation.property.address, currentY);
  currentY = generator.drawField(page, 'Zona:', reservation.property.zone, currentY);

  currentY -= 10;

  // === Rental period ===
  generator.drawSectionTitle(page, 'PERÍODO DE RESERVA', currentY, 11);
  currentY -= 5;

  const dateStart = new Date(reservation.dateStart);
  const dateEnd = new Date(reservation.dateEnd);
  const diffTime = dateEnd.getTime() - dateStart.getTime();
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  currentY = generator.drawField(page, 'Check-in:', formatDate(dateStart), currentY);
  currentY = generator.drawField(page, 'Check-out:', formatDate(dateEnd), currentY);
  currentY = generator.drawField(page, 'Noches:', String(nights), currentY);

  currentY -= 10;

  // === Price breakdown ===
  generator.drawSectionTitle(page, 'DESGLOSE DE PRECIO', currentY, 11);
  currentY -= 5;

  const nightlyRate = Number(reservation.property.priceNight);
  const subtotal = nightlyRate * nights;

  currentY = generator.drawField(page, 'Tarifa por noche:', formatCurrency(nightlyRate), currentY);
  currentY = generator.drawField(page, '× Noches:', String(nights), currentY);
  currentY = generator.drawField(page, 'Subtotal:', formatCurrency(subtotal), currentY);

  if (reservation.additionalServices && reservation.additionalServices.length > 0) {
    currentY = generator.drawField(
      page,
      'Servicios adicionales:',
      reservation.additionalServices.join(', '),
      currentY
    );
  }

  currentY = generator.drawField(page, 'TOTAL:', formatCurrency(Number(reservation.priceTotal)), currentY);

  currentY -= 10;

  // === Payment history ===
  if (reservation.payments && reservation.payments.length > 0) {
    generator.drawSectionTitle(page, 'HISTORIAL DE PAGOS', currentY, 11);
    currentY -= 5;

    const paymentHeaders = ['Fecha', 'Monto', 'Tipo', 'Estado'];
    const paymentRows = reservation.payments.map((p) => [
      formatDate(new Date(p.createdAt)),
      formatCurrency(Number(p.amount)),
      p.type === 'abono' ? 'Abono' : 'Total',
      p.status === 'pagado' ? 'Pagado' : 'Pendiente',
    ]);

    currentY = generator.addTable(page, paymentHeaders, paymentRows, currentY);
    currentY -= 10;
  }

  // === Balance summary ===
  generator.drawSectionTitle(page, 'RESUMEN DE SALDO', currentY, 11);
  currentY -= 5;

  const totalPaid = (reservation.payments || [])
    .filter((p) => p.status === 'pagado')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingBalance = Number(reservation.priceTotal) - totalPaid;

  currentY = generator.drawField(page, 'Total:', formatCurrency(Number(reservation.priceTotal)), currentY);
  currentY = generator.drawField(page, 'Total pagado:', formatCurrency(totalPaid), currentY);
  currentY = generator.drawField(page, 'Saldo pendiente:', formatCurrency(Math.max(0, pendingBalance)), currentY);

  currentY -= 10;

  // === Terms and conditions ===
  if (reservation.property.rules && reservation.property.rules.length > 0) {
    generator.drawSectionTitle(page, 'TÉRMINOS Y CONDICIONES', currentY, 11);
    currentY -= 5;

    for (const rule of reservation.property.rules) {
      page.drawText(`• ${rule}`, {
        x: 50,
        y: currentY,
        size: 8,
        font: generator.font,
        color: rgb(0.4, 0.4, 0.4),
      });
      currentY -= 14;
    }
  }

  // === FOOTER ===
  generator.addFooter(page, 1, 1);

  return doc.save();
}
