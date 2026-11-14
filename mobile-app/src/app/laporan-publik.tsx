import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Modal, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';
import { filterPublicReports, publicReports, reportCategories, type ReportCategory } from '../components/report/public-reports';

export default function PublicReportsScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ReportCategory>('Semua');
  const [selected, setSelected] = useState<(typeof publicReports)[number] | null>(null);
  const reports = filterPublicReports(category);
  const showMap = () => router.navigate({ pathname: '/peta-laporan', params: { category } });

  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => router.canGoBack() ? router.back() : router.navigate('/lapor')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Laporan Publik</Text><Pressable accessibilityRole="button" accessibilityLabel="Lihat peta laporan" onPress={showMap}><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Icon name="map" /></LinearGradient></Pressable></View>
      <Text className="font-inter text-[27px] font-bold leading-9 text-[#1B4332]">Pantau laporan warga</Text><Text className="font-inter mt-2 text-base leading-6 text-[#51665C]">Lihat perkembangan aduan di Jawa Barat berdasarkan kategori.</Text>
      <Text className="font-inter mt-2 text-sm text-[#51665C]">Data simulasi · Laporan publik belum terhubung.</Text>
      <View className="mt-4 flex-row flex-wrap gap-2">{reportCategories.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} className={`min-h-11 justify-center rounded-full border px-4 ${category === item ? 'border-[#1B4332] bg-[#1B4332]' : 'border-[#DCE9E0] bg-white'}`}><Text className={`font-inter text-sm font-semibold ${category === item ? 'text-white' : 'text-[#1B4332]'}`}>{item}</Text></Pressable>)}</View>
      <View className="mb-4 mt-5 flex-row items-center justify-between"><Text accessibilityLiveRegion="polite" className="font-inter text-sm font-bold text-[#51665C]">{reports.length} laporan</Text><Pressable accessibilityRole="button" onPress={showMap} className="min-h-11 flex-row items-center"><Icon name="map" size={20} /><Text className="font-inter ml-2 text-sm font-bold text-[#1B4332]">Lihat peta</Text></Pressable></View>
      {reports.map((report) => <Pressable key={report.id} accessibilityRole="button" accessibilityLabel={`${report.title}, ${report.status}, ${report.location}`} onPress={() => setSelected(report)} className="mb-3 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4">
        <View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center"><Icon name={report.category === 'Jalan' ? 'road' : report.category === 'Kebersihan' ? 'trash' : 'file'} size={20} /><Text className="font-inter ml-2 text-sm font-bold text-[#1B4332]">{report.category}</Text></View><View className={`rounded-full px-3 py-1 ${report.status === 'Sedang ditangani' ? 'bg-[#FFF1D2]' : 'bg-[#D8F3DC]'}`}><Text className={`font-inter text-xs font-bold ${report.status === 'Sedang ditangani' ? 'text-[#6F4C0A]' : 'text-[#1B4332]'}`}>{report.status}</Text></View></View>
        <Text className="font-inter mt-3 text-lg font-bold text-[#172B22]">{report.title}</Text><View className="mt-2 flex-row items-center"><Icon name="pin" size={19} /><Text className="font-inter ml-2 flex-1 text-sm text-[#51665C]">{report.location}</Text><Icon name="right" size={20} /></View><View className="my-3 h-px bg-[#DCE9E0]" /><View className="flex-row flex-wrap justify-between gap-2"><Text className="font-inter text-xs font-bold text-[#51665C]">{report.id}</Text><Text className="font-inter text-xs text-[#51665C]">{report.time}</Text></View>
      </Pressable>)}
      {reports.length === 0 && <Text className="font-inter rounded-2xl bg-[#F6F9F7] p-4 text-base text-[#51665C]">Tidak ada laporan pada kategori ini.</Text>}
    </ScrollView>
    <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}><View className="flex-1 justify-end bg-black/40"><View className="rounded-t-[24px] bg-white p-5" style={{ paddingBottom: insets.bottom + 20 }}><ScrollView><Text className="font-inter text-sm font-bold text-[#51665C]">CONTOH LAPORAN PUBLIK</Text><Text className="font-inter mt-2 text-xl font-bold text-[#1B4332]">{selected?.title}</Text><Text className="font-inter mt-3 text-base text-[#172B22]">{selected?.category} · {selected?.status}</Text><Text className="font-inter mt-2 text-sm text-[#51665C]">{selected?.location} · {selected?.time}</Text><Text className="font-inter mt-2 text-sm font-bold text-[#51665C]">{selected?.id}</Text><Text className="font-inter mt-4 text-sm leading-5 text-[#51665C]">Ini data simulasi. Riwayat dan tindak lanjut laporan belum terhubung.</Text><Pressable accessibilityRole="button" onPress={() => setSelected(null)} className="mt-4 min-h-12 items-center justify-center rounded-xl bg-[#1B4332]"><Text className="font-inter font-bold text-white">Tutup</Text></Pressable></ScrollView></View></View></Modal>
  </View>;
}
