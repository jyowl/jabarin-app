import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Modal, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';
import { filterPublicReports, reportCategories, resolveReportCategory } from '../components/report/public-reports';
import { ReportMap } from '../components/report/report-map';

export default function ReportMapScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const category = resolveReportCategory(params.category);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(false);
  const reports = filterPublicReports(category);
  const selected = reports.find((report) => report.id === selectedId) ?? reports[0];

  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke laporan publik" onPress={() => router.navigate('/laporan-publik')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Peta Laporan</Text></View>
      <Text className="font-inter text-[27px] font-bold leading-9 text-[#1B4332]">Peta laporan warga</Text><Text className="font-inter mt-2 text-base leading-6 text-[#51665C]">Titik menunjukkan perkiraan area laporan di Kabupaten Bandung.</Text>
      <Text className="font-inter mt-2 text-sm text-[#51665C]">Data dan titik simulasi, bukan lokasi kejadian sebenarnya.</Text>
      <View className="mb-4 mt-4 flex-row flex-wrap gap-2">{reportCategories.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => { router.setParams({ category: item }); setSelectedId(''); }} className={`min-h-11 justify-center rounded-full border px-4 ${category === item ? 'border-[#1B4332] bg-[#1B4332]' : 'border-[#DCE9E0] bg-white'}`}><Text className={`font-inter text-sm font-semibold ${category === item ? 'text-white' : 'text-[#1B4332]'}`}>{item}</Text></Pressable>)}</View>
      <View className="overflow-hidden rounded-[20px] bg-[#ECF6EF]"><ReportMap reports={reports} onSelect={setSelectedId} /></View>
      {selected ? <Pressable accessibilityRole="button" accessibilityLabel={`Detail contoh ${selected.title}`} onPress={() => setDetail(true)} className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center"><Icon name={selected.category === 'Jalan' ? 'road' : selected.category === 'Kebersihan' ? 'trash' : 'file'} size={20} /><Text className="font-inter ml-2 text-sm font-bold text-[#1B4332]">{selected.category}</Text></View><View className={`rounded-full px-3 py-1 ${selected.status === 'Sedang ditangani' ? 'bg-[#FFF1D2]' : 'bg-[#D8F3DC]'}`}><Text className={`font-inter text-xs font-bold ${selected.status === 'Sedang ditangani' ? 'text-[#6F4C0A]' : 'text-[#1B4332]'}`}>{selected.status}</Text></View></View><Text className="font-inter mt-3 text-lg font-bold text-[#172B22]">{selected.title}</Text><View className="mt-2 flex-row items-center"><Icon name="pin" size={19} /><Text className="font-inter ml-2 flex-1 text-sm text-[#51665C]">{selected.location}</Text><Icon name="right" size={20} /></View><View className="my-3 h-px bg-[#DCE9E0]" /><View className="flex-row flex-wrap justify-between gap-2"><Text className="font-inter text-xs font-bold text-[#51665C]">{selected.id}</Text><Text className="font-inter text-xs text-[#51665C]">{selected.time}</Text></View></Pressable> : <Text className="font-inter mt-4 text-sm text-[#51665C]">Tidak ada laporan pada kategori ini.</Text>}
      <Text className="font-inter mt-3 text-sm text-[#51665C]">Pilih titik pada peta atau lihat daftar laporan publik.</Text>
      <Pressable accessibilityRole="button" onPress={() => router.navigate('/laporan-publik')} className="mt-2 min-h-11 flex-row items-center"><Icon name="list" size={19} /><Text className="font-inter ml-2 text-sm font-bold text-[#1B4332]">Lihat daftar laporan</Text></Pressable>
    </ScrollView>
    <Modal visible={detail && !!selected} transparent animationType="slide" onRequestClose={() => setDetail(false)}><View className="flex-1 justify-end bg-black/40"><View className="rounded-t-[24px] bg-white p-5" style={{ paddingBottom: insets.bottom + 20 }}><Text className="font-inter text-sm font-bold text-[#51665C]">CONTOH LAPORAN PUBLIK</Text><Text className="font-inter mt-2 text-xl font-bold text-[#1B4332]">{selected?.title}</Text><Text className="font-inter mt-3 text-base text-[#172B22]">{selected?.category} · {selected?.status}</Text><Text className="font-inter mt-2 text-sm text-[#51665C]">{selected?.location} · {selected?.time}</Text><Text className="font-inter mt-2 text-sm font-bold text-[#51665C]">{selected?.id}</Text><Text className="font-inter mt-4 text-sm leading-5 text-[#51665C]">Data simulasi; lokasi ditampilkan sebagai perkiraan area.</Text><Pressable accessibilityRole="button" onPress={() => setDetail(false)}><LinearGradient colors={['#1B4332', '#276247']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, minHeight: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}><Text className="font-inter font-bold text-white">Tutup</Text></LinearGradient></Pressable></View></View></Modal>
  </View>;
}
