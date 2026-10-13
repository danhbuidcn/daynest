import { describe, expect, it } from '@jest/globals';

import { normalizeStatus, NOT_DONE, subtaskProgress, toggleSubtask, toggleTodo, type Subtask } from '@/lib/todos';

const subs: Subtask[] = [
  { id: 'a', text: 'Nghe podcast' },
  { id: 'b', text: 'Học 20 từ mới' },
  { id: 'c', text: 'Viết 5 câu' },
];

describe('toggleTodo', () => {
  it('ticking the todo ticks every subtask', () => {
    expect(toggleTodo(subs, { done: false, doneSubtasks: ['a'] })).toEqual({ done: true, doneSubtasks: ['a', 'b', 'c'] });
  });

  it('unticking the todo unticks every subtask', () => {
    expect(toggleTodo(subs, { done: true, doneSubtasks: ['a', 'b', 'c'] })).toEqual(NOT_DONE);
  });

  it('flips a todo without subtasks', () => {
    expect(toggleTodo([], NOT_DONE)).toEqual({ done: true, doneSubtasks: [] });
    expect(toggleTodo([], { done: true, doneSubtasks: [] })).toEqual(NOT_DONE);
  });
});

describe('toggleSubtask', () => {
  it('ticking the last subtask marks the todo done', () => {
    expect(toggleSubtask(subs, { done: false, doneSubtasks: ['a', 'b'] }, 'c')).toEqual({ done: true, doneSubtasks: ['a', 'b', 'c'] });
  });

  it('ticking one of several leaves the todo not done', () => {
    expect(toggleSubtask(subs, NOT_DONE, 'b')).toEqual({ done: false, doneSubtasks: ['b'] });
  });

  it('unticking one subtask of a done todo reopens it', () => {
    expect(toggleSubtask(subs, { done: true, doneSubtasks: ['a', 'b', 'c'] }, 'b')).toEqual({ done: false, doneSubtasks: ['a', 'c'] });
  });
});

describe('normalizeStatus', () => {
  it('drops ids of deleted subtasks and keeps list order', () => {
    expect(normalizeStatus(subs, { done: false, doneSubtasks: ['c', 'x', 'a'] })).toEqual({ done: false, doneSubtasks: ['a', 'c'] });
  });

  it('a subtask added to a done todo reopens it', () => {
    expect(normalizeStatus([...subs, { id: 'd', text: 'Ôn ngữ pháp' }], { done: true, doneSubtasks: ['a', 'b', 'c'] }).done).toBe(false);
  });

  it('removing the only undone subtask makes the todo done', () => {
    expect(normalizeStatus(subs.slice(0, 2), { done: false, doneSubtasks: ['a', 'b'] }).done).toBe(true);
  });
});

describe('subtaskProgress', () => {
  it('counts ticks of existing subtasks only ("2/3")', () => {
    expect(subtaskProgress(subs, { done: false, doneSubtasks: ['a', 'b', 'gone'] })).toEqual({ done: 2, total: 3 });
  });
});
