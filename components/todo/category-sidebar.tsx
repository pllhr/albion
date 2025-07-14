"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type Category = { id: number; name: string };

interface Props {
  courseId: number;
  selectedId: number | null;
  onSelect: (id: number | null) => void;
}

export const CategorySidebar = ({ courseId, selectedId, onSelect }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchCategories = async () => {
    const res = await fetch(`/api/courses/${courseId}/categories`);
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const createCategory = async () => {
    if (!newName.trim()) return;
    const res = await fetch(`/api/courses/${courseId}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      setAdding(false);
      fetchCategories();
    }
  };

  const renameCategory = async (id: number, name: string) => {
    const newName = prompt("Novo nome", name);
    if (!newName || newName.trim() === "") return;
    await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    if (!confirm("Excluir categoria?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (selectedId === id) onSelect(null);
    fetchCategories();
  };

  return (
    <div className="border-r w-56 flex-shrink-0 bg-white">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full text-left px-4 py-2 border-b flex items-center justify-between hover:bg-neutral-50"
      >
        <span className="font-semibold text-sm">Categorias</span>
        {collapsed ? <Plus className="w-4 h-4 rotate-45" /> : <X className="w-4 h-4" />}
      </button>
      {collapsed ? null : (
        <div className="p-3 space-y-1 text-sm">
          <button
            onClick={() => onSelect(null)}
            className={cn("block w-full text-left px-2 py-1 rounded", selectedId === null && "bg-[#d9f6d9]")}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center group">
              <button
                onClick={() => onSelect(cat.id)}
                className={cn(
                  "flex-1 text-left px-2 py-1 rounded",
                  selectedId === cat.id && "bg-[#d9f6d9]"
                )}
              >
                {cat.name}
              </button>
              <button onClick={() => renameCategory(cat.id, cat.name)} className="p-1 opacity-0 group-hover:opacity-100">
                <Edit2 className="w-3 h-3" />
              </button>
              <button onClick={() => deleteCategory(cat.id)} className="p-1 opacity-0 group-hover:opacity-100">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {adding ? (
            <div className="flex gap-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 border px-1 text-sm"
                placeholder="Nome"
              />
              <button className="text-[#58cc02] text-xs" onClick={createCategory}>
                OK
              </button>
            </div>
          ) : (
            <button onClick={() => setAdding(true)} className="text-[#58cc02] text-xs">
              <Plus className="inline w-3 h-3" /> Nova categoria
            </button>
          )}
        </div>
      )}
    </div>
  );
};
