"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { useTodoEditor } from "@/store/use-todo-editor";
import { cn } from "@/lib/utils";
import { EditorContent, useEditor, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

import Blockquote from "@tiptap/extension-blockquote";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";



interface TodoEditorModalProps {
  courseId: number;
}

interface ToolbarProps { editor: any; }

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;
  const button = (label: string, action: () => void, active: boolean) => (
    <button
      type="button"
      onClick={action}
      className={cn(
        "px-1.5 py-0.5 rounded text-sm",
        active ? "bg-[#58cc02] text-white" : "hover:bg-neutral-200"
      )}
    >
      {label}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-1 border rounded-md p-2 mb-2">
      {button("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"))}
      {button("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"))}
      {button("H1", () => editor.chain().focus().toggleHeading({ level: 1 }).run(), editor.isActive("heading", { level: 1 }))}
      {button("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {button("UL", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {button("OL", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      {button("☑", () => editor.chain().focus().toggleTaskList().run(), editor.isActive("taskList"))}
      {button("Code", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"))}
      {button("Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}
      <input
        type="color"
        onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        className="w-6 h-6 p-0 border cursor-pointer"
        title="Color"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            editor.chain().focus().setImage({ src: reader.result as string }).run();
          };
          reader.readAsDataURL(file);
        }}
        title="Add image"
      />
    </div>
  );
};

export const TodoEditorModal = ({ courseId }: TodoEditorModalProps) => {
  const { isOpen, close, todoId } = useTodoEditor();
  const [loading, setLoading] = useState(false);
  const [initialContent, setInitialContent] = useState<string>("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Heading.configure({ levels: [1, 2, 3] }),
      TaskList,
      TaskItem,

      Blockquote,
      Color,
      TextStyle,
      Image,
    ],
    content: initialContent || "<p></p>",
  });

  useEffect(() => {
    if (isOpen && todoId) {
      setLoading(true);
      fetch(`/api/todos/${todoId}`)
        .then((res) => res.json())
        .then((data) => {
          setTitle(data.title);
          setInitialContent(data.contentRichText || "<p></p>");
          setPriority((data.priority as "low" | "normal" | "high") ?? "normal");
          setLoading(false);
        });
    } else if (isOpen && !todoId) {
      setTitle("");
      setInitialContent("<p></p>");
      editor?.commands.setContent("<p></p>");
      setPriority("normal");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, todoId]);

  const handleSave = async () => {
    if (!title.trim()) return;
    const payload = {
      title,
      contentRichText: editor?.getHTML() ?? "",
      priority,
    };
    setLoading(true);
    const res = await fetch(todoId ? `/api/todos/${todoId}` : `/api/courses/${courseId}/todos`, {
      method: todoId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      close();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl w-full max-w-xl shadow-xl flex flex-col h-[80vh]">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">{todoId ? "Editar nota" : "Nova nota"}</h2>
          <button onClick={close} aria-label="Fechar">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#58cc02]"
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="border rounded-md p-2 text-sm"
            >
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
            </select>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin h-6 w-6 text-neutral-500" />
            </div>
          ) : (
            <> 
              <Toolbar editor={editor} />
              <EditorContent editor={editor} className="prose max-w-none border rounded-md p-2 min-h-[200px]" />
            </>
          )}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 rounded-md text-sm bg-neutral-200 hover:bg-neutral-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={loading || !title.trim()}
            onClick={handleSave}
            className={cn(
              "px-4 py-2 rounded-md text-sm bg-[#58cc02] text-white hover:brightness-110 disabled:opacity-50"
            )}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
