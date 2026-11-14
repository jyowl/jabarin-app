import { useCallback, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';
import { api, ApiError, type QueueTicket, type Service } from '../lib/api';
import { useAuth } from '../lib/auth';

const input = 'font-inter min-h-12 rounded-xl border border-[#74C69D] bg-white px-3 py-2 text-base text-[#172B22]';
const label = 'font-inter mb-2 text-sm font-bold text-[#1B4332]';
const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function formatSchedule(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} · ${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')} WIB`;
}

export default function AntreanScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [tickets, setTickets] = useState<QueueTicket[]>([]);
  const [active, setActive] = useState<QueueTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [serviceSlug, setServiceSlug] = useState('');
  const [location, setLocation] = useState('Puskesmas Bojongsoang');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const page = await api.listQueueTickets();
      setTickets(page.data);
      const waiting = page.data.find((item) => item.status === 'waiting') ?? page.data[0] ?? null;
      if (waiting && waiting.status === 'waiting') {
        const detail = await api.getQueueTicket(waiting.id);
        setActive(detail);
      } else {
        setActive(waiting);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Antrean gagal dimuat.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function openCreate() {
    setCreating(true);
    setError('');
    if (!services.length) {
      try {
        const page = await api.listServices({ per_page: 100 });
        setServices(page.data);
        setServiceSlug(page.data[0]?.slug ?? '');
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Layanan gagal dimuat.');
      }
    }
  }

  async function create() {
    if (!serviceSlug || !location.trim()) {
      setError('Pilih layanan dan isi lokasi kunjungan.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.createQueueTicket(serviceSlug, location.trim());
      setCreating(false);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Tiket gagal dibuat.');
    } finally {
      setBusy(false);
    }
  }

  function cancelActive() {
    if (!active) return;
    Alert.alert('Batalkan tiket?', `Tiket ${active.code} akan dibatalkan dan tidak dapat dipakai lagi.`, [
      { text: 'Tidak', style: 'cancel' },
      {
        text: 'Batalkan',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.cancelQueueTicket(active.id);
            await load();
          } catch (err) {
            Alert.alert('Gagal membatalkan', err instanceof ApiError ? err.message : 'Coba lagi.');
          }
        },
      },
    ]);
  }

  return <View className="flex-1 bg-white"><StatusBar barStyle="dark-content" />
    <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: 24 }}>
      <View className="mb-5 flex-row items-center"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.navigate('/')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Antrean</Text><Pressable accessibilityRole="button" accessibilityLabel="Muat ulang antrean" onPress={load} className="h-11 w-11 items-center justify-center rounded-xl bg-[#ECF6EF]"><Icon name="list" size={20} /></Pressable></View>
      <Text className="font-inter text-[27px] font-bold text-[#1B4332]">Antrean saya</Text>
      <Text className="font-inter mb-4 mt-2 text-base leading-6 text-[#51665C]">Lihat jadwal dan nomor antrean layanan Anda.</Text>

      {!token ? <View className="rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><Text className="font-inter text-lg font-bold text-[#1B4332]">Masuk untuk melihat antrean</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">Tiket antrean terhubung dengan akun warga Anda.</Text><Pressable accessibilityRole="button" onPress={() => router.navigate('/masuk')} className="mt-3 min-h-12 items-center justify-center rounded-xl bg-[#1B4332]"><Text className="font-inter font-bold text-white">Masuk atau daftar</Text></Pressable></View> : null}
      {token && loading ? <View className="items-center rounded-[20px] bg-[#F6F9F7] p-6"><ActivityIndicator color="#1B4332" /><Text className="font-inter mt-3 text-base text-[#51665C]">Memuat antrean…</Text></View> : null}
      {token && !loading && error ? <View className="rounded-[20px] bg-[#F6F9F7] p-4"><Text className="font-inter font-bold text-[#A12626]">Antrean tidak dapat dimuat</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">{error}</Text><Pressable accessibilityRole="button" onPress={load} className="mt-2 min-h-11 justify-center"><Text className="font-inter font-bold text-[#1B4332]">Coba lagi</Text></Pressable></View> : null}

      {token && !loading && active ? <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 20, padding: 16 }}>
        <View className="flex-row flex-wrap items-center justify-between gap-2"><View className="flex-row items-center rounded-full border border-white/30 bg-white/10 px-3 py-1"><Icon name="ticket" size={16} color="white" /><Text className="font-inter ml-2 text-xs font-bold text-white">{active.status === 'waiting' ? 'Antrean aktif' : 'Riwayat antrean'}</Text></View><Text className="font-inter text-xs text-[#D8F3DC]">{active.status === 'waiting' ? 'Menunggu' : active.status}</Text></View>
        <Text className="font-inter mt-4 text-center text-[41px] font-bold text-white">{active.code}</Text>
        <Text className="font-inter mt-2 text-center text-xl font-bold text-white">{active.service?.title ?? active.location}</Text>
        <View className="mb-3 mt-4 h-px bg-white/30" />
        <Text className="font-inter text-base font-semibold text-white">{formatSchedule(active.schedule_at)}</Text>
        <Text className="font-inter mt-3 text-sm text-white">{active.location}</Text>
        {active.status === 'waiting' ? <Text className="font-inter mt-3 text-sm text-[#D8F3DC]">{active.waiting_ahead ?? 0} orang di depan · estimasi {active.estimated_wait_minutes ?? 0} menit</Text> : null}
      </LinearGradient> : null}

      {token && !loading && !error && !active ? <View className="rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><Text className="font-inter text-lg font-bold text-[#1B4332]">Belum ada tiket antrean</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">Ambil tiket untuk layanan tatap muka, lalu tunjukkan kode saat tiba di lokasi.</Text></View> : null}

      {token && !loading ? <>
        {active?.status === 'waiting' ? <Pressable accessibilityRole="button" onPress={cancelActive} className="mt-4 min-h-12 items-center justify-center rounded-2xl border border-[#DCE9E0] px-4"><Text className="font-inter font-bold text-[#A12626]">Batalkan tiket</Text></Pressable> : <Pressable accessibilityRole="button" onPress={openCreate} className="mt-4"><LinearGradient colors={['#1B4332', '#276247']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 54, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 }}><Icon name="ticket" color="white" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-white">Ambil tiket antrean</Text></LinearGradient></Pressable>}
        {tickets.length > 1 ? <><Text className="font-inter mb-2 mt-5 text-lg font-bold text-[#1B4332]">Riwayat tiket</Text>{tickets.slice(1).map((ticket) => <View key={ticket.id} className="mb-2 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-[#D8F3DC]"><Icon name="ticket" size={20} /></View><View className="flex-1"><Text className="font-inter text-sm font-bold text-[#172B22]">{ticket.code} · {ticket.service?.title ?? ticket.location}</Text><Text className="font-inter mt-1 text-xs text-[#51665C]">{formatSchedule(ticket.schedule_at)} · {ticket.status}</Text></View></View>)}</> : null}
      </> : null}

      <View className="mt-4 flex-row rounded-2xl bg-[#ECF6EF] p-4"><Text className="font-inter mr-3 text-lg font-bold text-[#1B4332]">ⓘ</Text><View className="flex-1"><Text className="font-inter text-base font-bold text-[#1B4332]">Saat tiba di lokasi</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Tunjukkan nomor antrean ini di loket pendaftaran.</Text></View></View>
      <Pressable accessibilityRole="button" onPress={() => router.navigate({ pathname: '/layanan', params: { section: 'Kesehatan' } })} className="mt-4 min-h-14 flex-row items-center justify-center rounded-2xl border border-[#DCE9E0] px-4"><Icon name="health" size={21} /><Text className="font-inter ml-2 text-center text-base font-bold text-[#1B4332]">Lihat layanan kesehatan</Text></Pressable>
    </ScrollView>

    <Modal visible={creating} transparent animationType="slide" onRequestClose={() => setCreating(false)}><View className="flex-1 justify-end bg-black/40"><View className="max-h-[85%] rounded-t-[24px] bg-white p-5" style={{ paddingBottom: insets.bottom + 20 }}><ScrollView keyboardShouldPersistTaps="handled"><Text className="font-inter text-xl font-bold text-[#1B4332]">Ambil tiket antrean</Text><Text className={`${label} mt-4`}>Layanan</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">{services.map((service) => <Pressable key={service.id} accessibilityRole="button" accessibilityState={{ selected: serviceSlug === service.slug }} onPress={() => setServiceSlug(service.slug)} className={`mr-2 min-h-11 justify-center rounded-full border px-3 ${serviceSlug === service.slug ? 'border-[#1B4332] bg-[#1B4332]' : 'border-[#DCE9E0] bg-white'}`}><Text className={`font-inter text-sm font-semibold ${serviceSlug === service.slug ? 'text-white' : 'text-[#1B4332]'}`}>{service.title}</Text></Pressable>)}</ScrollView><Text className={label}>Lokasi kunjungan</Text><TextInput accessibilityLabel="Lokasi kunjungan" value={location} onChangeText={setLocation} placeholder="Contoh: Puskesmas Bojongsoang" placeholderTextColor="#51665C" className={input} />{error ? <Text accessibilityRole="alert" className="font-inter mt-3 text-sm text-[#A12626]">{error}</Text> : null}<Pressable accessibilityRole="button" disabled={busy} onPress={create} className="mt-4 min-h-12 items-center justify-center rounded-xl bg-[#1B4332]" style={{ opacity: busy ? 0.7 : 1 }}>{busy ? <ActivityIndicator color="white" /> : <Text className="font-inter font-bold text-white">Ambil tiket sekarang</Text>}</Pressable><Pressable accessibilityRole="button" onPress={() => setCreating(false)} className="mt-3 min-h-11 items-center justify-center"><Text className="font-inter font-bold text-[#1B4332]">Batal</Text></Pressable></ScrollView></View></View></Modal>
  </View>;
}
