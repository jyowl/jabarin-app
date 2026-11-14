import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SectionPlaceholder({ title }: { title: string }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-[#F5FAF6] px-5"
      style={{ paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }}
    >
      <Text className="text-2xl font-bold text-[#183D2E]">{title}</Text>
      <Text className="mt-3 text-base text-[#6D8276]">
        Fitur ini belum tersedia.
      </Text>
    </View>
  );
}
