import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  HeadingLevel, 
  BorderStyle,
  VerticalAlign,
  PageBreak
} from "docx";
import pptxgen from "pptxgenjs";
import { Indicator, QuarterName } from "../types";
import { getTargetLabel } from "../utils";

// Helper to translate status to Indonesian text
export function getStatusText(status: string): string {
  if (status === "Tercapai") return "Tercapai";
  if (status === "On Track") return "On Track";
  if (status === "Perlu Perhatian") return "Perlu Perhatian";
  return "Belum Diisi";
}

// Colors for status tags (hex)
const COLORS = {
  teal: "0F766E", // Teal 700 (primary theme)
  tealLight: "F0FDFA", // Teal 50 bg
  darkText: "0F172A", // Slate 900
  lightText: "FFFFFF",
  grayBorder: "CBD5E1", // Slate 300
  grayBg: "F8FAFC", // Slate 50
  
  // Status colors
  tercapai: "10B981", // Emerald 500
  tercapaiBg: "E6F4EA",
  ontrack: "F59E0B", // Amber 500
  ontrackBg: "FEF3C7",
  attention: "EF4444", // Rose 500
  attentionBg: "FEE2E2",
  unfilled: "64748B", // Slate 500
  unfilledBg: "F1F5F9"
};

// Interface for statistics
interface Stats {
  total: number;
  tercapai: number;
  ontrack: number;
  attention: number;
  unfilled: number;
}

