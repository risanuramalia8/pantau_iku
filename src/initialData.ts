import { Indicator } from "./types";

export const INITIAL_INDICATORS: Indicator[] = [
  {
    no: 1,
    kode: "IKM 17.3.1",
    indikatorKinerja: "Persentase Serapan Lulusan General (≤6 Bulan dari Tanggal Ijazah)",
    definisiOperasional: "Persentase serapan lulusan Poltekkes yang bekerja maksimal 6 bulan dari tanggal ijazah dibandingkan dengan total jumlah lulusan tahun sebelumnya (T-1).",
    formulaPerhitungan: "(Jumlah lulusan Tahun T-1 yang bekerja maksimal 6 bulan dari tanggal ijazah / Jumlah lulusan pada tahun T-1) x 100%",
    dataDibutuhkan: [
      "Jumlah lulusan Tahun T-1 yang bekerja maksimal 6 bulan dari tanggal ijazah",
      "Jumlah lulusan pada tahun T-1"
    ],
    target2026: 66.02,
    target2026Label: "66,02%",
    satuan: "%",
    pj: "Alumni dan Kerjasama",
    pjWadir: "Wadir 3",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah lulusan Tahun T-1 yang bekerja maksimal 6 bulan dari tanggal ijazah": 441,
          "Jumlah lulusan pada tahun T-1": 1000
        },
        realisasi: 44.1,
        realisasiLabel: "44.1%",
        capaian: 66.8,
        status: "On Track",
        justifikasi: "Proses Pengisian (prodi D3 Kesgi dan D3 Farmasi 100%) prodi lainnya belum semuanya",
        linkDokumen: "https://docs.google.com/spreadsheets/d/1OByyD9curmVJNmDSXL-qassOMtkMcfxc/edit?usp=sharing&ouid=102736474073733850319&rtpof=true&sd=true"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 2,
    kode: "IKM 17.3.2",
    indikatorKinerja: "Persentase Serapan Lulusan yang Bekerja di Sektor Kesehatan",
    definisiOperasional: "Persentase serapan lulusan Poltekkes yang bekerja di sektor kesehatan (fasilitas pelayanan kesehatan pemerintah, swasta, TNI/POLRI, dan/atau sesuai bidangnya, serta magang minimal 6 bulan) dibandingkan total jumlah lulusan Poltekkes Kemenkes tahun sebelumnya (T-1) yang mengisi data penelusuran (tracer study), tidak termasuk lulusan yang melanjutkan pendidikan.",
    formulaPerhitungan: "(Jumlah lulusan tahun T-1 yang bekerja di Sektor Kesehatan / Jumlah lulusan tahun T-1 yang mengisi tracer study, tidak termasuk lulusan melanjutkan pendidikan) x 100%",
    dataDibutuhkan: [
      "Jumlah lulusan tahun T-1 yang bekerja di Sektor Kesehatan",
      "Jumlah lulusan tahun T-1 yang mengisi tracer study, tidak termasuk lulusan melanjutkan pendidikan"
    ],
    target2026: 83.0,
    target2026Label: "83%",
    satuan: "%",
    pj: "Alumni dan Kerjasama",
    pjWadir: "Wadir 3",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah lulusan tahun T-1 yang bekerja di Sektor Kesehatan": 4308,
          "Jumlah lulusan tahun T-1 yang mengisi tracer study, tidak termasuk lulusan melanjutkan pendidikan": 10000
        },
        realisasi: 43.08,
        realisasiLabel: "43.08%",
        capaian: 51.9,
        status: "On Track",
        justifikasi: "Proses Pengisian (prodi D3 Kesgi dan D3 Farmasi 100%) prodi lainnya belum semuanya",
        linkDokumen: "https://docs.google.com/spreadsheets/d/1OByyD9curmVJNmDSXL-qassOMtkMcfxc/edit?usp=sharing&ouid=102736474073733850319&rtpof=true&sd=true"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 3,
    kode: "IKM 17.3.3",
    indikatorKinerja: "Persentase Serapan Lulusan LN",
    definisiOperasional: "Persentase serapan lulusan Kelas Internasional dan/atau Program Internasional yang bekerja di Luar Negeri dibandingkan dengan total jumlah lulusan Kelas Internasional dan/atau Program Internasional tahun sebelumnya (T-1).",
    formulaPerhitungan: "(Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1 yang bekerja di LN / Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1) x 100%",
    dataDibutuhkan: [
      "Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1 yang bekerja di LN",
      "Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1"
    ],
    target2026: 46.15,
    target2026Label: "46,15%",
    satuan: "%",
    pj: "Alumni dan Kerjasama",
    pjWadir: "Wadir 3",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1 yang bekerja di LN": 0,
          "Jumlah lulusan Kelas Internasional dan/atau Program Internasional Tahun T-1": 13
        },
        realisasi: 0,
        realisasiLabel: "0%",
        capaian: 0,
        status: "Perlu Perhatian",
        justifikasi: "Proses Pengisian (prodi D3 Kesgi dan D3 Farmasi 100%) prodi lainnya belum semuanya",
        linkDokumen: "https://docs.google.com/spreadsheets/d/1OByyD9curmVJNmDSXL-qassOMtkMcfxc/edit?usp=sharing&ouid=102736474073733850319&rtpof=true&sd=true"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 4,
    kode: "IKM 17.3.4",
    indikatorKinerja: "Persentase Kelulusan Uji Kompetensi (Ukom)",
    definisiOperasional: "Persentase kelulusan Uji Kompetensi yaitu perbandingan jumlah mahasiswa Poltekkes Kemenkes yang lulus Uji Kompetensi dengan total jumlah mahasiswa Poltekkes Kemenkes yang mengikuti Uji Kompetensi pada tahun berjalan. Target minimum indikator ini sesuai dengan nilai rata-rata capaian Uji Kompetensi, yaitu 94%.",
    formulaPerhitungan: "(Jumlah peserta lulus Uji Kompetensi Tahun T / Jumlah total peserta Uji Kompetensi Tahun T) X 100%",
    dataDibutuhkan: [
      "Jumlah peserta lulus Uji Kompetensi Tahun T",
      "Jumlah total peserta Uji Kompetensi Tahun T"
    ],
    target2026: 96.77,
    target2026Label: "96,77%",
    satuan: "%",
    pj: "Akademik",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah peserta lulus Uji Kompetensi Tahun T": 0,
          "Jumlah total peserta Uji Kompetensi Tahun T": 310
        },
        realisasi: 0,
        realisasiLabel: "0%",
        capaian: 0,
        status: "Perlu Perhatian",
        justifikasi: "Belum ada yang mengikuti Ukom pada TW 1; belum ada yg ikut ukom first taker, karena masih proses PBM semester VI, blm ada yg selesai sampai LTA yg menjadi syarat ikut ukom.",
        linkDokumen: "https://drive.google.com/drive/folders/1ySUxkC1qAlO74h3XaM3GsAzmETZpLaRE?usp=sharing"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 5,
    kode: "IKM 17.3.5",
    indikatorKinerja: "Jumlah Penelitian yang Dipublikasikan",
    definisiOperasional: "Jumlah luaran Penelitian yang dipublikasikan yaitu jumlah luaran penelitian yang dipublikasikan pada Tahun T.",
    formulaPerhitungan: "Jumlah penelitian yang dipublikasikan pada Tahun T",
    dataDibutuhkan: [
      "Jumlah penelitian yang dipublikasikan pada Tahun T"
    ],
    target2026: 48,
    target2026Label: "48 Penelitian",
    satuan: "Penelitian",
    pj: "P2M",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah penelitian yang dipublikasikan pada Tahun T": 14
        },
        realisasi: 14,
        realisasiLabel: "14 Penelitian",
        capaian: 29.17,
        status: "On Track",
        justifikasi: "Saat ini sudah dilaksanakan pencairan dana penelitian tahap 1 dari 5 tahapan pencairan, dosen peneliti baru melakukan penelitian",
        linkDokumen: "https://drive.google.com/file/d/1LPwWmKhUjdIkW8FzK9odS5Pa6yMPIL8i/view?usp=sharing"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 6,
    kode: "IKM 17.3.6",
    indikatorKinerja: "Jumlah Produk Inovasi yang Dihasilkan dan/atau Dikomersialisasikan",
    definisiOperasional: "Karya produk yang dihasilkan dari kegiatan penelitian, pengembangan, pengkajian, penerapan dan/atau perekayasaan oleh lembaga/unit, yang menghasilkan kebaruan yang diterapkan dan bermanfaat secara komersial, ekonomi dan/atau sosial budaya.",
    formulaPerhitungan: "Jumlah Karya HaKI yang dihasilkan pada Tahun T",
    dataDibutuhkan: [
      "Jumlah Karya HaKI yang dihasilkan pada Tahun T"
    ],
    target2026: 19,
    target2026Label: "19 Inovasi",
    satuan: "Inovasi",
    pj: "P2M",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah Karya HaKI yang dihasilkan pada Tahun T": 0
        },
        realisasi: 0,
        realisasiLabel: "0 Inovasi",
        capaian: 0,
        status: "Perlu Perhatian",
        justifikasi: "Penelitian dan pengmas belum dilaksanakan",
        linkDokumen: ""
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 7,
    kode: "IKM 17.3.7",
    indikatorKinerja: "Jumlah Pengabdian kepada Masyarakat yang Dihasilkan",
    definisiOperasional: "Realisasi pengabdian kepada Masyarakat Berbasis Masyarakat, Kewirausahaan, Kewilayahan sesuai dengan skema, dengan pendanaan BOPTN, Mandiri, PNBP/BLU, dan pendanaan lain.",
    formulaPerhitungan: "Jumlah pengabdian kepada masyarakat sesuai dengan skema Tahun T",
    dataDibutuhkan: [
      "Jumlah pengabdian kepada masyarakat sesuai dengan skema Tahun T"
    ],
    target2026: 48,
    target2026Label: "48 Pengabdian Masyarakat",
    satuan: "Pengabdian Masyarakat",
    pj: "P2M",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah pengabdian kepada masyarakat sesuai dengan skema Tahun T": 0
        },
        realisasi: 0,
        realisasiLabel: "0 Pengabdian Masyarakat",
        capaian: 0,
        status: "Perlu Perhatian",
        justifikasi: "Masih menunggu penambahan dana pengmas, dosen pengabdi saat ini sedang melaksanakan persiapan lokasi kegiatan pengmas",
        linkDokumen: ""
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 8,
    kode: "IKM 17.3.8",
    indikatorKinerja: "Rasio Dosen Tetap terhadap Mahasiswa",
    definisiOperasional: "Seluruh Dosen tetap dibandingkan dengan jumlah Mahasiswa pada Tahun H. Rasio Dosen terhadap Mahasiswa yaitu 1:27 - 1:30.",
    formulaPerhitungan: "Jumlah Dosen Tetap Tahun T / Jumlah Mahasiswa Tahun T",
    dataDibutuhkan: [
      "Jumlah Dosen Tetap Tahun T",
      "Jumlah Mahasiswa Tahun T"
    ],
    target2026: 30, // threshold 30 is good progress
    target2026Label: "Rasio 1:30 (Rentang 1:27 - 1:30)",
    satuan: "Rasio",
    pj: "Akademik",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah Dosen Tetap Tahun T": 100,
          "Jumlah Mahasiswa Tahun T": 3000
        },
        realisasi: "1:30",
        realisasiLabel: "1:30",
        capaian: 100,
        status: "Tercapai",
        justifikasi: "Rasio terpenuhi secara optimal pada triwulan pertama",
        linkDokumen: "https://docs.google.com/spreadsheets/d/1Vd_GcgYhleZFF8aQTJ2sqsNNbOVahd0D/edit?usp=drive_link"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: "", realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: "", realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: "", realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 9,
    kode: "IKM 17.3.9",
    indikatorKinerja: "Persentase Dosen Tetap dengan Kualifikasi Lektor Kepala dan/atau Guru Besar",
    definisiOperasional: "Jumlah Dosen dengan kualifikasi Lektor kepala dan atau Guru Besar dibandingkan dengan jumlah Dosen dengan kualifikasi Lektor, Lektor Kepala, dan Guru Besar pada awal Tahun T.",
    formulaPerhitungan: "(Jumlah Dosen dengan kualifikasi Lektor Kepala dan atau Guru Besar pada Tahun T / Jumlah Dosen dengan kualifikasi Lektor, Lektor Kepala, dan Guru Besar pada awal Tahun T) x 100%",
    dataDibutuhkan: [
      "Jumlah Dosen dengan kualifikasi Lektor Kepala dan atau Guru Besar pada Tahun T",
      "Jumlah Dosen dengan kualifikasi Lektor, Lektor Kepala, dan Guru Besar pada awal Tahun T"
    ],
    target2026: 23.93,
    target2026Label: "23,93%",
    satuan: "%",
    pj: "Kepegawaian",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah Dosen dengan kualifikasi Lektor Kepala dan atau Guru Besar pada Tahun T": 50,
          "Jumlah Dosen dengan kualifikasi Lektor, Lektor Kepala, dan Guru Besar pada awal Tahun T": 214
        },
        realisasi: 23.36,
        realisasiLabel: "23.36%",
        capaian: 97.62,
        status: "On Track",
        justifikasi: "Sedang proses serkom Lektor Kepala (LK)",
        linkDokumen: "https://drive.google.com/drive/folders/1CMvMDAAzlzkZtYKYzDr6XC9F178yYCyb?usp=drive_link"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 10,
    kode: "IKM 17.3.10",
    indikatorKinerja: "Persentase Dosen Fungsional yang Memiliki Sertifikasi Dosen",
    definisiOperasional: "Jumlah Dosen fungsional yang memiliki Sertifikasi Dosen dibandingkan dengan jumlah seluruh Dosen fungsional yang sudah menjabat selama 2 (dua) tahun.",
    formulaPerhitungan: "(Jumlah dosen fungsional yang memiliki sertifikasi dosen pada Tahun T / Jumlah seluruh dosen fungsional yang sudah menjabat selama 2 (dua) tahun pada Tahun T) x 100%",
    dataDibutuhkan: [
      "Jumlah dosen fungsional yang memiliki sertifikasi dosen pada Tahun T",
      "Jumlah seluruh dosen fungsional yang sudah menjabat selama 2 (dua) tahun pada Tahun T"
    ],
    target2026: 84.62,
    target2026Label: "84,62%",
    satuan: "%",
    pj: "UPM",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah dosen fungsional yang memiliki sertifikasi dosen pada Tahun T": 137,
          "Jumlah seluruh dosen fungsional yang sudah menjabat selama 2 (dua) tahun pada Tahun T": 169
        },
        realisasi: 81.07,
        realisasiLabel: "81.07%",
        capaian: 95.8,
        status: "On Track",
        justifikasi: "Pelaksanaan Sertifikasi Dosen Gelombang 1 Tahun 2026 belum dibuka",
        linkDokumen: "data_rekap_serdos_tahun_2026_tw_1.pdf"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 11,
    kode: "IKM 17.3.11",
    indikatorKinerja: "Persentase Dosen Tetap yang Memiliki Kemampuan Berbahasa Inggris",
    definisiOperasional: "Jumlah dosen tetap yang memiliki skor TOEFL >= 500 atau yang setara (intermediate) dibandingkan dengan jumlah seluruh Dosen tetap.",
    formulaPerhitungan: "(Jumlah dosen tetap yang memiliki sertifikat TOEFL >= 500 atau yang setara pada Tahun T / Jumlah seluruh Dosen tetap pada Tahun T) x 100%",
    dataDibutuhkan: [
      "Jumlah dosen tetap yang memiliki sertifikat TOEFL >= 500 atau yang setara pada Tahun T",
      "Jumlah seluruh Dosen tetap pada Tahun T"
    ],
    target2026: 6.63,
    target2026Label: "6,63%",
    satuan: "%",
    pj: "Pengembangan Bahasa",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah dosen tetap yang memiliki sertifikat TOEFL >= 500 atau yang setara pada Tahun T": 16,
          "Jumlah seluruh Dosen tetap pada Tahun T": 181
        },
        realisasi: 8.84,
        realisasiLabel: "8.84%",
        capaian: 133.33,
        status: "Tercapai",
        justifikasi: "Sudah melampaui target tahunan pada TW pertama",
        linkDokumen: "https://drive.google.com/drive/folders/1WvWQUVoKvqYYKgXeevdTe3Oqz4pO5ZzV?usp=drive_link"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 12,
    kode: "IKM 17.3.12",
    indikatorKinerja: "Jumlah Prestasi Dosen",
    definisiOperasional: "Prestasi yang diperoleh dosen sesuai bidangnya dalam lomba nasional dan internasional mendapatkan juara I, II, III dan/atau penghargaan dari kompetisi internasional yang dibuktikan dengan dokumen tertulis pada Tahun T.",
    formulaPerhitungan: "Jumlah prestasi dosen dalam lomba internasional, nasional, dan kompetisi internasional Tahun T",
    dataDibutuhkan: [
      "Jumlah prestasi dosen dalam lomba internasional, nasional, dan kompetisi internasional Tahun T"
    ],
    target2026: 13,
    target2026Label: "13 Prestasi",
    satuan: "Prestasi",
    pj: "UPM",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah prestasi dosen dalam lomba internasional, nasional, dan kompetisi internasional Tahun T": 2
        },
        realisasi: 2,
        realisasiLabel: "2 Prestasi",
        capaian: 15.38,
        status: "Perlu Perhatian",
        justifikasi: "Capaian kinerja prestasi dosen akan diteruskan dan dipacu pada triwulan berikutnya (On Track strategis)",
        linkDokumen: "https://drive.google.com/drive/folders/1lT7Pjf-k_qiIXaBNYLJCM6ka8dQ4ehmX?usp=sharing"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 13,
    kode: "IKM 17.3.13",
    indikatorKinerja: "Jumlah Prestasi Mahasiswa",
    definisiOperasional: "Prestasi yang diperoleh mahasiswa dalam kegiatan kokurikuler dan ekstrakurikuler pada kompetisi internasional, nasional, provinsi, kabupaten/kota mendapatkan juara I, II, III dan/atau penghargaan dari kompetisi internasional yang dibuktikan dengan dokumen tertulis pada Tahun T.",
    formulaPerhitungan: "Jumlah prestasi mahasiswa dalam lomba internasional, nasional, provinsi, Kota/Kab, dan kompetisi Tahun T",
    dataDibutuhkan: [
      "Jumlah prestasi mahasiswa dalam lomba internasional, nasional, provinsi, Kota/Kab, dan kompetisi Tahun T"
    ],
    target2026: 96,
    target2026Label: "96 Prestasi",
    satuan: "Prestasi",
    pj: "Kemahasiswaan",
    pjWadir: "Wadir 3",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah prestasi mahasiswa dalam lomba internasional, nasional, provinsi, Kota/Kab, dan kompetisi Tahun T": 48
        },
        realisasi: 48,
        realisasiLabel: "48 Prestasi",
        capaian: 50.0,
        status: "On Track",
        justifikasi: "Capaian prestasi mahasiswa sangat baik dan melampaui milestone TW I (On Track)",
        linkDokumen: "s.kemkes.go.id/PrestasiMahasiswa_NonAkademik_2026"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 14,
    kode: "IKM 17.3.14",
    indikatorKinerja: "Persentase Prodi memiliki Akreditasi Unggul atau Akreditasi Internasional",
    definisiOperasional: "Penyesuaian kelembagaan Poltekkes Kemenkes baik prodi dan atau institusi Poltekkes Kemenkes yang disesuaikan baik secara kuantitas dan kualitas dengan kebutuhan program pembangunan kesehatan.",
    formulaPerhitungan: "(Jumlah prodi Poltekkes Kemenkes yang memiliki akreditasi unggul/internasional Tahun T / Jumlah prodi Poltekkes Kemenkes pada Tahun T) x 100%",
    dataDibutuhkan: [
      "Jumlah prodi Poltekkes Kemenkes yang memiliki akreditasi unggul/internasional Tahun T",
      "Jumlah prodi Poltekkes Kemenkes pada Tahun T"
    ],
    target2026: 70.59,
    target2026Label: "70,59%",
    satuan: "%",
    pj: "UPM",
    pjWadir: "Wadir 1",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Jumlah prodi Poltekkes Kemenkes yang memiliki akreditasi unggul/internasional Tahun T": 11,
          "Jumlah prodi Poltekkes Kemenkes pada Tahun T": 17
        },
        realisasi: 64.71,
        realisasiLabel: "64.71%",
        capaian: 91.67,
        status: "On Track",
        justifikasi: "Masih dalam proses persiapan reakreditasi pada 3 program studi",
        linkDokumen: "https://pjm.poltekkespalembang.ac.id/tabel-sk-dan-sertifikat-akreditasi/"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 15,
    kode: "IKM 33.1.1",
    indikatorKinerja: "Nilai SAKIP Satuan Kerja",
    definisiOperasional: "Nilai Sistem Akuntabilitas Kinerja Instansi Pemerintah (SAKIP) Satuan Kerja.",
    formulaPerhitungan: "Nilai SAKIP Satuan Kerja",
    dataDibutuhkan: [
      "Nilai SAKIP Satuan Kerja"
    ],
    target2026: 83.0,
    target2026Label: "83 Nilai",
    satuan: "Nilai",
    pj: "SPI",
    pjWadir: "SPI",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Nilai SAKIP Satuan Kerja": 85.5
        },
        realisasi: 85.5,
        realisasiLabel: "85.5",
        capaian: 103.01,
        status: "Tercapai",
        justifikasi: "Penilaian Mandiri SAKIP Tahun 2025 oleh SPI berdasarkan surat tugas direktur Nomor PS.03.01/F.XXXII/1903/2026 tanggal 11 Maret 2026",
        linkDokumen: "https://drive.google.com/drive/folders/12GWdO0v8YwQ3IaLJ5Ay7d9yHFOfzW5u1?usp=sharing"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 16,
    kode: "IKM 33.2.1",
    indikatorKinerja: "Nilai Kinerja Anggaran Satuan Kerja",
    definisiOperasional: "Evaluasi kinerja anggaran (EKA) atau Nilai Kinerja Anggaran Kemenkeu.",
    formulaPerhitungan: "Nilai Kinerja Anggaran Satuan Kerja",
    dataDibutuhkan: [
      "Nilai Kinerja Anggaran Satuan Kerja"
    ],
    target2026: 92.75,
    target2026Label: "92,75 Nilai",
    satuan: "Nilai",
    pj: "Keuangan",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Nilai Kinerja Anggaran Satuan Kerja": 0
        },
        realisasi: 0,
        realisasiLabel: "0",
        capaian: 0,
        status: "Perlu Perhatian",
        justifikasi: "Pelaporan Capaian Output pada aplikasi Sakti dan belum bisa dilakukan pada Monev DJA juga belum tersedia NKA satker tahun 2026",
        linkDokumen: "Monitoring NKA tahun 2026 pada website monev kemenkeu TW 1.png"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 17,
    kode: "IKM 33.2.2",
    indikatorKinerja: "Persentase EBITDA Margin",
    definisiOperasional: "Rasio Surplus atau Defisit Sebelum Pendapatan (Beban) Keuangan dan Pajak ditambah beban penyusutan, amortisasi dan cadangan penyisihan piutang dibandingkan dengan Pendapatan Operasional.",
    formulaPerhitungan: "EBITDA / (Pendapatan Alokasi APBN + Pendapatan PNBP) x 100%",
    dataDibutuhkan: [
      "Nilai EBITDA",
      "Pendapatan Alokasi APBN",
      "Pendapatan PNBP"
    ],
    target2026: 20.36,
    target2026Label: "20,36%",
    satuan: "%",
    pj: "Keuangan",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Nilai EBITDA": 55.52,
          "Pendapatan Alokasi APBN": 50,
          "Pendapatan PNBP": 50
        },
        realisasi: 55.52,
        realisasiLabel: "55.52%",
        capaian: 272.69,
        status: "Tercapai",
        justifikasi: "Pelaksanaan Kegiatan masih berjalan, adanya blokir anggaran, serta terdapat belanja BLU yang belum disahkan",
        linkDokumen: "https://drive.google.com/drive/u/2/folders/1um_qPMbtzGBQbwxZ_gF_bSdzhPS7jpEv"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 18,
    kode: "IKM 33.2.3",
    indikatorKinerja: "Jumlah Pendapatan Badan Layanan Umum",
    definisiOperasional: "Pendapatan merupakan pendapatan yang diperoleh sebagai imbalan atas barang/jasa yang diserahkan kepada masyarakat termasuk pendapatan yang berasal dari hibah, hasil kerjasama dengan pihak lain, sewa, jasa lembaga keuangan, dan pendapatan lainnya yang sah yang tidak berhubungan secara langsung dengan pelayanan, tidak termasuk pendapatan dari APBN tahun berkenaan yang telah disahkan pada SP2B.",
    formulaPerhitungan: "Pendapatan PNBP/BLU",
    dataDibutuhkan: [
      "Pendapatan PNBP/BLU"
    ],
    target2026: 60859000000,
    target2026Label: "Rp 60.859.000.000",
    satuan: "Rupiah",
    pj: "Keuangan",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Pendapatan PNBP/BLU": 26196858920
        },
        realisasi: 26196858920,
        realisasiLabel: "Rp 26.196.858.920",
        capaian: 43.05,
        status: "On Track",
        justifikasi: "Capaian Kinerja Jumlah Pendapatan BLU masih on track",
        linkDokumen: "https://drive.google.com/drive/u/2/folders/1nNPcO8EfFiYCyHL02DSQIkapO_UgRzaz"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 19,
    kode: "IKM 33.2.4",
    indikatorKinerja: "Jumlah Pendapatan BLU dari Optimalisasi Aset dan Kerja Sama",
    definisiOperasional: "Realisasi Pendapatan yang berasal dari optimalisasi aset dan kerjasama yang dihasilkan dalam rangka optimalisasi aset dan kerja sama, terdiri dari: a. Optimalisasi aset tetap dan aset lainnya, b. Optimalisasi kerja sama non tridharma, c. Optimalisasi Unit Usaha.",
    formulaPerhitungan: "Pendapatan dari optimalisasi Aset Tetap Aset Lainnya + Kerja Sama Non-Tridharma + Unit Usaha",
    dataDibutuhkan: [
      "Pendapatan dari optimalisasi Aset Tetap dan Aset Lainnya",
      "Pendapatan Kerja Sama Non-Tridharma",
      "Pendapatan Unit Usaha"
    ],
    target2026: 10751317000,
    target2026Label: "Rp 10.751.317.000",
    satuan: "Rupiah",
    pj: "Keuangan",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Pendapatan dari optimalisasi Aset Tetap dan Aset Lainnya": 500000000,
          "Pendapatan Kerja Sama Non-Tridharma": 200000000,
          "Pendapatan Unit Usaha": 66990000
        },
        realisasi: 766990000,
        realisasiLabel: "Rp 766.990.000",
        capaian: 7.13,
        status: "Perlu Perhatian",
        justifikasi: "Realisasi pendapatan dari optimalisasi aset dan kerja sama belum optimal",
        linkDokumen: "https://drive.google.com/drive/u/2/folders/1gWq-ovmw2TALO_5v5yxNb_WY7fqjZmfz"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 20,
    kode: "IKM 33.3.1",
    indikatorKinerja: "Indeks Kualitas SDM Satuan Kerja",
    definisiOperasional: "Belum ada DO-nya",
    formulaPerhitungan: "Indeks Kualitas SDM Satuan Kerja",
    dataDibutuhkan: [
      "Indeks Kualitas SDM Satuan Kerja"
    ],
    target2026: 84.0,
    target2026Label: "84 Nilai",
    satuan: "Nilai",
    pj: "Kepegawaian",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Indeks Kualitas SDM Satuan Kerja": 81.15
        },
        realisasi: 81.15,
        realisasiLabel: "81.15",
        capaian: 96.61,
        status: "On Track",
        justifikasi: "Pengembangan kompetensi pegawai belum mencapai target maksimal dan banyak pegawai tidak memiliki diklat fungsional",
        linkDokumen: "https://drive.google.com/file/d/10NkiBkCJR_O1WdGIE76kl7BNqQIo9fBw/view?usp=sharing"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 21,
    kode: "IKM 33.4.1",
    indikatorKinerja: "Nilai Maturitas Manajemen Risiko Satuan Kerja",
    definisiOperasional: "Belum ada DO-nya",
    formulaPerhitungan: "Nilai Maturitas Manajemen Risiko Satuan Kerja",
    dataDibutuhkan: [
      "Nilai Maturitas Manajemen Risiko Satuan Kerja"
    ],
    target2026: 4.0,
    target2026Label: "Skor 4",
    satuan: "Nilai",
    pj: "UPR",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Nilai Maturitas Manajemen Risiko Satuan Kerja": 4.14
        },
        realisasi: 4.14,
        realisasiLabel: "4.14",
        capaian: 103.5,
        status: "Tercapai",
        justifikasi: "SK Level 3 Manrisk dari Itjen; BA Penilaian Manrisk Poltekkes Palembang",
        linkDokumen: "https://drive.google.com/file/d/1ob8CZNegFJaf6d8svo3cFrMNJbeJiWSJ/view?usp=drive_link"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 22,
    kode: "IKD 33.2.1",
    indikatorKinerja: "Persentase Realisasi Anggaran Satuan Kerja",
    definisiOperasional: "Belum ada DO-nya",
    formulaPerhitungan: "Persentase Realisasi Anggaran Satuan Kerja",
    dataDibutuhkan: [
      "Persentase Realisasi Anggaran Satuan Kerja"
    ],
    target2026: 96.0,
    target2026Label: "96%",
    satuan: "%",
    pj: "Keuangan",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Persentase Realisasi Anggaran Satuan Kerja": 14.38
        },
        realisasi: 14.38,
        realisasiLabel: "14.38%",
        capaian: 14.98,
        status: "Perlu Perhatian",
        justifikasi: "Pelaksanaan Kegiatan masih berjalan, adanya blokir anggaran, serta terdapat belanja BLU yang belum disahkan",
        linkDokumen: "https://drive.google.com/file/d/1LT_F9zlt3GfM3r701Ja5rmY3vYqbQ7Pw/view?usp=sharing"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  },
  {
    no: 23,
    kode: "IKD 33.1.2",
    indikatorKinerja: "Persentase Mutasi Pegawai antar Satuan Kerja",
    definisiOperasional: "Belum ada DO-nya",
    formulaPerhitungan: "Persentase Mutasi Pegawai antar Satuan Kerja",
    dataDibutuhkan: [
      "Persentase Mutasi Pegawai antar Satuan Kerja"
    ],
    target2026: 10.0,
    target2026Label: "10%",
    satuan: "%",
    pj: "Kepegawaian",
    pjWadir: "Wadir 2",
    quarters: {
      "TW I": {
        isFilled: true,
        variables: {
          "Persentase Mutasi Pegawai antar Satuan Kerja": 0.6
        },
        realisasi: 0.6,
        realisasiLabel: "0.6%",
        capaian: 6.0,
        status: "Perlu Perhatian",
        justifikasi: "1 orang sebagai dosen di kesgi dan 1 orang sebagai kepala lab terpadu",
        linkDokumen: "https://drive.google.com/drive/folders/19ryN8YVcROQ8ABRiRKL444oj10pRiqBr?usp=sharing"
      },
      "TW II": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW III": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" },
      "TW IV": { isFilled: false, variables: {}, realisasi: 0, realisasiLabel: "-", capaian: 0, status: "Belum Diisi", justifikasi: "", linkDokumen: "" }
    }
  }
];

