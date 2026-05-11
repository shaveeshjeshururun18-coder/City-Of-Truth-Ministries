import { jsPDF } from 'jspdf';

export const IMAGE_LOAD_TIMEOUT_MS = 3000;

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
    const margin = 8;
    const maxWidth = pageWidth - (margin * 2);
    const maxHeight = pageHeight - (margin * 2);
    const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
    const renderWidth = img.width * scale;
    const renderHeight = img.height * scale;
    const x = (pageWidth - renderWidth) / 2;
    const y = (pageHeight - renderHeight) / 2;
    pdfDoc.addImage(dataUrl, format, x, y, renderWidth, renderHeight, undefined, 'FAST');
};
