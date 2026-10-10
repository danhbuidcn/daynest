import { describe, expect, it } from '@jest/globals';

import { DEFAULT_REMINDER_MINUTES, REMINDER_OPTIONS } from '@/features/events/reminderOptions';
import en from '@/locales/en.json';
import vi from '@/locales/vi.json';

function keys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

describe('locales', () => {
  it('en and vi have the same keys', () => {
    expect(keys(vi).sort()).toEqual(keys(en).sort());
  });

  it('names every reminder threshold, including the default 15 minutes', () => {
    for (const m of [...REMINDER_OPTIONS, DEFAULT_REMINDER_MINUTES]) {
      expect(en.events.reminderOptions).toHaveProperty(String(m));
    }
  });
});
