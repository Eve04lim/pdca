export type TaskStatus = "pending" | "done" | "skipped";

export type Task = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  status: TaskStatus;
  note?: string;
  completedAt?: string; // ISO string
  createdAt: string; // ISO string
  nodeId?: string; // v1 用の枠
};
