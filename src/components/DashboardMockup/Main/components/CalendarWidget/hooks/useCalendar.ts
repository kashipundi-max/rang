"use client";

import { useState, useCallback, useMemo } from "react";

export interface TodoItem {
    id: string;
    title: string;
    description?: string;
    completed: boolean;
    priority: "high" | "medium" | "low";
    dueDate?: string;
}

const initialTodos: TodoItem[] = [
    {
        id: "1",
        title: "Review dashboard metrics",
        completed: true,
        priority: "high",
        dueDate: "Today",
    },
    {
        id: "2",
        title: "Update API documentation",
        completed: false,
        priority: "high",
        dueDate: "Today",
    },
    {
        id: "3",
        title: "Team sync meeting",
        completed: false,
        priority: "medium",
        dueDate: "Tomorrow",
    },
    {
        id: "4",
        title: "Deploy staging build",
        completed: false,
        priority: "low",
        dueDate: "Dec 2",
    },
]; export function useTodoList() {
    const [todos, setTodos] = useState<TodoItem[]>(initialTodos);

    const toggleTodo = useCallback((id: string) => {
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    }, []);

    const stats = useMemo(() => {
        const total = todos.length;
        const completed = todos.filter((t) => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, percentage };
    }, [todos]);

    return {
        todos,
        toggleTodo,
        stats,
    };
}

// Keep old hook for backward compatibility
export function useCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );

    const handleDateSelect = useCallback((date: Date | undefined) => {
        setSelectedDate(date);
    }, []);

    return {
        selectedDate,
        handleDateSelect,
    };
}
