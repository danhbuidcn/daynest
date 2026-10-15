// S6 §9: scrolling the month grid down folds the calendar header into one line, scrolling back up
// brings it back. Pure so the thresholds are tested; the screen feeds it every scroll offset.
export const COLLAPSE_AFTER = 60;
export const COLLAPSE_DISTANCE = 24;
export const EXPAND_DISTANCE = 40;
// Folding changes the height of the scroll area; offsets reported meanwhile are ignored.
export const SETTLE_MS = 300;

export type CollapseState = {
  collapsed: boolean;
  // Lowest offset since the header was last shown (while shown) · highest since it folded (while folded).
  anchor: number;
  until: number;
};

export const INITIAL_COLLAPSE: CollapseState = { collapsed: false, anchor: 0, until: 0 };

export function reduceCollapse(state: CollapseState, offset: number, now: number): CollapseState {
  if (now < state.until) return { ...state, anchor: offset };
  if (offset <= 0) return state.collapsed ? { collapsed: false, anchor: 0, until: now + SETTLE_MS } : { ...state, anchor: 0 };
  if (!state.collapsed) {
    const anchor = Math.min(state.anchor, offset);
    if (offset > COLLAPSE_AFTER && offset - anchor >= COLLAPSE_DISTANCE) return { collapsed: true, anchor: offset, until: now + SETTLE_MS };
    return { ...state, anchor };
  }
  const anchor = Math.max(state.anchor, offset);
  if (anchor - offset >= EXPAND_DISTANCE) return { collapsed: false, anchor: offset, until: now + SETTLE_MS };
  return { ...state, anchor };
}
