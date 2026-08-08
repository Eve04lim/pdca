"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Task } from "@/lib/types";
import { loadTasks, saveTasks } from "@/lib/storage";
import { DayTimeline } from "@/components/DayTimeline";

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TodayPage() {
  const today = todayString();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // localStorage is unavailable during SSR; load after mount to keep
    // the SSR/hydration output (empty state) consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTasks(loadTasks());
  }, []);

  const todayTasks = tasks.filter((t) => t.date === today);
  const pending = todayTasks.filter((t) => t.status === "pending");
  const done = todayTasks.filter((t) => t.status === "done");
  const skipped = todayTasks.filter((t) => t.status === "skipped");

  function persist(next: Task[]) {
    setTasks(next);
    saveTasks(next);
  }

  function addTask() {
    const title = input.trim();
    if (!title) return;
    const task: Task = {
      id: crypto.randomUUID(),
      date: today,
      title,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    persist([...tasks, task]);
    setInput("");
    inputRef.current?.focus();
  }

  function completeTask(id: string) {
    persist(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: "done", completedAt: new Date().toISOString(), note: notes[id] ?? t.note }
          : t
      )
    );
  }

  function skipTask(id: string) {
    persist(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: "skipped", note: notes[id] ?? t.note }
          : t
      )
    );
  }

  function deleteTask(id: string) {
    persist(tasks.filter((t) => t.id !== id));
    setNotes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function handleNoteChange(id: string, value: string) {
    setNotes((prev) => ({ ...prev, [id]: value }));
  }

  function flushNote(id: string) {
    const note = notes[id];
    if (note === undefined) return;
    persist(tasks.map((t) => (t.id === id ? { ...t, note } : t)));
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">今日</h1>
          <p className="text-sm text-zinc-400">{today}</p>
        </div>
        <Link href="/history" className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors">
          履歴 →
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
        className="flex gap-2 mb-8"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="タスクを追加…"
          className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-400 transition-colors"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-700 transition-colors"
        >
          追加
        </button>
      </form>

      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-zinc-400 tracking-widest mb-2">未完了</h2>
          <ul className="space-y-2">
            {pending.map((task) => (
              <li key={task.id} className="border border-zinc-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-1 pt-0.5">{task.title}</span>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => completeTask(task.id)}
                      className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded hover:bg-emerald-100 transition-colors"
                    >
                      完了
                    </button>
                    <button
                      onClick={() => skipTask(task.id)}
                      className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 transition-colors"
                    >
                      見送り
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-xs px-2 py-1 text-zinc-300 hover:text-zinc-600 transition-colors"
                    >
                      削除
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="気づきメモ（任意）"
                  value={notes[task.id] ?? task.note ?? ""}
                  onChange={(e) => handleNoteChange(task.id, e.target.value)}
                  onBlur={() => flushNote(task.id)}
                  className="mt-2 w-full text-xs text-zinc-500 placeholder-zinc-300 outline-none border-b border-transparent focus:border-zinc-200 transition-colors"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {done.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-zinc-400 tracking-widest mb-2">完了</h2>
          <ul className="space-y-1">
            {done.map((task) => (
              <li key={task.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-zinc-50">
                <span className="text-sm line-through text-zinc-400 flex-1">{task.title}</span>
                {task.completedAt && (
                  <span className="text-xs text-zinc-300 shrink-0">
                    {new Date(task.completedAt).toLocaleTimeString("ja-JP", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
                {task.note && (
                  <span className="text-xs text-zinc-300 italic shrink-0">— {task.note}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {skipped.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xs font-medium text-zinc-400 tracking-widest mb-2">見送り</h2>
          <ul className="space-y-1">
            {skipped.map((task) => (
              <li key={task.id} className="flex items-center gap-2 py-1.5 px-3 rounded-lg">
                <span className="text-sm text-amber-400 flex-1">{task.title}</span>
                {task.note && (
                  <span className="text-xs text-zinc-300 italic shrink-0">— {task.note}</span>
                )}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-xs text-zinc-200 hover:text-zinc-500 transition-colors shrink-0"
                >
                  削除
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {todayTasks.length === 0 && (
        <p className="text-sm text-zinc-300 text-center py-12">
          タスクをまだ追加していません
        </p>
      )}

      {todayTasks.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xs font-medium text-zinc-400 tracking-widest mb-3">タイムライン</h2>
          <DayTimeline tasks={todayTasks} />
        </section>
      )}
    </div>
  );
}
