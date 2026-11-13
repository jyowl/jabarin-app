import { useState } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../components/ui/icon';
import { exampleQuestion, exampleTime, hasExampleAnswer } from '../components/assistant/example';

const suggestions: { label: string; question: string; icon: IconName }[] = [
  { label: 'Cek status BPJS', question: exampleQuestion, icon: 'health' },
  { label: 'Cara lapor jalan', question: 'Bagaimana cara melaporkan jalan rusak?', icon: 'road' },
  { label: 'Pantau laporan', question: 'Bagaimana cara memantau laporan?', icon: 'list' },
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [unavailable, setUnavailable] = useState(false);
  const [example, setExample] = useState<{ text: string; sentAt: Date } | string | null>(null);
  const send = () => {
    if (!question.trim()) return;
    if (!hasExampleAnswer(question)) { setUnavailable(true); return; }
    setExample({ text: question.trim(), sentAt: new Date() });
    setQuestion('');
    setUnavailable(false);
    Keyboard.dismiss();
  };
  const choose = (value: string) => { setQuestion(value); setUnavailable(false); };

  return <KeyboardAvoidingView className="flex-1 bg-white" behavior="padding" style={{ paddingTop: insets.top }}>
    <StatusBar barStyle="dark-content" />
    <View className="flex-row items-center px-[18px] py-4"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.navigate('/')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Asisten JABARIN</Text></View>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      {example ? <>
        <Text className="font-inter mt-2 self-center overflow-hidden rounded-full bg-[#ECF6EF] px-3 py-1 text-xs font-semibold text-[#51665C]">{typeof example === 'string' ? 'Contoh percakapan' : exampleTime(example.sentAt)}</Text>
        <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-end', maxWidth: '80%', borderRadius: 18, padding: 15, marginTop: 16 }}><Text className="font-inter text-base font-semibold leading-6 text-white">{typeof example === 'string' ? example : example.text}</Text></LinearGradient>
        <View className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4">
          <LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}><Icon name="sparkle" size={16} /><Text className="font-inter ml-1 text-xs font-bold text-[#1B4332]">Contoh · Disusun AI</Text></LinearGradient>
          <Text className="font-inter mt-3 text-xl font-bold text-[#1B4332]">Cek status kepesertaan JKN</Text>
          <Text className="font-inter mt-3 text-base leading-6 text-[#172B22]">Buka Mobile JKN, masuk ke akun, lalu pilih Info Peserta. Anda juga bisa menghubungi Care Center 165 untuk mengecek status.</Text>
          <View className="my-3 h-px bg-[#DCE9E0]" />
          <Text className="font-inter text-sm font-semibold text-[#51665C]">Contoh sumber · BPJS Kesehatan</Text>
          <Pressable accessibilityRole="button" onPress={() => router.navigate('/dasar-jawaban')} className="mt-3"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 12 }}><Text className="font-inter text-center text-base font-bold text-[#1B4332]">ⓘ  Mengapa jawaban ini?</Text></LinearGradient></Pressable>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.navigate({ pathname: '/layanan', params: { section: 'Kesehatan' } })} className="mt-4 min-h-16 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Icon name="health" size={21} /></LinearGradient><View className="mx-3 flex-1"><Text className="font-inter text-base font-bold text-[#172B22]">Lihat layanan BPJS</Text><Text className="font-inter mt-1 text-sm text-[#51665C]">Buka informasi dan kanal resmi</Text></View><Icon name="right" size={20} /></Pressable>
        <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 16, padding: 16 }}><Text className="font-inter text-sm font-bold text-[#1B4332]">Asisten memakai panduan layanan</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Jaga kerahasiaan NIK, kata sandi, dan kode OTP Anda.</Text></LinearGradient>
      </> : <>
      <View className="mt-8 items-center">
        <View className="h-28 w-28 items-center justify-center rounded-full bg-[#ECF6EF]"><Image source={require('../../assets/images/icons/ai.svg')} style={{ width: 106, height: 103 }} contentFit="contain" accessibilityElementsHidden /></View>
        <Text className="font-inter mt-4 text-center text-[27px] font-bold text-[#1B4332]">Ada yang bisa dibantu?</Text>
        <Text className="font-inter mt-3 text-center text-base leading-6 text-[#51665C]">Tanya soal layanan pemerintah atau cara melapor. Anda bisa melihat alasan di balik saran saya.</Text>
        <Text className="font-inter mt-2 text-center text-sm text-[#51665C]">Pratinjau · Asisten AI belum terhubung</Text>
        <View className="mt-5 flex-row flex-wrap justify-center gap-2">{suggestions.map((item) => <Pressable key={item.label} accessibilityRole="button" onPress={() => choose(item.question)} className="min-h-11 flex-row items-center rounded-full border border-[#DCE9E0] px-3"><Icon name={item.icon} size={18} /><Text className="font-inter ml-2 text-sm font-semibold text-[#1B4332]">{item.label}</Text></Pressable>)}</View>
      </View>
      <Text className="font-inter mb-4 mt-12 text-xl font-bold text-[#1B4332]">Yang bisa Anda tanyakan</Text>
      {[
        { ...suggestions[0], description: 'Lihat langkah dan kanal resmi' },
        { ...suggestions[1], icon: 'report' as const, question: 'Bagaimana cara melapor?', description: 'Mulai dari kategori dan lokasi kejadian' },
      ].map((item) => <Pressable key={item.question} accessibilityRole="button" onPress={() => choose(item.question)} className="mb-3 min-h-16 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={21} /></LinearGradient><View className="mx-3 flex-1"><Text className="font-inter text-base font-bold text-[#172B22]">{item.question}</Text><Text className="font-inter mt-1 text-sm text-[#51665C]">{item.description}</Text></View><Icon name="right" size={20} /></Pressable>)}
      </>}
    </ScrollView>
    <View className="px-[18px] pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      {unavailable && <Text accessibilityRole="alert" className="font-inter mb-2 text-sm text-[#51665C]">Asisten belum terhubung. Pertanyaan Anda belum dikirim.</Text>}
      <View className="min-h-16 flex-row items-center rounded-2xl border border-[#DCE9E0] bg-white p-2" style={{ shadowColor: '#1B4332', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}><TextInput accessibilityLabel="Pertanyaan untuk Asisten JABARIN" value={question} onChangeText={(value) => { setQuestion(value); setUnavailable(false); }} placeholder="Ketik pertanyaan Anda..." placeholderTextColor="#51665C" multiline className="font-inter max-h-28 min-h-11 flex-1 px-2 text-base text-[#172B22]" /><Pressable accessibilityRole="button" accessibilityLabel="Kirim pertanyaan" accessibilityState={{ disabled: !question.trim() }} disabled={!question.trim()} onPress={send} className="h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4332]"><Icon name="send" color="white" size={22} /></Pressable></View>
    </View>
  </KeyboardAvoidingView>;
}
