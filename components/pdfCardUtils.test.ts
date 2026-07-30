import { describe, it, expect, vi } from 'vitest';
import { drawSectionLabel } from './pdfCardUtils';
import { jsPDF } from 'jspdf';

describe('pdfCardUtils - drawSectionLabel', () => {
    it('should draw a section label with default settings', () => {
        // Mock jsPDF instance
        const mockPdf = {
            setFillColor: vi.fn(),
            rect: vi.fn(),
            setTextColor: vi.fn(),
            setFont: vi.fn(),
            setFontSize: vi.fn(),
            text: vi.fn(),
        } as unknown as jsPDF;

        drawSectionLabel(mockPdf, 'Member', 10, 20, '#GOLD', '#NAVY');

        // Verify setFillColor
        expect(mockPdf.setFillColor).toHaveBeenCalledWith('#GOLD');
        // Default rectOffset is { x: 0, y: 1, w: 2, h: 3.8 }
        // x = 10 + 0 = 10, y = 20 + 1 = 21, w = 2, h = 3.8
        expect(mockPdf.rect).toHaveBeenCalledWith(10, 21, 2, 3.8, 'F');

        // Verify setTextColor
        expect(mockPdf.setTextColor).toHaveBeenCalledWith('#NAVY');
        // Verify font configuration
        expect(mockPdf.setFont).toHaveBeenCalledWith('helvetica', 'bold');
        // Default text size is 7.6
        expect(mockPdf.setFontSize).toHaveBeenCalledWith(7.6);

        // Default textOffset is { x: 5, y: 4.0 }
        // tx = 10 + 5 = 15, ty = 20 + 4.0 = 24.0
        expect(mockPdf.text).toHaveBeenCalledWith('MEMBER', 15, 24);
    });

    it('should draw a section label with custom offsets', () => {
        // Mock jsPDF instance
        const mockPdf = {
            setFillColor: vi.fn(),
            rect: vi.fn(),
            setTextColor: vi.fn(),
            setFont: vi.fn(),
            setFontSize: vi.fn(),
            text: vi.fn(),
        } as unknown as jsPDF;

        drawSectionLabel(mockPdf, 'Church Name', 10, 20, '#GOLD', '#NAVY', {
            rectOffset: { x: 0, y: -1, w: 3, h: 8.5 },
            textOffset: { x: 6, y: 1, size: 7.6 }
        });

        // Verify setFillColor
        expect(mockPdf.setFillColor).toHaveBeenCalledWith('#GOLD');
        // Custom rectOffset is { x: 0, y: -1, w: 3, h: 8.5 }
        // x = 10 + 0 = 10, y = 20 - 1 = 19, w = 3, h = 8.5
        expect(mockPdf.rect).toHaveBeenCalledWith(10, 19, 3, 8.5, 'F');

        // Verify setTextColor
        expect(mockPdf.setTextColor).toHaveBeenCalledWith('#NAVY');
        // Verify font configuration
        expect(mockPdf.setFont).toHaveBeenCalledWith('helvetica', 'bold');
        // Custom text size is 7.6
        expect(mockPdf.setFontSize).toHaveBeenCalledWith(7.6);

        // Custom textOffset is { x: 6, y: 1 }
        // tx = 10 + 6 = 16, ty = 20 + 1 = 21
        expect(mockPdf.text).toHaveBeenCalledWith('CHURCH NAME', 16, 21);
    });
});
