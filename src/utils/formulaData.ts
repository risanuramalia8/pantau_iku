import * as XLSX from "xlsx";
import { Indicator, QuarterName } from "../types";
import { getTargetLabel, getTargetValue } from "../utils";

export interface FormulaSimulationResult {
  variablesList: Array<{
    name: string;
    value: number | string;
    isFilled: boolean;
  }>;
  simulasiRumus: string;
  simulasiCapaian: string;
  realisasiDisplay: string;
  targetDisplay: string;
  capaianDisplay: string;
  status: string;
  isFilled: boolean;
  steps: string[];
}

/**
 * Extracts raw formula variables, mathematical simulation, and calculation steps for any given indicator & quarter
 */
export function getFormulaSimulation(ind: Indicator, tw: QuarterName): FormulaSimulationResult {
  const q = ind.quarters[tw];
  const targetLabel = getTargetLabel(ind);
  const targetVal = getTargetValue(ind);
  const isFilled = q?.isFilled ?? false;
  const status = q?.status || "Belum Diisi";
  const realisasiDisplay = q?.realisasiLabel || (q?.realisasi !== undefined && q.realisasi !== null ? String(q.realisasi) : "-");
  const capaianDisplay = isFilled && q?.capaian !== undefined ? `${q.capaian.toFixed(1)}%` : "-";

  const variables = q?.variables || {};
  const neededVars = ind.dataDibutuhkan && ind.dataDibutuhkan.length > 0
    ? ind.dataDibutuhkan
    : Object.keys(variables);

  const variablesList = neededVars.map(vName => {
    const rawVal = variables[vName];
    const hasVal = rawVal !== undefined && rawVal !== null;
    return {
      name: vName,
      value: hasVal ? rawVal : 0,
      isFilled: hasVal && isFilled
    };
  });

  let simulasiRumus = "-";
  let simulasiCapaian = "-";
  const steps: string[] = [];

  const kode = ind.kode;

  switch (kode) {
    case "IKD 33.1.2": {
      const v1Name = "Jumlah pegawai yang dimutasi antar satuan kerja dan/atau antar unit di satuan kerja";
      const v2Name = "Jumlah total pegawai";
      const a = variables[v1Name] !== undefined ? Number(variables[v1Name]) : (isFilled ? 0 : 0);
      const b = variables[v2Name] !== undefined ? Number(variables[v2Name]) : (isFilled ? 0 : 0);

      steps.push(`Langkah 1: Ambil data mutasi pegawai (Pembilang) = ${a} pegawai.`);
      steps.push(`Langkah 2: Ambil data total seluruh pegawai (Penyebut) = ${b} pegawai.`);

      if (b > 0) {
        const hasil = Number(((a / b) * 100).toFixed(2));
        simulasiRumus = `(${a} / ${b}) × 100% = ${hasil}%`;
        steps.push(`Langkah 3: Hitung Realisasi: (${a} / ${b}) × 100% = ${hasil}%.`);
      } else {
        simulasiRumus = `(${a} / ${b}) × 100% = 0%`;
        steps.push(`Langkah 3: Total pegawai 0, Realisasi = 0%.`);
      }

      if (targetVal > 0) {
        simulasiCapaian = `(${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay}`;
        steps.push(`Langkah 4: Hitung Capaian terhadap Target Tahunan (${targetLabel}): (${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay} (Status: ${status}).`);
      }
      break;
    }

    case "IKM 17.3.1":
    case "IKM 17.3.2":
    case "IKM 17.3.3":
    case "IKM 17.3.4":
    case "IKM 17.3.9":
    case "IKM 17.3.10":
    case "IKM 17.3.11":
    case "IKM 17.3.14": {
      const v1Name = neededVars[0] || "Pembilang";
      const v2Name = neededVars[1] || "Penyebut";
      const a = variables[v1Name] !== undefined ? Number(variables[v1Name]) : 0;
      const b = variables[v2Name] !== undefined ? Number(variables[v2Name]) : 0;

      steps.push(`Langkah 1: Input Pembilang [${v1Name}] = ${a}`);
      steps.push(`Langkah 2: Input Penyebut [${v2Name}] = ${b}`);

      if (b > 0) {
        const val = Number(((a / b) * 100).toFixed(2));
        simulasiRumus = `(${a} / ${b}) × 100% = ${val}%`;
        steps.push(`Langkah 3: Hitung Realisasi: (${a} / ${b}) × 100% = ${val}%`);
      } else {
        simulasiRumus = `(${a} / ${b}) × 100% = 0%`;
        steps.push(`Langkah 3: Penyebut bernilai 0, Realisasi = 0%`);
      }

      if (targetVal > 0) {
        simulasiCapaian = `(${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay}`;
        steps.push(`Langkah 4: Evaluasi Capaian terhadap Target (${targetLabel}): (${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay}`);
      }
      break;
    }

    case "IKM 17.3.8": {
      const v1Name = "Jumlah Dosen Tetap Tahun T";
      const v2Name = "Jumlah Mahasiswa Tahun T";
      const a = variables[v1Name] !== undefined ? Number(variables[v1Name]) : 0;
      const b = variables[v2Name] !== undefined ? Number(variables[v2Name]) : 0;
      steps.push(`Langkah 1: Input Jumlah Dosen Tetap = ${a}`);
      steps.push(`Langkah 2: Input Jumlah Mahasiswa = ${b}`);
      if (a > 0) {
        const ratio = Math.floor(b / a);
        simulasiRumus = `1 : floor(${b} / ${a}) = 1:${ratio}`;
        steps.push(`Langkah 3: Rasio Dosen : Mahasiswa = 1 : ${ratio}`);
      } else {
        simulasiRumus = `1 : 0`;
        steps.push(`Langkah 3: Dosen 0, Rasio = 1:0`);
      }
      simulasiCapaian = `Evaluasi Rentang Ideal (1:27 s/d 1:30) = ${capaianDisplay}`;
      steps.push(`Langkah 4: Capaian Rasio terhadap Standar = ${capaianDisplay} (Status: ${status})`);
      break;
    }

    case "IKM 33.2.2": {
      const surplus = variables["Surplus/Defisit Kegiatan Operasional"] || 0;
      const penyusutan = variables["Beban Penyusutan dan Amortisasi"] || 0;
      const piutang = variables["Beban Penyisihan Piutang Tak Tertagih"] || 0;
      const pend = variables["Jumlah Pendapatan"] || 0;
      const ebitda = surplus + penyusutan + piutang;

      steps.push(`Langkah 1: Hitung EBITDA = Surplus/Defisit (${surplus.toLocaleString()}) + Penyusutan (${penyusutan.toLocaleString()}) + Piutang (${piutang.toLocaleString()}) = Rp ${ebitda.toLocaleString()}`);
      steps.push(`Langkah 2: Total Pendapatan = Rp ${pend.toLocaleString()}`);

      if (pend > 0) {
        const val = Number(((ebitda / pend) * 100).toFixed(2));
        simulasiRumus = `(Rp ${ebitda.toLocaleString()} / Rp ${pend.toLocaleString()}) × 100% = ${val}%`;
        steps.push(`Langkah 3: Rasio EBITDA / Pendapatan = ${val}%`);
      } else {
        simulasiRumus = `Rp ${ebitda.toLocaleString()} / Rp 0 = 0%`;
      }
      simulasiCapaian = `(${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay}`;
      steps.push(`Langkah 4: Capaian terhadap Target = ${capaianDisplay}`);
      break;
    }

    case "IKM 33.2.4": {
      const a = variables["Pendapatan dari optimalisasi Aset Tetap dan Aset Lainnya"] || 0;
      const b = variables["Pendapatan Kerja Sama Non-Tridharma"] || 0;
      const c = variables["Pendapatan Unit Usaha"] || 0;
      const total = a + b + c;
      steps.push(`Langkah 1: Optimalisasi Aset = Rp ${a.toLocaleString()}`);
      steps.push(`Langkah 2: Kerja Sama Non-Tridharma = Rp ${b.toLocaleString()}`);
      steps.push(`Langkah 3: Pendapatan Unit Usaha = Rp ${c.toLocaleString()}`);
      simulasiRumus = `Rp ${a.toLocaleString()} + Rp ${b.toLocaleString()} + Rp ${c.toLocaleString()} = Rp ${total.toLocaleString()}`;
      steps.push(`Langkah 4: Total Optimalisasi Aset & Kerja Sama = Rp ${total.toLocaleString()}`);
      simulasiCapaian = `(Rp ${total.toLocaleString()} / ${targetLabel}) × 100% = ${capaianDisplay}`;
      steps.push(`Langkah 5: Capaian terhadap Target = ${capaianDisplay}`);
      break;
    }

    default: {
      if (neededVars.length === 1) {
        const v = neededVars[0];
        const val = variables[v] !== undefined ? variables[v] : (isFilled ? q.realisasi : 0);
        steps.push(`Langkah 1: Nilai tunggal [${v}] = ${val}`);
        simulasiRumus = `${val} ${ind.satuan || ""}`.trim();
        if (targetVal > 0) {
          simulasiCapaian = `(${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay}`;
          steps.push(`Langkah 2: Capaian terhadap Target (${targetLabel}) = ${capaianDisplay}`);
        }
      } else if (neededVars.length >= 2) {
        const a = variables[neededVars[0]] !== undefined ? Number(variables[neededVars[0]]) : 0;
        const b = variables[neededVars[1]] !== undefined ? Number(variables[neededVars[1]]) : 0;
        steps.push(`Langkah 1: Parameter 1 [${neededVars[0]}] = ${a}`);
        steps.push(`Langkah 2: Parameter 2 [${neededVars[1]}] = ${b}`);
        if (b > 0) {
          const val = Number(((a / b) * 100).toFixed(2));
          simulasiRumus = `(${a} / ${b}) × 100% = ${val}%`;
        } else {
          simulasiRumus = `Input: ${a} & ${b}`;
        }
        if (targetVal > 0) {
          simulasiCapaian = `(${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay}`;
          steps.push(`Langkah 3: Capaian terhadap Target (${targetLabel}) = ${capaianDisplay}`);
        }
      } else {
        steps.push(`Langkah 1: Nilai realisasi entri langsung: ${realisasiDisplay}`);
        simulasiRumus = `${realisasiDisplay}`;
        if (targetVal > 0) {
          simulasiCapaian = `(${realisasiDisplay} / ${targetLabel}) × 100% = ${capaianDisplay}`;
          steps.push(`Langkah 2: Capaian terhadap Target (${targetLabel}) = ${capaianDisplay}`);
        }
      }
      break;
    }
  }

  return {
    variablesList,
    simulasiRumus,
    simulasiCapaian,
    realisasiDisplay,
    targetDisplay: targetLabel,
    capaianDisplay,
    status,
    isFilled,
    steps
  };
}

