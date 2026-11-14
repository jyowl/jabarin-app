import { Pressable, ScrollView, Text } from 'react-native';
import { categories, type Category } from '../../../data/services';

type Props = { selected: Category; onSelect: (category: Category) => void; largeText: boolean };

export function CategoryFilter({ selected, onSelect, largeText }: Props) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" className="mt-5 mb-5">
      {categories.map((category) => {
        const active = selected === category;
        return (
          <Pressable key={category} onPress={() => onSelect(category)} accessibilityRole="button" accessibilityState={{ selected: active }} className={`mr-2 min-h-11 justify-center rounded-full border px-4 py-2 ${active ? 'border-brand-green bg-brand-green' : 'border-brand-mint bg-white'}`}>
            <Text className={`font-inter font-semibold ${active ? 'text-white' : 'text-brand-green'}`} style={{ fontSize: largeText ? 18 : 15 }}>{category}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
