import { useCallback, useState } from 'react';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, BackHandler, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CatalogScreen from '../components/services/catalog-screen';
import { DirectoryRow } from '../components/services/directory-row';
import { directory, type DirectoryItem } from '../components/services/service-directory';
import { Icon } from '../components/ui/icon';

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const { section } = useLocalSearchParams<{ section?: string }>();
  const page = section ? (section === 'Kesehatan' ? 'health' : 'catalog') : 'directory';
  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!section) return false;
      router.setParams({ section: undefined });
      return true;
    });
    return () => subscription.remove();
  }, [section]));
  const [query, setQuery] = useState('');
  const select = (item: DirectoryItem) => {
    if (item.href) router.navigate(item.href);
    else router.setParams({ section: item.title });
  };
  if (page === 'catalog') return <View className="flex-1 bg-white"><Pressable accessibilityRole="button" onPress={() => router.setParams({ section: undefined })} style={{ paddingTop: insets.top + 8, paddingHorizontal: 18, paddingBottom: 8 }}><Text className="font-inter text-base font-bold text-[#1B4332]">‹ Kembali ke layanan</Text></Pressable><CatalogScreen key={section} section={section ?? ''} /></View>;
  const results = directory.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('id-ID').includes(query.trim().toLocaleLowerCase('id-ID')));
  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
    <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali" onPress={() => page === 'health' ? router.setParams({ section: undefined }) : router.navigate('/')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter text-2xl font-bold text-[#1B4332]">{page === 'health' ? 'Kesehatan' : 'Layanan'}</Text></View>
    {page === 'directory' ? <>
      <Text className="font-inter text-[27px] font-bold text-[#1B4332]">Layanan pemerintah</Text><Text className="font-inter mb-4 mt-2 text-base leading-6 text-[#51665C]">Pilih layanan untuk melihat informasi dan langkah berikutnya.</Text>
      <View className="mb-4 min-h-[52px] flex-row items-center rounded-2xl border border-[#DCE9E0] bg-[#F6F9F7] px-4"><Icon name="search" size={22} /><TextInput accessibilityLabel="Cari layanan" value={query} onChangeText={setQuery} placeholder="Cari layanan, misalnya BPJS" placeholderTextColor="#51665C" className="font-inter ml-3 flex-1 py-3 text-base text-[#172B22]" /></View>
      {results.map((item) => <DirectoryRow key={item.title} {...item} onPress={() => select(item)} />)}
      {results.length === 0 && <View className="rounded-2xl bg-[#F6F9F7] p-4"><Text className="font-inter font-bold text-[#1B4332]">Layanan tidak ditemukan</Text><Text className="font-inter mt-2 text-[#51665C]">Coba kata kunci lain.</Text><Pressable accessibilityRole="button" onPress={() => setQuery('')} className="mt-2 min-h-11 justify-center"><Text className="font-inter font-bold text-[#1B4332]">Hapus pencarian</Text></Pressable></View>}
    </> : <>
      <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ padding: 18, borderRadius: 20 }}><View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#D8F3DC]"><Icon name="health" /></View><Text className="font-inter mt-3 text-2xl font-bold text-white">Kesehatan & BPJS</Text><Text className="font-inter mt-2 text-base leading-6 text-[#D8F3DC]">Temukan informasi JKN, fasilitas kesehatan, dan bantuan layanan.</Text></LinearGradient>
      <Text className="font-inter mb-4 mt-5 text-xl font-bold text-[#1B4332]">Layanan kesehatan</Text>
      <DirectoryRow title="BPJS Kesehatan" description="Informasi kepesertaan JKN dan kanal resmi" icon="health" onPress={() => Alert.alert('BPJS Kesehatan', 'Informasi kepesertaan belum terhubung. Gunakan kanal resmi BPJS Kesehatan untuk informasi terkini.')} />
      <DirectoryRow title="Antrean puskesmas" description="Lihat contoh antrean fasilitas kesehatan" icon="ticket" onPress={() => router.navigate('/antrean')} />
      <View className="mt-2 flex-row rounded-2xl bg-[#ECF6EF] p-4"><Icon name="sparkle" /><View className="ml-3 flex-1"><Text className="font-inter font-bold text-[#1B4332]">Butuh panduan?</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Asisten JABARIN belum tersedia.</Text></View></View>
    </>}
  </ScrollView></View>;
}
