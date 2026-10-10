import { SvgXml } from 'react-native-svg';

// Paths are copied 1:1 from the mockups (docs/specs/sprint-*/design/mockups.html); keep both in sync.
const stroke = (d: string, width = 1.9) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const ICONS = {
  calendar: (filled: boolean) =>
    `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="4"/><path d="M8 3v4M16 3v4" fill="none"/><path d="M3.5 10h17" stroke="${filled ? '#fff' : 'currentColor'}"/></svg>`,
  book: (filled: boolean) =>
    `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5A2.5 2.5 0 0 0 7.5 21H19v-3" fill="none"/></svg>`,
  chart: (filled: boolean) => stroke('<path d="M5 20V12M12 20V5M19 20v-5"/>', filled ? 2.6 : 1.8),
  gear: (filled: boolean) =>
    `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.8"><path d="M12 2.8l2 1.6 2.5-.4 1 2.4 2.4 1-.4 2.5 1.6 2-1.6 2 .4 2.5-2.4 1-1 2.4-2.5-.4-2 1.6-2-1.6-2.5.4-1-2.4-2.4-1 .4-2.5L2.8 12l1.6-2-.4-2.5 2.4-1 1-2.4 2.5.4z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="${filled ? '#fff' : 'none'}"/></svg>`,
  plus: () => stroke('<path d="M12 5v14M5 12h14"/>', 2.6),
  back: () => stroke('<path d="M15 5l-7 7 7 7"/>', 2.2),
  chevron: () => stroke('<path d="M9 6l6 6-6 6"/>', 2.2),
  check: () => stroke('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.6),
  pen: () => stroke('<path d="M14.5 5.5l4 4M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.5 19z"/>', 2),
  camera: () =>
    stroke('<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.3"/>', 2),
  lock: () => stroke('<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>', 2),
  logout: () => stroke('<path d="M14 4h3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-3"/><path d="M10 8l-4 4 4 4M6 12h10"/>'),
  info: () => stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
  mail: () => stroke('<rect x="3.5" y="5.5" width="17" height="13" rx="3.5"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/>'),
  globe: () =>
    stroke('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/>'),
  devices: () => stroke('<rect x="3" y="5" width="12" height="9" rx="2"/><rect x="15" y="9" width="6" height="11" rx="2"/><path d="M6 18h6"/>'),
  phone: () => stroke('<rect x="7" y="3" width="10" height="18" rx="3"/><path d="M11 18h2"/>'),
} satisfies Record<string, (filled: boolean) => string>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 24, color, filled = false }: { name: IconName; size?: number; color: string; filled?: boolean }) {
  return <SvgXml xml={ICONS[name](filled)} width={size} height={size} color={color} />;
}
