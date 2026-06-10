// ============================================
// PdfGenerator — Core PDF layout engine
// ============================================

import { PDFDocument, PDFPage, StandardFonts, rgb, PDFFont } from 'pdf-lib';

// ============================================
// Types
// ============================================

export interface BusinessInfo {
  businessName: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
}

export interface TableOptions {
  x?: number;
  y?: number;
  cellPadding?: number;
  headerColor?: [number, number, number];
  borderColor?: [number, number, number];
  alternateRowColor?: [number, number, number];
}

// ============================================
// PdfGenerator Class
// ============================================

export class PdfGenerator {
  private _font: PDFFont | null = null;
  private _boldFont: PDFFont | null = null;

  /** Public getter for font access in templates */
  get font(): PDFFont {
    if (!this._font) throw new Error('PdfGenerator: font not initialized. Call createDocument() first.');
    return this._font;
  }

  /** Public getter for bold font access in templates */
  get boldFont(): PDFFont {
    if (!this._boldFont) throw new Error('PdfGenerator: boldFont not initialized. Call createDocument() first.');
    return this._boldFont;
  }

  /**
   * Create a new PDF document with standard US Letter size
   */
  async createDocument(): Promise<PDFDocument> {
    const doc = await PDFDocument.create();
    this._font = await doc.embedFont(StandardFonts.Helvetica);
    this._boldFont = await doc.embedFont(StandardFonts.HelveticaBold);
    return doc;
  }

  /**
   * Add business header to a page
   */
  addHeader(page: PDFPage, businessInfo: BusinessInfo): void {
    const { width } = page.getSize();
    const font = this.font;
    const boldFont = this.boldFont;

    // Business name
    page.drawText(businessInfo.businessName.toUpperCase(), {
      x: 50,
      y: 750,
      size: 18,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // NIT
    page.drawText(`NIT: ${businessInfo.nit}`, {
      x: 50,
      y: 730,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Address
    page.drawText(`Dirección: ${businessInfo.address}`, {
      x: 50,
      y: 715,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Phone
    page.drawText(`Teléfono: ${businessInfo.phone}`, {
      x: 50,
      y: 700,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Email
    page.drawText(`Email: ${businessInfo.email}`, {
      x: 50,
      y: 685,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Divider line
    page.drawLine({
      start: { x: 50, y: 675 },
      end: { x: width - 50, y: 675 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
  }

  /**
   * Add page number footer
   */
  addFooter(page: PDFPage, currentPage: number, totalPages: number): void {
    const { width } = page.getSize();
    const font = this.font;

    const text = `Página ${currentPage} de ${totalPages}`;
    const textWidth = font.widthOfTextAtSize(text, 8);

    page.drawText(text, {
      x: (width - textWidth) / 2,
      y: 30,
      size: 8,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });

    page.drawText('Documento generado por Lorens Nieto', {
      x: 50,
      y: 20,
      size: 7,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  /**
   * Draw a table on the page.
   * Returns the Y position after the table.
   */
  addTable(
    page: PDFPage,
    headers: string[],
    rows: (string | number)[][],
    startY: number,
    options?: TableOptions
  ): number {
    const { width } = page.getSize();
    const font = this.font;
    const boldFont = this.boldFont;
    const cellPadding = options?.cellPadding ?? 6;
    const headerColor = options?.headerColor ?? [0.2, 0.2, 0.2] as [number, number, number];
    const borderColor = options?.borderColor ?? [0.8, 0.8, 0.8] as [number, number, number];
    const alternateColor = options?.alternateRowColor ?? [0.95, 0.95, 0.95] as [number, number, number];

    const marginX = options?.x ?? 50;
    const tableWidth = width - marginX * 2;
    const colWidth = tableWidth / headers.length;
    const rowHeight = 20;
    let currentY = startY;

    // Draw header
    headers.forEach((header, i) => {
      const x = marginX + i * colWidth;

      // Header background
      page.drawRectangle({
        x,
        y: currentY - rowHeight,
        width: colWidth,
        height: rowHeight,
        color: rgb(headerColor[0], headerColor[1], headerColor[2]),
      });

      // Header text
      page.drawText(header, {
        x: x + cellPadding,
        y: currentY - rowHeight + cellPadding + 2,
        size: 9,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
    });

    currentY -= rowHeight;

    // Draw rows
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r]!;
      const rowY = currentY - rowHeight;

      // Alternate row background
      if (r % 2 === 1) {
        page.drawRectangle({
          x: marginX,
          y: rowY,
          width: tableWidth,
          height: rowHeight,
          color: rgb(alternateColor[0], alternateColor[1], alternateColor[2]),
        });
      }

      // Row cells
      row.forEach((cell, c) => {
        const x = marginX + c * colWidth;
        const cellText = String(cell);

        page.drawText(cellText, {
          x: x + cellPadding,
          y: rowY + cellPadding + 2,
          size: 8,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });

      // Row border bottom
      page.drawLine({
        start: { x: marginX, y: rowY },
        end: { x: marginX + tableWidth, y: rowY },
        thickness: 0.5,
        color: rgb(borderColor[0], borderColor[1], borderColor[2]),
      });

      currentY = rowY;
    }

    return currentY;
  }

  /**
   * Draw a section title
   */
  drawSectionTitle(page: PDFPage, title: string, y: number, size = 14): number {
    const font = this.boldFont;

    page.drawText(title, {
      x: 50,
      y,
      size,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    return y - 20;
  }

  /**
   * Draw a labeled value line (label: value)
   */
  drawField(page: PDFPage, label: string, value: string, y: number, labelWidth = 120): number {
    const font = this.font;
    const boldFont = this.boldFont;

    page.drawText(label, {
      x: 50,
      y,
      size: 9,
      font: boldFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    page.drawText(value, {
      x: 50 + labelWidth,
      y,
      size: 9,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    return y - 15;
  }
}

// ============================================
// Shared Helpers
// ============================================

const MONTHS_ES: string[] = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Format a number as currency in COP format
 * Example: formatCurrency(1200000) → "$ 1,200,000 COP"
 */
export function formatCurrency(amount: number): string {
  const formatted = amount.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `$ ${formatted} COP`;
}

/**
 * Format a date in Spanish locale
 * Example: formatDate(new Date(2026, 5, 15)) → "15 de junio de 2026"
 */
export function formatDate(date: Date): string {
  const day = date.getDate();
  const month = MONTHS_ES[date.getMonth()]!;
  const year = date.getFullYear();
  return `${day} de ${month} de ${year}`;
}
