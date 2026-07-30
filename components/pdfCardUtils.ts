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
 * Draws a standardized styled text field box inside a jsPDF document.
 * Includes a subtle offset shadow, styled border, and handles multi-line/italic placeholder styles.
 * Used across admin and user dashboards for rendering member form PDFs.
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
    navy = '#1B2A5E',
    navyDark = '#0F1A3E'
) => {
    const cleanValue = `${value || ''}`.trim();
    pdf.setFillColor('#D8D0C0');
    pdf.roundedRect(x + 1, y + 1.5, width, height, 4, 4, 'F');
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(navy);
    pdf.setLineWidth(1.2);
    pdf.roundedRect(x, y, width, height, 4, 4, 'FD');
    if (cleanValue) {
        pdf.setTextColor(navyDark);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(isMultiline ? 9.2 : 9.5);
        const lines = pdf.splitTextToSize(cleanValue, width - 10);
        pdf.text(lines.slice(0, isMultiline ? 4 : 1), x + 5, y + (isMultiline ? 8 : height / 2 + 3.1));
    } else if (placeholder) {
        pdf.setTextColor('#AAAAAA');
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(9);
        pdf.text(placeholder, x + 5, y + (isMultiline ? 8 : height / 2 + 3.1));
    }
};
