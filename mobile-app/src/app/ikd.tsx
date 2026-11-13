import { useContext, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextSizeContext } from '../components/home/text-size';
import { Icon, type IconName } from '../components/ui/icon';

const documents: { title: string; subtitle: string; icon: IconName }[] = [
  { title: 'KTP Elektronik Digital', subtitle: 'Sinkronisasi Dukcapil · Aktif', icon: 'id' },
  { title: 'Kartu Keluarga (KK) Digital', subtitle: 'No. •••• 0002 · TTE QR', icon: 'file' },
  { title: 'Kartu JKN / KIS Kesehatan', subtitle: 'Faskes I · Puskesmas Bojongsoang', icon: 'medical' },
];

export default function IkdScreen() {
  const insets = useSafeAreaInsets();
  const [showNik, setShowNik] = useState(false);
  const { largeText, toggleTextSize } = useContext(TextSizeContext);
  const unavailable = (name: string) => Alert.alert(name, 'Ini adalah data simulasi. Layanan resmi belum terhubung.');
  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.navigate('/')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Profil IKD</Text></View>
      <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 20, padding: 18 }}>
        <View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center"><Icon name="id" size={18} color="#D8F3DC" /><Text className="font-inter ml-2 text-xs font-bold text-[#D8F3DC]">REPUBLIK INDONESIA</Text></View><Text className="font-inter overflow-hidden rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1B4332]">✓ Terverifikasi</Text></View>
        <Text className="font-inter mt-4 text-2xl font-bold leading-8 text-white">Identitas Kependudukan Digital</Text>
        <View className="mt-5 flex-row flex-wrap items-center justify-between gap-2"><Text className="font-inter text-sm text-[#D8F3DC]">NIK</Text><View className="flex-row flex-wrap items-center"><Text className="font-inter text-base font-semibold text-white">{showNik ? '0000000000000042' : '000000••••••0042'}</Text><Pressable accessibilityRole="button" accessibilityLabel={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'} onPress={() => setShowNik(!showNik)} className="ml-3 min-h-11 justify-center"><Text className="font-inter text-sm font-semibold text-white underline">{showNik ? 'Sembunyikan' : 'Tampilkan'}</Text></Pressable></View></View>
        {([['Nama lengkap', 'Rina Pratama'], ['Domisili', 'Kab. Bandung, Jawa Barat'], ['Gol. darah / Status', 'O / Kawin']] as const).map(([label, value]) => <View key={label} className="mt-2 flex-row flex-wrap justify-between gap-x-3"><Text className="font-inter text-sm text-[#D8F3DC]">{label}</Text><Text className="font-inter shrink text-right text-sm font-semibold text-white">{value}</Text></View>)}
        <View className="mb-3 mt-4 h-px bg-white/30" />
        <View className="flex-row flex-wrap items-center justify-between gap-2"><Text className="font-inter text-sm font-semibold text-[#D8F3DC]">◇ Data simulasi</Text><Pressable accessibilityRole="button" onPress={() => unavailable('QR verifikasi')} className="min-h-12 justify-center rounded-xl bg-white px-4"><Text className="font-inter text-center text-sm font-bold text-[#1B4332]">▦  Buka QR Verifikasi</Text></Pressable></View>
      </LinearGradient>
      <View className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-white p-3"><Text className="font-inter mb-3 text-lg font-bold text-[#1B4332]">Dokumen resmi tersimpan</Text>
        {documents.map((doc) => <LinearGradient key={doc.title} colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 14, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCE9E0' }}><View className="h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC]"><Icon name={doc.icon} size={20} /></View><View className="mx-2 flex-1"><Text className="font-inter text-sm font-bold text-[#172B22]">{doc.title}</Text><Text className="font-inter mt-1 text-xs text-[#51665C]">{doc.subtitle}</Text></View><Pressable accessibilityRole="button" accessibilityLabel={`Lihat ${doc.title}`} onPress={() => unavailable(doc.title)} className="min-h-11 justify-center rounded-xl border border-[#74C69D] bg-white px-3"><Text className="font-inter text-sm font-bold text-[#1B4332]">Lihat</Text></Pressable></LinearGradient>)}
      </View>
      <Text className="font-inter mb-3 mt-5 text-xl font-bold text-[#1B4332]">Pengaturan</Text>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: largeText }} onPress={toggleTextSize} className="min-h-16 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><View className="h-11 w-11 items-center justify-center rounded-xl bg-[#D8F3DC]"><Text className="font-inter font-bold text-[#1B4332]">A+</Text></View><View className="ml-3 flex-1"><Text className="font-inter text-base font-bold text-[#172B22]">Perbesar teks</Text><Text className="font-inter mt-1 text-xs text-[#51665C]">Sesuaikan ukuran teks beranda</Text></View><Icon name="right" size={20} /></Pressable>
    </ScrollView>
  </View>;
}