// Helper to calculate statistics
function calculateStats(indicators: Indicator[], quarter: "all" | QuarterName): Stats {
  let total = indicators.length;
  let tercapai = 0;
  let ontrack = 0;
  let attention = 0;
  let unfilled = 0;

  indicators.forEach(ind => {
    if (quarter === "all") {
      // For all quarters combined, evaluate average or current status
      // We'll evaluate based on the last filled quarter, or simple count of statuses
      const statuses = (["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).map(q => ind.quarters[q].status);
      const isAnyAttention = statuses.includes("Perlu Perhatian");
      const isAllTercapai = statuses.every(s => s === "Tercapai");
      const isAnyFilled = (["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).some(q => ind.quarters[q].isFilled);

      if (!isAnyFilled) unfilled++;
      else if (isAllTercapai) tercapai++;
      else if (isAnyAttention) attention++;
      else ontrack++;
    } else {
      const q = ind.quarters[quarter];
      if (!q.isFilled) unfilled++;
      else if (q.status === "Tercapai") tercapai++;
      else if (q.status === "On Track") ontrack++;
      else if (q.status === "Perlu Perhatian") attention++;
    }
  });

  return { total, tercapai, ontrack, attention, unfilled };
}

/**
 * GENERATES WORD DOCUMENT (DOCX)
 */
export async function generateDocxReport(
  indicators: Indicator[],
  quarterScope: "all" | QuarterName,
  titleText: string,
  subtitleText: string,
  authorText: string
): Promise<Blob> {
  const stats = calculateStats(indicators, quarterScope);
  const isAllQuarters = quarterScope === "all";
  
  // -------------------------------------------------------------------------
  // COVER PAGE LAYOUT
  // -------------------------------------------------------------------------
  const coverKemenkesHeader = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 40 },
    children: [
      new TextRun({
        text: "KEMENTERIAN KESEHATAN REPUBLIK INDONESIA",
        bold: true,
        size: 18,
        color: "475569", // Slate 600
        font: "Arial"
      })
    ]
  });

  const coverDitjenHeader = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 40 },
    children: [
      new TextRun({
        text: "DIREKTORAT JENDERAL TENAGA KESEHATAN",
        bold: true,
        size: 16,
        color: "475569",
        font: "Arial"
      })
    ]
  });

  const coverPoltekkesHeader = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 1200 },
    children: [
      new TextRun({
        text: "POLITEKNIK KESEHATAN KEMENKES PALEMBANG",
        bold: true,
        size: 20,
        color: COLORS.teal,
        font: "Arial"
      })
    ]
  });

  const coverMainTitle = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 800, after: 160 },
    children: [
      new TextRun({
        text: "LAPORAN CAPAIAN INDIKATOR KINERJA UTAMA (IKU)",
        bold: true,
        size: 28,
        color: COLORS.teal,
        font: "Arial"
      })
    ]
  });

  const coverSubtitle = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 1400 },
    children: [
      new TextRun({
        text: subtitleText,
        bold: true,
        size: 20,
        color: "475569",
        font: "Arial"
      })
    ]
  });

  // Metadata block styled as an elegant centered box (table with thin border)
  const metaTable = new Table({
    width: { size: 85, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: COLORS.teal },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.teal },
      left: { style: BorderStyle.SINGLE, size: 8, color: COLORS.teal },
      right: { style: BorderStyle.SINGLE, size: 8, color: COLORS.teal },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: "F0FDFA" }, // Teal 50 bg
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 180, after: 80 },
                children: [
                  new TextRun({
                    text: `Periode: ${isAllQuarters ? "Keseluruhan (TW I - TW IV)" : `Triwulan ${quarterScope.replace("TW ", "")}`} Tahun 2026`,
                    bold: true,
                    size: 20,
                    color: "0F172A",
                    font: "Arial"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                children: [
                  new TextRun({
                    text: `Unit Pembina / Penanggung Jawab:`,
                    size: 16,
                    color: "475569",
                    font: "Calibri"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({
                    text: authorText.toUpperCase(),
                    bold: true,
                    size: 18,
                    color: COLORS.teal,
                    font: "Arial"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 180 },
                children: [
                  new TextRun({
                    text: `Sistem Pantau: PANTAU-IKU • Tanggal Unduh: ${new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
                    size: 14,
                    color: "64748B",
                    font: "Calibri"
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  const coverFooterSpacing = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 1600 },
    children: [
      new TextRun({
        text: "SISTEM PEMANTAUAN & EVALUASI KINERJA UTAMA (PANTAU-IKU)\nPOLTEKKES PALEMBANG - 2026",
        bold: true,
        size: 12,
        color: "94A3B8",
        font: "Arial"
      })
    ]
  });

  const pageBreakPara = new Paragraph({
    children: [new PageBreak()]
  });

  // Section heading for executive summary
  const summaryHeader = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 180 },
    children: [
      new TextRun({
        text: "I. RINGKASAN EKSEKUTIF (EXECUTIVE SUMMARY)",
        bold: true,
        size: 24,
        color: COLORS.teal,
        font: "Arial"
      })
    ]
  });

  const summaryIntro = new Paragraph({
    spacing: { after: 180 },
    children: [
      new TextRun({
        text: `Berdasarkan hasil konsolidasi data kinerja, berikut adalah rangkuman evaluasi capaian dari total `,
        size: 22,
        font: "Calibri"
      }),
      new TextRun({
        text: `${stats.total} Indikator Kinerja Utama (IKU)`,
        bold: true,
        size: 22,
        font: "Calibri"
      }),
      new TextRun({
        text: ` yang dibina pada periode pelaporan saat ini:`,
        size: 22,
        font: "Calibri"
      })
    ]
  });

  // Create a stunning executive summary bento table in word
  const statsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder },
      left: { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder },
      right: { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder },
      insideVertical: { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.tercapaiBg },
            children: [
              new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 180, right: 180 },
                children: [
                  new TextRun({ text: "✔ TERCAPAI\n", bold: true, color: "065F46", size: 18, font: "Arial" }),
                  new TextRun({ text: `${stats.tercapai} Indikator\n`, bold: true, color: COLORS.tercapai, size: 32, font: "Arial" }),
                  new TextRun({ text: "Kinerja indikator telah berhasil memenuhi atau melampaui target tahunan yang ditentukan.", size: 15, color: "065F46", font: "Calibri" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.ontrackBg },
            children: [
              new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 180, right: 180 },
                children: [
                  new TextRun({ text: "➔ ON TRACK\n", bold: true, color: "92400E", size: 18, font: "Arial" }),
                  new TextRun({ text: `${stats.ontrack} Indikator\n`, bold: true, color: COLORS.ontrack, size: 32, font: "Arial" }),
                  new TextRun({ text: "Kinerja indikator berjalan baik dan memenuhi milestone triwulanan yang ditargetkan.", size: 15, color: "92400E", font: "Calibri" })
                ]
              })
            ]
          })
        ]
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.attentionBg },
            children: [
              new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 180, right: 180 },
                children: [
                  new TextRun({ text: "⚠ PERLU PERHATIAN\n", bold: true, color: "991B1B", size: 18, font: "Arial" }),
                  new TextRun({ text: `${stats.attention} Indikator\n`, bold: true, color: COLORS.attention, size: 32, font: "Arial" }),
                  new TextRun({ text: "Capaian di bawah standar target berkala minimum. Membutuhkan rencana tindak lanjut segera.", size: 15, color: "991B1B", font: "Calibri" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: COLORS.unfilledBg },
            children: [
              new Paragraph({
                spacing: { before: 120, after: 120 },
                indent: { left: 180, right: 180 },
                children: [
                  new TextRun({ text: "✉ BELUM DINILAI / BELUM INPUT\n", bold: true, color: "334155", size: 18, font: "Arial" }),
                  new TextRun({ text: `${stats.unfilled} Indikator\n`, bold: true, color: COLORS.unfilled, size: 32, font: "Arial" }),
                  new TextRun({ text: "Penanggung jawab sektor belum melaporkan data realisasi untuk periode triwulan evaluasi.", size: 15, color: "334155", font: "Calibri" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Main Table heading with a PageBreak before it to look highly structured
  const tableHeader = new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 480, after: 180 },
    children: [
      new PageBreak(),
      new TextRun({
        text: "II. RINCIAN EVALUASI CAPAIAN TIAP INDIKATOR KINERJA",
        bold: true,
        size: 24,
        color: COLORS.teal,
        font: "Arial"
      })
    ]
  });

  // Build Table of Indicators
  const borderStyle = { style: BorderStyle.SINGLE, size: 4, color: COLORS.grayBorder };
  const tableRows: TableRow[] = [];

  // Table Headers row
  const headerCells = [
    new TableCell({
      width: { size: 5, type: WidthType.PERCENTAGE },
      shading: { fill: COLORS.teal },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "NO", bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
    }),
    new TableCell({
      width: { size: 10, type: WidthType.PERCENTAGE },
      shading: { fill: COLORS.teal },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "KODE", bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
    }),
    new TableCell({
      width: { size: 35, type: WidthType.PERCENTAGE },
      shading: { fill: COLORS.teal },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.LEFT, children: [new TextRun({ text: "INDIKATOR KINERJA & TARGET", bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
    }),
    new TableCell({
      width: { size: 10, type: WidthType.PERCENTAGE },
      shading: { fill: COLORS.teal },
      verticalAlign: VerticalAlign.CENTER,
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "PJ SEKTOR", bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
    })
  ];

  if (isAllQuarters) {
    // Add columns for each quarter's capaian
    ["TW I", "TW II", "TW III", "TW IV"].forEach(q => {
      headerCells.push(
        new TableCell({
          width: { size: 10, type: WidthType.PERCENTAGE },
          shading: { fill: COLORS.teal },
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q, bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
        })
      );
    });
  } else {
    // Single quarter details
    headerCells.push(
      new TableCell({
        width: { size: 12, type: WidthType.PERCENTAGE },
        shading: { fill: COLORS.teal },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `REALISASI`, bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
      }),
      new TableCell({
        width: { size: 10, type: WidthType.PERCENTAGE },
        shading: { fill: COLORS.teal },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `CAPAIAN`, bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
      }),
      new TableCell({
        width: { size: 18, type: WidthType.PERCENTAGE },
        shading: { fill: COLORS.teal },
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `STATUS`, bold: true, color: COLORS.lightText, size: 18, font: "Arial" })] })]
      })
    );
  }

  tableRows.push(new TableRow({ children: headerCells }));

  // Populate data rows
  indicators.forEach((ind, index) => {
    const rowCells = [
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: String(index + 1), size: 18, font: "Calibri" })] })]
      }),
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ind.kode, bold: true, size: 18, font: "Calibri" })] })]
      }),
      new TableCell({
        children: [
          new Paragraph({
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({ text: ind.indikatorKinerja, bold: true, size: 18, font: "Calibri" }),
              new TextRun({ text: `\nTarget: ${getTargetLabel(ind)}`, size: 16, color: "475569", italics: true, font: "Calibri" })
            ]
          })
        ]
      }),
      new TableCell({
        verticalAlign: VerticalAlign.CENTER,
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: ind.pj, size: 16, font: "Calibri" })] })]
      })
    ];

    if (isAllQuarters) {
      (["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).forEach(qName => {
        const q = ind.quarters[qName];
        let statusCol = COLORS.unfilled;
        let bgCol = COLORS.unfilledBg;
        let cellText = "Belum";

        if (q.isFilled) {
          cellText = `${q.capaian.toFixed(1)}%`;
          if (q.status === "Tercapai") {
            statusCol = COLORS.tercapai;
            bgCol = COLORS.tercapaiBg;
          } else if (q.status === "On Track") {
            statusCol = COLORS.ontrack;
            bgCol = COLORS.ontrackBg;
          } else {
            statusCol = COLORS.attention;
            bgCol = COLORS.attentionBg;
          }
        }

        rowCells.push(
          new TableCell({
            shading: { fill: bgCol },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: cellText,
                    bold: true,
                    color: statusCol,
                    size: 18,
                    font: "Calibri"
                  }),
                  q.isFilled ? new TextRun({
                    text: `\n(${q.status})`,
                    size: 14,
                    color: "555555",
                    font: "Calibri"
                  }) : new TextRun({ text: "" })
                ]
              })
            ]
          })
        );
      });
    } else {
      // Single Quarter Row Cells
      const q = ind.quarters[quarterScope];
      let statusCol = COLORS.unfilled;
      let bgCol = COLORS.unfilledBg;
      
      if (q.isFilled) {
        if (q.status === "Tercapai") {
          statusCol = COLORS.tercapai;
          bgCol = COLORS.tercapaiBg;
        } else if (q.status === "On Track") {
          statusCol = COLORS.ontrack;
          bgCol = COLORS.ontrackBg;
        } else {
          statusCol = COLORS.attention;
          bgCol = COLORS.attentionBg;
        }
      }

      rowCells.push(
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.isFilled ? q.realisasiLabel : "-", size: 18, font: "Calibri" })] })]
        }),
        new TableCell({
          verticalAlign: VerticalAlign.CENTER,
          children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: q.isFilled ? `${q.capaian.toFixed(2)}%` : "-", bold: true, size: 18, font: "Calibri" })] })]
        }),
        new TableCell({
          shading: { fill: bgCol },
          verticalAlign: VerticalAlign.CENTER,
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: q.isFilled ? q.status : "Belum Dilaporkan",
                  bold: true,
                  color: statusCol,
                  size: 18,
                  font: "Calibri"
                })
              ]
            })
          ]
        })
      );
    }

    tableRows.push(new TableRow({ children: rowCells }));
  });

  const indicatorTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: borderStyle,
      bottom: borderStyle,
      left: borderStyle,
      right: borderStyle,
      insideHorizontal: borderStyle,
      insideVertical: borderStyle
    },
    rows: tableRows
  });

  // Section III: Detail Issues & Justification for Single Quarter
  const detailsBlock: any[] = [];
  if (!isAllQuarters) {
    detailsBlock.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 360, after: 180 },
        children: [
          new TextRun({
            text: `III. KENDALA & RENCANA TINDAK LANJUT (${quarterScope})`,
            bold: true,
            size: 24,
            color: COLORS.teal,
            font: "Arial"
          })
        ]
      })
    );

    let issuesCount = 0;
    indicators.forEach(ind => {
      const q = ind.quarters[quarterScope];
      if (q.isFilled && (q.justifikasi || q.rencanaTindakLanjut)) {
        issuesCount++;
        detailsBlock.push(
          new Paragraph({
            spacing: { before: 120, after: 60 },
            children: [
              new TextRun({ text: `[${ind.kode}] ${ind.indikatorKinerja}`, bold: true, size: 20, color: COLORS.teal, font: "Calibri" })
            ]
          }),
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: "• Kendala/Permasalahan: ", bold: true, size: 18, font: "Calibri" }),
              new TextRun({ text: q.justifikasi || "Tidak ada kendala yang dilaporkan.", size: 18, font: "Calibri" })
            ]
          })
        );

        if (q.rencanaTindakLanjut) {
          detailsBlock.push(
            new Paragraph({
              spacing: { after: 120 },
              children: [
                new TextRun({ text: "• Rencana Tindak Lanjut: ", bold: true, size: 18, font: "Calibri" }),
                new TextRun({ text: q.rencanaTindakLanjut, size: 18, font: "Calibri" })
              ]
            })
          );
        }
      }
    });

    if (issuesCount === 0) {
      detailsBlock.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "Seluruh indikator yang dilaporkan tidak mencatatkan kendala atau rencana tindak lanjut operasional yang signifikan.", italics: true, size: 18, font: "Calibri" })
          ]
        })
      );
    }
  }

  // Footer / Penutup
  const closingBlock = [
    new Paragraph({
      spacing: { before: 480, after: 240 },
      children: [
        new TextRun({ text: "Laporan evaluasi capaian kinerja ini dihasilkan secara otomatis dan sah melalui Platform PANTAU-IKU Politeknik Kesehatan Kemenkes Palembang.", italics: true, size: 16, color: "475569", font: "Calibri" })
      ]
    })
  ];

  // Signature Block
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 180, after: 1200 },
                children: [
                  new TextRun({ text: "Mengetahui,\n", size: 18, font: "Arial" }),
                  new TextRun({ text: "Verifikator Satuan Penjaminan Internal (SPI)\nPoltekkes Kemenkes Palembang", bold: true, size: 18, font: "Arial" })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "( __________________________________ )", bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: "\nNIP. _____________________________", size: 16, font: "Calibri" })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 180, after: 1200 },
                children: [
                  new TextRun({ text: `Palembang, ${new Date().toLocaleDateString("id-ID", { year: 'numeric', month: 'long', day: 'numeric' })}\n`, size: 18, font: "Arial" }),
                  new TextRun({ text: `Penanggung Jawab Kinerja / Sektor\n${authorText}`, bold: true, size: 18, font: "Arial" })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `( ${authorText.replace("PJ ", "")} )`, bold: true, size: 18, font: "Arial" }),
                  new TextRun({ text: "\nNIP. _____________________________", size: 16, font: "Calibri" })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Document Assembly
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          coverKemenkesHeader,
          coverDitjenHeader,
          coverPoltekkesHeader,
          coverMainTitle,
          coverSubtitle,
          metaTable,
          coverFooterSpacing,
          pageBreakPara,
          summaryHeader,
          summaryIntro,
          statsTable,
          tableHeader,
          indicatorTable,
          ...detailsBlock,
          ...closingBlock
        ]
      }
    ]
  });

  return await Packer.toBlob(doc);
}


/**
 * GENERATES POWERPOINT PRESENTATION (PPTX)
 */
export async function generatePptxReport(
  indicators: Indicator[],
  quarterScope: "all" | QuarterName,
  titleText: string,
  subtitleText: string,
  authorText: string
): Promise<void> {
  const stats = calculateStats(indicators, quarterScope);
  const isAllQuarters = quarterScope === "all";
  
  // 1. Initialize PPTX
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  
  // Theme Color Presets
  const TEAL = "0F766E";
  const TEAL_LIGHT = "F0FDFA";
  const SLATE = "1E293B";
  const EMERALD = "10B981";
  const AMBER = "F59E0B";
  const RED = "EF4444";
  const SLATE_BG = "F8FAFC";

  // ----------------------------------------------------
  // SLIDE 1: COVER SLIDE
  // ----------------------------------------------------
  const slide1 = pptx.addSlide();
  // Teal Accent Top bar
  slide1.addShape('rect', { x: 0, y: 0, w: "100%", h: 0.4, fill: { color: TEAL } });
  
  // Big Title
  slide1.addText(titleText.toUpperCase(), { 
    x: 1.0, 
    y: 1.8, 
    w: 11.3, 
    fontSize: 28, 
    color: TEAL, 
    bold: true,
    fontFace: "Arial"
  });

  // Subtitle
  slide1.addText(subtitleText, { 
    x: 1.0, 
    y: 2.7, 
    w: 11.3, 
    fontSize: 18, 
    color: "475569", 
    fontFace: "Arial" 
  });

  // Meta Information Box (Left Border Teal)
  slide1.addShape('rect', { x: 1.0, y: 3.8, w: 0.08, h: 1.6, fill: { color: TEAL } });
  
  slide1.addText(
    `Periode Laporan : ${isAllQuarters ? "Keseluruhan (TW I - TW IV)" : `Triwulan ${quarterScope.replace("TW ", "")}`} 2026\n` +
    `Unit Pembina    : ${authorText}\n` +
    `Sistem Pantau   : PANTAU-IKU Poltekkes Palembang\n` +
    `Tanggal Unduh   : ${new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
    { 
      x: 1.2, 
      y: 3.8, 
      w: 10.0, 
      h: 1.6,
      fontSize: 13, 
      color: "334155", 
      lineSpacing: 22,
      fontFace: "Calibri"
    }
  );

  // Bottom Deco
  slide1.addText("DIREKTORAT POLTEKKES KEMENKES PALEMBANG", { 
    x: 1.0, 
    y: 6.3, 
    w: 11.3, 
    fontSize: 11, 
    color: "94A3B8", 
    bold: true,
    fontFace: "Arial"
  });

  // ----------------------------------------------------
  // SLIDE 2: EXECUTIVE SUMMARY STATS
  // ----------------------------------------------------
  const slide2 = pptx.addSlide();
  // Header
  slide2.addShape('rect', { x: 0, y: 0, w: "100%", h: 0.9, fill: { color: TEAL } });
  slide2.addText("RINGKASAN EKSEKUTIF CAPAIAN IKU", { x: 0.6, y: 0.25, fontSize: 18, color: "FFFFFF", bold: true, fontFace: "Arial" });

  // Subtitle
  slide2.addText(`Analisis Kinerja Konsolidasi terhadap ${stats.total} Indikator Kinerja Utama:`, {
    x: 0.6, y: 1.2, fontSize: 13, color: "475569", fontFace: "Arial", bold: true
  });

  // Add 4 Visual Metric Cards side-by-side
  const cardWidth = 2.7;
  const cardHeight = 3.6;
  const cardY = 1.8;
  const cardGap = 0.3;

  // Card 1: Tercapai
  slide2.addShape('rect', { x: 0.6, y: cardY, w: cardWidth, h: cardHeight, fill: { color: "E6F4EA" }, line: { color: EMERALD, width: 1.5 } });
  slide2.addText("TERCAPAI", { x: 0.8, y: cardY + 0.3, w: cardWidth - 0.4, fontSize: 13, color: "065F46", bold: true, fontFace: "Arial" });
  slide2.addText(String(stats.tercapai), { x: 0.8, y: cardY + 0.8, w: cardWidth - 0.4, fontSize: 54, color: EMERALD, bold: true, fontFace: "Arial" });
  slide2.addText("Indikator kinerja telah berhasil mencapai atau melampaui target tahunan yang ditentukan.", { 
    x: 0.8, y: cardY + 2.0, w: cardWidth - 0.4, h: 1.2, fontSize: 11, color: "065F46", lineSpacing: 16, fontFace: "Calibri" 
  });

  // Card 2: On Track
  slide2.addShape('rect', { x: 0.6 + cardWidth + cardGap, y: cardY, w: cardWidth, h: cardHeight, fill: { color: "FEF3C7" }, line: { color: AMBER, width: 1.5 } });
  slide2.addText("ON TRACK", { x: 0.8 + cardWidth + cardGap, y: cardY + 0.3, w: cardWidth - 0.4, fontSize: 13, color: "92400E", bold: true, fontFace: "Arial" });
  slide2.addText(String(stats.ontrack), { x: 0.8 + cardWidth + cardGap, y: cardY + 0.8, w: cardWidth - 0.4, fontSize: 54, color: AMBER, bold: true, fontFace: "Arial" });
  slide2.addText("Kinerja indikator dinilai on track dan memenuhi target berkala/milestone triwulan.", { 
    x: 0.8 + cardWidth + cardGap, y: cardY + 2.0, w: cardWidth - 0.4, h: 1.2, fontSize: 11, color: "92400E", lineSpacing: 16, fontFace: "Calibri" 
  });

  // Card 3: Perlu Perhatian
  slide2.addShape('rect', { x: 0.6 + (cardWidth + cardGap) * 2, y: cardY, w: cardWidth, h: cardHeight, fill: { color: "FEE2E2" }, line: { color: RED, width: 1.5 } });
  slide2.addText("PERLU PERHATIAN", { x: 0.8 + (cardWidth + cardGap) * 2, y: cardY + 0.3, w: cardWidth - 0.4, fontSize: 11, color: "991B1B", bold: true, fontFace: "Arial" });
  slide2.addText(String(stats.attention), { x: 0.8 + (cardWidth + cardGap) * 2, y: cardY + 0.8, w: cardWidth - 0.4, fontSize: 54, color: RED, bold: true, fontFace: "Arial" });
  slide2.addText("Capaian di bawah standar minimum berkala. Membutuhkan intervensi dan perbaikan segera.", { 
    x: 0.8 + (cardWidth + cardGap) * 2, y: cardY + 2.0, w: cardWidth - 0.4, h: 1.2, fontSize: 11, color: "991B1B", lineSpacing: 16, fontFace: "Calibri" 
  });

  // Card 4: Belum Diisi
  slide2.addShape('rect', { x: 0.6 + (cardWidth + cardGap) * 3, y: cardY, w: cardWidth, h: cardHeight, fill: { color: "F1F5F9" }, line: { color: "94A3B8", width: 1.5 } });
  slide2.addText("BELUM INPUT", { x: 0.8 + (cardWidth + cardGap) * 3, y: cardY + 0.3, w: cardWidth - 0.4, fontSize: 13, color: "334155", bold: true, fontFace: "Arial" });
  slide2.addText(String(stats.unfilled), { x: 0.8 + (cardWidth + cardGap) * 3, y: cardY + 0.8, w: cardWidth - 0.4, fontSize: 54, color: "64748B", bold: true, fontFace: "Arial" });
  slide2.addText("Indikator belum dilaporkan realisasinya oleh Penanggung Jawab Sektor di periode ini.", { 
    x: 0.8 + (cardWidth + cardGap) * 3, y: cardY + 2.0, w: cardWidth - 0.4, h: 1.2, fontSize: 11, color: "334155", lineSpacing: 16, fontFace: "Calibri" 
  });

  // ----------------------------------------------------
  // SLIDE 3+: TABLE OF INDICATORS (Auto paginated to prevent overflow!)
  // ----------------------------------------------------
  const itemsPerPage = 5; // 5 rows per slide looks highly readable and fits 16:9 beautifully
  const pagesCount = Math.ceil(indicators.length / itemsPerPage);

  for (let i = 0; i < pagesCount; i++) {
    const slide = pptx.addSlide();
    // Header
    slide.addShape('rect', { x: 0, y: 0, w: "100%", h: 0.9, fill: { color: TEAL } });
    slide.addText(`RINCIAN CAPAIAN TIAP INDIKATOR (HALAMAN ${i + 1}/${pagesCount})`, { 
      x: 0.6, y: 0.25, fontSize: 16, color: "FFFFFF", bold: true, fontFace: "Arial" 
    });

    const pageIndicators = indicators.slice(i * itemsPerPage, (i + 1) * itemsPerPage);

    // Build Table Rows
    const tableData: any[][] = [];

    // Header Row Definitions
    const tableHeaders = [
      { text: "NO", options: { bold: true, fill: TEAL, color: "FFFFFF", align: "center" } },
      { text: "KODE", options: { bold: true, fill: TEAL, color: "FFFFFF", align: "center" } },
      { text: "INDIKATOR KINERJA & TARGET", options: { bold: true, fill: TEAL, color: "FFFFFF", align: "left" } },
      { text: "PJ SEKTOR", options: { bold: true, fill: TEAL, color: "FFFFFF", align: "center" } }
    ];

    if (isAllQuarters) {
      ["TW I", "TW II", "TW III", "TW IV"].forEach(q => {
        tableHeaders.push({ text: q, options: { bold: true, fill: TEAL, color: "FFFFFF", align: "center" } });
      });
    } else {
      tableHeaders.push(
        { text: "REALISASI", options: { bold: true, fill: TEAL, color: "FFFFFF", align: "center" } },
        { text: "CAPAIAN", options: { bold: true, fill: TEAL, color: "FFFFFF", align: "center" } },
        { text: "STATUS", options: { bold: true, fill: TEAL, color: "FFFFFF", align: "center" } }
      );
    }
    tableData.push(tableHeaders);

    // Row Data Definitions
    pageIndicators.forEach((ind, index) => {
      const globalIndex = i * itemsPerPage + index + 1;
      const row: any[] = [
        { text: String(globalIndex), options: { align: "center", fontFace: "Calibri" } },
        { text: ind.kode, options: { bold: true, align: "center", fontFace: "Calibri" } },
        { 
          text: `${ind.indikatorKinerja}\nTarget: ${getTargetLabel(ind)}`, 
          options: { align: "left", fontFace: "Calibri", fontSize: 11, lineSpacing: 14 } 
        },
        { text: ind.pj, options: { align: "center", fontFace: "Calibri", fontSize: 10 } }
      ];

      if (isAllQuarters) {
        (["TW I", "TW II", "TW III", "TW IV"] as QuarterName[]).forEach(qName => {
          const q = ind.quarters[qName];
          let cellText = "Belum Diisi";
          let cellColor = "64748B"; // slate
          let bgCol = "F1F5F9"; // light gray

          if (q.isFilled) {
            cellText = `${q.capaian.toFixed(1)}%\n(${q.status})`;
            if (q.status === "Tercapai") {
              cellColor = "047857"; // emerald 700
              bgCol = "E6F4EA";
            } else if (q.status === "On Track") {
              cellColor = "B45309"; // amber 700
              bgCol = "FEF3C7";
            } else {
              cellColor = "B91C1C"; // red 700
              bgCol = "FEE2E2";
            }
          }

          row.push({
            text: cellText,
            options: { align: "center", color: cellColor, fill: bgCol, bold: true, fontSize: 10 }
          });
        });
      } else {
        const q = ind.quarters[quarterScope];
        let cellColor = "64748B";
        let bgCol = "F1F5F9";

        if (q.isFilled) {
          if (q.status === "Tercapai") {
            cellColor = "047857";
            bgCol = "E6F4EA";
          } else if (q.status === "On Track") {
            cellColor = "B45309";
            bgCol = "FEF3C7";
          } else {
            cellColor = "B91C1C";
            bgCol = "FEE2E2";
          }
        }

        row.push(
          { text: q.isFilled ? q.realisasiLabel : "-", options: { align: "center", fontFace: "Calibri", fontSize: 11 } },
          { text: q.isFilled ? `${q.capaian.toFixed(1)}%` : "-", options: { align: "center", bold: true, fontFace: "Calibri", fontSize: 11 } },
          { 
            text: q.isFilled ? q.status : "Belum Dilaporkan", 
            options: { align: "center", color: cellColor, fill: bgCol, bold: true, fontFace: "Calibri", fontSize: 10 } 
          }
        );
      }

      tableData.push(row);
    });

    // Add table to slide
    slide.addTable(tableData, {
      x: 0.6,
      y: 1.3,
      w: 12.1,
      colW: isAllQuarters 
        ? [0.5, 1.2, 5.0, 1.4, 1.0, 1.0, 1.0, 1.0] 
        : [0.5, 1.2, 5.8, 1.4, 1.1, 1.1, 1.0],
      border: { type: "solid", color: "CBD5E1", pt: 1 },
      fontSize: 11,
      fontFace: "Calibri"
    });
  }

  // ----------------------------------------------------
  // SLIDE 4: ISSUES & ACTION PLANS FOR SINGLE QUARTER
  // ----------------------------------------------------
  if (!isAllQuarters) {
    const problematicIndicators = indicators.filter(ind => {
      const q = ind.quarters[quarterScope];
      return q.isFilled && (q.justifikasi || q.rencanaTindakLanjut);
    });

    if (problematicIndicators.length > 0) {
      // Show issues (limit to top 3 or auto paginated if needed, but simple top list fits 1 slide)
      const slideIssues = pptx.addSlide();
      slideIssues.addShape('rect', { x: 0, y: 0, w: "100%", h: 0.9, fill: { color: TEAL } });
      slideIssues.addText(`KENDALA OPERASIONAL & RENCANA TINDAK LANJUT (${quarterScope})`, { 
        x: 0.6, y: 0.25, fontSize: 16, color: "FFFFFF", bold: true, fontFace: "Arial" 
      });

      let currentY = 1.3;
      problematicIndicators.slice(0, 3).forEach((ind) => {
        const q = ind.quarters[quarterScope];
        
        // Indicator Title
        slideIssues.addText(`[${ind.kode}] ${ind.indikatorKinerja}`, {
          x: 0.6, y: currentY, w: 12.1, fontSize: 12, color: TEAL, bold: true, fontFace: "Arial"
        });
        
        // Justifikasi / Kendala (Red accent block)
        slideIssues.addShape('rect', { x: 0.6, y: currentY + 0.35, w: 0.05, h: 0.45, fill: { color: RED } });
        slideIssues.addText(`Kendala: ${q.justifikasi || "Tidak dicantumkan"}`, {
          x: 0.75, y: currentY + 0.32, w: 11.8, fontSize: 11, color: "334155", fontFace: "Calibri"
        });

        // Rencana Tindak Lanjut (Emerald accent block)
        if (q.rencanaTindakLanjut) {
          slideIssues.addShape('rect', { x: 0.6, y: currentY + 0.85, w: 0.05, h: 0.45, fill: { color: EMERALD } });
          slideIssues.addText(`Tindak Lanjut: ${q.rencanaTindakLanjut}`, {
            x: 0.75, y: currentY + 0.82, w: 11.8, fontSize: 11, color: "334155", fontFace: "Calibri"
          });
          currentY += 1.4;
        } else {
          currentY += 0.9;
        }
      });
    }
  }

  // ----------------------------------------------------
  // SLIDE FINAL: THANK YOU
  // ----------------------------------------------------
  const slideFinal = pptx.addSlide();
  slideFinal.addShape('rect', { x: 0, y: 0, w: "100%", h: "100%", fill: { color: TEAL } });
  
  slideFinal.addText("SEKIAN & TERIMA KASIH", {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    fontSize: 32,
    color: "FFFFFF",
    bold: true,
    align: "center",
    fontFace: "Arial"
  });

  slideFinal.addText("SISTEM PANTAU INTEGRASI INDIKATOR KINERJA UTAMA (PANTAU-IKU)\nPOLTEKKES KEMENKES PALEMBANG", {
    x: 1.0,
    y: 3.2,
    w: 11.3,
    fontSize: 14,
    color: "F0FDFA",
    align: "center",
    fontFace: "Arial",
    lineSpacing: 22
  });

  // 4. Save/Download File
  let suffix = "Keseluruhan";
  if (quarterScope === "TW I") suffix = "Triwulan_I";
  else if (quarterScope === "TW II") suffix = "Triwulan_II";
  else if (quarterScope === "TW III") suffix = "Triwulan_III";
  else if (quarterScope === "TW IV") suffix = "Triwulan_IV";

  const safeTitle = titleText.replace(/\s+/g, "_");
  await pptx.writeFile({ fileName: `Laporan_IKU_${safeTitle}_${suffix}_2026.pptx` });
}
