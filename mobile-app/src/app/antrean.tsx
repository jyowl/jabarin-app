import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';

export default function AntreanScreen() {
  const insets = useSafeAreaInsets();
  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.navigate('/')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Antrean</Text></View>
      <Text className="font-inter text-[27px] font-bold text-[#1B4332]">Antrean saya</Text>
      <Text className="font-inter mb-4 mt-2 text-base leading-6 text-[#51665C]">Lihat jadwal dan nomor antrean layanan Anda.</Text>
      <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 20, padding: 16 }}>
        <View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center rounded-full border border-white/30 bg-white/10 px-3 py-1"><Icon name="ticket" size={16} color="white" /><Text className="font-inter ml-2 text-xs font-bold text-white">Antrean aktif</Text></View><Text className="font-inter text-xs text-[#D8F3DC]">Data simulasi</Text></View>
        <Text className="font-inter mt-4 text-center text-[41px] font-bold text-white">A-027</Text>
        <Text className="font-inter mt-2 text-center text-xl font-bold text-white">Puskesmas Bojongsoang</Text>
        <View className="mb-3 mt-4 h-px bg-white/30" />
        <Text className="font-inter text-base font-semibold text-white">Senin, 16 November · 09.00 WIB</Text>
        <Text className="font-inter mt-3 text-sm text-white">Poli umum · Loket pendaftaran</Text>
      </LinearGradient>
      <View className="mt-4 flex-row rounded-2xl bg-[#ECF6EF] p-4"><Text className="font-inter mr-3 text-lg font-bold text-[#1B4332]">ⓘ</Text><View className="flex-1"><Text className="font-inter text-base font-bold text-[#1B4332]">Saat tiba di lokasi</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Tunjukkan nomor antrean ini di loket pendaftaran.</Text></View></View>
      <Pressable accessibilityRole="button" onPress={() => router.navigate({ pathname: '/layanan', params: { section: 'Kesehatan' } })} className="mt-4 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] px-4"><Icon name="health" size={21} /><Text className="font-inter ml-2 text-center text-base font-bold text-[#1B4332]">Lihat layanan kesehatan</Text></Pressable>
    </ScrollView>
  </View>;
}
