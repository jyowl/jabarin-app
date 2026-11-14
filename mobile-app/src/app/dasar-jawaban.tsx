import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';

export default function DasarJawabanScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ question?: string; answer?: string; degraded?: string }>();
  const hasAnswer = Boolean(params.answer);
  const degraded = params.degraded === '1';

  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke asisten" onPress={() => router.navigate('/asisten')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Dasar Jawaban</Text></View>
      <Text className="font-inter text-[27px] font-bold leading-9 text-[#1B4332]">Bagaimana jawaban ini dibuat?</Text>
      <Text className="font-inter mt-2 text-base leading-6 text-[#51665C]">Asisten JABARIN memakai Gemini dan panduan layanan publik. Saran AI tidak menggantikan keputusan petugas.</Text>
      <Text className="font-inter mt-2 text-sm text-[#51665C]">{hasAnswer ? (degraded ? 'Jawaban panduan statis · AI belum aktif' : 'Jawaban AI · Gemini') : 'Belum ada jawaban yang dipilih'}</Text>

      {hasAnswer ? <View className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4">
        <LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}><Icon name="sparkle" size={16} /><Text className="font-inter ml-1 text-xs font-bold text-[#1B4332]">{degraded ? 'Panduan layanan' : 'Jawaban layanan'}</Text></LinearGradient>
        {params.question ? <Text className="font-inter mt-3 text-sm font-bold text-[#51665C]">Pertanyaan</Text> : null}
        {params.question ? <Text className="font-inter mt-1 text-base text-[#172B22]">{params.question}</Text> : null}
        <Text className="font-inter mt-3 text-sm font-bold text-[#51665C]">Jawaban</Text>
        <Text className="font-inter mt-1 text-base leading-6 text-[#172B22]">{params.answer}</Text>
        <Pressable accessibilityRole="button" onPress={() => router.navigate({ pathname: '/layanan', params: { section: 'Kesehatan' } })} className="mt-3 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] bg-white px-3"><Icon name="health" size={20} /><Text className="font-inter ml-2 flex-shrink text-center text-base font-bold text-[#1B4332]">Lihat layanan terkait</Text></Pressable>
      </View> : <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: '#DCE9E0', padding: 16 }}><Text className="font-inter text-lg font-bold text-[#1B4332]">Tanyakan sesuatu dulu</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">Setelah asisten menjawab, tombol “Mengapa jawaban ini?” akan menampilkan pertanyaan, jawaban, dan sumber yang dipakai.</Text></LinearGradient>}

      <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: '#DCE9E0', padding: 16 }}>
        <LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}><Icon name="road" size={16} /><Text className="font-inter ml-1 text-xs font-bold text-[#1B4332]">Batas bantuan</Text></LinearGradient>
        <Text className="font-inter mt-3 text-base leading-6 text-[#172B22]">Asisten hanya membahas layanan publik Jawa Barat. Asisten tidak meminta NIK lengkap, kata sandi, atau kode OTP, dan tidak mengarang nomor registrasi atau tarif.</Text>
      </LinearGradient>
      <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 16, padding: 16 }}><View className="flex-row"><Icon name="file" size={20} /><View className="ml-3 flex-1"><Text className="font-inter text-base font-bold text-[#1B4332]">Data yang dipakai</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Pertanyaan, riwayat percakapan terakhir, profil akun (nama, domisili, status IKD), jumlah berkas dan laporan aktif, serta katalog layanan.</Text></View></View></LinearGradient>
      <Pressable accessibilityRole="button" onPress={() => router.navigate('/asisten')} className="mt-4 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] px-4"><Icon name="left" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-[#1B4332]">Kembali ke asisten</Text></Pressable>
    </ScrollView>
  </View>;
}
