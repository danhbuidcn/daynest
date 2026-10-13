import { describe, expect, it } from '@jest/globals';

import { occurrencesForTodo, withStatus, type TodoExceptionRow, type TodoRow } from '@/features/todos/todo';

const base: TodoRow = {
  id: 't1',
  title: 'Học tiếng Anh',
  note: '',
  color: 'lavender',
  allDay: true,
  startsAt: null,
  endsAt: null,
  startDate: '2026-10-12',
  endDate: '2026-10-12',
  repeat: 'daily',
  repeatInterval: 1,
  repeatUntil: '2026-10-14',
  lunarMonth: null,
  lunarDay: null,
  reminderMinutes: [],
  subtasks: [
    { id: 'a', text: 'Nghe' },
    { id: 'b', text: 'Viết' },
  ],
  done: false,
  doneSubtasks: [],
  updatedAt: '2026-10-01T00:00:00Z',
};

const range = { from: { year: 2026, month: 10, day: 1 }, to: { year: 2026, month: 10, day: 31 } };

const ex = (patch: Partial<TodoExceptionRow>): TodoExceptionRow => ({
  id: 'x',
  todoId: 't1',
  occurrenceDate: '2026-10-13',
  kind: 'status',
  title: null,
  note: null,
  color: null,
  allDay: null,
  startsAt: null,
  endsAt: null,
  startDate: null,
  endDate: null,
  reminderMinutes: null,
  subtasks: null,
  done: null,
  doneSubtasks: [],
  ...patch,
});

describe('occurrencesForTodo', () => {
  it('each lap of a repeating todo has its own done state', () => {
    const occ = occurrencesForTodo(base, [ex({ done: true, doneSubtasks: ['a', 'b'] })], range);
    expect(occ.map((o) => [o.occurrenceDate, o.status.done])).toEqual([
      ['2026-10-12', false],
      ['2026-10-13', true],
      ['2026-10-14', false],
    ]);
  });

  it('a status exception does not change what the lap shows', () => {
    const occ = occurrencesForTodo(base, [ex({ doneSubtasks: ['a'] })], range).find((o) => o.occurrenceDate === '2026-10-13')!;
    expect(occ.isException).toBe(false);
    expect(occ.title).toBe('Học tiếng Anh');
    expect(occ.status).toEqual({ done: false, doneSubtasks: ['a'] });
  });

  it('an override with its own subtasks uses them', () => {
    const own = [{ id: 'c', text: 'Ngày 2: 20 từ mới' }];
    const occ = occurrencesForTodo(base, [ex({ kind: 'override', title: 'Ngày 2', subtasks: own, done: true, doneSubtasks: ['c'] })], range).find(
      (o) => o.occurrenceDate === '2026-10-13',
    )!;
    expect([occ.title, occ.subtasks, occ.status.done]).toEqual(['Ngày 2', own, true]);
  });

  it('skip hides the lap', () => {
    expect(occurrencesForTodo(base, [ex({ kind: 'skip' })], range)).toHaveLength(2);
  });

  it('a one-off todo reads its own row', () => {
    const one: TodoRow = { ...base, repeat: 'none', repeatUntil: null, done: true, doneSubtasks: ['a', 'b'] };
    expect(occurrencesForTodo(one, [], range).map((o) => o.status)).toEqual([{ done: true, doneSubtasks: ['a', 'b'] }]);
  });
});

describe('withStatus (optimistic tick)', () => {
  const status = { done: false, doneSubtasks: ['b'] };

  it('one-off todo: updates the row', () => {
    const data = withStatus({ todos: [{ ...base, repeat: 'none' }], exceptions: [] }, 't1', '2026-10-12', status);
    expect([data.todos[0].done, data.todos[0].doneSubtasks]).toEqual([false, ['b']]);
  });

  it('repeating todo: adds a status exception for that lap', () => {
    const data = withStatus({ todos: [base], exceptions: [] }, 't1', '2026-10-13', status);
    expect(data.exceptions).toMatchObject([{ todoId: 't1', occurrenceDate: '2026-10-13', kind: 'status', done: false, doneSubtasks: ['b'] }]);
  });

  it('repeating todo: keeps an existing override, only its done state changes', () => {
    const data = withStatus({ todos: [base], exceptions: [ex({ kind: 'override', title: 'Ngày 2' })] }, 't1', '2026-10-13', status);
    expect(data.exceptions).toMatchObject([{ kind: 'override', title: 'Ngày 2', doneSubtasks: ['b'] }]);
  });
});
