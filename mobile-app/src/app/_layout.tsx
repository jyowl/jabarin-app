import '../../global.css';
import { useFonts } from 'expo-font';
import { Tabs } from 'expo-router';
import { BottomNav, type TabName } from '../components/bottom-nav';
import { useState } from 'react';
import { TextSizeContext } from '../components/home/text-size';
import { AuthProvider } from '../lib/auth';

const routeByTab: Record<TabName, string> = {
  Beranda: 'index', Layanan: 'layanan', 'Lapor!': 'lapor', Antrean: 'antrean', IKD: 'ikd',
};
const tabByRoute: Record<string, TabName> = {
  index: 'Beranda', layanan: 'Layanan', lapor: 'Lapor!', 'laporan-publik': 'Lapor!', 'peta-laporan': 'Lapor!', antrean: 'Antrean', ikd: 'IKD',
};

export default function RootLayout() {
  const [largeText, setLargeText] = useState(false);
  const [loaded, error] = useFonts({ Inter: require('../../assets/fonts/Inter.ttf') });
  if (error) throw error;
  if (!loaded) return null;
  return (
    <AuthProvider>
    <TextSizeContext.Provider value={{ largeText, toggleTextSize: () => setLargeText((value) => !value) }}>
    <Tabs screenOptions={{ headerShown: false }} tabBar={({ state, emitter, navigateToTab, insets }) => ['asisten', 'dasar-jawaban', 'masuk'].includes(state.routes[state.index].name) ? null : (
      <BottomNav active={tabByRoute[state.routes[state.index].name] ?? 'Beranda'}
        bottomInset={insets.bottom}
        onSelect={(tab) => {
          const route = state.routes.find((item) => item.name === routeByTab[tab]);
          if (!route) return;
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!event.defaultPrevented) navigateToTab(route.key);
        }} />
    )}>
      <Tabs.Screen name="index" options={{ title: 'Beranda' }} />
      <Tabs.Screen name="layanan" options={{ title: 'Layanan' }} />
      <Tabs.Screen name="lapor" options={{ title: 'Lapor!' }} />
      <Tabs.Screen name="antrean" options={{ title: 'Antrean' }} />
      <Tabs.Screen name="ikd" options={{ title: 'Profil IKD' }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="asisten" />
      <Tabs.Screen name="dasar-jawaban" />
      <Tabs.Screen name="laporan-publik" />
      <Tabs.Screen name="peta-laporan" />
      <Tabs.Screen name="masuk" options={{ href: null }} />
    </Tabs>
    </TextSizeContext.Provider>
    </AuthProvider>
  );
}
