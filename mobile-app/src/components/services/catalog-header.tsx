import { Pressable, Text, TextInput, View } from 'react-native';

type Props = {
  query: string;
  onChangeQuery: (value: string) => void;
  largeText: boolean;
  onToggleTextSize: () => void;
};

export function CatalogHeader({ query, onChangeQuery, largeText, onToggleTextSize }: Props) {
  return (
    <View className="rounded-[24px] bg-brand-green p-5">
      <View className="flex-row items-start justify-between">
        <Text className="font-inter flex-1 pr-2 font-bold text-white" style={{ fontSize: largeText ? 26 : 22 }}>
          Katalog Layanan & e-Dokumen
        </Text>
        <Pressable onPress={onToggleTextSize} accessibilityRole="button" accessibilityLabel="Perbesar ukuran teks" accessibilityState={{ selected: largeText }} className="min-h-11 min-w-11 items-center justify-center rounded-xl bg-brand-beige">
          <Text className="font-inter font-bold text-brand-green">{largeText ? 'A−' : 'A+'}</Text>
        </Pressable>
      </View>
      <Text className="font-inter mt-2 leading-6 text-brand-beige" style={{ fontSize: largeText ? 19 : 16 }}>
        Pilih layanan administrasi kependudukan, kesehatan, atau perizinan tanpa perlu datang ke loket.
      </Text>
      <TextInput value={query} onChangeText={onChangeQuery} accessibilityLabel="Cari nama layanan" placeholder="Ketik nama layanan (misal: KK, Domisili, PBB)..." placeholderTextColor="#53665C" autoCapitalize="none" returnKeyType="search" className="font-inter mt-4 min-h-[48px] rounded-2xl bg-white px-4 py-3 text-brand-green" style={{ fontSize: largeText ? 18 : 15 }} />
    </View>
  );
}
