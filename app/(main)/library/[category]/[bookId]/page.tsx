import BookReader from "@/components/book-reader";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { bookProgress } from "@/db/schema";

async function fetchBookText(bookId: string): Promise<{ title: string; content: string }> {
  // tentativa via Gutendex se id numérico
  if (/^\d+$/.test(bookId)) {
    try {
      const res = await fetch(`https://gutendex.com/books/${bookId}`);
      if (!res.ok) throw new Error("fail");
      const json = await res.json();
      const txtUrl: string | undefined = json.formats["text/plain; charset=utf-8"] || json.formats["text/plain"];
      if (txtUrl) {
        const txtRes = await fetch(txtUrl);
        const text = await txtRes.text();
        return { title: json.title as string, content: text.slice(0, 10000) };
      }
    } catch {}
  }
  // fallback mock
  return {
    title: "Livro Desconhecido",
    content: "Esta é uma amostra de texto. Adicione conteúdo real futuramente.\n\nSegundo parágrafo de exemplo com mais palavras para testar o leitor.",
  };
}

export const dynamic = "force-dynamic";

export default async function BookPage({ params }: { params: { category: string; bookId: string } }) {
  const { title, content } = await fetchBookText(params.bookId);
  const { splitTextIntoChapters } = await import("@/lib/books");
  const chapters = splitTextIntoChapters(content);
  if (!content) return notFound();

  const lang: "en" | "pt" | "de" = "en";

  const { userId } = await auth();
  let savedPct = 0;
  if (userId) {
    const rec = await db.query.bookProgress.findFirst({
      where: (bp) => bp.bookId === params.bookId && bp.userId === userId,
    });
    if (rec) savedPct = rec.percentage;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 text-sm text-blue-600">
        <Link href="/library" className="underline">Biblioteca</Link> / <Link href={`/library/${params.category}`} className="underline">{params.category}</Link> / {title}
      </div>
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <BookReader lang={lang} text={content} chapters={chapters} bookId={params.bookId} initialProgress={savedPct} />
      <div className="text-right mt-6">
        <Link href={`/library/${params.category}/${params.bookId}/exercise`} className="underline text-green-600 hover:text-green-800">Exercícios</Link>
      </div>
      {savedPct > 1 && (
        <button
          onClick={() => {
            const doc = document.documentElement;
            const total = doc.scrollHeight - doc.clientHeight;
            window.scrollTo({ top: (savedPct / 100) * total, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 z-50"
        >Continuar {savedPct.toFixed(0)}%</button>
      )}
    </div>
  );
} 