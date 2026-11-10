import { useState } from 'react';
import { Link } from 'expo-router';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ServiceCard } from '../components/service-card';

const services = [
  {
    icon: '🪪',
    title: 'Dukcapil',
    description: 'Informasi layanan KTP, Kartu Keluarga, dan akta.',
  },
  {
    icon: '🏥',
    title: 'Kesehatan',
    description: 'Informasi puskesmas dan layanan kesehatan.',
  },
  {
    icon: '🏛️',
    title: 'Pajak PBB',
    description: 'Informasi Pajak Bumi dan Bangunan.',
  },
  {
    icon: '📣',
    title: 'Lapor!',
    description: 'Informasi pengaduan dan aspirasi masyarakat.',
  },
  {
    icon: '📄',
    title: 'Izin NIB',
    description: 'Informasi Nomor Induk Berusaha.',
  },
  {
    icon: '🎟️',
    title: 'Antrean',
    description: 'Informasi antrean pelayanan publik.',
  },
  {
    icon: '🤝',
    title: 'Bansos',
    description: 'Informasi program bantuan sosial.',
  },
  {
    icon: '🔐',
    title: 'Profil IKD',
    description: 'Informasi Identitas Kependudukan Digital.',
  },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View className="flex-1 bg-[#F5FAF6]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="rounded-b-[24px] bg-[#28694F] px-5 pb-6"
          style={{ paddingTop: insets.top + 16 }}
        >
          <Link href="/" asChild>
            <Pressable
              accessibilityRole="button"
              className="mb-5 self-start rounded-lg bg-[#598F76] px-3 py-2"
            >
              <Text className="text-xs font-semibold text-white">
                ‹ Beranda
              </Text>
            </Pressable>
          </Link>

          <Text className="text-2xl font-bold text-white">
            Layanan Publik
          </Text>

          <Text className="mb-5 mt-2 text-xs leading-5 text-[#D9F2DF]">
            Temukan layanan yang kamu butuhkan.
          </Text>

          <View className="h-11 flex-row items-center rounded-xl bg-white px-3">
            <Text className="mr-2 text-lg">🔎</Text>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari layanan..."
              placeholderTextColor="#8799AF"
              autoCapitalize="none"
              returnKeyType="search"
              className="h-full flex-1 text-sm text-[#183D2E]"
            />

            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery('')}
                accessibilityLabel="Hapus pencarian"
                className="ml-2 p-2"
              >
                <Text className="text-base text-[#6D8276]">×</Text>
              </Pressable>
            )}
          </View>
        </View>

        <View
          className="px-[15px] pt-5"
          style={{ paddingBottom: insets.bottom + 24 }}
        >
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-sm font-bold text-[#183D2E]">
              Semua Layanan
            </Text>

            <Text className="text-xs text-[#388F6B]">
              {filteredServices.length} layanan
            </Text>
          </View>

          <View className="flex-row flex-wrap justify-between">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.title}
                icon={service.icon}
                title={service.title}
                onPress={() =>
                  Alert.alert(service.title, service.description)
                }
              />
            ))}
          </View>

          {filteredServices.length === 0 && (
            <View className="items-center rounded-xl border border-[#D6EAD9] bg-white px-5 py-10">
              <Text className="text-sm font-semibold text-[#183D2E]">
                Layanan tidak ditemukan
              </Text>

              <Text className="mt-2 text-center text-xs text-[#6D8276]">
                Coba cari dengan kata kunci lain.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}