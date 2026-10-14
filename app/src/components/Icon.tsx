import { SvgXml } from "react-native-svg";

import { useUiScale } from "@/theme/useUiScale";

// Paths are copied 1:1 from the mockups (docs/specs/sprint-*/design/mockups.html); keep both in sync.
const stroke = (d: string, width = 1.9) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;

const ICONS = {
  calendar: (filled: boolean) =>
    `<svg viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="4"/><path d="M8 3v4M16 3v4" fill="none"/><path d="M3.5 10h17" stroke="${filled ? "#fff" : "currentColor"}"/></svg>`,
  book: (filled: boolean) =>
    `<svg viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z"/><path d="M5 20.5A2.5 2.5 0 0 0 7.5 21H19v-3" fill="none"/></svg>`,
  chart: (filled: boolean) =>
    stroke('<path d="M5 20V12M12 20V5M19 20v-5"/>', filled ? 2.6 : 1.8),
  wallet: (filled: boolean) =>
    `<svg viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8V7a2.5 2.5 0 0 1 2.5-2.5H16V8" fill="none"/><rect x="3.5" y="8" width="17" height="12" rx="3.5"/><circle cx="16" cy="14" r="1.3" fill="${filled ? "#fff" : "currentColor"}" stroke="none"/></svg>`,
  gear: (filled: boolean) =>
    `<svg viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8"><path d="M12 2.8l2 1.6 2.5-.4 1 2.4 2.4 1-.4 2.5 1.6 2-1.6 2 .4 2.5-2.4 1-1 2.4-2.5-.4-2 1.6-2-1.6-2.5.4-1-2.4-2.4-1 .4-2.5L2.8 12l1.6-2-.4-2.5 2.4-1 1-2.4 2.5.4z" stroke-linejoin="round"/><circle cx="12" cy="12" r="3.2" fill="${filled ? "#fff" : "none"}"/></svg>`,
  plus: () => stroke('<path d="M12 5v14M5 12h14"/>', 2.6),
  back: () => stroke('<path d="M15 5l-7 7 7 7"/>', 2.2),
  chevron: () => stroke('<path d="M9 6l6 6-6 6"/>', 2.2),
  chevronDown: () => stroke('<path d="M6 9l6 6 6-6"/>', 2.4),
  check: () => stroke('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 2.6),
  pen: () =>
    stroke(
      '<path d="M14.5 5.5l4 4M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 0l.5.5a2.1 2.1 0 0 1 0 3L8.5 19z"/>',
      2,
    ),
  camera: () =>
    stroke(
      '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.3"/>',
      2,
    ),
  lock: () =>
    stroke(
      '<rect x="5" y="10.5" width="14" height="10" rx="3"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
      2,
    ),
  logout: () =>
    stroke(
      '<path d="M14 4h3a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-3"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    ),
  info: () =>
    stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
  mail: () =>
    stroke(
      '<rect x="3.5" y="5.5" width="17" height="13" rx="3.5"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/>',
    ),
  globe: () =>
    stroke(
      '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 2.5 14.4 0 17M12 3.5c-2.5 2.6-2.5 14.4 0 17"/>',
    ),
  devices: () =>
    stroke(
      '<rect x="3" y="5" width="12" height="9" rx="2"/><rect x="15" y="9" width="6" height="11" rx="2"/><path d="M6 18h6"/>',
    ),
  phone: () =>
    stroke(
      '<rect x="7" y="3" width="10" height="18" rx="3"/><path d="M11 18h2"/>',
    ),
  close: () => stroke('<path d="M6 6l12 12M18 6L6 18"/>', 2.2),
  image: () =>
    stroke('<rect x="3.5" y="4.5" width="17" height="15" rx="3.5"/><circle cx="9" cy="9.5" r="1.6"/><path d="M4 17l5-4.5 3.5 3 3-2.5 4.5 4"/>'),
  bug: () =>
    stroke('<rect x="7" y="8" width="10" height="12" rx="5"/><path d="M9.5 8a2.5 2.5 0 0 1 5 0M12 12v8M7 13H3.5M20.5 13H17M7.5 17.5l-3 2M16.5 17.5l3 2M7.5 9.5l-3-2M16.5 9.5l3-2"/>'),
  grip: () =>
    `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>`,
  more: () =>
    `<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>`,
  repeat: () =>
    stroke(
      '<path d="M17 3l3 3-3 3"/><path d="M4 12V9a3 3 0 0 1 3-3h13"/><path d="M7 21l-3-3 3-3"/><path d="M20 12v3a3 3 0 0 1-3 3H4"/>',
    ),
  bell: () =>
    stroke(
      '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    ),
  trash: () => stroke('<path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13"/>'),
  allDay: () =>
    stroke(
      '<circle cx="12" cy="13" r="7.5"/><path d="M12 9.5V13l2.5 1.5M10 2.5h4"/>',
    ),
  palette: () =>
    stroke(
      '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 1.8-1 1.4-2-.5-1.2.2-2.5 1.6-2.5H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="8" cy="11" r="1"/><circle cx="11" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/>',
    ),
  arrowRight: () => stroke('<path d="M4 12h15M14 7l5 5-5 5"/>'),
  arrowLeft: () => stroke('<path d="M20 12H5M10 7l-5 5 5 5"/>'),
  moon: () =>
    stroke('<path d="M19 14.5A7.5 7.5 0 1 1 9.5 5a6 6 0 0 0 9.5 9.5z"/>'),
  clock: () =>
    stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  note: () =>
    stroke(
      '<path d="M6 3.5h9l4 4V20a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 20z"/><path d="M14.5 3.5V8H19M9 12h7M9 16h5"/>',
    ),
  alert: () =>
    stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5M12 16h.01"/>'),
  warn: () => stroke('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'),
  battery: () =>
    stroke(
      '<rect x="3" y="7" width="16" height="10" rx="3"/><path d="M21 10.5v3M7 10.5v3M10.5 10.5v3"/>',
    ),
  week: () =>
    stroke(
      '<rect x="3.5" y="5" width="17" height="15" rx="4"/><path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M12 14h2M16 14h.5"/>',
    ),
  time24: () =>
    stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12h4"/>'),
  flag: () => stroke('<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>'),
  search: () =>
    stroke('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
  pin: () =>
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15 3l6 6-3 1-3.5 3.5L15 18l-2 2-4-4-5 5-1-1 5-5-4-4 2-2 4.5.5L14 6z"/></svg>',
  todo: () => stroke('<circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-4.8"/>'),
  checklist: () =>
    stroke(
      '<path d="M4 6.5l1.5 1.5L8.5 5M4 12.5l1.5 1.5 3-3M4 18.5l1.5 1.5 3-3M12 7h8M12 13h8M12 19h8"/>',
    ),
  folder: () =>
    stroke(
      '<path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5z"/>',
    ),
  restore: () =>
    stroke('<path d="M4 12a8 8 0 1 0 2.5-5.8"/><path d="M4 4v4h4"/>'),
  google: () => stroke('<path d="M19 12.2h-7M19 12.2A7 7 0 1 1 16.8 7"/>', 2.4),
  sync: () =>
    stroke(
      '<path d="M20 11a8 8 0 0 0-14.5-4M4 13a8 8 0 0 0 14.5 4"/><path d="M5 3v4h4M19 21v-4h-4"/>',
    ),
  food: () =>
    stroke(
      '<path d="M4 11.5h16a8 8 0 0 1-16 0z"/><path d="M9.5 8c0-1.2 1-1.6 1-2.8M13.5 8c0-1.2 1-1.6 1-2.8"/>',
    ),
  car: () =>
    stroke(
      '<path d="M6 11.5l1.6-4A2 2 0 0 1 9.5 6h5a2 2 0 0 1 1.9 1.5l1.6 4"/><rect x="3.5" y="11.5" width="17" height="6" rx="2.5"/><path d="M7 17.5v2M17 17.5v2M7.5 14.5h1M15.5 14.5h1"/>',
    ),
  bill: () =>
    stroke(
      '<path d="M6 3.5h12v17l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 20.5z"/><path d="M9 8.5h6M9 12h6M9 15.5h3.5"/>',
    ),
  tag: () =>
    stroke(
      '<path d="M3.5 12.3V5a1.5 1.5 0 0 1 1.5-1.5h7.3l8.2 8.2-8.8 8.8z"/><circle cx="8.5" cy="8.5" r="1.4"/>',
    ),
  // S4 expense category icons (mockup screen 11).
  coffee: () => stroke('<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M9 3.5c0 1.2-1 1.6-1 2.8M12.5 3.5c0 1.2-1 1.6-1 2.8"/>'),
  wine: () => stroke('<path d="M8 3.5h8l-.5 5a3.5 3.5 0 0 1-7 0zM12 12v8M8.5 20.5h7"/>'),
  cart: () => stroke('<path d="M3.5 4.5h2l2 11h10l2-7.5H7"/><circle cx="9" cy="19" r="1.3"/><circle cx="17" cy="19" r="1.3"/>'),
  bag: () => stroke('<path d="M5 8h14l-1 12H6z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>'),
  shirt: () => stroke('<path d="M8 4L3.5 7l2 4L8 10v10h8V10l2.5 1 2-4L16 4c-.5 1.5-2 2.5-4 2.5S8.5 5.5 8 4z"/>'),
  home: () => stroke('<path d="M4 11l8-6.5 8 6.5"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>'),
  bolt: () => stroke('<path d="M13 3L5 13.5h6L10 21l8-10.5h-6z"/>'),
  drop: () => stroke('<path d="M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z"/>'),
  cycle: () => stroke('<path d="M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>'),
  ruler: () => stroke('<rect x="3.5" y="8" width="17" height="8" rx="2"/><path d="M7.5 8v3M11 8v4M14.5 8v3M18 8v2"/>'),
  wifi: () => stroke('<path d="M3 9.5a13 13 0 0 1 18 0M6 12.8a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0M12 19.5h.01"/>'),
  tool: () => stroke('<path d="M14.5 6.5a4 4 0 0 0 5 5L12 19a2.1 2.1 0 0 1-3-3l7.5-7.5a4 4 0 0 0-2-2z"/>'),
  bus: () => stroke('<rect x="5" y="3.5" width="14" height="14" rx="3"/><path d="M5 11h14M8 17.5v2.5M16 17.5v2.5M8.5 14.5h.01M15.5 14.5h.01"/>'),
  bike: () => stroke('<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9l3 7h-7M14 6h2.5"/>'),
  fuel: () => stroke('<path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20M3.5 20h12M5 10h9"/><path d="M14 8.5l3 2v6.5a1.5 1.5 0 0 0 3 0V9l-2.5-2.5"/>'),
  plane: () => stroke('<path d="M21 4L3 11l7 2.5L12.5 21z"/><path d="M10 13.5L21 4"/>'),
  heart: () => stroke('<path d="M12 20s-7.5-4.5-7.5-10A4.2 4.2 0 0 1 12 7.5 4.2 4.2 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>'),
  pill: () => stroke('<rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-45 12 12)"/><path d="M9.5 9.5l5 5"/>'),
  dumbbell: () => stroke('<path d="M6.5 7.5v9M17.5 7.5v9M3.5 10v4M20.5 10v4M6.5 12h11"/>'),
  scissors: () => stroke('<circle cx="6.5" cy="7" r="2.5"/><circle cx="6.5" cy="17" r="2.5"/><path d="M8.5 8.5L20 18M8.5 15.5L20 6"/>'),
  baby: () => stroke('<circle cx="12" cy="12.5" r="7.5"/><path d="M9.5 12h.01M14.5 12h.01M10 15.5c1.2.8 2.8.8 4 0M12 5c-1 0-1.5-1-1-1.8"/>'),
  paw: () => stroke('<circle cx="7" cy="10.5" r="1.8"/><circle cx="10.5" cy="6.5" r="1.8"/><circle cx="14.5" cy="6.5" r="1.8"/><circle cx="18" cy="10.5" r="1.8"/><path d="M8 17a4 4 0 0 1 8 0c0 2-2 2.5-4 2.5S8 19 8 17z"/>'),
  cap: () => stroke('<path d="M2.5 9.5L12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4c1.5 1.5 3.5 2 5.5 2s4-.5 5.5-2v-4M21.5 9.5v5"/>'),
  briefcase: () => stroke('<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V5.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3.5 12.5h17"/>'),
  laptop: () => stroke('<rect x="5" y="5" width="14" height="10" rx="2"/><path d="M2.5 18.5h19"/>'),
  card: () => stroke('<rect x="3" y="5.5" width="18" height="13" rx="3"/><path d="M3 10h18M7 14.5h3"/>'),
  coins: () => stroke('<ellipse cx="12" cy="7" rx="7" ry="3"/><path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>'),
  umbrella: () => stroke('<path d="M3 12a9 9 0 0 1 18 0zM12 12v6.5a2 2 0 0 1-4 0"/>'),
  gift: () => stroke('<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3.5 9h17M12 9v11M12 9c-1-3-5-4-5-1.5S12 9 12 9zm0 0c1-3 5-4 5-1.5S12 9 12 9z"/>'),
  film: () => stroke('<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="M8 5v14M16 5v14M3.5 12h17"/>'),
  music: () => stroke('<path d="M9 18V5.5l10-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>'),
  game: () => stroke('<rect x="3" y="8" width="18" height="10" rx="5"/><path d="M7.5 11.5v3M6 13h3M15.5 12h.01M17.5 14h.01"/>'),
  ticket: () => stroke('<path d="M3.5 8.5V6.5a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v2a3.5 3.5 0 0 0 0 7v2a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1v-2a3.5 3.5 0 0 0 0-7zM14 5.5v13" stroke-dasharray="0"/>'),
  ball: () => stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17M3.5 12h17M6 6c3 2.5 3 9.5 0 12M18 6c-3 2.5-3 9.5 0 12"/>'),
  tree: () => stroke('<path d="M12 3.5l6 8h-3.5l4 5.5h-13l4-5.5H6zM12 17v3.5"/>'),
} satisfies Record<string, (filled: boolean) => string>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 24,
  color,
  filled = false,
}: {
  name: IconName;
  size?: number;
  color: string;
  filled?: boolean;
}) {
  const scale = useUiScale();
  return (
    <SvgXml
      xml={ICONS[name](filled)}
      width={size * scale}
      height={size * scale}
      color={color}
    />
  );
}
