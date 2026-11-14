import { useCallback, useEffect, useState } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { File, FileMode, Paths } from 'expo-file-system';
import { Alert, BackHandler, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';
import { parsePickerDraft, validateReport } from '../components/report/validation';
import { imageType, validPhoto } from '../components/report/photo';

const categories = ['Jalan', 'Kebersihan', 'Administrasi', 'Lainnya'];
const input = 'font-inter min-h-12 rounded-xl border border-[#74C69D] bg-white px-3 py-2 text-base text-[#172B22]';
const label = 'font-inter mb-2 text-sm font-bold text-[#1B4332]';

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [district, setDistrict] = useState('');
  const [details, setDetails] = useState('');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const [review, setReview] = useState(false);
  const [simulation, setSimulation] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [error, setError] = useState('');
  const [restoring, setRestoring] = useState(Platform.OS === 'android');

  async function acceptPhoto(asset: ImagePicker.ImagePickerAsset) {
    let size: number;
    let header: Uint8Array;
    if (Platform.OS === 'web') {
      const blob = asset.file ?? await (await fetch(asset.uri)).blob();
      size = blob.size;
      header = new Uint8Array(await blob.slice(0, 8).arrayBuffer());
    } else {
      const file = new File(asset.uri);
      size = file.size;
      const handle = file.open(FileMode.ReadOnly);
      try { header = await handle.readBytes(8); } finally { handle.close(); }
    }
    if (!validPhoto(size, header)) {
      Alert.alert('Foto tidak dapat dipilih', 'Pilih foto JPG atau PNG yang dapat dibaca dan maksimal 10 MB.');
      return;
    }
    setPhoto({ ...asset, fileSize: size, mimeType: imageType(header) ?? undefined });
  }

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let active = true;
    async function restore() {
      try {
        const snapshot = new File(Paths.cache, 'report-picker-draft.json');
        if (!snapshot.exists) return;
        const draft = parsePickerDraft(await snapshot.text());
        if (!active) return;
        setTitle(draft.title); setCategory(draft.category); setDistrict(draft.district); setDetails(draft.details);
        if (draft.photo?.uri && typeof draft.photo.uri === 'string') setPhoto(draft.photo);
        const result = await ImagePicker.getPendingResultAsync();
        if (!active) return;
        if (result && 'canceled' in result && !result.canceled && result.assets[0]) await acceptPhoto(result.assets[0]);
        else if (result && 'code' in result) Alert.alert('Foto tidak dapat dipulihkan', 'Draf laporan telah dipulihkan. Silakan pilih foto lagi.');
        snapshot.delete();
      } catch {
        if (active) Alert.alert('Pemulihan belum selesai', 'Draf atau foto sementara tidak dapat dipulihkan.');
      } finally {
        if (active) setRestoring(false);
      }
    }
    void restore();
    return () => { active = false; };
  }, []);

  useFocusEffect(useCallback(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (showDetail) { setShowDetail(false); return true; }
      if (simulation) { setSimulation(false); return true; }
      if (review) { setReview(false); return true; }
      return false;
    });
    return () => subscription.remove();
  }, [review, simulation, showDetail]));

  async function pickPhoto(camera: boolean) {
    let snapshot: File | undefined;
    try {
      if (camera && Platform.OS !== 'web' && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
        Alert.alert('Izin kamera diperlukan', 'Aktifkan izin kamera untuk mengambil foto.');
        return;
      }
      if (Platform.OS === 'android') {
        // shortcut: Android may evict cache under storage pressure; use encrypted durable drafts for production.
        snapshot = new File(Paths.cache, 'report-picker-draft.json');
        snapshot.writeSync(JSON.stringify({ title, category, district, details, photo }));
      }
      const result = camera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'] })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] });
      if (!result.canceled && result.assets[0]) await acceptPhoto(result.assets[0]);
    } catch {
      Alert.alert('Foto tidak dapat dipilih', 'Coba lagi atau lanjutkan tanpa foto.');
    } finally {
      if (snapshot?.exists) {
        try { snapshot.delete(); } catch { Alert.alert('Draf sementara belum dihapus', 'Tutup dan buka kembali aplikasi untuk mencoba memulihkan draf.'); }
      }
    }
  }

  function showReview() {
    const message = validateReport(title, category, district, details);
    setError(message);
    if (!message) { Keyboard.dismiss(); setReview(true); }
  }

  if (restoring) return <View className="flex-1 items-center justify-center bg-white"><Text className="font-inter text-[#51665C]">Memulihkan draf…</Text></View>;

  if (review) return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 14, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel={showDetail ? 'Kembali ke simulasi pengiriman' : simulation ? 'Kembali ke tinjau laporan' : 'Ubah isi laporan'} onPress={() => showDetail ? setShowDetail(false) : simulation ? setSimulation(false) : setReview(false)} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">{showDetail ? 'Detail Laporan' : simulation ? 'Lapor Warga' : 'Tinjau laporan'}</Text></View>
      {showDetail ? <>
        <Text className="font-inter mb-3 text-sm leading-5 text-[#51665C]">Simulasi tampilan · Laporan belum dikirim atau disimpan.</Text>
        <View className="rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center"><Icon name={category === 'Jalan' ? 'road' : category === 'Kebersihan' ? 'trash' : 'file'} size={20} /><Text className="font-inter ml-2 text-sm font-bold text-[#1B4332]">{category}</Text></View><Text className="font-inter overflow-hidden rounded-full bg-[#FFF1D2] px-3 py-1 text-xs font-bold text-[#6F4C0A]">Contoh status</Text></View><Text className="font-inter mt-3 text-lg font-bold text-[#172B22]">{title.trim()}</Text><View className="mt-2 flex-row items-center"><Icon name="pin" size={18} /><Text className="font-inter ml-2 flex-1 text-sm text-[#51665C]">{district.trim()}</Text></View><View className="my-3 h-px bg-[#DCE9E0]" /><Text className="font-inter text-xs font-bold text-[#51665C]">#JBR-02481 · Tiket contoh</Text></View>
        <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 16, padding: 16, flexDirection: 'row' }}><Icon name="calendar" size={21} /><View className="ml-3 flex-1"><Text className="font-inter text-base font-bold text-[#1B4332]">Estimasi penanganan belum tersedia</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Estimasi resmi akan tersedia setelah layanan terhubung.</Text></View></LinearGradient>
        <Text className="font-inter mb-3 mt-5 text-xl font-bold text-[#1B4332]">Riwayat penanganan</Text>
        <View className="rounded-[20px] border border-[#DCE9E0] bg-white p-4"><Text className="font-inter mb-3 text-sm text-[#51665C]">Contoh alur, bukan riwayat laporan Anda.</Text>{[
          { title: 'Sedang ditangani', description: 'Contoh: tim lapangan dijadwalkan untuk mengecek lokasi.', icon: 'calendar' as const },
          { title: 'Diverifikasi', description: 'Contoh: petugas memeriksa dan meneruskan laporan.', icon: 'file' as const },
          { title: 'Diterima', description: 'Contoh: tiket masuk antrean verifikasi.', icon: 'ticket' as const },
        ].map((item) => <View key={item.title} className="mb-4 flex-row"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={21} /></LinearGradient><View className="ml-3 flex-1"><Text className="font-inter text-base font-bold text-[#1B4332]">{item.title}</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#172B22]">{item.description}</Text></View></View>)}</View>
        <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 16, padding: 16, flexDirection: 'row' }}><Icon name="sparkle" size={21} /><View className="ml-3 flex-1"><Text className="font-inter text-base font-bold text-[#1B4332]">Mengapa kategori {category}?</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Kategori dipilih dalam formulir. Saran AI dan verifikasi petugas belum tersedia.</Text></View></LinearGradient>
      </> : simulation ? <>
        <View className="mb-6 mt-6 items-center"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ height: 76, width: 76, borderRadius: 20, alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={30} /></LinearGradient><Text className="font-inter mt-4 text-center text-[27px] font-bold text-[#1B4332]">Simulasi pengiriman</Text><Text className="font-inter mt-3 text-center text-base leading-6 text-[#51665C]">Laporan belum dikirim atau disimpan. Layanan pengiriman resmi belum terhubung.</Text></View>
        <View className="rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><Text className="font-inter self-start overflow-hidden rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-bold text-[#1B4332]">Contoh tiket · Bukan tiket resmi</Text><Text className="font-inter mt-4 text-2xl font-bold text-[#1B4332]">#JBR-02481</Text><Text className="font-inter mt-3 text-base font-bold text-[#172B22]">{title.trim()}</Text></View>
        <Pressable accessibilityRole="button" onPress={() => setShowDetail(true)} className="mt-4"><LinearGradient colors={['#1B4332', '#276247']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 }}><Icon name="list" color="white" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-white">Pantau laporan saya</Text></LinearGradient></Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/laporan-publik')} className="mt-4 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] px-4"><Icon name="arrow" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-[#1B4332]">Buka log laporan publik</Text></Pressable>
      </> : <>
        <Text className="font-inter text-[27px] font-bold leading-9 text-[#1B4332]">Periksa laporan Anda</Text><Text className="font-inter mt-2 text-base leading-6 text-[#51665C]">Pastikan isi laporan sesuai sebelum melanjutkan.</Text>
        <View className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 }}><Text className="font-inter text-xs font-bold text-[#1B4332]">{category}</Text></LinearGradient><Text className="font-inter mt-3 text-xl font-bold text-[#1B4332]">{title.trim()}</Text><Text className="font-inter mt-2 text-sm font-semibold text-[#51665C]">{district.trim()}</Text><Text className="font-inter mt-3 text-base leading-6 text-[#172B22]">{details.trim()}</Text>{photo && <Image source={{ uri: photo.uri }} style={{ width: '100%', height: 180, marginTop: 12, borderRadius: 12 }} contentFit="contain" accessibilityLabel="Foto bukti laporan" />}</View>
        <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 20, borderWidth: 1, borderColor: '#74C69D', padding: 16 }}><Text className="font-inter text-xs font-bold text-[#1B4332]">✧  SARAN TUJUAN</Text><Text className="font-inter mt-3 text-lg font-bold text-[#1B4332]">Tujuan laporan belum tersedia</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">Saran AI dan tujuan instansi belum terhubung. Petugas perlu memeriksa kategori dan tujuan sebelum laporan diteruskan.</Text></LinearGradient>
        <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 16, padding: 16 }}><Text className="font-inter text-sm font-bold text-[#1B4332]">Informasi yang dapat tampil di log publik</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Judul, kategori, lokasi umum, dan status penanganan.</Text></LinearGradient>
        <Text className="font-inter mt-4 text-sm leading-5 text-[#51665C]">Pratinjau saja. Laporan dan foto belum dikirim atau disimpan.</Text>
        {/* shortcut: simulasi tanpa pengiriman atau tiket resmi, hubungkan layanan laporan sebelum mengaktifkan pengiriman. */}
        <Pressable accessibilityRole="button" onPress={() => setSimulation(true)} className="mt-4"><LinearGradient colors={['#1B4332', '#276247']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 56, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 }}><Icon name="send" color="white" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-white">Simulasikan pengiriman</Text></LinearGradient></Pressable>
        <Pressable accessibilityRole="button" onPress={() => setReview(false)} className="mt-4 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] px-4"><Icon name="left" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-[#1B4332]">Ubah isi laporan</Text></Pressable>
      </>}
    </ScrollView>
  </View>;

  return <KeyboardAvoidingView className="flex-1 bg-white" behavior="padding">
    <StatusBar barStyle="dark-content" />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 12, paddingTop: insets.top + 14, paddingBottom: 24 }}>
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.navigate('/')} className="mr-3 h-11 w-11 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Lapor Warga</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Laporan publik" onPress={() => router.navigate('/laporan-publik')} className="h-11 w-11 items-center justify-center rounded-2xl bg-[#D8F3DC]"><Icon name="list" /></Pressable>
      </View>
      <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 18, padding: 14 }}>
        <View className="flex-row items-center justify-between"><View className="rounded-full bg-[#D8F3DC] px-3 py-1"><Text className="font-inter text-xs font-bold text-[#1B4332]">ASPIRASI & ADUAN</Text></View><Icon name="report" color="#D8F3DC" size={22} /></View>
        <Text className="font-inter mt-2 text-2xl font-bold text-white">Lapor Warga Terpadu</Text>
        <Text className="font-inter mt-1 text-sm leading-5 text-[#D8F3DC]">Laporkan jalan rusak, sampah, atau kendala layanan publik.</Text>
      </LinearGradient>
      <View className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-white p-3">
        <Text className="font-inter mb-4 text-xl font-bold text-[#1B4332]">Buat laporan baru</Text>
        <Text className={label}>Judul laporan</Text><TextInput accessibilityLabel="Judul laporan" value={title} onChangeText={setTitle} placeholder="Contoh: Jalan berlubang di Jl. Sapan" placeholderTextColor="#51665C" className={input} />
        <View className="mt-4 flex-row gap-3"><View className="flex-1"><Text className={label}>Kategori</Text><Pressable accessibilityRole="button" accessibilityLabel={`Kategori: ${category || 'belum dipilih'}`} onPress={() => setShowCategories(true)} className="min-h-12 flex-row items-center justify-between rounded-xl border border-[#74C69D] px-3"><Text className="font-inter flex-1 text-base text-[#172B22]">{category || 'Pilih kategori'}</Text><Icon name="right" size={18} /></Pressable></View><View className="flex-1"><Text className={label}>Kecamatan</Text><TextInput accessibilityLabel="Kecamatan" value={district} onChangeText={setDistrict} placeholder="Nama kecamatan" placeholderTextColor="#51665C" className={input} /></View></View>
        <Text className={`${label} mt-4`}>Detail kejadian / keluhan</Text><TextInput accessibilityLabel="Detail kejadian atau keluhan" value={details} onChangeText={setDetails} placeholder="Ceritakan kejadian dan lokasi secara jelas" placeholderTextColor="#51665C" multiline textAlignVertical="top" className={`${input} min-h-[76px]`} />
        <Text className={`${label} mt-4`}>Foto bukti (opsional)</Text>
        <View className="min-h-[94px] items-center justify-center rounded-xl border-2 border-dashed border-[#74C69D] bg-[#ECF6EF] p-3">
          {photo && <Image source={{ uri: photo.uri }} style={{ width: 100, height: 70, borderRadius: 8, marginBottom: 8 }} contentFit="cover" accessibilityLabel="Foto bukti yang dipilih" />}
          {!photo && <Icon name="upload" size={22} />}
          <View className="flex-row flex-wrap justify-center"><Pressable accessibilityRole="button" onPress={() => pickPhoto(false)} className="min-h-11 justify-center px-3"><Text className="font-inter text-center font-bold text-[#1B4332]">{photo ? 'Ganti foto' : 'Unggah foto'}</Text></Pressable><Pressable accessibilityRole="button" onPress={() => pickPhoto(true)} className="min-h-11 justify-center px-3"><Text className="font-inter text-center font-bold text-[#1B4332]">Ambil kamera</Text></Pressable></View>
          <Text className="font-inter text-center text-xs text-[#51665C]">JPG atau PNG · maks. 10 MB</Text>
          {photo && <Pressable accessibilityRole="button" onPress={() => setPhoto(null)} className="min-h-11 justify-center"><Text className="font-inter font-bold text-[#1B4332]">Hapus foto</Text></Pressable>}
        </View>
        {error ? <Text accessibilityRole="alert" className="font-inter mt-3 text-sm text-[#A12626]">{error}</Text> : null}
        <Pressable accessibilityRole="button" onPress={showReview} className="mt-4 self-end"><LinearGradient colors={['#1B4332', '#276247']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 44, borderRadius: 14, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrow" color="white" size={20} /><Text className="font-inter ml-2 text-base font-bold text-white">Tinjau laporan</Text></LinearGradient></Pressable>
      </View>
    </ScrollView>
    <Modal visible={showCategories} transparent animationType="fade" onRequestClose={() => setShowCategories(false)}><View className="flex-1 justify-center bg-black/40 px-6"><View className="rounded-2xl bg-white p-4"><Text className="font-inter mb-2 text-lg font-bold text-[#1B4332]">Pilih kategori</Text>{categories.map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: category === item }} onPress={() => { setCategory(item); setShowCategories(false); }} className="min-h-11 justify-center"><Text className="font-inter text-base text-[#172B22]">{item}{category === item ? ' ✓' : ''}</Text></Pressable>)}<Pressable accessibilityRole="button" onPress={() => setShowCategories(false)} className="min-h-11 justify-center"><Text className="font-inter font-bold text-[#1B4332]">Batal</Text></Pressable></View></View></Modal>
  </KeyboardAvoidingView>;
}
