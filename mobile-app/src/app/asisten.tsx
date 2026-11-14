import { useEffect, useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Pressable, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../components/ui/icon';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/auth';

type Bubble = { id: string; role: 'user' | 'model'; content: string; degraded?: boolean };

const fallbackSuggestions: { label: string; question: string; icon: IconName }[] = [
  { label: 'Syarat e-KTP', question: 'Syarat perpanjang e-KTP yang rusak apa saja?', icon: 'id' },
  { label: 'Cara lapor jalan', question: 'Bagaimana cara melaporkan jalan rusak?', icon: 'road' },
  { label: 'Aktivasi IKD', question: 'Cara aktivasi IKD dan manfaatnya?', icon: 'health' },
];

export default function AssistantScreen() {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Bubble[]>([]);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState(fallbackSuggestions);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [ready, setReady] = useState<boolean | null>(null);

  useEffect(() => {
    if (!token) return;
    api.chatSuggestions()
      .then((data) => setSuggestions(data.suggestions.slice(0, 3).map((text, index) => ({ label: text.length > 26 ? `${text.slice(0, 24)}…` : text, question: text, icon: fallbackSuggestions[index % fallbackSuggestions.length].icon }))))
      .then(() => setReady(true))
      .catch(() => setReady(false));
  }, [token]);

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages, sending]);

  async function send(value?: string) {
    const text = (value ?? question).trim();
    if (!text || sending) return;
    if (!token) {
      router.navigate('/masuk');
      return;
    }
    setQuestion('');
    setError('');
    setSending(true);
    Keyboard.dismiss();
    const userBubble: Bubble = { id: `user-${Date.now()}`, role: 'user', content: text };
    setMessages((current) => [...current, userBubble]);
    try {
      const response = await api.chat(text, sessionId);
      setSessionId(response.session_id);
      setReady(!response.degraded);
      setMessages((current) => [...current, { id: response.reply.id, role: 'model', content: response.reply.content, degraded: response.degraded }]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Pesan gagal dikirim.');
    } finally {
      setSending(false);
    }
  }

  const lastAnswer = [...messages].reverse().find((message) => message.role === 'model');
  const lastQuestion = [...messages].reverse().find((message) => message.role === 'user');

  return <KeyboardAvoidingView className="flex-1 bg-white" behavior="padding" style={{ paddingTop: insets.top }}>
    <StatusBar barStyle="dark-content" />
    <View className="flex-row items-center px-[18px] py-4"><Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={() => router.navigate('/')} className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#ECF6EF]"><Icon name="left" /></Pressable><Text className="font-inter flex-1 text-2xl font-bold text-[#1B4332]">Asisten JABARIN</Text><View className={`rounded-full px-3 py-1 ${ready ? 'bg-[#D8F3DC]' : 'bg-[#FFF1D2]'}`}><Text className={`font-inter text-xs font-bold ${ready ? 'text-[#1B4332]' : 'text-[#6F4C0A]'}`}>{ready === null ? 'Menghubungkan' : ready ? 'AI siap' : 'Mode panduan'}</Text></View></View>
    <ScrollView ref={scrollRef} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 24 }}>
      {!token ? <View className="mt-6 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4"><Text className="font-inter text-lg font-bold text-[#1B4332]">Masuk untuk bertanya</Text><Text className="font-inter mt-2 text-sm leading-5 text-[#51665C]">Asisten AI memakai konteks akun Anda agar jawaban lebih relevan.</Text><Pressable accessibilityRole="button" onPress={() => router.navigate('/masuk')} className="mt-3 min-h-12 items-center justify-center rounded-xl bg-[#1B4332]"><Text className="font-inter font-bold text-white">Masuk atau daftar</Text></Pressable></View> : null}

      {messages.length === 0 ? <>
        <View className="mt-8 items-center">
          <View className="h-28 w-28 items-center justify-center rounded-full bg-[#ECF6EF]"><Image source={require('../../assets/images/icons/ai.svg')} style={{ width: 106, height: 103 }} contentFit="contain" accessibilityElementsHidden /></View>
          <Text className="font-inter mt-4 text-center text-[27px] font-bold text-[#1B4332]">Ada yang bisa dibantu?</Text>
          <Text className="font-inter mt-3 text-center text-base leading-6 text-[#51665C]">Tanya soal layanan pemerintah atau cara melapor.</Text>
          <View className="mt-5 flex-row flex-wrap justify-center gap-2">{suggestions.map((item) => <Pressable key={item.label} accessibilityRole="button" onPress={() => setQuestion(item.question)} className="min-h-11 flex-row items-center rounded-full border border-[#DCE9E0] px-3"><Icon name={item.icon} size={18} /><Text className="font-inter ml-2 text-sm font-semibold text-[#1B4332]">{item.label}</Text></Pressable>)}</View>
        </View>
        <Text className="font-inter mb-4 mt-12 text-xl font-bold text-[#1B4332]">Yang bisa Anda tanyakan</Text>
        {suggestions.slice(0, 2).map((item) => <Pressable key={item.question} accessibilityRole="button" onPress={() => { setQuestion(item.question); void send(item.question); }} className="mb-3 min-h-16 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}><Icon name={item.icon} size={21} /></LinearGradient><View className="mx-3 flex-1"><Text className="font-inter text-base font-bold text-[#172B22]">{item.question}</Text><Text className="font-inter mt-1 text-sm text-[#51665C]">Jawaban dari Asisten JABARIN</Text></View><Icon name="right" size={20} /></Pressable>)}
      </> : <>
        {messages.map((message) => message.role === 'user'
          ? <LinearGradient key={message.id} colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-end', maxWidth: '85%', borderRadius: 18, padding: 15, marginTop: 16 }}><Text className="font-inter text-base font-semibold leading-6 text-white">{message.content}</Text></LinearGradient>
          : <View key={message.id} className="mt-4 rounded-[20px] border border-[#DCE9E0] bg-[#F6F9F7] p-4">
            <LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}><Icon name="sparkle" size={16} /><Text className="font-inter ml-1 text-xs font-bold text-[#1B4332]">{message.degraded ? 'Panduan · AI belum aktif' : 'Disusun AI'}</Text></LinearGradient>
            <Text className="font-inter mt-3 text-base leading-6 text-[#172B22]">{message.content}</Text>
            <View className="my-3 h-px bg-[#DCE9E0]" />
            <Text className="font-inter text-sm font-semibold text-[#51665C]">Sumber: Asisten JABARIN · Gemini</Text>
            {message.id === lastAnswer?.id ? <Pressable accessibilityRole="button" onPress={() => router.navigate({ pathname: '/dasar-jawaban', params: { question: lastQuestion?.content ?? '', answer: message.content, degraded: message.degraded ? '1' : '0' } })} className="mt-3"><LinearGradient colors={['#C7E9D0', '#E7F7EA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', padding: 12 }}><Text className="font-inter text-center text-base font-bold text-[#1B4332]">ⓘ  Mengapa jawaban ini?</Text></LinearGradient></Pressable> : null}
          </View>)}
        {sending ? <View className="mt-4 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3"><ActivityIndicator color="#1B4332" /><Text className="font-inter ml-2 text-sm text-[#51665C]">Asisten sedang menyusun jawaban…</Text></View> : null}
        {error ? <Text accessibilityRole="alert" className="font-inter mt-3 text-sm text-[#A12626]">{error}</Text> : null}
        <LinearGradient colors={['#E4F2E8', '#F3FAF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ marginTop: 16, borderRadius: 16, padding: 16 }}><Text className="font-inter text-sm font-bold text-[#1B4332]">Asisten memakai panduan layanan</Text><Text className="font-inter mt-1 text-sm leading-5 text-[#51665C]">Jaga kerahasiaan NIK, kata sandi, dan kode OTP Anda.</Text></LinearGradient>
      </>}
    </ScrollView>
    <View className="px-[18px] pt-2" style={{ paddingBottom: insets.bottom + 16 }}>
      <View className="min-h-16 flex-row items-center rounded-2xl border border-[#DCE9E0] bg-white p-2" style={{ shadowColor: '#1B4332', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 3 }}><TextInput accessibilityLabel="Pertanyaan untuk Asisten JABARIN" value={question} onChangeText={setQuestion} placeholder="Ketik pertanyaan Anda..." placeholderTextColor="#51665C" multiline className="font-inter max-h-28 min-h-11 flex-1 px-2 text-base text-[#172B22]" /><Pressable accessibilityRole="button" accessibilityLabel="Kirim pertanyaan" accessibilityState={{ disabled: !question.trim() || sending }} disabled={!question.trim() || sending} onPress={() => void send()} className="h-12 w-12 items-center justify-center rounded-2xl bg-[#1B4332]" style={{ opacity: !question.trim() || sending ? 0.6 : 1 }}>{sending ? <ActivityIndicator color="white" size="small" /> : <Icon name="send" color="white" size={22} />}</Pressable></View>
    </View>
  </KeyboardAvoidingView>;
}
