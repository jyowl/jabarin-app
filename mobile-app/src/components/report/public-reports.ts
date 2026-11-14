import type { PublicReport, ReportStatus } from '../../lib/api';

export const reportCategories = ['Semua', 'Jalan', 'Kebersihan', 'Administrasi'] as const;
export type ReportCategory = (typeof reportCategories)[number];

export type ReportItem = {
  id: string;
  ref: string;
  category: ReportCategory;
  title: string;
  description: string;
  location: string;
  status: string;
  time: string;
  coordinate: { latitude: number; longitude: number };
  response: string;
};

export function resolveReportCategory(category?: string): ReportCategory {
  return reportCategories.find((item) => item === category) ?? 'Semua';
}

const statusLabel: Record<ReportStatus, string> = {
  open: 'Diterima',
  in_progress: 'Sedang ditangani',
  resolved: 'Selesai',
  rejected: 'Ditolak',
};

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getDate()} ${months[date.getMonth()]} · ${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')} WIB`;
}

// Titik peta fallback di sekitar Kabupaten Bandung bila laporan tidak menyertakan koordinat.
function fallbackCoordinate(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) % 10_000;
  return {
    latitude: -6.99 + ((hash % 100) - 50) / 500,
    longitude: 107.65 + ((Math.floor(hash / 100) % 100) - 50) / 500,
  };
}

export function toReportItem(report: PublicReport): ReportItem {
  const category = reportCategories.find((item) => item === report.category) ?? 'Administrasi';
  return {
    id: `#${report.ref_number}`,
    ref: report.ref_number,
    category,
    title: report.title,
    description: report.description,
    location: report.location || 'Kab. Bandung',
    status: statusLabel[report.status] ?? report.status,
    time: formatTime(report.created_at),
    coordinate:
      typeof report.latitude === 'number' && typeof report.longitude === 'number'
        ? { latitude: report.latitude, longitude: report.longitude }
        : fallbackCoordinate(report.ref_number),
    response: report.response,
  };
}
