"use client";

export async function markChapterRead(bookId: string, chapterIndex: number) {
  const res = await fetch("/api/book-chapter-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookId, chapterIndex }),
  });
  if (!res.ok) {
    throw new Error("Failed to mark chapter read");
  }
}
