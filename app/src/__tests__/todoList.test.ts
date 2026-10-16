import { describe, expect, it } from '@jest/globals';

import { todoListSpan } from '@/features/calendar/dayOccurrences';
import type { TodoOccurrence } from '@/features/todos/todo';
import { jdFromDate } from '@/lib/lunar';
import { groupTodoList, type ListSpan } from '@/lib/todos/list';

const X = jdFromDate({ year: 2026, month: 10, day: 13 });

type Item = ListSpan & { id: string };
const item = (id: string, offset: number, over: Partial<Item> = {}): Item => ({
  id,
  start: X + offset,
  end: X + offset,
  done: false,
  order: '0',
  ...over,
});
const group = (items: Item[]) => {
  const g = groupTodoList(items, (i) => i, X);
  return {
    overdue: g.overdue.map((i) => i.id),
    day: g.day.map((i) => i.id),
    upcoming: g.upcoming.map((i) => i.id),
  };
};

describe('groupTodoList', () => {
  it('keeps overdue to the day before and upcoming to the day after the chosen day', () => {
    const items = [item('-31', -31), item('-30', -30), item('-1', -1), item('0', 0), item('1', 1), item('7', 7), item('8', 8)];
    expect(group(items)).toEqual({
      overdue: ['-1'],
      day: ['0'],
      upcoming: ['1'],
    });
  });

  it('leaves done todos out of overdue and upcoming, and puts them last on the chosen day', () => {
    const items = [item('late', -2, { done: true }), item('next', 2, { done: true }), item('a', 0, { done: true, order: '0' }), item('b', 0, { order: '1x' })];
    expect(group(items)).toEqual({
      overdue: [],
      day: ['b', 'a'],
      upcoming: [],
    });
  });

  it('orders by day, then all-day before timed, then by start', () => {
    const items = [
      item('late-9', -1, { order: '12026-10-12T02:00' }),
      item('late-allday', -1),
      item('soon-9', 1, { order: '12026-10-16T02:00' }),
      item('soon-8', 1, { order: '12026-10-16T01:00' }),
      item('sooner', 1, { order: '1z' }),
    ];
    expect(group(items)).toEqual({
      overdue: ['late-allday', 'late-9'],
      day: [],
      upcoming: ['soon-8', 'soon-9', 'sooner'],
    });
  });

  it('shows a multi-day todo that covers the chosen day there, not as overdue', () => {
    const items = [item('trip', -2, { end: X + 1 }), item('past-trip', -4, { end: X - 1 })];
    expect(group(items)).toEqual({
      overdue: ['past-trip'],
      day: ['trip'],
      upcoming: [],
    });
  });

  it('lists each lap of a repeating todo on its own', () => {
    const items = [item('r-12', -1), item('r-13', 0), item('r-14', 1)];
    expect(group(items)).toEqual({
      overdue: ['r-12'],
      day: ['r-13'],
      upcoming: ['r-14'],
    });
  });
});

describe('todoListSpan', () => {
  const todo = (over: Partial<TodoOccurrence>): TodoOccurrence => ({
    eventId: 't1',
    occurrenceDate: '2026-10-13',
    title: 'Nộp báo cáo',
    note: '',
    color: 'sky',
    allDay: false,
    startsAt: '2026-10-12T17:30:00.000Z',
    endsAt: '2026-10-12T18:30:00.000Z',
    startDate: null,
    endDate: null,
    reminderMinutes: [],
    repeat: 'none',
    isException: false,
    subtasks: [],
    status: { done: false, doneSubtasks: [] },
    ...over,
  });

  it('counts days in the chosen time zone', () => {
    // 00:30 on 13/10 in Ho Chi Minh, still 12/10 in UTC.
    expect(todoListSpan(todo({}), 'Asia/Ho_Chi_Minh')).toMatchObject({
      start: X,
      end: X,
    });
    expect(todoListSpan(todo({}), 'UTC')).toMatchObject({
      start: X - 1,
      end: X - 1,
    });
  });

  it('puts all-day todos before timed ones', () => {
    const allDay = todoListSpan(
      todo({
        allDay: true,
        startsAt: null,
        endsAt: null,
        startDate: '2026-10-13',
        endDate: '2026-10-13',
      }),
      'UTC',
    );
    expect(allDay.order < todoListSpan(todo({}), 'UTC').order).toBe(true);
  });
});
