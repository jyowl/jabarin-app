import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName = 'home' | 'grid' | 'report' | 'ticket' | 'id' | 'health' | 'bank' | 'file' | 'social' | 'calendar' | 'search' | 'left' | 'right' | 'arrow' | 'sparkle' | 'assistant' | 'medical' | 'list' | 'upload' | 'road' | 'send' | 'map' | 'pin' | 'trash';

export function Icon({ name, size = 24, color = '#1B4332' }: { name: IconName; size?: number; color?: string }) {
  const paths: Record<IconName, string> = {
    home: 'M3 10 12 3l9 7v10H3z M9 20v-6h6v6', grid: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z', list: 'M9 5h12 M9 12h12 M9 19h12 M4 5h.1 M4 12h.1 M4 19h.1', upload: 'M12 16V3 M7 8l5-5 5 5 M4 15v5h16v-5',
    report: 'M3 10v4h4l9 4V6l-9 4H3z M7 14l2 6h3l-2-5 M19 8l2-2 M19 12h3 M19 16l2 2',
    ticket: 'M3 6h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4z M12 7v2 M12 12v1 M12 16v1',
    id: 'M3 5h18v14H3z M11 10h7 M11 14h7 M6 15c0-2 3-2 3 0', health: 'M12 20S3 15 3 9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 11-9 11z M6 12h3l1-3 2 6 2-3h4',
    bank: 'M3 9h18L12 3z M5 10v8 M9 10v8 M15 10v8 M19 10v8 M3 21h18 M3 18h18',
    file: 'M6 3h8l4 4v14H6z M14 3v5h4 M9 12h6 M9 16h6', social: 'M3 12l4-4 4 2 3-2 7 5-5 5-4-2-3 1z M8 12l3 2 M11 10l4 3',
    calendar: 'M4 5h16v15H4z M4 10h16 M8 3v4 M16 3v4 M12 12v3l2 1', search: 'M20 20l-4-4 M18 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
    left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', arrow: 'M4 12h16 M14 6l6 6-6 6', sparkle: 'M12 2l2 7 7 3-7 2-2 8-2-8-7-2 7-3z', assistant: 'M14 5H3v16l4-3h13v-6 M14 7l1.2-3 1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2z M19 2l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z', medical: 'M4 7h16v13H4z M9 7V4h6v3 M12 10v7 M9 13.5h6', road: 'M8 3 4 21 M16 3l4 18 M12 3v4 M12 11v3 M12 18v3', send: 'M3 3l18 9-18 9 4-9-4-9z M7 12h14', map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z M9 3v15 M15 6v15', pin: 'M12 21s-6-5.6-6-11a6 6 0 0 1 12 0c0 5.4-6 11-6 11z M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', trash: 'M4 6h16 M9 6V4h6v2 M6 6l1 14h10l1-14 M10 10v6 M14 10v6',
  };
  return <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" accessibilityElementsHidden><Path d={paths[name]} />{name === 'id' && <Circle cx="7.5" cy="10" r="1.3" />}{name === 'medical' && <Rect x="3" y="7" width="18" height="13" rx="1" />}</Svg>;
}
