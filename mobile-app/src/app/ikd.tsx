import { useCallback, useContext, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TextSizeContext } from '../components/home/text-size';
import { Icon } from '../components/ui/icon';
import { useAuth } from '../lib/auth';
import { api, ApiError } from '../lib/api';

const statusLabel: Record<string, string> = { active: 'Aktif', pending: 'Menunggu verifikasi', inactive: 'Belum aktif' };

export default function IkdScreen() {
  const insets = useSafeAreaInsets();
  const [showNik, setShowNik] = useState(false);
  const { largeText, toggleTextSize } = useContext(TextSizeContext);
  const { user, token, logout, refreshUser, setUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(useCallback(() => {
    if (!token) return;
    void refreshUser().catch(() => undefined);
  }, [token, refreshUser]));

  async function activate() {
    setBusy(true);
    setError('');
    try {
      const updated = await api.activateIKD(`device-verification-${Date.now()}`);
      setUser(updated);
      Alert.alert('IKD aktif', 'Identitas Kependudukan Digital Anda sudah aktif.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Aktivasi IKD gagal.');
    } finally {
      setBusy(false);
    }
  }

  const maskedNik = user ? `${user.nik.slice(0, 4)}••••••${user.nik.slice(-4)}` : '';

  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.navigate('/')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Profil IKD</Text>{user ? <Pressable accessibilityRole="button" onPress={() => { void logout(); router.navigate('/'); }} className="min-h-11 justify-center rounded-xl bg-[#ECF6EF] px-3"><Text className="font-inter text-sm font-bold text-[#A12626]">Keluar</Text></Pressable> : null}</View>

      {!token ? <View className="rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><Text className="font-inter text-lg font-bold text-[#1B4332]">Masuk untuk melihat identitas</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">Profil IKD terhubung dengan akun warga JABARIN.</Text><Pressable accessibilityRole="button" onPress={() => router.navigate('/masuk')} className="mt-3 min-h-12 items-center justify-center rounded-xl bg-[#1B4332]"><Text className="font-inter font-bold text-white">Masuk atau daftar</Text></Pressable></View> : null}
      {token && !user ? <View className="items-center rounded-[20px] bg-[#F6F9F7] p-6"><ActivityIndicator color="#1B4332" /><Text className="font-inter mt-3 text-base text-[#51665C]">Memuat profil…</Text></View> : null}

      {user ? <>
        <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 20, padding: 18 }}>
          <View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center"><Icon name="id" size={18} color="#D8F3DC" /><Text className="font-inter ml-2 text-xs font-bold text-[#D8F3DC]">REPUBLIK INDONESIA</Text></View><Text className="font-inter overflow-hidden rounded-full bg-white px-3 py-1 text-xs font-bold text-[#1B4332]">{user.ikd_status === 'active' ? '✓ Terverifikasi' : statusLabel[user.ikd_status]}</Text></View>
          <Text className="font-inter mt-4 text-2xl font-bold leading-8 text-white">Identitas Kependudukan Digital</Text>
          <View className="mt-5 flex-row flex-wrap items-center justify-between gap-2"><Text className="font-inter text-sm text-[#D8F3DC]">NIK</Text><View className="flex-row flex-wrap items-center"><Text className="font-inter text-base font-semibold text-white">{showNik ? user.nik : maskedNik}</Text><Pressable accessibilityRole="button" accessibilityLabel={showNik ? 'Sembunyikan NIK' : 'Tampilkan NIK'} onPress={() => setShowNik(!showNik)} className="ml-3 min-h-11 justify-center"><Text className="font-inter text-sm font-semibold text-white underline">{showNik ? 'Sembunyikan' : 'Tampilkan'}</Text></Pressable></View></View>
          {([['Nama lengkap', user.full_name], ['Domisili', [user.city, user.province].filter(Boolean).join(', ')], ['Alamat', user.address || 'Belum diisi'], ['Status IKD', statusLabel[user.ikd_status]]] as const).map(([label, value]) => <View key={label} className="mt-2 flex-row flex-wrap justify-between gap-x-3"><Text className="font-inter text-sm text-[#D8F3DC]">{label}</Text><Text className="font-inter shrink text-right text-sm font-semibold text-white">{value}</Text></View>)}
          <View className="mb-3 mt-4 h-px bg-white/30" />
          <View className="flex-row flex-wrap items-center justify-between gap-2"><Text className="font-inter text-sm font-semibold text-[#D8F3DC]">{user.ikd_activated_at ? `Aktif sejak ${new Date(user.ikd_activated_at).toLocaleDateString('id-ID')}` : 'Status data akun'}</Text>{user.ikd_status !== 'active' ? <Pressable accessibilityRole="button" disabled={busy} onPress={activate} className="min-h-12 justify-center rounded-xl bg-white px-4" style={{ opacity: busy ? 0.7 : 1 }}>{busy ? <ActivityIndicator color="#1B4332" /> : <Text className="font-inter text-center text-sm font-bold text-[#1B4332]">Aktifkan IKD</Text>}</Pressable> : null}</View>
        </LinearGradient>
        {error ? <Text accessibilityRole="alert" className="font-inter mt-3 text-sm text-[#A12626]">{error}</Text> : null}

        <View className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-white p-3"><Text className="font-inter mb-3 text-lg font-bold text-[#1B4332]">Dokumen tersimpan</Text>
          {[{ title: 'KTP Elektronik Digital', subtitle: user.ikd_status === 'active' ? 'Terhubung dengan akun IKD' : 'Aktifkan IKD untuk memakai dokumen', icon: 'id' as const, available: user.ikd_status === 'active' }, { title: 'Kartu Keluarga (KK) Digital', subtitle: 'Belum tersedia dari layanan', icon: 'file' as const, available: false }, { title: 'Kartu JKN / KIS Kesehatan', subtitle: 'Belum tersedia dari layanan', icon: 'medical' as const, available: false }].map((doc) => <LinearGradient key={doc.title} colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 14, padding: 10, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCE9E0' }}><View className="h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC]"><Icon name={doc.icon} size={20} /></View><View className="mx-2 flex-1"><Text className="font-inter text-sm font-bold text-[#172B22]">{doc.title}</Text><Text className="font-inter mt-1 text-xs text-[#51665C]">{doc.subtitle}</Text></View><View className={`min-h-11 justify-center rounded-xl border px-3 ${doc.available ? 'border-[#74C69D] bg-white' : 'border-[#DCE9E0] bg-[#F6F9F7]'}`}><Text className={`font-inter text-sm font-bold ${doc.available ? 'text-[#1B4332]' : 'text-[#51665C]'}`}>{doc.available ? 'Aktif' : '—'}</Text></View></LinearGradient>)}
        </View>
      </> : null}

      <Text className="font-inter mb-3 mt-5 text-xl font-bold text-[#1B4332]">Pengaturan</Text>
      <Pressable accessibilityRole="switch" accessibilityState={{ checked: largeText }} onPress={toggleTextSize} className="min-h-16 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><View className="h-11 w-11 items-center justify-center rounded-xl bg-[#D8F3DC]"><Text className="font-inter font-bold text-[#1B4332]">A+</Text></View><View className="ml-3 flex-1"><Text className="font-inter text-base font-bold text-[#172B22]">Perbesar teks</Text><Text className="font-inter mt-1 text-xs text-[#51665C]">Sesuaikan ukuran teks beranda</Text></View><Icon name="right" size={20} /></Pressable>
    </ScrollView>
  </View>;
}
