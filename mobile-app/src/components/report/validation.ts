export function validateReport(title: string, category: string, district: string, details: string) {
  if (!title.trim()) return 'Isi judul laporan.';
  if (!category) return 'Pilih kategori laporan.';
  if (!district.trim()) return 'Isi kecamatan.';
  if (!details.trim()) return 'Isi detail kejadian atau keluhan.';
  return '';
}

export function parsePickerDraft(value: string) {
  const draft = JSON.parse(value);
  if (!draft || typeof draft.title !== 'string' || typeof draft.category !== 'string' || typeof draft.district !== 'string' || typeof draft.details !== 'string') throw new Error('Invalid draft');
  return draft as { title: string; category: string; district: string; details: string; photo?: { uri: string; width: number; height: number } | null };
}
