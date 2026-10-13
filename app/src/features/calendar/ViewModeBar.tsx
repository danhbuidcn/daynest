import { useTranslation } from 'react-i18next';

import { SegmentedBar } from '@/components/SegmentedBar';

export const VIEW_MODES = ['month', 'list', 'week', 'day'] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

export function ViewModeBar({ value, onChange }: { value: ViewMode; onChange: (mode: ViewMode) => void }) {
  const { t } = useTranslation();
  const options = VIEW_MODES.map((mode) => ({ value: mode, label: t(`calendar.modes.${mode}`) }));
  return <SegmentedBar options={options} value={value} onChange={onChange} />;
}
