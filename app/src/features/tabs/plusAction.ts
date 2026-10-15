import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef } from 'react';

// Spec S6 §11: the `+` of the tab bar does what the tab in front says (Chi tiêu → new expense, …);
// a tab that registers nothing (Lịch, Cài đặt) leaves the 4-tile pop-up.
let current: (() => void) | null = null;

export function setPlusAction(action: (() => void) | null): void {
  current = action;
}

// True when the tab in front handled the press.
export function runPlusAction(): boolean {
  if (!current) return false;
  current();
  return true;
}

// Registers while this screen is focused; `null` registers nothing (e.g. a tab view without one).
export function usePlusAction(handler: (() => void) | null): void {
  const latest = useRef(handler);
  useEffect(() => {
    latest.current = handler;
  });
  const active = handler !== null;
  useFocusEffect(
    useCallback(() => {
      if (!active) return;
      const action = () => latest.current?.();
      setPlusAction(action);
      return () => {
        if (current === action) setPlusAction(null);
      };
    }, [active]),
  );
}
