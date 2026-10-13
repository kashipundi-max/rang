"use client";

import React from "react";
import { useTodoList } from "./hooks";
import { WidgetLayout } from "../shared";
import {
  IconCircleCheckFilled,
  IconCircle,
  IconPlus,
} from "@tabler/icons-react";

interface TodoItemProps {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  onToggle: (id: string) => void;
}

function TodoItem({ id, title, completed, dueDate, onToggle }: TodoItemProps) {
  return (
    <div
      className={`group relative flex items-center gap-2.5 py-2 px-2 rounded-md transition-all duration-200 cursor-pointer hover:bg-white/5 select-none ${
        completed ? "opacity-50" : ""
      }`}
      onClick={() => onToggle(id)}
    >
      {/* Checkbox */}
      <div
        className={`shrink-0 transition-all duration-200 ${
          completed ? "text-brand-primary" : "text-white/30 hover:text-white/50"
        }`}
      >
        {completed ? (
          <IconCircleCheckFilled className="w-4 h-4" />
        ) : (
          <IconCircle className="w-4 h-4" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <span
          className={`text-xs font-medium transition-all duration-200 truncate block ${
            completed ? "text-white/40 line-through" : "text-white/90"
          }`}
        >
          {title}
        </span>
      </div>

      {/* Due Date */}
      {dueDate && (
        <span className="text-[10px] text-white/30 shrink-0">{dueDate}</span>
      )}

      {/* Hover indicator */}
      <div className="absolute inset-y-0 left-0 w-0.5 bg-brand-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
}

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="relative h-1 rounded-full overflow-hidden bg-white/10">
      {/* Progress track */}
      <div
        className="relative h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${percentage}%` }}
      >
        {/* Main gradient bar */}
        <div className="absolute inset-0 bg-linear-to-r from-brand-primary to-brand-primary-light rounded-full" />

        {/* Subtle shine */}
        <div className="absolute inset-0 bg-linear-to-b from-white/20 to-transparent rounded-full" />
      </div>
    </div>
  );
}

export function TodoListWidget() {
  const { todos, toggleTodo, stats } = useTodoList();

  return (
    <WidgetLayout title="Tasks">
      {/* Progress Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-white/40 font-medium tracking-wide uppercase">
            Progress
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-white">
              {stats.completed}/{stats.total}
            </span>
            <span className="text-[10px] text-brand-primary">
              {stats.percentage}%
            </span>
          </div>
        </div>
        <ProgressBar percentage={stats.percentage} />
      </div>

      {/* Todo List */}
      <div className="space-y-0.5 -mx-1">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            id={todo.id}
            title={todo.title}
            description={todo.description}
            completed={todo.completed}
            priority={todo.priority}
            dueDate={todo.dueDate}
            onToggle={toggleTodo}
          />
        ))}
      </div>

      {/* Add Task Button */}
      <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-md border border-dashed border-white/15 text-white/40 hover:text-white/60 hover:border-white/25 hover:bg-white/5 transition-all duration-200 focus:outline-none">
        <IconPlus className="w-3.5 h-3.5" />
        <span className="text-[10px] font-medium">Add Task</span>
      </button>
    </WidgetLayout>
  );
}

// Keep backward compatibility
export { TodoListWidget as CalendarWidget };
export default TodoListWidget;