export const MOCK_PJ_USERS = [
  { name: "Alumni dan Kerjasama", email: "alumni.kerjasama@poltekkes-palembang.ac.id", keywords: ["alumni", "kerjasama"] },
  { name: "Akademik", email: "akademik@poltekkes-palembang.ac.id", keywords: ["akademik", "wadir1"] },
  { name: "P2M", email: "p2m@poltekkes-palembang.ac.id", keywords: ["p2m", "penelitian"] },
  { name: "Kepegawaian", email: "kepegawaian@poltekkes-palembang.ac.id", keywords: ["kepegawaian", "sdm", "wadir2"] },
  { name: "UPM", email: "upm@poltekkes-palembang.ac.id", keywords: ["upm", "akreditasi", "sertifikasi"] },
  { name: "Pengembangan Bahasa", email: "bahasa@poltekkes-palembang.ac.id", keywords: ["bahasa", "toefl"] },
  { name: "Kemahasiswaan", email: "kemahasiswaan@poltekkes-palembang.ac.id", keywords: ["mahasiswa", "prestasi", "wadir3"] },
  { name: "SPI", email: "spi@poltekkes-palembang.ac.id", keywords: ["spi", "sakip"] },
  { name: "Keuangan", email: "keuangan@poltekkes-palembang.ac.id", keywords: ["keuangan", "anggaran", "ebitda"] },
  { name: "UPR", email: "upr@poltekkes-palembang.ac.id", keywords: ["upr", "risiko"] }
];
