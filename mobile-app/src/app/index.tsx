import { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomNav, TabName } from '../components/bottom-nav';
import { ServiceCard } from '../components/service-card';

const services: {
  icon: string;
  title: string;
  tab: TabName;
}[] = [
  { icon: '🪪', title: 'Dukcapil', tab: 'Layanan' },
  { icon: '🏥', title: 'Kesehatan', tab: 'Layanan' },
  { icon: '🏛️', title: 'Pajak PBB', tab: 'Layanan' },
  { icon: '📣', title: 'Lapor!', tab: 'Lapor!' },
  { icon: '📄', title: 'Izin NIB', tab: 'Layanan' },
  { icon: '🎟️', title: 'Antrean', tab: 'Antrean' },
  { icon: '🤝', title: 'Bansos', tab: 'Layanan' },
  { icon: '🔐', title: 'Profil IKD', tab: 'IKD' },
];

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 items-center">
      <Text className="text-[10px] text-[#899BAE]">{label}</Text>
      <Text className="mt-[2px] text-[11px] font-bold text-[#194B38]">
        {value}
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabName>('Beranda');
  const [query, setQuery] = useState('');

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        service.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <View className="flex-1 bg-[#F5FAF6]">
      <StatusBar barStyle="light-content"/>

      {activeTab === 'Beranda' ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
        >
          <View className="pb-3">
            {/* Header */}
            <View
              className="rounded-b-[24px] bg-[#28694F] px-[18px] pb-8"
              style={{ paddingTop: insets.top + 18 }}
            >
              <View className="mb-[13px] flex-row items-center justify-between">
                <Text className="text-[11px] font-semibold text-[#E5F4E8]">
                  ◈  satuwarga
                </Text>

                <Pressable
                  onPress={() => setActiveTab('IKD')}
                  className="rounded-full bg-[#598F76] px-[11px] py-[5px]"
                >
                  <Text className="text-[10px] font-semibold text-white">
                    ✓ IKD Aktif
                  </Text>
                </Pressable>
              </View>

              <Text className="mb-3 text-[15px] font-bold text-white">
                Halo, Budi Santoso
              </Text>

              <View className="h-[34px] flex-row items-center rounded-xl bg-white pl-[11px] pr-[5px]">
                <Text className="mr-[5px] text-[22px] text-[#59697C]">
                  ⌕
                </Text>

                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Cari e-KTP, PBB, Puskesmas..."
                  placeholderTextColor="#8799AF"
                  className="h-full flex-1 text-[11px] text-[#183D2E]"
                />

                <Pressable className="rounded-[5px] bg-[#3B9470] px-[10px] py-[5px]">
                  <Text className="text-[10px] font-bold text-white">
                    Cari
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Ringkasan */}
            <View className="-mt-4 mx-[15px] h-[50px] flex-row items-center rounded-xl border border-[#D6EAD9] bg-white">
              <SummaryItem label="Berkas" value="2 Proses" />
              <View className="h-7 w-px bg-[#D6EAD9]" />
              <SummaryItem label="Antrean" value="A-042" />
              <View className="h-7 w-px bg-[#D6EAD9]" />
              <SummaryItem label="Lapor" value="3 Aduan" />
            </View>

            <View className="px-[15px]">
              {/* Banner */}
              <View className="mt-[14px] overflow-hidden rounded-[11px] border border-[#75BE91] bg-white">
                <Image
                  source={require('../../assets/images/banner-jabarin.png')}
                  resizeMode="cover"
                  className="h-[98px] w-full"
                />

                <View className="h-[35px] flex-row items-center justify-between px-[9px]">
                  <Text className="flex-1 text-[10px] font-bold text-[#183D2E]">
                    Urus Dokumen & Pajak 100% Daring
                  </Text>

                  <Pressable
                    onPress={() => setActiveTab('Layanan')}
                    className="rounded bg-[#3B9470] px-2 py-1"
                  >
                    <Text className="text-[10px] font-bold text-white">
                      Buka
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* Judul kategori */}
              <View className="mb-2 mt-[13px] flex-row items-center justify-between">
                <Text className="text-[11px] font-bold text-[#183D2E]">
                  Kategori Layanan Utama
                </Text>
                <Text className="text-[9px] text-[#3C9972]">
                  4×2 Grid • 10px Gap
                </Text>
              </View>

              {/* Kartu layanan */}
              <View className="flex-row flex-wrap justify-between">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service.title}
                    icon={service.icon}
                    title={service.title}
                    onPress={() => setActiveTab(service.tab)}
                  />
                ))}
              </View>

              {/* Status berkas */}
              <View className="mt-1 min-h-[62px] flex-row items-center justify-between rounded-[11px] border border-[#D6EAD9] bg-white px-[10px]">
                <View className="flex-1">
                  <Text className="text-[9px] font-bold text-[#388F6B]">
                    REG-2026-8841 • Diverifikasi
                  </Text>
                  <Text className="mt-[5px] text-[10px] font-bold text-[#183D2E]">
                    Surat Keterangan Pindah & Domisili
                  </Text>
                </View>

                <Pressable
                  onPress={() => setActiveTab('Layanan')}
                  className="ml-2 rounded-lg bg-[#D9F2DF] px-[9px] py-[6px]"
                >
                  <Text className="text-[10px] font-bold text-[#194B38]">
                    Lacak
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View
          className="flex-1 items-center bg-[#F5FAF6] px-6"
          style={{ paddingTop: insets.top + 24 }}
        >
          <Text className="text-[22px] font-bold text-[#194B38]">
            {activeTab}
          </Text>
          <Text className="mt-2 text-center text-[#6D8276]">
            Konten halaman {activeTab} bisa dibuat berikutnya.
          </Text>
        </View>
      )}

      <BottomNav
        active={activeTab}
        onSelect={setActiveTab}
        bottomInset={insets.bottom}
      />
    </View>
  );
}