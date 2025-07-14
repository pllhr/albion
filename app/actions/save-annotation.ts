"use client";

export interface AnnotationInput {
  id?: number;
  bookId: number;
  chapterIndex: number;
  startOffset: number;
  endOffset: number;
  type: "highlight" | "note";
  color: string;
  content?: string;
}

export async function saveAnnotation(input: AnnotationInput) {
  const res = await fetch("/api/annotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to save annotation");
  return res.json();
}
