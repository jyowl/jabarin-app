import { Pressable, Text, View } from 'react-native';

export type TabName =
  | 'Beranda'
  | 'Layanan'
  | 'Lapor!'
  | 'Antrean'
  | 'IKD';

type BottomNavProps = {
  active: TabName;
  onSelect: (tab: TabName) => void;
  bottomInset: number;
};

const tabs: { title: TabName; icon: string }[] = [
  { title: 'Beranda', icon: '🏠' },
  { title: 'Layanan', icon: '🗂️' },
  { title: 'Lapor!', icon: '📣' },
  { title: 'Antrean', icon: '🎟️' },
  { title: 'IKD', icon: '🪪' },
];

export function BottomNav({
  active,
  onSelect,
  bottomInset,
}: BottomNavProps) {
  return (
    <View
      className="flex-row justify-around border-t border-[#D6EAD9] bg-white px-[7px] pt-[6px]"
      style={{ paddingBottom: Math.max(bottomInset, 7) }}
    >
      {tabs.map((tab) => {
        const selected = active === tab.title;

        return (
          <Pressable
            key={tab.title}
            onPress={() => onSelect(tab.title)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={`h-9 w-[19%] items-center justify-center rounded-[9px] ${
              selected ? 'bg-[#D9F2DF]' : 'bg-white'
            }`}
          >
            <Text className="text-xs">{tab.icon}</Text>
            <Text
              className={`mt-[2px] text-[9px] font-semibold ${
                selected ? 'text-[#183D2E]' : 'text-[#8494A8]'
              }`}
            >
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}