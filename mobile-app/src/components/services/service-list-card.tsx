import { Pressable, Text, View } from 'react-native';
import type { PublicService } from '../../../data/services';

type Props = { service: PublicService; largeText: boolean; onApply: () => void };

export function ServiceListCard({ service, largeText, onApply }: Props) {
  return (
    <View className="mb-4 rounded-[22px] border border-brand-beige bg-white p-5">
      <View className="flex-row items-start">
        <View className="mr-4 h-14 w-14 items-center justify-center rounded-2xl bg-brand-beige">
          <Text className="font-inter text-2xl" accessibilityElementsHidden>{service.icon}</Text>
        </View>
        <View className="flex-1">
          <View className="self-start rounded-md bg-brand-beige px-2 py-1">
            <Text className="font-inter font-bold uppercase text-brand-green" style={{ fontSize: largeText ? 14 : 12 }}>{service.category}</Text>
          </View>
          <Text className="font-inter mt-2 font-bold text-brand-green" style={{ fontSize: largeText ? 22 : 18 }}>{service.title}</Text>
        </View>
      </View>
      <View className="my-4 h-px bg-brand-beige" />
      <Text className="font-inter mb-3 leading-5 text-[#51665C]" style={{ fontSize: largeText ? 17 : 14 }}>{service.description}</Text>
      <View className="mb-3 flex-row flex-wrap">
        <Text className="font-inter mr-1 text-brand-green" style={{ fontSize: largeText ? 18 : 14 }}>⏱ Selesai {service.duration} •</Text>
        <Text className="font-inter font-bold text-brand-green" style={{ fontSize: largeText ? 18 : 14 }}>💳 {service.fee}</Text>
      </View>
      <Pressable onPress={onApply} accessibilityRole="button" accessibilityLabel={`Ajukan ${service.title}`} className="min-h-11 self-start justify-center rounded-2xl bg-brand-green px-4 py-2">
        <Text className="font-inter font-bold text-white" style={{ fontSize: largeText ? 19 : 16 }}>Ajukan Sekarang</Text>
      </Pressable>
    </View>
  );
}
