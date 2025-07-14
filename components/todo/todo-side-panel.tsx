"use client";

import { X, Plus, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useTodoPanel } from "@/store/use-todo-panel";
import { useTodoEditor } from "@/store/use-todo-editor";

import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


interface TodoSidePanelProps {
  courseId: number;
}

type TodoItem = { id: number; title: string; isDone: boolean; position: number };

interface SortableTodoProps {
  todo: TodoItem;
  onClick: () => void;
}

const SortableTodo = ({ todo, onClick }: SortableTodoProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as React.CSSProperties;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <button
        onClick={onClick}
        className="w-full flex items-center gap-2 text-left bg-[#f8fff3] border border-[#b9efb9] rounded-lg p-2 hover:bg-[#ecffe9]"
      >
        <GripVertical className="h-4 w-4 text-neutral-400 flex-shrink-0" />
        <p className={cn("text-sm font-medium", todo.isDone && "line-through text-neutral-400")}>{todo.title}</p>
      </button>
    </div>
  );
};

export const TodoSidePanel = ({ courseId }: TodoSidePanelProps) => {
  const { isOpen, close } = useTodoPanel();
  const { open: openEditor } = useTodoEditor();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    type TodoItem = { id: number; title: string; isDone: boolean; position: number };
  const fetchTodos = async () => {
      setLoading(true);
       const res = await fetch(`/api/courses/${courseId}/todos`);
       let data: TodoItem[] = [];
       if (res.ok) {
         try {
           data = await res.json();
         } catch {}
       }
       setTodos(data);
      setLoading(false);
    };
    fetchTodos();
  }, [isOpen, courseId]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const newTodos = arrayMove(todos, oldIndex, newIndex).map((t: TodoItem, idx: number) => ({ ...t, position: idx }));
    setTodos(newTodos);
    // persist positions
    await Promise.all(
      newTodos.map((t: TodoItem) =>
        fetch(`/api/todos/${t.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ position: t.position }),
        })
      )
    );
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 z-40 w-80 max-w-full transform bg-white shadow-2xl transition-transform duration-300",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-bold text-lg">Minhas notas</h2>
        <button
          type="button"
          aria-label="Nova nota"
          onClick={() => openEditor()}
          className="flex items-center gap-1 text-sm font-medium text-[#58cc02] hover:underline"
        >
          <Plus className="h-4 w-4" /> Nova
        </button>
        <button onClick={close} aria-label="Fechar" className="ml-2">
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="p-4 overflow-y-auto space-y-4">
        {loading && <p className="text-sm text-neutral-500">Carregando...</p>}
        {!loading && todos.length === 0 && (
          <p className="text-sm text-neutral-500">Nenhuma nota ainda.</p>
        )}
        {!loading && (
            <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                {todos.map((todo) => (
                  <SortableTodo key={todo.id} todo={todo} onClick={() => openEditor(todo.id)} />
                ))}
              </SortableContext>
            </DndContext>
         )}
      </div>
    </div>
  );
};
