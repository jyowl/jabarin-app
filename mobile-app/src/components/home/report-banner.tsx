import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '../ui/icon';

function OfficeIllustration() {
  return (
    <View style={styles.illustration} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Image source={require('../../../assets/images/Ilustrasi/office-walls.svg')} contentFit="fill" style={[styles.asset, { left: '7.3%', top: '32%', width: '74%', height: '51%' }]} />
      <Image source={require('../../../assets/images/Ilustrasi/office-platform.svg')} contentFit="fill" style={[styles.asset, { left: '3.3%', top: '69%', width: '84%', height: '21%' }]} />
      <Image source={require('../../../assets/images/Ilustrasi/roof.svg')} contentFit="fill" style={[styles.asset, { left: 0, top: 0, width: '89.3%', height: '44%' }]} />
      <Image source={require('../../../assets/images/Ilustrasi/acknowledgment-bubble.svg')} contentFit="fill" style={[styles.asset, { right: 0, top: '50%', width: '36.7%', height: '47%' }]} />
    </View>
  );
}

export function ReportBanner({ onPress, largeText }: { onPress: () => void; largeText: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Lapor Warga Terpadu. Buat laporan dan pantau tindak lanjut" onPress={onPress}>
      <LinearGradient colors={['#1B4332', '#2F7455']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.banner}>
        <View pointerEvents="none" style={styles.circleOuter} />
        <View pointerEvents="none" style={styles.circleInner} />
        <View style={styles.topRow}>
          <View style={styles.badge}><Text style={[styles.badgeText, largeText && { fontSize: 14 }]}>ASPIRASI & ADUAN</Text></View>
          <View style={styles.arrow}><Icon name="arrow" size={23} /></View>
        </View>
        <View style={styles.contentRow}>
          <View style={styles.copy}>
            <Text style={[styles.title, largeText && styles.titleLarge]}>Lapor Warga{ '\n' }Terpadu</Text>
            <Text style={[styles.description, largeText && styles.descriptionLarge]}>Buat laporan dan pantau tindak lanjut.</Text>
          </View>
          <View style={styles.artwork}><OfficeIllustration /></View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: { borderRadius: 20, overflow: 'hidden', padding: 16, minHeight: 164 },
  circleOuter: { position: 'absolute', right: -50, top: -56, width: 175, height: 175, borderRadius: 88, backgroundColor: 'rgba(116, 198, 157, 0.12)' },
  circleInner: { position: 'absolute', right: -37, top: -80, width: 145, height: 145, borderRadius: 73, backgroundColor: 'rgba(116, 198, 157, 0.18)' },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  badge: { minHeight: 25, borderRadius: 999, backgroundColor: '#D8F3DC', paddingHorizontal: 10, paddingVertical: 4, justifyContent: 'center', alignItems: 'center', flexShrink: 1 },
  badgeText: { color: '#1B4332', fontFamily: 'Inter', fontWeight: '700', fontSize: 11, textAlign: 'center', includeFontPadding: false },
  arrow: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  contentRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: -3 },
  copy: { flex: 1.2, zIndex: 1 },
  title: { color: '#FFFFFF', fontFamily: 'Inter', fontWeight: '700', fontSize: 25, lineHeight: 34 },
  titleLarge: { fontSize: 29, lineHeight: 38 },
  description: { color: '#D8F3DC', fontFamily: 'Inter', fontSize: 14, lineHeight: 18, marginTop: 8 },
  descriptionLarge: { fontSize: 17, lineHeight: 23 },
  artwork: { flex: 1, justifyContent: 'flex-end', marginLeft: 2 },
  illustration: { width: '100%', aspectRatio: 1.5 },
  asset: { position: 'absolute' },
});
