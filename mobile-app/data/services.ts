export const categories = ['Semua', 'Kependudukan', 'Kesehatan', 'Pajak & Izin', 'Sosial'] as const;
export type Category = (typeof categories)[number];
export type PublicService = {
  id: string;
  icon: string;
  category: Exclude<Category, 'Semua'>;
  title: string;
  duration: string;
  fee: string;
  requirements: string[];
};

export const catalogSections: Record<string, { category: Category; query: string }> = {
  Dukcapil: { category: 'Kependudukan', query: '' },
  'Pajak PBB': { category: 'Pajak & Izin', query: 'PBB' },
  'Izin NIB': { category: 'Pajak & Izin', query: 'NIB' },
  Bansos: { category: 'Sosial', query: '' },
};

// Data contoh untuk slicing UI. Waktu, tarif, dan persyaratan harus
// dikonfirmasi kepada instansi terkait sebelum digunakan publik.
export const publicServices: PublicService[] = [
  { id: 'ektp', icon: '🪪', category: 'Kependudukan', title: 'Cetak Ulang & Pembaruan e-KTP', duration: '1 Hari Kerja', fee: 'Gratis (Rp 0)', requirements: ['Kartu Keluarga', 'Dokumen pendukung perubahan data'] },
  { id: 'kk', icon: '👨‍👩‍👧', category: 'Kependudukan', title: 'Pembaruan Kartu Keluarga (KK) Digital', duration: '4 Jam Kerja', fee: 'Gratis (Rp 0)', requirements: ['Kartu Keluarga sebelumnya', 'Dokumen pendukung perubahan keluarga'] },
  { id: 'domisili', icon: '🏠', category: 'Kependudukan', title: 'Surat Keterangan Pindah & Domisili', duration: '2 Jam Kerja', fee: 'Gratis (Rp 0)', requirements: ['Kartu Keluarga', 'Alamat tujuan kepindahan'] },
  { id: 'akta', icon: '📄', category: 'Kependudukan', title: 'Pengajuan Akta Kelahiran', duration: 'Sesuai verifikasi', fee: 'Lihat ketentuan', requirements: ['Dokumen kelahiran', 'Kartu Keluarga'] },
  { id: 'puskesmas', icon: '🏥', category: 'Kesehatan', title: 'Pendaftaran Pelayanan Puskesmas', duration: 'Sesuai jadwal', fee: 'Lihat ketentuan', requirements: ['Identitas pasien', 'Kartu kepesertaan jika tersedia'] },
  { id: 'pbb', icon: '🏛️', category: 'Pajak & Izin', title: 'Informasi & Pelayanan Pajak PBB', duration: 'Sesuai verifikasi', fee: 'Sesuai tagihan', requirements: ['Nomor Objek Pajak (NOP)', 'Identitas pemohon'] },
  { id: 'nib', icon: '🏪', category: 'Pajak & Izin', title: 'Informasi Nomor Induk Berusaha (NIB)', duration: 'Sesuai verifikasi', fee: 'Lihat ketentuan', requirements: ['Identitas pemohon', 'Informasi kegiatan usaha'] },
  { id: 'bansos', icon: '🤝', category: 'Sosial', title: 'Informasi & Usulan Bantuan Sosial', duration: 'Sesuai verifikasi', fee: 'Lihat ketentuan', requirements: ['Identitas pemohon', 'Kartu Keluarga'] },
];
