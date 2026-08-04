import { jsPDF } from 'jspdf';

export const IMAGE_LOAD_TIMEOUT_MS = 2000; // Reduced from 3000 to 2000ms for faster processing
export const PDF_PAGE_MARGIN_MM = 8;

/**
 * Waits for all <img> elements inside a node to either load, error, or time out.
 * @param node DOM node containing card markup to capture.
 * @param timeoutMs Max wait per image before continuing (default: IMAGE_LOAD_TIMEOUT_MS).
 * @returns Promise that resolves after every image is settled, avoiding stalled captures.
 */
export const waitForNodeImages = async (node: HTMLElement, timeoutMs: number = 2000) => { // Reduced from 3000 to 2000ms
    const images = Array.from(node.querySelectorAll('img')) as HTMLImageElement[];
    await Promise.all(images.map((img) => (
        img.complete && img.naturalWidth > 0
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                const done = () => resolve();
                img.addEventListener('load', done, { once: true });
                img.addEventListener('error', done, { once: true });
                setTimeout(done, timeoutMs);
            })
    )));
};

/**
 * Adds a card image to a landscape A4 PDF page with centered placement.
 * It fits the image within page bounds using an equal margin (PDF_PAGE_MARGIN_MM) on all sides.
 * @param pdfDoc Target jsPDF instance.
 * @param dataUrl Image data URL to render.
 * @param format Image format expected by jsPDF addImage.
 * @param isFirstPage When false, creates a new page before drawing.
 */
export const addCenteredCardPage = (
    pdfDoc: jsPDF,
    dataUrl: string,
    format: 'PNG' | 'JPEG',
    isFirstPage: boolean
) => {
    if (!isFirstPage) pdfDoc.addPage('a4', 'landscape');
    const pageWidth = pdfDoc.internal.pageSize.getWidth();
    const pageHeight = pdfDoc.internal.pageSize.getHeight();
    const img = pdfDoc.getImageProperties(dataUrl);
    const maxWidth = pageWidth - (PDF_PAGE_MARGIN_MM * 2);
    const maxHeight = pageHeight - (PDF_PAGE_MARGIN_MM * 2);
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    const renderWidth = img.width * scale;
    const renderHeight = img.height * scale;
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;
    
    // Use 'MEDIUM' compression for balanced quality and speed
    pdfDoc.addImage(dataUrl, format, x, y, renderWidth, renderHeight, undefined, 'MEDIUM');
};

/**
 * Draws a section label with a rectangular colored bar next to the text.
 * @param pdf jsPDF instance
 * @param label The text label to display
 * @param x X coordinate
 * @param y Y coordinate
 * @param gold Color code/hex for the rectangular accent block
 * @param navyDark Color code/hex for the text
 * @param options Additional layout options to handle differences between Admin and User dashboards
 */
export const drawSectionLabel = (
    pdf: jsPDF,
    label: string,
    x: number,
    y: number,
    gold: string = '#C9963A',
    navyDark: string = '#0F1A3E',
    options?: {
        rectOffset?: { x: number; y: number; w: number; h: number };
        textOffset?: { x: number; y: number; size: number };
    }
) => {
    const rx = x + (options?.rectOffset?.x ?? 0);
    const ry = y + (options?.rectOffset?.y ?? 1);
    const rw = options?.rectOffset?.w ?? 2;
    const rh = options?.rectOffset?.h ?? 3.8;

    const tx = x + (options?.textOffset?.x ?? 5);
    const ty = y + (options?.textOffset?.y ?? 4.0);
    const tsize = options?.textOffset?.size ?? 7.6;

    pdf.setFillColor(gold);
    pdf.rect(rx, ry, rw, rh, 'F');
    pdf.setTextColor(navyDark);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(tsize);
    pdf.text(label.toUpperCase(), tx, ty);
};

/**
 * Draws a rounded input/field box with value or placeholder text in a PDF.
 */
export const drawFieldBox = (
    pdf: jsPDF,
    x: number,
    y: number,
    width: number,
    height: number,
    value = '',
    placeholder = '',
    isMultiline = false,
    navy = '#1E293B',
    navyDark = '#0F1A3E'
) => {
    pdf.setFillColor(252, 252, 253);
    pdf.setDrawColor(218, 225, 233);
    pdf.setLineWidth(0.3);
    pdf.roundedRect(x, y, width, height, 1.8, 1.8, 'FD');

    const display = (value && value.trim() ? value : placeholder).toUpperCase();
    if (display) {
        pdf.setTextColor(value && value.trim() ? navyDark : '#94A3B8');
        pdf.setFont('helvetica', value && value.trim() ? 'bold' : 'normal');
        pdf.setFontSize(7.2);
        if (isMultiline) {
            const lines = pdf.splitTextToSize(display, width - 6);
            pdf.text(lines, x + 3.5, y + 4.5);
        } else {
            pdf.text(display, x + 3.5, y + Math.min(height - 2, 4.8));
        }
    }
};

