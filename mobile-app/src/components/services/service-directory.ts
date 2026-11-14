import type { Href } from 'expo-router';
import type { IconName } from '../ui/icon';

export type DirectoryItem = { title: string; description: string; icon: IconName; homeIcon: number; href?: Href };
export const directory: DirectoryItem[] = [
  { title: 'Dukcapil', description: 'Dokumen kependudukan', icon: 'id', homeIcon: require('../../../assets/images/icons/dukcapil.svg') },
  { title: 'Kesehatan', description: 'BPJS dan puskesmas', icon: 'health', homeIcon: require('../../../assets/images/icons/kesehatan.svg') },
  { title: 'Pajak PBB', description: 'Pajak bumi dan bangunan', icon: 'bank', homeIcon: require('../../../assets/images/icons/pajak.svg') },
  { title: 'Lapor!', description: 'Aduan dan aspirasi warga', icon: 'report', homeIcon: require('../../../assets/images/icons/lapor.svg'), href: '/lapor' },
  { title: 'Izin NIB', description: 'Perizinan usaha', icon: 'file', homeIcon: require('../../../assets/images/icons/izin.svg') },
  { title: 'Antrean', description: 'Jadwal layanan', icon: 'ticket', homeIcon: require('../../../assets/images/icons/antrean.svg'), href: '/antrean' },
  { title: 'Bansos', description: 'Bantuan sosial', icon: 'social', homeIcon: require('../../../assets/images/icons/bansos.svg') },
  { title: 'Profil IKD', description: 'Identitas kependudukan digital', icon: 'id', homeIcon: require('../../../assets/images/icons/ikd.svg'), href: '/ikd' },
];
