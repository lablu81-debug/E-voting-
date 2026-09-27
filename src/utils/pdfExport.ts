import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Candidate, CommitteeMember, Language } from '../types';
import { toBanglaNum } from './helpers';

export interface PdfExportData {
  currentLang: Language;
  vpCandidates: Candidate[];
  ecCandidates: Candidate[];
  committeeMembers: CommitteeMember[];
  totalVoters: number;
  totalVotesCast: number;
}

/**
 * Downloads a generated jsPDF instance via standard methods with fallback.
 */
function savePdfFile(pdf: jsPDF, filename: string): boolean {
  try {
    pdf.save(filename);
    return true;
  } catch (err) {
    console.warn('Standard pdf.save failed, trying blob download link:', err);
    try {
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 2000);
      return true;
    } catch (fallbackErr) {
      console.error('Blob download also failed:', fallbackErr);
      return false;
    }
  }
}

/**
 * Ensures any external images inside the container do not taint canvas by
 * converting them to data URLs or replacing with clean avatar placeholders.
 */
async function sanitizeImagesForCanvas(root: HTMLElement): Promise<void> {
  const images = Array.from(root.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      try {
        if (!img.src || img.src.startsWith('data:')) return;
        
        // Attempt fetch with cors
        const response = await fetch(img.src, { mode: 'cors' });
        if (!response.ok) throw new Error('CORS fetch failed');
        const blob = await response.blob();
        
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch {
        // If image fetch fails or causes CORS issues, replace with an avatar placeholder
        // so html2canvas never touches a tainted external resource
        const parent = img.parentElement;
        const altText = img.alt || 'Candidate';
        const initial = altText.trim().charAt(0).toUpperCase() || 'C';
        
        const avatar = document.createElement('div');
        avatar.style.width = '100%';
        avatar.style.height = '100%';
        avatar.style.display = 'flex';
        avatar.style.alignItems = 'center';
        avatar.style.justifyContent = 'center';
        avatar.style.backgroundColor = '#e2e8f0';
        avatar.style.color = '#334155';
        avatar.style.fontSize = '10px';
        avatar.style.fontWeight = 'bold';
        avatar.textContent = initial;
        
        if (parent) {
          img.style.display = 'none';
          parent.appendChild(avatar);
        } else {
          img.style.display = 'none';
        }
      }
    })
  );
}

/**
 * Pure programmatic PDF generator using jsPDF.
 * Used as a 100% reliable fallback or standalone generator that works in any browser.
 */
