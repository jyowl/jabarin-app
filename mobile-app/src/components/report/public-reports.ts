export const reportCategories = ['Semua', 'Jalan', 'Kebersihan', 'Administrasi'] as const;
export type ReportCategory = (typeof reportCategories)[number];

export function resolveReportCategory(category?: string): ReportCategory {
  return reportCategories.find((item) => item === category) ?? 'Semua';
}

// shortcut: data laporan hanya contoh, ganti dengan data publik dari layanan resmi saat tersedia.
export const publicReports = [
  { id: '#JBR-02481', category: 'Jalan', title: 'Jalan berlubang di Jl. Sapan', location: 'Bojongsoang, Kab. Bandung', status: 'Sedang ditangani', time: '13 Nov · 10.25 WIB', coordinate: { latitude: -6.99, longitude: 107.65 } },
  { id: '#JBR-02465', category: 'Kebersihan', title: 'Sampah menumpuk dekat pasar', location: 'Dayeuhkolot, Kab. Bandung', status: 'Diverifikasi', time: '13 Nov · 08.10 WIB', coordinate: { latitude: -6.98, longitude: 107.62 } },
  { id: '#JBR-02412', category: 'Administrasi', title: 'Kendala pengajuan KK', location: 'Cileunyi, Kab. Bandung', status: 'Selesai', time: '12 Nov · 14.40 WIB', coordinate: { latitude: -6.94, longitude: 107.75 } },
  { id: '#JBR-02398', category: 'Jalan', title: 'Lampu jalan tidak menyala', location: 'Majalaya, Kab. Bandung', status: 'Diterima', time: '12 Nov · 09.30 WIB', coordinate: { latitude: -7.05, longitude: 107.75 } },
  { id: '#JBR-02385', category: 'Kebersihan', title: 'Saluran tersumbat sampah', location: 'Soreang, Kab. Bandung', status: 'Diterima', time: '11 Nov · 15.20 WIB', coordinate: { latitude: -7.03, longitude: 107.52 } },
] as const;

export function filterPublicReports(category: ReportCategory) {
  return publicReports.filter((report) => category === 'Semua' || report.category === category);
}
