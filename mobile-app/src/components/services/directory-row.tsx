import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Icon, type IconName } from '../ui/icon';

export function DirectoryRow({ title, description, icon, homeIcon, onPress }: { title: string; description: string; icon: IconName; homeIcon?: number; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} className="mb-2 flex-row items-center rounded-2xl bg-[#F6F9F7] p-3">
    <View className="mr-3 h-12 w-12 items-center justify-center rounded-2xl bg-[#D8F3DC]">{homeIcon ? <Image source={homeIcon} style={{ width: 24, height: 24 }} contentFit="contain" accessibilityElementsHidden /> : <Icon name={icon} />}</View>
    <View className="flex-1"><Text className="font-inter text-base font-bold text-[#172B22]">{title}</Text><Text className="font-inter mt-1 text-sm text-[#51665C]">{description}</Text></View>
    <Icon name="right" size={20} />
  </Pressable>;
}
