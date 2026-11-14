import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CatalogHeader } from './catalog-header';
import { CategoryFilter } from './category-filter';
import { ServiceListCard } from './service-list-card';
import { catalogSections, type Category, type PublicService } from '../../../data/services';
import { api, ApiError, type Service } from '../../lib/api';
import { useAuth } from '../../lib/auth';

function toPublicService(service: Service): PublicService {
  return {
    id: service.id,
    slug: service.slug,
    icon: service.icon || '📄',
    category: service.category,
    title: service.title,
    description: service.description,
    duration: service.sla_days > 0 ? `${service.sla_days} Hari Kerja` : 'Sesuai verifikasi',
    fee: 'Gratis / sesuai ketentuan',
    requirements: service.requirements ?? [],
  };
}

export default function ServicesScreen({ section }: { section: string }) {
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [query, setQuery] = useState(catalogSections[section]?.query ?? '');
  const [category, setCategory] = useState<Category>(catalogSections[section]?.category ?? 'Semua');
  const [largeText, setLargeText] = useState(false);
  const [selected, setSelected] = useState<PublicService | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [appliedRef, setAppliedRef] = useState('');

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const page = await api.listServices({
        q: query.trim() || undefined,
        category: category === 'Semua' ? undefined : category,
        per_page: 100,
      });
      if (!signal?.aborted) setServices(page.data.map(toPublicService));
    } catch (err) {
      if (!signal?.aborted) setError(err instanceof ApiError ? err.message : 'Katalog layanan gagal dimuat.');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [query, category]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => { void load(controller.signal); }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [load]);

  async function apply() {
    if (!selected) return;
    if (!token) {
      setSelected(null);
      router.navigate('/masuk');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const application = await api.createApplication(selected.slug);
      setAppliedRef(application.ref_number);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Pengajuan gagal dikirim.');
    } finally {
      setSubmitting(false);
    }
  }

  function closeModal() {
    setSelected(null);
    setAppliedRef('');
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />
      <View className="bg-brand-green" style={{ height: insets.top }} />
      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={<>
          <CatalogHeader query={query} onChangeQuery={setQuery} largeText={largeText} onToggleTextSize={() => setLargeText((value) => !value)} />
          <CategoryFilter selected={category} onSelect={setCategory} largeText={largeText} />
          <Text className="font-inter mb-4 text-xs text-brand-green">Katalog layanan langsung dari layanan JABARIN.</Text>
        </>}
        renderItem={({ item }: { item: PublicService }) => <ServiceListCard service={item} largeText={largeText} onApply={() => setSelected(item)} />}
        ListEmptyComponent={loading ? <View className="items-center py-10"><ActivityIndicator color="#1B4332" /><Text className="font-inter mt-3 text-base text-brand-green">Memuat katalog…</Text></View> : <View className="rounded-2xl border border-brand-beige p-6">
          <Text className="font-inter text-lg font-bold text-brand-green">{error ? 'Katalog tidak dapat dimuat' : 'Layanan tidak ditemukan'}</Text>
          <Text className="font-inter mt-2 text-base text-brand-green">{error || 'Coba kata kunci atau kategori lain.'}</Text>
          <Pressable onPress={() => { if (error) void load(); else { setQuery(''); setCategory('Semua'); } }} className="mt-4 min-h-11 justify-center self-start rounded-xl bg-brand-beige px-4"><Text className="font-inter font-bold text-brand-green">{error ? 'Coba lagi' : 'Reset pencarian'}</Text></Pressable>
        </View>}
      />
      <Modal visible={selected !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <View className="flex-1 justify-end bg-black/40" style={{ paddingTop: insets.top + 24 }}>
          <View className="max-h-full rounded-t-[28px] bg-white px-6 pt-6" style={{ paddingBottom: insets.bottom + 20 }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text className="font-inter text-sm font-semibold text-brand-olive">{appliedRef ? 'PENGAJUAN TERKIRIM' : 'AJUKAN LAYANAN'}</Text>
              <Text className="font-inter mt-2 text-2xl font-bold text-brand-green">{selected?.title}</Text>
              {appliedRef ? <>
                <Text className="font-inter mt-4 rounded-xl bg-brand-beige p-4 text-base text-brand-green">Nomor registrasi Anda: <Text className="font-bold">{appliedRef}</Text>. Pantau status berkas melalui layanan JABARIN.</Text>
                <Pressable onPress={closeModal} accessibilityRole="button" className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-brand-green"><Text className="font-inter text-base font-bold text-white">Selesai</Text></Pressable>
              </> : <>
                <Text className="font-inter mt-5 text-base font-bold text-brand-green">Dokumen yang perlu disiapkan</Text>
                {(selected?.requirements ?? []).map((item) => <Text key={item} className="font-inter mt-3 text-base text-brand-green">• {item}</Text>)}
                {error ? <Text accessibilityRole="alert" className="font-inter mt-3 text-sm text-[#A12626]">{error}</Text> : null}
                <Pressable onPress={apply} disabled={submitting} accessibilityRole="button" className="mt-5 min-h-12 items-center justify-center rounded-2xl bg-brand-green" style={{ opacity: submitting ? 0.7 : 1 }}>{submitting ? <ActivityIndicator color="white" /> : <Text className="font-inter text-base font-bold text-white">Kirim pengajuan</Text>}</Pressable>
                <Pressable onPress={closeModal} accessibilityRole="button" className="mt-3 min-h-12 items-center justify-center rounded-2xl border border-brand-beige"><Text className="font-inter text-base font-bold text-brand-green">Batal</Text></Pressable>
                <Text className="font-inter mt-3 text-xs leading-5 text-[#51665C]">Dengan mengirim, berkas akan diverifikasi petugas layanan.</Text>
              </>}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
