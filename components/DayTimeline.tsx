"use client";

import { Task } from "@/lib/types";

type Props = {
  tasks: Task[];
};

export function DayTimeline({ tasks }: Props) {
  const completed = tasks.filter((t) => t.status === "done" && t.completedAt);

  if (completed.length === 0) {
    return (
      <div className="text-xs text-zinc-300 py-2">完了タスクがないためタイムラインなし</div>
    );
  }

  return (
    <div>
      <div className="relative h-5 bg-zinc-100 rounded-full overflow-hidden">
        {[6, 12, 18].map((h) => (
          <div
            key={h}
            className="absolute top-0 bottom-0 w-px bg-zinc-200"
            style={{ left: `${(h / 24) * 100}%` }}
          />
        ))}
        {completed.map((task) => {
          const d = new Date(task.completedAt!);
          const hours = d.getHours() + d.getMinutes() / 60;
          const pct = (hours / 24) * 100;
          return (
            <div
              key={task.id}
              className="absolute top-1/2 w-3 h-3 bg-emerald-500 rounded-full -translate-x-1/2 -translate-y-1/2 cursor-default"
              style={{ left: `${pct}%` }}
              title={`${task.title}（${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}）`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-zinc-300 mt-1 select-none">
        <span>0</span>
        <span>6</span>
        <span>12</span>
        <span>18</span>
        <span>24</span>
      </div>
    </div>
  );
}
