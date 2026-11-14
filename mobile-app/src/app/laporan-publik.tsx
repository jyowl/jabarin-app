import { useCallback, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Modal, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';
import { reportCategories, toReportItem, type ReportCategory, type ReportItem } from '../components/report/public-reports';
import { api, ApiError } from '../lib/api';

export default function PublicReportsScreen() {
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useState<ReportCategory>('Semua');
  const [selected, setSelected] = useState<ReportItem | null>(null);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const showMap = () => router.navigate({ pathname: '/peta-laporan', params: { category } });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await api.listPublicReports({ category: category === 'Semua' ? undefined : category, per_page: 50 });
      setReports(page.data.map(toReportItem));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Laporan publik gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => router.canGoBack() ? router.back() : router.navigate('/lapor')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Laporan Publik</Text><Pressable accessibilityRole="button" accessibilityLabel="Lihat peta laporan" onPress={showMap}><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Icon name="map" /></LinearGradient></Pressable></View>
      <Text className="font-inter text-[27px] font-bold leading-9 text-[#1B4332]">Pantau laporan warga</Text><Text className="font-inter mt-2 text-base leading-6 text-[#51665C]">Lihat perkembangan aduan di Jawa Barat berdasarkan kategori.</Text>
      <Text className="font-inter mt-2 text-sm text-[#51665C]">Laporan ditampilkan tanpa data pribadi pelapor.</Text>
      <View className="mt-4 flex-row flex-wrap gap-2">{reportCategories.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => setCategory(item)} className={`min-h-11 justify-center rounded-full border px-4 ${category === item ? 'border-[#1B4332] bg-[#1B4332]' : 'border-[#DCE9E0] bg-white'}`}><Text className={`font-inter text-sm font-semibold ${category === item ? 'text-white' : 'text-[#1B4332]'}`}>{item}</Text></Pressable>)}</View>
      <View className="mb-4 mt-5 flex-row items-center justify-between"><Text accessibilityLiveRegion="polite" className="font-inter text-sm font-bold text-[#51665C]">{loading ? 'Memuat…' : `${reports.length} laporan`}</Text><Pressable accessibilityRole="button" onPress={load} className="min-h-11 flex-row items-center"><Icon name="map" size={20} /><Text className="font-inter ml-2 text-sm font-bold text-[#1B4332]">Muat ulang</Text></Pressable></View>
      {loading ? <View className="items-center rounded-2xl bg-[#F6F9F7] p-6"><ActivityIndicator color="#1B4332" /><Text className="font-inter mt-3 text-base text-[#51665C]">Memuat laporan…</Text></View> : null}
      {!loading && error ? <View className="rounded-2xl bg-[#F6F9F7] p-4"><Text className="font-inter font-bold text-[#A12626]">Laporan tidak dapat dimuat</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">{error}</Text><Pressable accessibilityRole="button" onPress={load} className="mt-2 min-h-11 justify-center"><Text className="font-inter font-bold text-[#1B4332]">Coba lagi</Text></Pressable></View> : null}
      {reports.map((report) => <Pressable key={report.id} accessibilityRole="button" accessibilityLabel={`${report.title}, ${report.status}, ${report.location}`} onPress={() => setSelected(report)} className="mb-3 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4">
        <View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center"><Icon name={report.category === 'Jalan' ? 'road' : report.category === 'Kebersihan' ? 'trash' : 'file'} size={20} /><Text className="font-inter ml-2 text-sm font-bold text-[#1B4332]">{report.category}</Text></View><View className={`rounded-full px-3 py-1 ${report.status === 'Sedang ditangani' ? 'bg-[#FFF1D2]' : report.status === 'Ditolak' ? 'bg-[#FBE0E0]' : 'bg-[#D8F3DC]'}`}><Text className={`font-inter text-xs font-bold ${report.status === 'Sedang ditangani' ? 'text-[#6F4C0A]' : report.status === 'Ditolak' ? 'text-[#A12626]' : 'text-[#1B4332]'}`}>{report.status}</Text></View></View>
        <Text className="font-inter mt-3 text-lg font-bold text-[#172B22]">{report.title}</Text><View className="mt-2 flex-row items-center"><Icon name="pin" size={19} /><Text className="font-inter ml-2 flex-1 text-sm text-[#51665C]">{report.location}</Text><Icon name="right" size={20} /></View><View className="my-3 h-px bg-[#DCE9E0]" /><View className="flex-row flex-wrap justify-between gap-2"><Text className="font-inter text-xs font-bold text-[#51665C]">{report.id}</Text><Text className="font-inter text-xs text-[#51665C]">{report.time}</Text></View>
      </Pressable>)}
      {!loading && !error && reports.length === 0 && <Text className="font-inter rounded-2xl bg-[#F6F9F7] p-4 text-base text-[#51665C]">Belum ada laporan pada kategori ini.</Text>}
    </ScrollView>
    <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}><View className="flex-1 justify-end bg-black/40"><View className="rounded-t-[24px] bg-white p-5" style={{ paddingBottom: insets.bottom + 20 }}><ScrollView><Text className="font-inter text-sm font-bold text-[#51665C]">LAPORAN PUBLIK</Text><Text className="font-inter mt-2 text-xl font-bold text-[#1B4332]">{selected?.title}</Text><Text className="font-inter mt-3 text-base text-[#172B22]">{selected?.category} · {selected?.status}</Text><Text className="font-inter mt-2 text-sm text-[#51665C]">{selected?.location} · {selected?.time}</Text><Text className="font-inter mt-2 text-sm font-bold text-[#51665C]">{selected?.id}</Text><Text className="font-inter mt-4 text-base leading-6 text-[#172B22]">{selected?.description}</Text>{selected?.response ? <Text className="font-inter mt-4 rounded-xl bg-[#F6F9F7] p-3 text-sm leading-5 text-[#51665C]">Tanggapan petugas: {selected.response}</Text> : null}<Pressable accessibilityRole="button" onPress={() => setSelected(null)} className="mt-4 min-h-12 items-center justify-center rounded-xl bg-[#1B4332]"><Text className="font-inter font-bold text-white">Tutup</Text></Pressable></ScrollView></View></View></Modal>
  </View>;
}