export function generateDirectPdfDocument(data: PdfExportData, filename: string): boolean {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const isEn = data.currentLang === 'en';
    const pageWidth = 210;
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = 16;

    // Header Background bar
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(margin, y, contentWidth, 20, 'F');

    // Header Text
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(
      'WORKER PARTICIPATION COMMITTEE (PC) GENERAL ELECTION 2026',
      pageWidth / 2,
      y + 7,
      { align: 'center' }
    );

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(190, 215, 245);
    pdf.text(
      'Official Election Audit Certificate & Return of Election (EPZ Labour Act 2019 & Rules 2022)',
      pageWidth / 2,
      y + 14,
      { align: 'center' }
    );

    y += 25;

    // Meta Info Box
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.roundedRect(margin, y, contentWidth, 16, 2, 2, 'FD');

    const turnoutPct =
      data.totalVoters > 0 ? ((data.totalVotesCast / data.totalVoters) * 100).toFixed(1) : '0';
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    pdf.setTextColor(100, 116, 139); // slate-500
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'bold');
    pdf.text('DATE ISSUED', margin + 6, y + 5);
    pdf.text('TOTAL REGISTERED VOTERS', margin + 50, y + 5);
    pdf.text('TOTAL BALLOTS CAST', margin + 105, y + 5);
    pdf.text('AUDIT STATUS', margin + 155, y + 5);

    pdf.setTextColor(15, 23, 42); // slate-900
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(dateStr, margin + 6, y + 12);
    pdf.text(`${data.totalVoters} Voters`, margin + 50, y + 12);
    pdf.text(`${data.totalVotesCast} (${turnoutPct}%)`, margin + 105, y + 12);

    pdf.setTextColor(4, 120, 87); // emerald-700
    pdf.text('Verified & Sealed', margin + 155, y + 12);

    y += 22;

    // Helper: Draw Section Title
    const drawSectionTitle = (title: string, subtitle?: string) => {
      pdf.setFillColor(30, 58, 138); // blue-900
      pdf.rect(margin, y, 3, 7, 'F');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, margin + 6, y + 5.5);

      if (subtitle) {
        pdf.setTextColor(100, 116, 139);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subtitle, pageWidth - margin, y + 5.5, { align: 'right' });
      }
      y += 10;
    };

    // Helper: Draw Candidate Table
    const drawCandidateTable = (candidates: Candidate[], seatsCount: number = 1) => {
      const sorted = [...candidates].sort((a, b) => b.votes - a.votes);

      // Table Header
      pdf.setFillColor(241, 245, 249); // slate-100
      pdf.rect(margin, y, contentWidth, 7, 'F');
      pdf.setDrawColor(203, 213, 225);
      pdf.line(margin, y, margin + contentWidth, y);
      pdf.line(margin, y + 7, margin + contentWidth, y + 7);

      pdf.setTextColor(51, 65, 85);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RANK', margin + 4, y + 4.8);
      pdf.text('ID', margin + 18, y + 4.8);
      pdf.text('CANDIDATE NAME', margin + 35, y + 4.8);
      pdf.text('DEPARTMENT', margin + 95, y + 4.8);
      pdf.text('VOTES', margin + 145, y + 4.8, { align: 'right' });
      pdf.text('PERCENT', margin + 162, y + 4.8, { align: 'right' });
      pdf.text('RESULT', margin + 175, y + 4.8);

      y += 7;

      sorted.forEach((c, idx) => {
        const isElected = idx < seatsCount && c.votes > 0;
        const pct = data.totalVotesCast > 0 ? ((c.votes / data.totalVotesCast) * 100).toFixed(1) : '0';

        if (isElected) {
          pdf.setFillColor(236, 253, 245); // emerald-50
          pdf.rect(margin, y, contentWidth, 6.5, 'F');
        }

        pdf.setDrawColor(226, 232, 240);
        pdf.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', isElected ? 'bold' : 'normal');
        pdf.setTextColor(isElected ? 4 : 15, isElected ? 120 : 23, isElected ? 87 : 42);

        pdf.text(`#${idx + 1}`, margin + 4, y + 4.5);
        pdf.text(c.id, margin + 18, y + 4.5);
        pdf.text(`${c.nameEn} (${c.nameBn})`, margin + 35, y + 4.5);
        pdf.text(c.deptEn, margin + 95, y + 4.5);
        pdf.text(String(c.votes), margin + 145, y + 4.5, { align: 'right' });
        pdf.text(`${pct}%`, margin + 162, y + 4.5, { align: 'right' });

        if (isElected) {
          pdf.setTextColor(6, 95, 70); // emerald-800
          pdf.setFont('helvetica', 'bold');
          pdf.text(seatsCount > 1 ? `ELECTED (S#${idx + 1})` : 'ELECTED', margin + 175, y + 4.5);
        } else {
          pdf.setTextColor(148, 163, 184); // slate-400
          pdf.setFont('helvetica', 'normal');
          pdf.text('Runner Up', margin + 175, y + 4.5);
        }

        y += 6.5;
      });

      y += 4;
    };

    // Vice President Section
    drawSectionTitle('1. VICE PRESIDENT ELECTION (1 SEAT)', 'Voted by Elected Executive Committee Members');
    drawCandidateTable(data.vpCandidates, 1);

    y += 2;

    // Executive Committee Members Section
    drawSectionTitle('2. EXECUTIVE COMMITTEE MEMBERS ELECTION (08 SEATS)', 'General Direct Secret Ballot — Top 8 Candidates Certified');
    drawCandidateTable(data.ecCandidates, 8);

    y += 3;

    // Compliance Statement Box
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, y, contentWidth, 12, 1, 1, 'FD');

    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(6.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text(
      'STATUTORY DECLARATION: This certifies that the PC Election was conducted in accordance with the EPZ Labour Act 2019 and EPZ Labour Rules 2022 for EPZ Factories. All eligible factory employees exercised their voting rights via secret ballot without coercion or bias.',
      margin + 4,
      y + 4.5,
      { maxWidth: contentWidth - 8 }
    );

    y += 16;

    // Committee Signatures Section
    pdf.setDrawColor(148, 163, 184);
    pdf.setLineDashPattern([2, 2], 0);
    pdf.line(margin, y, margin + contentWidth, y);
    pdf.setLineDashPattern([], 0);

    y += 5;
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text(
      `ELECTION ORGANIZING COMMITTEE AUTHENTICATION & SIGNATURES (${data.committeeMembers.length} MEMBERS)`,
      pageWidth / 2,
      y,
      { align: 'center' }
    );

    y += 6;

    const numMembers = data.committeeMembers.length;
    const colWidth = contentWidth / numMembers;

    data.committeeMembers.forEach((m, idx) => {
      const colX = margin + idx * colWidth;
      const centerX = colX + colWidth / 2;

      // Simulated signature line
      pdf.setFont('times', 'italic');
      pdf.setFontSize(9);
      pdf.setTextColor(148, 163, 184);
      pdf.text(m.name.en.split(' ')[0] || 'Member', centerX, y + 6, { align: 'center' });

      pdf.setDrawColor(51, 65, 85);
      pdf.line(colX + 3, y + 8, colX + colWidth - 3, y + 8);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(15, 23, 42);
      pdf.text(m.name.en, centerX, y + 12, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(71, 85, 105);
      pdf.text(m.roleDescription?.en || m.badge.en, centerX, y + 15.5, { align: 'center' });

      pdf.setFontSize(6);
      pdf.setTextColor(100, 116, 139);
      pdf.text(m.dept.en, centerX, y + 19, { align: 'center' });
    });

    return savePdfFile(pdf, filename);
  } catch (err) {
    console.error('Failed to generate direct programmatic PDF:', err);
    return false;
  }
}

