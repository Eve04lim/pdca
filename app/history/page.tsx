"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Task } from "@/lib/types";
import { loadTasks } from "@/lib/storage";
import { DayTimeline } from "@/components/DayTimeline";

export default function HistoryPage() {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    // localStorage is unavailable during SSR; load after mount to keep
    // the SSR/hydration output (empty state) consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(loadTasks());
  }, []);

  const byDate = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    if (!acc[t.date]) acc[t.date] = [];
    acc[t.date].push(t);
    return acc;
  }, {});

  const dates = Object.keys(byDate).sort((a, b) => (a > b ? -1 : 1));

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">履歴</h1>
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors">
          ← 今日
        </Link>
      </div>

      {dates.length === 0 && (
        <p className="text-sm text-zinc-300 text-center py-12">まだ履歴がありません</p>
      )}

      {dates.map((date) => {
        const dayTasks = byDate[date];
        const doneCount = dayTasks.filter((t) => t.status === "done").length;
        const skippedCount = dayTasks.filter((t) => t.status === "skipped").length;
        const pendingCount = dayTasks.filter((t) => t.status === "pending").length;

        return (
          <section key={date} className="mb-10">
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="text-sm font-medium">{date}</h2>
              <span className="text-xs text-zinc-400">
                完了 {doneCount}
                {skippedCount > 0 && ` / 見送り ${skippedCount}`}
                {pendingCount > 0 && ` / 未完了 ${pendingCount}`}
              </span>
            </div>
            <ul className="space-y-1 mb-3">
              {dayTasks.map((task) => (
                <li key={task.id} className="flex items-center gap-2 text-sm">
                  <span
                    className={
                      task.status === "done"
                        ? "text-zinc-400 line-through"
                        : task.status === "skipped"
                        ? "text-amber-400"
                        : "text-zinc-600"
                    }
                  >
                    {task.title}
                  </span>
                  {task.status === "done" && task.completedAt && (
                    <span className="text-xs text-zinc-300">
                      {new Date(task.completedAt).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                  {task.note && (
                    <span className="text-xs text-zinc-300 italic">— {task.note}</span>
                  )}
                </li>
              ))}
            </ul>
            <DayTimeline tasks={dayTasks} />
          </section>
        );
      })}
    </div>
  );
}
