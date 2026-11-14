import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';

export default function DasarJawabanScreen() {
  const insets = useSafeAreaInsets();
  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke asisten" onPress={() => router.navigate('/asisten')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Dasar Jawaban</Text></View>
      <Text className="font-inter text-[27px] font-bold leading-9 text-[#1B4332]">Mengapa saran ini muncul?</Text>
      <Text className="font-inter mt-2 text-base leading-6 text-[#51665C]">Lihat informasi yang dipakai AI dan siapa yang memeriksa saran.</Text>
      <Text className="font-inter mt-2 text-sm text-[#51665C]">Contoh simulasi · AI belum terhubung</Text>
      <View className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4">
        <LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}><Icon name="sparkle" size={16} /><Text className="font-inter ml-1 text-xs font-bold text-[#1B4332]">Jawaban layanan</Text></LinearGradient>
        <Text className="font-inter mt-3 text-xl font-bold text-[#1B4332]">Cek status kepesertaan JKN</Text>
        <Text className="font-inter mt-3 text-base leading-6 text-[#172B22]">Contoh pertanyaan menyebut “cek status BPJS”. Contoh jawaban mengarahkan ke Mobile JKN dan Care Center 165. Periksa informasi terbaru melalui kanal resmi BPJS Kesehatan.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.navigate({ pathname: '/layanan', params: { section: 'Kesehatan' } })} className="mt-3 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] bg-white px-3"><Icon name="health" size={20} /><Text className="font-inter ml-2 flex-shrink text-center text-base font-bold text-[#1B4332]">Lihat layanan BPJS Kesehatan</Text></Pressable>
      </View>
      <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: '#DCE9E0', padding: 16 }}>
        <LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}><Icon name="road" size={16} /><Text className="font-inter ml-1 text-xs font-bold text-[#1B4332]">Saran klasifikasi</Text></LinearGradient>
        <Text className="font-inter mt-3 text-xl font-bold text-[#1B4332]">Kategori Jalan · #JBR-02481</Text>
        <Text className="font-inter mt-3 text-base leading-6 text-[#172B22]">Dalam contoh ini, deskripsi “jalan berlubang” dan lokasi Bojongsoang digunakan untuk menyarankan kategori Jalan. Saran perlu diperiksa petugas sebelum laporan diteruskan.</Text>
      </LinearGradient>
      <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 16, padding: 16 }}><View className="flex-row"><Icon name="file" size={20} /><View className="ml-3 flex-1"><Text className="font-inter text-base font-bold text-[#1B4332]">Data yang dipakai</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Pertanyaan, panduan layanan, serta judul, deskripsi, dan kecamatan dari tiket contoh.</Text></View></View></LinearGradient>
      <Pressable accessibilityRole="button" onPress={() => router.navigate('/asisten')} className="mt-4 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] px-4"><Icon name="left" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-[#1B4332]">Kembali ke asisten</Text></Pressable>
    </ScrollView>
  </View>;
}
