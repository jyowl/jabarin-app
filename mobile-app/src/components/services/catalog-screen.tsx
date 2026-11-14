import { useState } from 'react';
import { FlatList, Modal, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogHeader } from './catalog-header';
import { CategoryFilter } from './category-filter';
import { ServiceListCard } from './service-list-card';
import { catalogSections, publicServices, type Category, type PublicService } from '../../../data/services';

export default function ServicesScreen({ section }: { section: string }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState(catalogSections[section]?.query ?? '');
  const [category, setCategory] = useState<Category>(catalogSections[section]?.category ?? 'Semua');
  const [largeText, setLargeText] = useState(false);
  const [selected, setSelected] = useState<PublicService | null>(null);
  const keyword = query.trim().toLocaleLowerCase('id-ID');
  const filtered = publicServices.filter((service) =>
    (category === 'Semua' || service.category === category) &&
    `${service.title} ${service.category}`.toLocaleLowerCase('id-ID').includes(keyword),
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      <View className="bg-brand-green" style={{ height: insets.top }} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={<>
          <CatalogHeader query={query} onChangeQuery={setQuery} largeText={largeText} onToggleTextSize={() => setLargeText((value) => !value)} />
          <CategoryFilter selected={category} onSelect={setCategory} largeText={largeText} />
          <Text className="font-inter mb-4 text-xs text-brand-green">Pratinjau katalog • Estimasi dan biaya merupakan data contoh.</Text>
        </>}
        renderItem={({ item }: { item: PublicService }) => <ServiceListCard service={item} largeText={largeText} onApply={() => setSelected(item)} />}
        ListEmptyComponent={<View className="rounded-2xl border border-brand-beige p-6">
          <Text className="font-inter text-lg font-bold text-brand-green">Layanan tidak ditemukan</Text>
          <Text className="font-inter mt-2 text-base text-brand-green">Coba kata kunci atau kategori lain.</Text>
          <Pressable onPress={() => { setQuery(''); setCategory('Semua'); }} className="mt-4 min-h-11 justify-center self-start rounded-xl bg-brand-beige px-4"><Text className="font-inter font-bold text-brand-green">Reset pencarian</Text></Pressable>
        </View>}
      />
      <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={() => setSelected(null)}>
        <View className="flex-1 justify-end bg-black/40" style={{ paddingTop: insets.top + 24 }}>
          <View className="max-h-full rounded-t-[28px] bg-white px-6 pt-6" style={{ paddingBottom: insets.bottom + 20 }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text className="font-inter text-sm font-semibold text-brand-olive">PRATINJAU PENGAJUAN</Text>
              <Text className="font-inter mt-2 text-2xl font-bold text-brand-green">{selected?.title}</Text>
              <Text className="font-inter mt-5 text-base font-bold text-brand-green">Dokumen yang perlu disiapkan</Text>
              {selected?.requirements.map((item) => <Text key={item} className="mt-3 text-base text-brand-green">• {item}</Text>)}
              <Text className="font-inter mt-5 rounded-xl bg-brand-beige p-4 text-base text-brand-green">Ini adalah contoh alur. Pengajuan belum dikirim ke instansi pemerintah.</Text>
              <Pressable onPress={() => setSelected(null)} accessibilityRole="button" className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-brand-green"><Text className="font-inter text-base font-bold text-white">Kembali ke katalog</Text></Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
