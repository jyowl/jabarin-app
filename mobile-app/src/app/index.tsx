import { useContext, useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Modal, Pressable, ScrollView, StatusBar, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { directory } from '../components/services/service-directory';
import { ReportBanner } from '../components/home/report-banner';
import { Icon } from '../components/ui/icon';
import { TextSizeContext } from '../components/home/text-size';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { fontScale } = useWindowDimensions();
  const { largeText, toggleTextSize } = useContext(TextSizeContext);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const openService = (title: string, href?: (typeof directory)[number]['href']) => {
    if (href) router.navigate(href);
    else router.navigate({ pathname: '/layanan', params: { section: title } });
  };
  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 90 }}>
      <View className="mb-5 flex-row items-center">
        <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4332]"><Icon name="bank" color="white" /></View>
        <View className="flex-1"><Text className="font-inter text-2xl font-bold text-[#1B4332]" style={largeText && { fontSize: 29 }}>Halo, Wargi!</Text><Text className="font-inter text-sm font-semibold text-[#51665C]" style={largeText && { fontSize: 18 }}>JABARIN · Jawa Barat</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Ubah ukuran teks" accessibilityState={{ selected: largeText }} onPress={toggleTextSize} className="h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Text className="font-inter text-base font-bold text-[#1B4332]" style={largeText && { fontSize: 20 }}>{largeText ? 'A−' : 'A+'}</Text></Pressable>
      </View>
      <ReportBanner largeText={largeText} onPress={() => router.navigate('/lapor')} />
      <View className="mb-4 mt-6 flex-row flex-wrap items-center justify-between"><Text className="font-inter text-xl font-bold text-[#1B4332]" style={largeText && { fontSize: 24 }}>Kategori Layanan</Text><Pressable onPress={() => router.navigate('/layanan')} accessibilityRole="button" className="min-h-11 flex-row items-center"><Text className="font-inter font-bold text-[#1B4332]" style={largeText && { fontSize: 18 }}>Semua</Text><Icon name="right" size={18} /></Pressable></View>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>{directory.map((item) => <Pressable key={item.title} onPress={() => openService(item.title, item.href)} accessibilityRole="button" style={{ width: fontScale > 1.25 || largeText ? '48%' : '23%', flexGrow: 1 }}>
        <LinearGradient colors={['#1B4332', '#2C6C4F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 85, borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 8 }}>
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC]"><Image source={item.homeIcon} style={{ width: 22, height: 22 }} contentFit="contain" accessibilityElementsHidden /></View><Text className="font-inter mt-2 text-center font-semibold text-white" style={{ fontSize: largeText ? 15 : 11 }}>{item.title}</Text>
        </LinearGradient></Pressable>)}</View>
      <View className="mb-3 mt-6 flex-row flex-wrap items-center justify-between"><Text className="font-inter text-xl font-bold text-[#1B4332]" style={largeText && { fontSize: 24 }}>Pantau Laporan</Text><Pressable accessibilityRole="button" onPress={() => router.navigate('/laporan-publik')} className="min-h-11 flex-row items-center"><Text className="font-inter font-bold text-[#1B4332]" style={largeText && { fontSize: 18 }}>Lihat semua</Text><Icon name="right" size={18} /></Pressable></View>
      <View className="rounded-2xl border border-[#DCE9E0] bg-[#F6F9F7] p-4"><Text className="font-inter text-sm font-semibold text-[#51665C]" style={largeText && { fontSize: 18 }}>Laporan belum tersedia</Text><Text className="font-inter mt-1 text-sm text-[#51665C]" style={largeText && { fontSize: 18 }}>Status laporan akan muncul setelah layanan terhubung.</Text></View>
    </ScrollView>
    <Pressable accessibilityRole="button" accessibilityLabel="Asisten AI" onPress={() => setAssistantOpen(true)} className="absolute bottom-[13px] right-[18px]" style={{ borderRadius: 20, shadowColor: '#1B4332', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.22, shadowRadius: 8, elevation: 5 }}>
      <LinearGradient colors={['#1B4332', '#276247']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minWidth: 70, minHeight: 52, borderRadius: 20, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="assistant" color="white" size={22} /><Text className="font-inter ml-2 font-bold text-white" style={largeText && { fontSize: 18 }}>AI</Text>
      </LinearGradient>
    </Pressable>
    <Modal visible={assistantOpen} transparent animationType="slide" onRequestClose={() => setAssistantOpen(false)}>
      <View className="flex-1 justify-end bg-black/40"><Pressable accessibilityRole="button" accessibilityLabel="Tutup menu asisten" onPress={() => setAssistantOpen(false)} className="flex-1" />
        <View className="rounded-t-[28px] bg-white px-5 pt-3" style={{ paddingBottom: insets.bottom + 24 }}>
          <View className="mb-4 h-1 w-10 self-center rounded-full bg-[#DCE9E0]" />
          <View className="mb-4 flex-row items-center"><View className="flex-1"><Text className="font-inter text-2xl font-bold text-[#1B4332]">Asisten JABARIN</Text><Text className="font-inter mt-1 text-sm text-[#51665C]">Bantuan untuk layanan dan laporan warga.</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Tutup menu asisten" onPress={() => setAssistantOpen(false)} className="h-11 w-11 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Text className="text-2xl text-[#1B4332]">×</Text></Pressable></View>
          {([
            { title: 'Cari layanan', description: 'Contohnya BPJS, Dukcapil, atau bansos', icon: 'search' as const, action: () => { setAssistantOpen(false); router.navigate('/layanan'); } },
            { title: 'Pantau laporan', description: 'Lihat contoh laporan publik', icon: 'list' as const, action: () => { setAssistantOpen(false); router.navigate('/laporan-publik'); } },
            { title: 'Pahami saran AI', description: 'Lihat data dan alasan di balik jawaban', icon: 'sparkle' as const, action: () => { setAssistantOpen(false); router.navigate('/dasar-jawaban'); } },
          ]).map((item) => <Pressable key={item.title} accessibilityRole="button" onPress={item.action} className="mb-3 min-h-16 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={21} /></LinearGradient><View className="mx-3 flex-1"><Text className="font-inter text-base font-bold text-[#172B22]">{item.title}</Text><Text className="font-inter mt-1 text-sm text-[#51665C]">{item.description}</Text></View><Icon name="right" size={20} /></Pressable>)}
          <Pressable accessibilityRole="button" onPress={() => { setAssistantOpen(false); router.navigate('/asisten'); }} className="min-h-14 flex-row items-center justify-center rounded-2xl bg-[#D8F3DC] px-4"><Icon name="assistant" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-[#1B4332]">Tanya Asisten JABARIN</Text></Pressable>
        </View>
      </View>
    </Modal>
  </View>;
}
