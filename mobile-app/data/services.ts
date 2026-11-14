export const categories = ['Semua', 'Kependudukan', 'Kesehatan', 'Pajak', 'Perizinan', 'Sosial', 'Identitas', 'Aduan', 'Antrean'] as const;
export type Category = (typeof categories)[number];

export type PublicService = {
  id: string;
  slug: string;
  icon: string;
  category: string;
  title: string;
  description: string;
  duration: string;
  fee: string;
  requirements: string[];
};

export const catalogSections: Record<string, { category: Category; query: string }> = {
  Dukcapil: { category: 'Kependudukan', query: '' },
  Kesehatan: { category: 'Kesehatan', query: '' },
  'Pajak PBB': { category: 'Pajak', query: '' },
  'Izin NIB': { category: 'Perizinan', query: '' },
  Bansos: { category: 'Sosial', query: '' },
};