/**
 * Generates and downloads a high-resolution, print-ready PDF certificate
 * of the election results with automatic fallback.
 */
export async function downloadCertificatePDF(
  elementId: string,
  filename: string = 'PC_Election_Official_Results_2026.pdf',
  dataFallback?: PdfExportData
): Promise<boolean> {
  const element = document.getElementById(elementId);

  // If DOM element not found, use programmatic generator immediately if data is provided
  if (!element) {
    if (dataFallback) {
      return generateDirectPdfDocument(dataFallback, filename);
    }
    console.error(`Element with id "${elementId}" not found for PDF export.`);
    return false;
  }

  try {
    // Create an isolated, visible off-screen staging wrapper
    // Positioned at top: 0, left: 0 with 0.01 opacity so the layout engine computes
    // exact dimensions without viewport clipping or -9999px coordinate distortion.
    const staging = document.createElement('div');
    staging.id = 'pdf-export-staging-area';
    staging.style.position = 'fixed';
    staging.style.top = '0';
    staging.style.left = '0';
    staging.style.width = '794px'; // 210mm at 96 DPI
    staging.style.zIndex = '-99999';
    staging.style.opacity = '0.01';
    staging.style.pointerEvents = 'none';
    staging.style.backgroundColor = '#ffffff';
    staging.style.margin = '0';
    staging.style.padding = '0';

    const clone = element.cloneNode(true) as HTMLElement;
    clone.id = `${elementId}-export-clone`;
    clone.classList.remove('hidden');
    clone.classList.remove('print:block');
    clone.style.display = 'block';
    clone.style.visibility = 'visible';
    clone.style.width = '794px';
    clone.style.maxWidth = '794px';
    clone.style.margin = '0';
    clone.style.backgroundColor = '#ffffff';

    staging.appendChild(clone);
    document.body.appendChild(staging);

    // Sanitize any external images so canvas is never tainted
    await sanitizeImagesForCanvas(staging);

    // Capture using html2canvas with scale 2 for crisp vector-like text
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: 794,
      windowWidth: 1024
    });

    // Clean up staging container immediately
    document.body.removeChild(staging);

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfWidth = 210; // A4 mm
    const pdfHeight = 297; // A4 mm
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const imgHeight = (canvasHeight * pdfWidth) / canvasWidth;

    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight, undefined, 'FAST');
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 2) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    const downloaded = savePdfFile(pdf, filename);
    if (downloaded) return true;

    // If saving failed, try programmatic fallback
    if (dataFallback) {
      return generateDirectPdfDocument(dataFallback, filename);
    }
    return false;
  } catch (canvasError) {
    console.warn('Canvas-based PDF export encountered an issue, falling back to direct programmatic PDF:', canvasError);

    // Clean up staging if it was left attached
    const leftStaging = document.getElementById('pdf-export-staging-area');
    if (leftStaging && leftStaging.parentNode) {
      leftStaging.parentNode.removeChild(leftStaging);
    }

    // Direct programmatic generation
    if (dataFallback) {
      return generateDirectPdfDocument(dataFallback, filename);
    }

    // Last resort print dialog
    window.print();
    return false;
  }
}

/**
 * Triggers clean print of the targeted certificate element.
 */
export function printCertificateElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  try {
    let printFrame = document.getElementById('pc-print-iframe') as HTMLIFrameElement | null;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'pc-print-iframe';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) {
      window.print();
      return;
    }

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>PC Election Official Results 2026</title>
          <meta charset="utf-8" />
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              background: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 6px;
              font-size: 11px;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12px;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 5px 8px;
              font-size: 11px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 600;
              color: #0f172a;
            }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .font-bold { font-weight: bold; }
            .font-semibold { font-weight: 600; }
            .bg-emerald-50 { background-color: #ecfdf5 !important; }
            .bg-slate-50 { background-color: #f8fafc !important; }
            .text-emerald-700 { color: #047857; }
            .badge-elected {
              background-color: #d1fae5;
              color: #065f46;
              padding: 2px 6px;
              border-radius: 4px;
              font-weight: bold;
              font-size: 9px;
              border: 1px solid #6ee7b7;
            }
            img {
              max-width: 100%;
            }
          </style>
        </head>
        <body>
          ${element.innerHTML}
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      try {
        printFrame?.contentWindow?.focus();
        printFrame?.contentWindow?.print();
      } catch {
        window.print();
      }
    }, 400);
  } catch {
    window.print();
  }
}