/**
 * Generates an Excel workbook containing:
 * - Sheet 1: "REKAP TABEL INDUK" (the master table)
 * - Sheet 2: "DATA FORMULA PER INDIKATOR" (raw formula variables, numbers, and origin breakdown)
 */
export function generateRekapIndukExcelWorkbook(
  indicators: Indicator[],
  downloadScope: "all" | QuarterName,
  selectedYear: number
): void {
  const wb = XLSX.utils.book_new();

  const activeQuarters: QuarterName[] = downloadScope === "all"
    ? ["TW I", "TW II", "TW III", "TW IV"]
    : [downloadScope];

  // ==========================================
  // SHEET 1: REKAP TABEL INDUK
  // ==========================================
  const sheet1Headers = [
    "NO",
    "KODE",
    "INDIKATOR KINERJA",
    "DEFINISI OPERASIONAL",
    "FORMULA PERHITUNGAN",
    "PJ SEKTOR",
    "PJ WADIR",
    "TARGET TAHUNAN",
    "SATUAN"
  ];

  activeQuarters.forEach(tw => {
    sheet1Headers.push(`REALISASI (${tw})`);
    sheet1Headers.push(`CAPAIAN (${tw})`);
    sheet1Headers.push(`STATUS (${tw})`);
    sheet1Headers.push(`PERMASALAHAN / JUSTIFIKASI (${tw})`);
    sheet1Headers.push(`RENCANA TINDAK LANJUT (${tw})`);
    sheet1Headers.push(`LINK DOKUMEN (${tw})`);
  });

  const sheet1Rows = indicators.map(ind => {
    const row: any = {
      "NO": ind.no,
      "KODE": ind.kode,
      "INDIKATOR KINERJA": ind.indikatorKinerja,
      "DEFINISI OPERASIONAL": ind.definisiOperasional,
      "FORMULA PERHITUNGAN": ind.formulaPerhitungan,
      "PJ SEKTOR": ind.pj,
      "PJ WADIR": ind.pjWadir,
      "TARGET TAHUNAN": getTargetLabel(ind),
      "SATUAN": ind.satuan
    };

    activeQuarters.forEach(tw => {
      const q = ind.quarters[tw];
      row[`REALISASI (${tw})`] = q.realisasiLabel || (q.realisasi !== undefined && q.realisasi !== null ? String(q.realisasi) : "");
      row[`CAPAIAN (${tw})`] = q.isFilled && q.capaian !== undefined ? `${q.capaian.toFixed(2)}%` : "";
      row[`STATUS (${tw})`] = q.status || "Belum Diisi";
      row[`PERMASALAHAN / JUSTIFIKASI (${tw})`] = q.justifikasi || "";
      row[`RENCANA TINDAK LANJUT (${tw})`] = q.rencanaTindakLanjut || "";
      row[`LINK DOKUMEN (${tw})`] = q.linkDokumen || "";
    });

    return row;
  });

  const wsRekap = XLSX.utils.json_to_sheet(sheet1Rows, { header: sheet1Headers });
  XLSX.utils.book_append_sheet(wb, wsRekap, "REKAP TABEL INDUK");

  // ==========================================
  // SHEET 2: DATA FORMULA PER INDIKATOR (DATA MENTAH)
  // ==========================================
  // Collect all distinct variable names used across indicators
  const allUniqueVariables = Array.from(
    new Set(indicators.flatMap(ind => ind.dataDibutuhkan || []))
  );

  const sheet2Headers = [
    "NO",
    "KODE",
    "INDIKATOR KINERJA",
    "PJ SEKTOR",
    "TARGET TAHUNAN",
    "SATUAN",
    "FORMULA PERHITUNGAN"
  ];

  activeQuarters.forEach(tw => {
    sheet2Headers.push(`VARIABEL 1 - PEMBILANG (${tw})`);
    sheet2Headers.push(`NILAI VAR 1 (${tw})`);
    sheet2Headers.push(`VARIABEL 2 - PENYEBUT (${tw})`);
    sheet2Headers.push(`NILAI VAR 2 (${tw})`);
    sheet2Headers.push(`VARIABEL 3 (${tw})`);
    sheet2Headers.push(`NILAI VAR 3 (${tw})`);
    sheet2Headers.push(`ASAL USUL / SIMULASI RUMUS (${tw})`);
    sheet2Headers.push(`REALISASI HASIL (${tw})`);
    sheet2Headers.push(`ASAL USUL CAPAIAN (${tw})`);
    sheet2Headers.push(`CAPAIAN (${tw})`);
    sheet2Headers.push(`STATUS (${tw})`);
  });

  // Also include the individual variable columns for full granularity (e.g. "Jumlah pegawai yang dimutasi..." etc.)
  activeQuarters.forEach(tw => {
    allUniqueVariables.forEach(v => {
      sheet2Headers.push(`[DATA MENTAH] ${v} (${tw})`);
    });
  });

  const sheet2Rows = indicators.map(ind => {
    const row: any = {
      "NO": ind.no,
      "KODE": ind.kode,
      "INDIKATOR KINERJA": ind.indikatorKinerja,
      "PJ SEKTOR": ind.pj,
      "TARGET TAHUNAN": getTargetLabel(ind),
      "SATUAN": ind.satuan,
      "FORMULA PERHITUNGAN": ind.formulaPerhitungan
    };

    activeQuarters.forEach(tw => {
      const q = ind.quarters[tw];
      const sim = getFormulaSimulation(ind, tw);
      const vars = sim.variablesList;

      row[`VARIABEL 1 - PEMBILANG (${tw})`] = vars[0] ? vars[0].name : "-";
      row[`NILAI VAR 1 (${tw})`] = vars[0] && q.isFilled ? vars[0].value : (vars[0] ? 0 : "");

      row[`VARIABEL 2 - PENYEBUT (${tw})`] = vars[1] ? vars[1].name : "-";
      row[`NILAI VAR 2 (${tw})`] = vars[1] && q.isFilled ? vars[1].value : (vars[1] ? 0 : "");

      row[`VARIABEL 3 (${tw})`] = vars[2] ? vars[2].name : "-";
      row[`NILAI VAR 3 (${tw})`] = vars[2] && q.isFilled ? vars[2].value : (vars[2] ? 0 : "");

      row[`ASAL USUL / SIMULASI RUMUS (${tw})`] = q.isFilled ? sim.simulasiRumus : "Belum dihitung";
      row[`REALISASI HASIL (${tw})`] = q.isFilled ? sim.realisasiDisplay : "-";
      row[`ASAL USUL CAPAIAN (${tw})`] = q.isFilled ? sim.simulasiCapaian : "Belum dihitung";
      row[`CAPAIAN (${tw})`] = q.isFilled ? sim.capaianDisplay : "-";
      row[`STATUS (${tw})`] = q.status || "Belum Diisi";

      // Fill in all individual variable columns
      allUniqueVariables.forEach(v => {
        const colName = `[DATA MENTAH] ${v} (${tw})`;
        if (ind.dataDibutuhkan && ind.dataDibutuhkan.includes(v)) {
          const rawVal = q.variables ? q.variables[v] : undefined;
          row[colName] = rawVal !== undefined ? rawVal : (q.isFilled ? 0 : 0);
        } else {
          row[colName] = ""; // empty if this indicator does not use this variable
        }
      });
    });

    return row;
  });

  const wsFormula = XLSX.utils.json_to_sheet(sheet2Rows, { header: sheet2Headers });
  XLSX.utils.book_append_sheet(wb, wsFormula, "DATA FORMULA PER INDIKATOR");

  // Write and trigger download
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "binary" });
  const s2ab = (s: string) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
  };

  const suffix = downloadScope === "all" ? "Semua_Triwulan" : downloadScope.replace(" ", "_");
  const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `Rekap_Tabel_Induk_IKU_Poltekkes_Palembang_${suffix}_${selectedYear}.xlsx`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
