import { Linking, Pressable, Text, View } from 'react-native';
import type { ReportItem } from './public-reports';

export function ReportMap(_props: { reports: readonly ReportItem[]; onSelect: (id: string) => void }) {
  return <View className="h-[320px] items-center justify-center bg-[#ECF6EF] p-5"><Text className="font-inter text-center text-base text-[#51665C]">Peta interaktif tersedia di aplikasi seluler.</Text><Pressable accessibilityRole="link" onPress={() => { void Linking.openURL('https://www.openstreetmap.org/#map=11/-6.99/107.65'); }} className="mt-3 min-h-11 justify-center"><Text className="font-inter text-center font-bold text-[#1B4332]">Buka peta wilayah Bandung</Text></Pressable></View>;
}
