import { describe, expect, it } from '@jest/globals';

import { newFormState } from '@/features/events/eventFormState';
import { newTodoFormState, switchKind, toTodoInput } from '@/features/todos/todoFormState';

const tz = 'Asia/Ho_Chi_Minh';
const day = { year: 2026, month: 10, day: 13 };

describe('newTodoFormState', () => {
  it('defaults to all day on the given date, no reminder', () => {
    const f = newTodoFormState(day, tz, new Date('2026-10-13T02:00:00Z'));
    expect([f.allDay, f.startDate, f.endDate, f.reminderOn, f.reminderMinutes]).toEqual([true, day, day, false, []]);
  });
});

describe('toTodoInput', () => {
  const form = { ...newTodoFormState(day, tz), title: 'Học tiếng Anh' };
  const items = [
    { id: 'a', text: ' Nghe ', done: true },
    { id: 'b', text: '   ', done: true },
    { id: 'c', text: 'Viết', done: false },
  ];

  it('drops empty subtasks and trims the rest', () => {
    expect(toTodoInput(form, items, false, tz).input.subtasks).toEqual([
      { id: 'a', text: 'Nghe' },
      { id: 'c', text: 'Viết' },
    ]);
  });

  it('a one-off todo keeps its done state on the row', () => {
    const { input } = toTodoInput(form, items, false, tz);
    expect([input.done, input.doneSubtasks]).toEqual([false, ['a']]);
  });

  it('every subtask ticked → done', () => {
    expect(toTodoInput(form, items.map((i) => ({ ...i, done: true })), false, tz).status.done).toBe(true);
  });

  it('a repeating todo keeps nothing on the row — each lap has its own state', () => {
    const { input, status } = toTodoInput({ ...form, repeat: 'daily' }, items, false, tz);
    expect([input.done, input.doneSubtasks, status.doneSubtasks]).toEqual([false, [], ['a']]);
  });
});

describe('switchKind', () => {
  const now = new Date('2026-10-13T02:00:00Z'); // 9:00 in Hà Nội → a new event is 10:00–11:00
  const todo = newTodoFormState(day, tz, now);
  const event = newFormState(day, tz, now);

  it('keeps what was typed and gives untouched time and reminder the new defaults', () => {
    const typed = { ...todo, title: 'Học', note: 'Unit 2', color: 'lavender' as const, repeat: 'daily' as const };
    const f = switchKind(typed, todo, event);
    expect([f.title, f.note, f.color, f.repeat]).toEqual(['Học', 'Unit 2', 'lavender', 'daily']);
    expect([f.allDay, f.startTime.hour, f.endTime.hour, f.reminderOn, f.reminderMinutes]).toEqual([false, 10, 11, true, [15]]);
  });

  it('keeps a group the user changed', () => {
    const next = { year: 2026, month: 10, day: 14 };
    const f = switchKind({ ...todo, startDate: next, endDate: next }, todo, event);
    expect([f.allDay, f.startDate, f.reminderOn]).toEqual([true, next, true]);
  });

  it('switching back and forth untouched returns the defaults', () => {
    expect(switchKind(switchKind(todo, todo, event), event, todo)).toEqual(todo);
  });
});
