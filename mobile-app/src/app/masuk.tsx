import { useState } from 'react';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../components/ui/icon';
import { useAuth } from '../lib/auth';
import { ApiError } from '../lib/api';

const input = 'font-inter min-h-12 rounded-xl border border-[#74C69D] bg-white px-3 py-2 text-base text-[#172B22]';
const label = 'font-inter mb-2 text-sm font-bold text-[#1B4332]';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [nik, setNik] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Kab. Bandung');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError('');
    if (mode === 'login' && (!identifier.trim() || !password)) {
      setError('Isi NIK/nomor telepon dan kata sandi.');
      return;
    }
    if (mode === 'register') {
      if (nik.trim().length !== 16 || !/^\d+$/.test(nik.trim())) {
        setError('NIK harus 16 digit angka.');
        return;
      }
      if (fullName.trim().length < 3) {
        setError('Nama lengkap minimal 3 karakter.');
        return;
      }
      if (phone.trim().length < 9) {
        setError('Nomor telepon minimal 9 karakter.');
        return;
      }
      if (password.length < 8) {
        setError('Kata sandi minimal 8 karakter.');
        return;
      }
    }
    setBusy(true);
    try {
      if (mode === 'login') await login(identifier, password);
      else await register({ nik: nik.trim(), full_name: fullName.trim(), phone: phone.trim(), password, city: city.trim() });
      router.replace('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Tidak dapat masuk. Coba lagi.');
    } finally {
      setBusy(false);
    }
  }

  return <KeyboardAvoidingView className="flex-1 bg-white" behavior="padding">
    <StatusBar barStyle="dark-content" />
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.replace('/')} className="mb-5 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable>
      <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 20, padding: 18 }}>
        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-[#D8F3DC]"><Icon name="id" /></View>
        <Text className="font-inter mt-3 text-2xl font-bold text-white">Masuk ke JABARIN</Text>
        <Text className="font-inter mt-2 text-base leading-6 text-[#D8F3DC]">Gunakan akun warga untuk mengajukan layanan, mengambil antrean, dan mengirim laporan.</Text>
      </LinearGradient>

      <View className="mb-4 mt-5 flex-row rounded-2xl bg-[#ECF6EF] p-1">
        {(['login', 'register'] as const).map((item) => <Pressable key={item} accessibilityRole="button" accessibilityState={{ selected: mode === item }} onPress={() => { setMode(item); setError(''); }} className={`min-h-11 flex-1 items-center justify-center rounded-xl ${mode === item ? 'bg-white' : ''}`}><Text className={`font-inter text-sm font-bold ${mode === item ? 'text-[#1B4332]' : 'text-[#51665C]'}`}>{item === 'login' ? 'Masuk' : 'Daftar'}</Text></Pressable>)}
      </View>

      <View className="rounded-[20px] border border-[#DCE9E0] bg-white p-3">
        {mode === 'login' ? <>
          <Text className={label}>NIK atau nomor telepon</Text>
          <TextInput accessibilityLabel="NIK atau nomor telepon" value={identifier} onChangeText={setIdentifier} keyboardType="default" autoCapitalize="none" placeholder="3204xxxxxxxxxxxx atau 08xxxxxxxxxx" placeholderTextColor="#51665C" className={input} />
        </> : <>
          <Text className={label}>NIK</Text>
          <TextInput accessibilityLabel="NIK" value={nik} onChangeText={setNik} keyboardType="number-pad" maxLength={16} placeholder="16 digit NIK" placeholderTextColor="#51665C" className={input} />
          <Text className={`${label} mt-4`}>Nama lengkap</Text>
          <TextInput accessibilityLabel="Nama lengkap" value={fullName} onChangeText={setFullName} placeholder="Nama sesuai KTP" placeholderTextColor="#51665C" className={input} />
          <Text className={`${label} mt-4`}>Nomor telepon</Text>
          <TextInput accessibilityLabel="Nomor telepon" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="08xxxxxxxxxx" placeholderTextColor="#51665C" className={input} />
          <Text className={`${label} mt-4`}>Kabupaten/kota</Text>
          <TextInput accessibilityLabel="Kabupaten atau kota" value={city} onChangeText={setCity} placeholder="Kab. Bandung" placeholderTextColor="#51665C" className={input} />
        </>}
        <Text className={`${label} mt-4`}>Kata sandi</Text>
        <TextInput accessibilityLabel="Kata sandi" value={password} onChangeText={setPassword} secureTextEntry placeholder={mode === 'login' ? 'Kata sandi akun' : 'Minimal 8 karakter'} placeholderTextColor="#51665C" className={input} />
        {error ? <Text accessibilityRole="alert" className="font-inter mt-3 text-sm text-[#A12626]">{error}</Text> : null}
        <Pressable accessibilityRole="button" disabled={busy} onPress={submit} className="mt-4" style={{ opacity: busy ? 0.7 : 1 }}>
          <LinearGradient colors={['#1B4332', '#276247']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 54, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
            {busy ? <ActivityIndicator color="white" /> : <><Icon name="arrow" color="white" size={20} /><Text className="font-inter ml-2 text-center text-base font-bold text-white">{mode === 'login' ? 'Masuk' : 'Daftar & masuk'}</Text></>}
          </LinearGradient>
        </Pressable>
      </View>
      <Text className="font-inter mt-4 text-center text-xs leading-5 text-[#51665C]">Data dikirim ke layanan JABARIN. Jangan bagikan kata sandi atau kode OTP kepada siapa pun.</Text>
    </ScrollView>
  </KeyboardAvoidingView>;
}
