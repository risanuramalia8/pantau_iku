import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Indicator, QuarterName } from "../types";
import { getTargetLabel } from "../utils";
import { getLocalSignatureConfig } from "./signatureSettings";

export interface GeneratePdfOptions {
  indicators: Indicator[];
  selectedYear: number;
  reportScope: "all" | QuarterName;
  selectedQuarter: QuarterName;
  stats: {
    total: number;
    tercapaiCount: number;
    tercapaiPercent: number;
    ontrackCount: number;
    warningCount: number;
  };
}

async function loadKopImage(url: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }
          ctx.drawImage(img, 0, 0);
          resolve({
            dataUrl: canvas.toDataURL("image/jpeg", 0.95),
            width: canvas.width,
            height: canvas.height
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = url;
    } catch {
      resolve(null);
    }
  });
}

export async function generatePdfSurat({
  indicators,
  selectedYear,
  reportScope,
  selectedQuarter,
  stats
}: GeneratePdfOptions): Promise<Blob> {
  // A4 portrait dimensions in mm: 210 x 297
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const sigConfig = getLocalSignatureConfig();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 12;

  // 1. Kop Surat Resmi Gambar / Text
  const kopImg = await loadKopImage("/kopbaru.png");
  if (kopImg) {
    const kopHeight = (kopImg.height * contentWidth) / kopImg.width;
    doc.addImage(kopImg.dataUrl, "JPEG", margin, currentY, contentWidth, kopHeight);
    currentY += kopHeight + 6;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(80, 80, 80);
    doc.text("KEMENTERIAN KESEHATAN REPUBLIK INDONESIA", margin, currentY);

    // Right top year
    doc.setFont("courier", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tahun Anggaran: ${selectedYear}`, pageWidth - margin, currentY, { align: "right" });

    currentY += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("POLITEKNIK KESEHATAN KEMENKES PALEMBANG", margin, currentY);

    currentY += 4.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Jl. Jend. Sudirman KM. 3.5 No. 1365, Kota Palembang, Sumatera Selatan", margin, currentY);

    currentY += 3;
    // Double line kop surat (thick + thin)
    doc.setDrawColor(30, 41, 59);
    doc.setLineWidth(0.8);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 1;
    doc.setLineWidth(0.2);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 7;
  }

  // 2. Judul Dokumen
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(
    reportScope === "all"
      ? "LAPORAN KERJA CAPAIAN INDIKATOR KINERJA UTAMA (IKU)"
      : `LAPORAN KERJA CAPAIAN INDIKATOR KINERJA UTAMA (IKU) - ${reportScope}`,
    pageWidth / 2,
    currentY,
    { align: "center" }
  );

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const scopeLabel = reportScope === "all" ? "Keseluruhan Indikator (TW I - TW IV)" : `Periode ${reportScope}`;
  doc.text(`Cakupan: ${scopeLabel} | Tahun Anggaran ${selectedYear}`, pageWidth / 2, currentY, { align: "center" });

  currentY += 2;
  // Purple underline decorative bar
  doc.setDrawColor(107, 33, 168); // purple-800
  doc.setLineWidth(0.8);
  doc.line(pageWidth / 2 - 15, currentY, pageWidth / 2 + 15, currentY);

  currentY += 6;

  // 3. Ringkasan Eksekutif
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(
    reportScope === "all"
      ? "I. Ringkasan Eksekutif Kinerja Institusi"
      : `I. Ringkasan Eksekutif Kinerja Institusi (${reportScope})`,
    margin,
    currentY
  );

  currentY += 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const introText = reportScope === "all"
    ? `Berdasarkan hasil pemantauan pada platform PANTAU IKU Poltekkes Kemenkes Palembang untuk Tahun Anggaran ${selectedYear}, dari total ${indicators.length} Indikator Kinerja Utama (IKU) yang ditugaskan kepada seluruh unit kerja dan sektor, tercatat sebanyak ${stats.tercapaiCount} indikator (${stats.tercapaiPercent}%) telah mencapai target kinerja 100%. Sebanyak ${stats.ontrackCount} indikator berada dalam status on track sesuai target pentahapan triwulan, dan ${stats.warningCount} indikator masuk dalam kategori perlu perhatian khusus.`
    : `Berdasarkan hasil pemantauan capaian kinerja pada platform PANTAU IKU Poltekkes Kemenkes Palembang untuk ${reportScope} Tahun Anggaran ${selectedYear}, dari total ${indicators.length} Indikator Kinerja Utama (IKU), tercatat sebanyak ${stats.tercapaiCount} indikator (${stats.tercapaiPercent}%) berstatus Tercapai (≥100%), sebanyak ${stats.ontrackCount} indikator On Track sesuai milestone target, dan ${stats.warningCount} indikator memerlukan perhatian khusus serta percepatan tindak lanjut pimpinan.`;
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, margin, currentY);
  currentY += splitIntro.length * 3.8 + 2;

  // Quick stats row
  const boxWidth = (contentWidth - 9) / 4;
  const boxHeight = 11;
  const statBoxes = [
    { label: "Total IKU", value: `${indicators.length}`, fill: [248, 250, 252], border: [203, 213, 225], textCol: [30, 41, 59] },
    { label: "Tercapai", value: `${stats.tercapaiCount} (${stats.tercapaiPercent}%)`, fill: [236, 253, 245], border: [167, 243, 208], textCol: [6, 95, 70] },
    { label: "On Track", value: `${stats.ontrackCount}`, fill: [247, 254, 231], border: [217, 249, 157], textCol: [63, 98, 18] },
    { label: "Perlu Perhatian", value: `${stats.warningCount}`, fill: [255, 241, 242], border: [254, 205, 211], textCol: [159, 18, 57] }
  ];

  statBoxes.forEach((item, i) => {
    const x = margin + i * (boxWidth + 3);
    doc.setFillColor(item.fill[0], item.fill[1], item.fill[2]);
    doc.setDrawColor(item.border[0], item.border[1], item.border[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, currentY, boxWidth, boxHeight, 1.5, 1.5, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(item.textCol[0], item.textCol[1], item.textCol[2]);
    doc.text(item.label.toUpperCase(), x + boxWidth / 2, currentY + 3.8, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(item.value, x + boxWidth / 2, currentY + 8.5, { align: "center" });
  });

  currentY += boxHeight + 6;

  // 4. Bagian II: Matriks Capaian
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text(
    reportScope === "all"
      ? `II. Matriks Capaian Keseluruhan Indikator (${indicators.length} IKU)`
      : `II. Matriks Capaian Indikator Kinerja Utama - ${reportScope} (${indicators.length} IKU)`,
    margin,
    currentY
  );

  currentY += 2;

  // Build Table Data
  const isAll = reportScope === "all";
  const tableHead = isAll ? [
    ["No", "Kode", "Indikator Kinerja Utama", "Satuan", "Target", "TW I", "TW II", "TW III", "TW IV", "PJ Sektor"]
  ] : [
    ["No", "Kode", "Indikator Kinerja Utama", "Satuan", "Target", `Realisasi ${reportScope}`, `Capaian`, "Status", "PJ Sektor"]
  ];

  const tableBody = indicators.map((ind) => {
    if (isAll) {
      return [
        ind.no,
        ind.kode,
        ind.indikatorKinerja,
        ind.satuan || "-",
        getTargetLabel(ind),
        ind.quarters["TW I"].isFilled ? `${ind.quarters["TW I"].capaian.toFixed(1)}%` : "-",
        ind.quarters["TW II"].isFilled ? `${ind.quarters["TW II"].capaian.toFixed(1)}%` : "-",
        ind.quarters["TW III"].isFilled ? `${ind.quarters["TW III"].capaian.toFixed(1)}%` : "-",
        ind.quarters["TW IV"].isFilled ? `${ind.quarters["TW IV"].capaian.toFixed(1)}%` : "-",
        ind.pj
      ];
    } else {
      const q = ind.quarters[reportScope];
      return [
        ind.no,
        ind.kode,
        ind.indikatorKinerja,
        ind.satuan || "-",
        getTargetLabel(ind),
        q.isFilled ? (q.realisasiLabel || String(q.realisasi)) : "-",
        q.isFilled ? `${q.capaian.toFixed(1)}%` : "-",
        q.isFilled ? q.status : "Belum Diisi",
        ind.pj
      ];
    }
  });

  autoTable(doc, {
    startY: currentY,
    head: tableHead,
    body: tableBody,
    theme: "striped",
    margin: { left: margin, right: margin },
    headStyles: {
      fillColor: [76, 29, 149], // deep purple
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: "bold",
      halign: "center",
      valign: "middle",
      cellPadding: 1.8
    },
    bodyStyles: {
      fontSize: 6.8,
      cellPadding: 1.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: isAll ? {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      2: { cellWidth: "auto" }, // wraps text
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 15, halign: "right", fontStyle: "bold" },
      5: { cellWidth: 12, halign: "center" },
      6: { cellWidth: 12, halign: "center" },
      7: { cellWidth: 12, halign: "center" },
      8: { cellWidth: 12, halign: "center" },
      9: { cellWidth: 24 }
    } : {
      0: { cellWidth: 7, halign: "center" },
      1: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      2: { cellWidth: "auto" },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 15, halign: "right", fontStyle: "bold" },
      5: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      6: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      7: { cellWidth: 20, halign: "center" },
      8: { cellWidth: 24 }
    },
    didDrawCell: (data) => {
      // Colorize capaian numbers
      if (data.section === "body") {
        if (isAll && [5, 6, 7, 8].includes(data.column.index)) {
          const val = data.cell.text[0];
          if (val && val !== "-") {
            const num = parseFloat(val.replace("%", ""));
            if (!isNaN(num)) {
              if (num >= 100) {
                data.cell.styles.textColor = [5, 150, 105]; // emerald
                data.cell.styles.fontStyle = "bold";
              } else if (num >= 80) {
                data.cell.styles.textColor = [180, 83, 9]; // amber
              } else {
                data.cell.styles.textColor = [225, 29, 72]; // rose
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        } else if (!isAll && data.column.index === 6) {
          const val = data.cell.text[0];
          if (val && val !== "-") {
            const num = parseFloat(val.replace("%", ""));
            if (!isNaN(num)) {
              if (num >= 100) {
                data.cell.styles.textColor = [5, 150, 105]; // emerald
                data.cell.styles.fontStyle = "bold";
              } else if (num >= 80) {
                data.cell.styles.textColor = [180, 83, 9]; // amber
              } else {
                data.cell.styles.textColor = [225, 29, 72]; // rose
                data.cell.styles.fontStyle = "bold";
              }
            }
          }
        } else if (!isAll && data.column.index === 7) {
          const val = data.cell.text[0];
          if (val === "Tercapai") {
            data.cell.styles.textColor = [5, 150, 105];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "On Track") {
            data.cell.styles.textColor = [101, 163, 13];
            data.cell.styles.fontStyle = "bold";
          } else if (val === "Perlu Perhatian") {
            data.cell.styles.textColor = [225, 29, 72];
            data.cell.styles.fontStyle = "bold";
          }
        }
      }
    }
  });

  // Calculate position after table
  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;
  let signatureY = finalY + 8;

  // If signature block would fall too low on page, add page
  const pageHeight = doc.internal.pageSize.getHeight();
  if (signatureY + 45 > pageHeight - margin) {
    doc.addPage();
    signatureY = margin + 10;
  }

  // 5. Bagian Lembar Tanda Tangan & Pengesahan Direktur
  // Left side info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text("Dokumen diterbitkan melalui Sistem Digital PANTAU IKU", margin, signatureY);
  doc.text("Status: Laporan Kerja Resmi Disahkan", margin, signatureY + 3.8);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, margin, signatureY + 7.6);

  // Right side signature block
  const sigRightX = pageWidth - margin - 35;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `${sigConfig.city || "Palembang"}, ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`,
    sigRightX,
    signatureY,
    { align: "center" }
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${sigConfig.directorTitle || "Direktur Poltekkes Kemenkes Palembang"},`,
    sigRightX,
    signatureY + 4.5,
    { align: "center" }
  );

  // Blank vertical space for signature (approx 16mm)
  const sigNameY = signatureY + 24;

  if (sigConfig.directorName) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(sigConfig.directorName, sigRightX, sigNameY, { align: "center" });

    // Underline name
    const textWidth = doc.getTextWidth(sigConfig.directorName);
    doc.setLineWidth(0.3);
    doc.setDrawColor(15, 23, 42);
    doc.line(sigRightX - textWidth / 2, sigNameY + 0.6, sigRightX + textWidth / 2, sigNameY + 0.6);
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text("( ............................................................ )", sigRightX, sigNameY, { align: "center" });
  }

  const sigNipY = sigNameY + 4.5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  if (sigConfig.directorNip) {
    doc.text(`NIP. ${sigConfig.directorNip}`, sigRightX, sigNipY, { align: "center" });
  } else {
    doc.text("NIP. .......................................................", sigRightX, sigNipY, { align: "center" });
  }

  // Add page numbers at the bottom of all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `PANTAU IKU Poltekkes Palembang | Halaman ${p} dari ${totalPages}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  return doc.output("blob");
}
