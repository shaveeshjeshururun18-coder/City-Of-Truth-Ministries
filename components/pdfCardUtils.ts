import { jsPDF } from 'jspdf';

export const IMAGE_LOAD_TIMEOUT_MS = 3000;
export const PDF_PAGE_MARGIN_MM = 8;

/**
 * Waits for all <img> elements inside a node to either load, error, or time out.
 * @param node DOM node containing card markup to capture.
 * @param timeoutMs Max wait per image before continuing (default: IMAGE_LOAD_TIMEOUT_MS).
 * @returns Promise that resolves after every image is settled, avoiding stalled captures.
 */
export const waitForNodeImages = async (node: HTMLElement, timeoutMs: number = IMAGE_LOAD_TIMEOUT_MS) => {
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
    pdfDoc.addImage(dataUrl, format, x, y, renderWidth, renderHeight, undefined, 'FAST');
};
