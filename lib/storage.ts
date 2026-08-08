import { Task } from "./types";

const KEY = "pdca.tasks.v0";

export function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}

export function saveTasks(tasks: Task[]): void {
  localStorage.setItem(KEY, JSON.stringify(tasks));
}
