import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateHebrewAlphabetPDF = async () => {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;

    // Color scheme
    const primaryGold = [251, 191, 36]; // #FBBF24
    const darkBg = [15, 23, 42]; // #0F172A
    const white = [255, 255, 255];
    const lightGray = [200, 200, 200];

    const HEBREW_LETTERS = [
      { letter: "א", paleo: "𐤀", name: "ALEPH", hebrew: "אלף", value: 1, meaning: "Ox, Strength, Leader" },
      { letter: "ב", paleo: "𐤁", name: "BET", hebrew: "בית", value: 2, meaning: "House, Family, Inside" },
      { letter: "ג", paleo: "𐤂", name: "GIMEL", hebrew: "גימל", value: 3, meaning: "Camel, Pride, Lift Up" },
      { letter: "ד", paleo: "𐤃", name: "DALET", hebrew: "דלת", value: 4, meaning: "Door, Pathway, Enter" },
      { letter: "ה", paleo: "𐤄", name: "HE", hebrew: "הא", value: 5, meaning: "Window, Breath, Revelation" },
      { letter: "ו", paleo: "𐤅", name: "VAV", hebrew: "וו", value: 6, meaning: "Nail, Peg, Connection" },
      { letter: "ז", paleo: "𐤆", name: "ZAYIN", hebrew: "זין", value: 7, meaning: "Sword, Weapon, Cut" },
      { letter: "ח", paleo: "𐤇", name: "CHET", hebrew: "חית", value: 8, meaning: "Fence, Enclosure, Protection" },
      { letter: "ט", paleo: "𐤈", name: "TET", hebrew: "טית", value: 9, meaning: "Basket, Snake, Surround" },
      { letter: "י", paleo: "𐤉", name: "YOD", hebrew: "יוד", value: 10, meaning: "Hand, Work, Deed" },
      { letter: "כ", paleo: "𐤊", name: "KAF", hebrew: "כף", value: 20, meaning: "Palm, Open Hand, Cover" },
      { letter: "ל", paleo: "𐤋", name: "LAMED", hebrew: "למד", value: 30, meaning: "Staff, Goad, Teach/Lead" },
      { letter: "מ", paleo: "𐤌", name: "MEM", hebrew: "מם", value: 40, meaning: "Water, Chaos, Mighty" },
      { letter: "נ", paleo: "𐤍", name: "NUN", hebrew: "נון", value: 50, meaning: "Fish, Seed, Life/Action" },
      { letter: "ס", paleo: "𐤎", name: "SAMEKH", hebrew: "סמך", value: 60, meaning: "Prop, Support, Lean" },
      { letter: "ע", paleo: "𐤏", name: "AYIN", hebrew: "עין", value: 70, meaning: "Eye, See, Understand" },
      { letter: "פ", paleo: "𐤐", name: "PE", hebrew: "פה", value: 80, meaning: "Mouth, Word, Speak" },
      { letter: "צ", paleo: "𐤑", name: "TSADE", hebrew: "צדי", value: 90, meaning: "Fishhook, Pull, Righteous" },
      { letter: "ק", paleo: "𐤒", name: "QOPH", hebrew: "קוף", value: 100, meaning: "Sun on Horizon, Time, Circle" },
      { letter: "ר", paleo: "𐤓", name: "RESH", hebrew: "ריש", value: 200, meaning: "Head, Person, Highest" },
      { letter: "ש", paleo: "𐤔", name: "SHIN", hebrew: "שין", value: 300, meaning: "Teeth, Consume, Destroy" },
      { letter: "ת", paleo: "𐤕", name: "TAV", hebrew: "תו", value: 400, meaning: "Mark, Sign, Covenant" }
    ];

    // PAGE 1: TITLE PAGE
    pdf.setFillColor(...darkBg);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Gold decorative line top
    pdf.setDrawColor(...primaryGold);
    pdf.setLineWidth(3);
    pdf.line(margin, 15, pageWidth - margin, 15);

    // Title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(48);
    pdf.setTextColor(...primaryGold);
    pdf.text('Lashon HaKodesh', pageWidth / 2, 60, { align: 'center' });

    // Subtitle
    pdf.setFontSize(28);
    pdf.setTextColor(245, 158, 11);
    pdf.text('The Holy Tongue', pageWidth / 2, 85, { align: 'center' });

    // Hebrew text
    pdf.setFontSize(16);
    pdf.setTextColor(...white);
    pdf.text('Hebrew Aleph-Bet Guide', pageWidth / 2, 105, { align: 'center' });

    // Divider
    pdf.setLineWidth(1.5);
    pdf.line(margin + 20, 120, pageWidth - margin - 20, 120);

    // Description
    pdf.setFontSize(12);
    pdf.setTextColor(...lightGray);
    const descLines = [
      'A Comprehensive Guide to the 22 Letters of the Hebrew Alphabet',
      'Including Modern & Paleo-Hebrew Forms, Meanings & Gematria Values',
      '',
      'Presented by City of Truth Ministries',
      'Valparai, Tamil Nadu, India'
    ];
    let yPos = 140;
    descLines.forEach(line => {
      pdf.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;
    });

    // Statistics
    pdf.setFontSize(11);
    pdf.setTextColor(...primaryGold);
    yPos += 15;
    pdf.text('22 Letters • Gematria Values 1-400 • 3000+ Years Old', pageWidth / 2, yPos, { align: 'center' });

    // Gold decorative line bottom
    pdf.setLineWidth(3);
    pdf.line(margin, pageHeight - 25, pageWidth - margin, pageHeight - 25);

    // Copyright footer
    pdf.setFontSize(9);
    pdf.setTextColor(...primaryGold);
    pdf.text('© 2026 City of Truth Ministries', pageWidth / 2, pageHeight - 12, { align: 'center' });
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    pdf.text('All Rights Reserved | Educational & Personal Use', pageWidth / 2, pageHeight - 7, { align: 'center' });

    // PAGE 2 & 3: ALPHABET TABLE
    for (let pageNum = 0; pageNum < 2; pageNum++) {
      pdf.addPage();

      // Header
      pdf.setFillColor(...darkBg);
      pdf.rect(0, 0, pageWidth, pageHeight, 'F');

      // Page header with gold line
      pdf.setDrawColor(...primaryGold);
      pdf.setLineWidth(2);
      pdf.line(margin, 8, pageWidth - margin, 8);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...primaryGold);
      pdf.text(`Hebrew Aleph-Bet - Page ${pageNum + 2}`, margin, 18);

      // Table data for this page
      const startIdx = pageNum * 11;
      const endIdx = Math.min(startIdx + 11, HEBREW_LETTERS.length);
      const pageLetters = HEBREW_LETTERS.slice(startIdx, endIdx);

      // Table setup
      const tableData = pageLetters.map((letter, idx) => [
        `${startIdx + idx + 1}`,
        letter.letter,
        letter.name,
        letter.hebrew,
        letter.value.toString(),
        letter.meaning
      ]);

      // Using autoTable - called as exported function
      autoTable(pdf, {
        startY: 28,
        margin: { left: margin, right: margin },
        head: [['#', 'Modern', 'Name', 'Hebrew', 'Value', 'Meaning']],
        body: tableData,
        theme: 'grid',
        headStyles: {
          fillColor: primaryGold as any,
          textColor: darkBg as any,
          fontStyle: 'bold',
          fontSize: 10,
          halign: 'center' as any,
          valign: 'middle' as any,
          lineColor: primaryGold as any,
          lineWidth: 0.5
        },
        bodyStyles: {
          textColor: lightGray as any,
          fontSize: 9,
          lineColor: [100, 100, 100] as any,
          lineWidth: 0.3,
          fillColor: [20, 25, 50] as any
        },
        alternateRowStyles: {
          fillColor: [15, 20, 40] as any
        },
        columnStyles: {
          0: { halign: 'center' as any, cellWidth: 8 },
          1: { halign: 'center' as any, fontSize: 14, textColor: primaryGold as any, cellWidth: 12 },
          2: { halign: 'left' as any, cellWidth: 20 },
          3: { halign: 'center' as any, fontSize: 12, textColor: primaryGold as any, cellWidth: 15 },
          4: { halign: 'center' as any, cellWidth: 12 },
          5: { halign: 'left' as any }
        },
        didDrawPage: (data: any) => {
          // Footer
          const pageSize = pdf.internal.pageSize;
          const pageHeight = pageSize.getHeight();

          // Bottom gold line
          pdf.setDrawColor(...primaryGold);
          pdf.setLineWidth(2);
          pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

          // Footer text
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`© 2026 City of Truth Ministries | Valparai Sanctuary`, margin, pageHeight - 8);
          pdf.text(`Page ${pageNum + 2}`, pageWidth - margin - 20, pageHeight - 8);
          pdf.setTextColor(...primaryGold);
          pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
        }
      });
    }

    // PAGE 4: REFERENCE PAGE
    pdf.addPage();
    pdf.setFillColor(...darkBg);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Header
    pdf.setDrawColor(...primaryGold);
    pdf.setLineWidth(2);
    pdf.line(margin, 8, pageWidth - margin, 8);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...primaryGold);
    pdf.text('Reference & Information', margin, 18);

    // Content
    pdf.setFontSize(10);
    pdf.setTextColor(...lightGray);
    let refY = 35;

    const refSections = [
      {
        title: 'GEMATRIA (Numerical Values)',
        content: [
          'Units (Aleph-Tet): 1-9',
          'Tens (Yod-Tsade): 10-90',
          'Hundreds (Qoph-Tav): 100-400'
        ]
      },
      {
        title: 'STRUCTURE',
        content: [
          'Modern Hebrew: Used in modern texts',
          'Paleo-Hebrew: Ancient pictographic forms',
          'Meaning: Spiritual significance of each letter'
        ]
      },
      {
        title: 'USAGE',
        content: [
          'Educational resource for Hebrew learning',
          'Spiritual study and contemplation',
          'Reference for gematria calculations'
        ]
      },
      {
        title: 'COPYRIGHT & LICENSE',
        content: [
          '© 2026 City of Truth Ministries',
          'Valparai, Tamil Nadu, India',
          'This document is provided for educational and personal use.',
          'Permission granted for non-commercial distribution.'
        ]
      }
    ];

    refSections.forEach(section => {
      // Section title
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(...primaryGold);
      pdf.text(section.title, margin, refY);
      refY += 8;

      // Section content
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(...lightGray);
      section.content.forEach(line => {
        pdf.text('• ' + line, margin + 3, refY);
        refY += 6;
      });
      refY += 4;
    });

    // Bottom footer
    pdf.setDrawColor(...primaryGold);
    pdf.setLineWidth(2);
    pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`© 2026 City of Truth Ministries | Baruch Hashem`, margin, pageHeight - 8);
    pdf.setTextColor(...primaryGold);
    pdf.text(`Page 4`, pageWidth - margin - 20, pageHeight - 8);

    // Save the PDF
    pdf.save('Hebrew_Alphabet_City_of_Truth.pdf');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
};

export default generateHebrewAlphabetPDF;
