import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from './ui/icon';
import { useContext } from 'react';
import { TextSizeContext } from './home/text-size';

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

const tabs: { title: TabName; icon: IconName }[] = [
  { title: 'Beranda', icon: 'home' },
  { title: 'Layanan', icon: 'grid' },
  { title: 'Lapor!', icon: 'report' },
  { title: 'Antrean', icon: 'ticket' },
  { title: 'IKD', icon: 'id' },
];

export function BottomNav({
  active,
  onSelect,
  bottomInset,
}: BottomNavProps) {
  const { largeText } = useContext(TextSizeContext);
  return (
    <View className="bg-white px-3 pt-1" style={{ paddingBottom: Math.max(bottomInset, 12) }}>
      <View
        className="flex-row justify-around rounded-[20px] border border-[#DCE9E0] bg-white p-[5px]"
        style={{
          shadowColor: '#1B4332',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
      {tabs.map((tab) => {
        const selected = active === tab.title;

        return (
          <Pressable
            key={tab.title}
            onPress={() => onSelect(tab.title)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={`min-h-[58px] w-[19%] items-center justify-center rounded-[14px] ${
              selected ? 'bg-[#D9F2DF]' : 'bg-white'
            }`}
          >
            <Icon name={tab.icon} size={22} color={tab.title === 'Lapor!' ? '#A6565A' : '#508267'} />
            <Text
              style={largeText && { fontSize: 14 }}
              className={`font-inter mt-[2px] text-center text-[10px] font-semibold ${
                selected ? 'text-[#183D2E]' : 'text-[#51665C]'
              }`}
            >
              {tab.title === 'IKD' ? 'Profil IKD' : tab.title}
            </Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}
