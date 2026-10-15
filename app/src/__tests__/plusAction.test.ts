import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { runPlusAction, setPlusAction } from '@/features/tabs/plusAction';

jest.mock('expo-router', () => ({ useFocusEffect: () => {} }));

describe('plus action', () => {
  afterEach(() => setPlusAction(null));

  it('does nothing when the tab in front registered nothing', () => {
    expect(runPlusAction()).toBe(false);
  });

  it('runs the registered action and reports it handled the press', () => {
    const action = jest.fn();
    setPlusAction(action);
    expect(runPlusAction()).toBe(true);
    expect(action).toHaveBeenCalledTimes(1);
  });

  it('forgets the action once cleared', () => {
    setPlusAction(() => {});
    setPlusAction(null);
    expect(runPlusAction()).toBe(false);
  });
});
