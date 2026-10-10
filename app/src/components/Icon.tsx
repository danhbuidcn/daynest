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
  close: () => stroke('<path d="M6 6l12 12M18 6L6 18"/>', 2.2),
  more: () => `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`,
  repeat: () => stroke('<path d="M17 3l3 3-3 3"/><path d="M4 12V9a3 3 0 0 1 3-3h13"/><path d="M7 21l-3-3 3-3"/><path d="M20 12v3a3 3 0 0 1-3 3H4"/>'),
  bell: () => stroke('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>'),
  trash: () => stroke('<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>'),
  allDay: () => stroke('<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M10 2.5h4"/>'),
  palette: () =>
    stroke(
      '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.4-2-.5-1.2.2-2.5 1.6-2.5H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="8" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/>',
    ),
  arrowRight: () => stroke('<path d="M4 12h15M14 7l5 5-5 5"/>'),
  arrowLeft: () => stroke('<path d="M20 12H5M10 7l-5 5 5 5"/>'),
  moon: () => stroke('<path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/>'),
  clock: () => stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  note: () => stroke('<path d="M6 3.5h9l4 4V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20z"/><path d="M14.5 3.5V8H19M9 12h7M9 16h5"/>'),
  alert: () => stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5M12 16h.01"/>'),
  warn: () => stroke('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'),
  battery: () => stroke('<rect x="3" y="7" width="16" height="10" rx="3"/><path d="M21 10.5v3M7 10.5v3M10.5 10.5v3"/>'),
  week: () => stroke('<rect x="3.5" y="5" width="17" height="15" rx="4"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h.5"/>'),
  time24: () => stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12h4"/>'),
  flag: () => stroke('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  search: () => stroke('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  pin: () =>
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 3l6 6-3 1-3.5 3.5L15 18l-2 2-4-4-5 5-1-1 5-5-4-4 2-2 4.5.5L14 6z"/></svg>',
  checklist: () => stroke('<path d="M4 6.5l1.5 1.5L8.5 5M4 12.5l1.5 1.5 3-3M4 18.5l1.5 1.5 3-3M12 7h8M12 13h8M12 19h8"/>'),
  folder: () =>
    stroke('<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5z"/>'),
  restore: () => stroke('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/>'),
} satisfies Record<string, (filled: boolean) => string>;

export type IconName = keyof typeof ICONS;

export function Icon({ name, size = 24, color, filled = false }: { name: IconName; size?: number; color: string; filled?: boolean }) {
  return <SvgXml xml={ICONS[name](filled)} width={size} height={size} color={color} />;
}
