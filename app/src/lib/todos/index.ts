// Done state of one todo occurrence (S5): the todo itself + its subtasks, kept consistent —
// ticking the todo ticks every subtask, ticking the last subtask ticks the todo.
export type Subtask = { id: string; text: string };
export type TodoStatus = { done: boolean; doneSubtasks: string[] };

export const SUBTASK_MAX_ITEMS = 50;
export const SUBTASK_TEXT_MAX = 200;

export const NOT_DONE: TodoStatus = { done: false, doneSubtasks: [] };

// Drops ids of subtasks deleted since (edit "Tất cả" keeps old ticks on other occurrences) and,
// with subtasks, derives `done` from them so a subtask added later reopens a done todo.
export function normalizeStatus(subtasks: Subtask[], status: TodoStatus): TodoStatus {
  if (subtasks.length === 0) return { done: status.done, doneSubtasks: [] };
  const ticked = new Set(status.doneSubtasks);
  const doneSubtasks = subtasks.filter((s) => ticked.has(s.id)).map((s) => s.id);
  return { done: doneSubtasks.length === subtasks.length, doneSubtasks };
}

export function toggleTodo(subtasks: Subtask[], status: TodoStatus): TodoStatus {
  return status.done ? NOT_DONE : { done: true, doneSubtasks: subtasks.map((s) => s.id) };
}

export function toggleSubtask(subtasks: Subtask[], status: TodoStatus, id: string): TodoStatus {
  const ticked = status.doneSubtasks.includes(id) ? status.doneSubtasks.filter((x) => x !== id) : [...status.doneSubtasks, id];
  return normalizeStatus(subtasks, { done: false, doneSubtasks: ticked });
}

// "2/5" on calendar rows, the todo list and the detail screen.
export function subtaskProgress(subtasks: Subtask[], status: TodoStatus): { done: number; total: number } {
  return { done: normalizeStatus(subtasks, status).doneSubtasks.length, total: subtasks.length };
}
