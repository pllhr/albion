"use client";

import { useEffect, useState } from "react";
import { Plus, GripVertical } from "lucide-react";
import { CategorySidebar } from "@/components/todo/category-sidebar";
import { cn } from "@/lib/utils";
import { useTodoEditor } from "@/store/use-todo-editor";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Types -----------------------------------------------------------

type TodoItem = {
  id: number;
  title: string;
  isDone: boolean;
  position: number;
  status: "backlog" | "doing" | "done";
  categoryId: number | null;
  priority: "low" | "normal" | "high";
};

const columns: TodoItem["status"][] = ["backlog", "doing", "done"];
const columnLabels: Record<TodoItem["status"], string> = {
  backlog: "Backlog",
  doing: "Em progresso",
  done: "Concluído",
};

// Main component --------------------------------------------------

interface Props {
  courseId: number;
}

export const TodoBoardClient = ({ courseId }: Props) => {
  const { open: openEditor } = useTodoEditor();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      const res = await fetch(`/api/courses/${courseId}/todos`);
      const data = (await res.json()) as TodoItem[];
      setTodos(data);
      setLoading(false);
    };
    fetchTodos();
  }, [courseId]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return;

    const activeTodo = todos.find((t) => t.id === active.id);
    if (!activeTodo) return;

    // Determine target column & position
    let targetStatus: TodoItem["status"];
    let targetIndex = 0;

    const overTodo = todos.find((t) => t.id === over.id);
    if (overTodo) {
      targetStatus = overTodo.status;
      const siblings = todos.filter((t) => t.status === targetStatus).sort((a, b) => a.position - b.position);
      targetIndex = siblings.findIndex((t) => t.id === overTodo.id);
    } else if (columns.includes(over.id as any)) {
      targetStatus = over.id as TodoItem["status"];
      targetIndex = 0;
    } else {
      return;
    }

    // Build new list
    const updated = todos.map((t) => ({ ...t }));

    // Remove from old list
    const oldSiblings = updated
      .filter((t) => t.status === activeTodo.status)
      .sort((a, b) => a.position - b.position);
    oldSiblings.splice(oldSiblings.findIndex((t) => t.id === activeTodo.id), 1);
    oldSiblings.forEach((t, idx) => (t.position = idx));

    // Insert into new list
    const newSiblings = updated
      .filter((t) => t.status === targetStatus && t.id !== activeTodo.id)
      .sort((a, b) => a.position - b.position);
    newSiblings.splice(targetIndex, 0, { ...activeTodo, status: targetStatus });
    newSiblings.forEach((t, idx) => (t.position = idx));

    setTodos(updated);

    // Persist server-side
    await fetch(`/api/todos/${activeTodo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: targetStatus, position: targetIndex }),
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Minhas notas</h1>
        <button onClick={() => openEditor()} className="flex items-center gap-1 text-sm text-[#58cc02] hover:underline">
          <Plus className="h-4 w-4" /> Nova
        </button>
      </div>

      {/* layout with sidebar */}
      <div className="flex">
        <CategorySidebar courseId={courseId} selectedId={categoryId} onSelect={setCategoryId} />
        <div className="flex-1 overflow-auto">
          {loading ? (
        <p className="text-neutral-500 text-sm">Carregando...</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => {
              const colTodos = todos
                .filter((t) => (categoryId === null ? true : t.categoryId === categoryId))
                .filter((t) => t.status === col)
                .sort((a, b) => a.position - b.position);
              return (
                <Column key={col} id={col} label={columnLabels[col]} todos={colTodos} openEditor={openEditor} />
              );
            })}
          </div>
        </DndContext>
          )}
        </div>
      </div>
    </div>
  );
};

// Column -----------------------------------------------------------

interface ColumnProps {
  id: TodoItem["status"];
  label: string;
  todos: TodoItem[];
  openEditor: (id?: number) => void;
}

const Column = ({ id, label, todos, openEditor }: ColumnProps) => {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="bg-[#f8fff3] border border-[#b9efb9] rounded-lg p-3 flex flex-col min-h-[300px]">
      <h3 className="text-sm font-semibold mb-2">{label}</h3>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        {todos.map((t) => (
          <TodoCard key={t.id} todo={t} onClick={() => openEditor(t.id)} />
        ))}
      </SortableContext>
      <button onClick={() => openEditor()} className="mt-2 text-xs text-[#58cc02] hover:underline flex gap-1 items-center">
        <Plus className="h-3 w-3" /> Nova
      </button>
    </div>
  );
};

// Card -------------------------------------------------------------

const priorityColors: Record<"low" | "normal" | "high", string> = {
  low: "bg-neutral-300 text-neutral-700",
  normal: "bg-blue-200 text-blue-800",
  high: "bg-red-300 text-red-800",
};

interface CardProps {
  todo: TodoItem;
  onClick: () => void;
}

const TodoCard = ({ todo, onClick }: CardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: todo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2 text-left bg-white border border-[#d9f6d9] rounded-md p-2 hover:bg-[#ecffe9]"
      >
        <GripVertical className="h-4 w-4 text-neutral-400" />
        <p className={cn("flex-1 text-sm font-medium", todo.isDone && "line-through text-neutral-400")}>{todo.title}</p>
        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", priorityColors[todo.priority ?? "normal"])}>{todo.priority === "low" ? "Low" : todo.priority === "high" ? "High" : "Normal"}</span>
      </button>
    </div>
  );
};
