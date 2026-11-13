import MapView, { Marker } from 'react-native-maps';
import type { publicReports } from './public-reports';

export function ReportMap({ reports, onSelect }: { reports: readonly (typeof publicReports)[number][]; onSelect: (id: string) => void }) {
  return <MapView style={{ width: '100%', height: 320 }} initialRegion={{ latitude: -6.99, longitude: 107.65, latitudeDelta: 0.24, longitudeDelta: 0.3 }}>
    {reports.map((report) => <Marker key={report.id} coordinate={report.coordinate} pinColor="#1B4332" title={`${report.category} · Contoh`} description={`Perkiraan area ${report.location}`} onPress={() => onSelect(report.id)} />)}
  </MapView>;
}
