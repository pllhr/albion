import { auth } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import ChaptersSidebar from '@/components/chapters-sidebar';
import { Button } from '@/components/ui/button';
import { StoryReader } from '@/components/story-reader';
import { getBookWithChapters, getBookChapter } from '@/db/queries';
import { knownWord, bookChapterProgress } from '@/db/schema';
import { db } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { I18nProvider } from '@/providers/i18n-provider';
import { ReaderSettingsProvider } from '@/providers/reader-settings-context';

export const dynamic = 'force-dynamic';

interface Props {
  params: { id: string; chapter: string };
}

export default async function BookReaderPage({ params }: Props) {
  const bookId = Number(params.id);
  const chapterIndex = Number(params.chapter);
  if (Number.isNaN(bookId) || Number.isNaN(chapterIndex)) return <div>Invalid params</div>;

  const { userId } = auth();

  const [book, chapter] = await Promise.all([
    getBookWithChapters(bookId),
    getBookChapter(bookId, chapterIndex),
  ]);

  if (!book || !chapter) return <div>Not found</div>;

  // Salvar progresso como 100% ao abrir capítulo
  if (userId) {
    await db.insert(bookChapterProgress)
      .values({ userId, bookId: String(bookId), chapterIndex, percentage: 100 })
      .onConflictDoNothing();
  }

  // TODO: derive lang from book in future; default pt
  const lang: 'en' | 'pt' | 'de' = 'pt';

  const [known, progressArr] = userId ? await Promise.all([
    db.select({ word: knownWord.word }).from(knownWord).where(eq(knownWord.userId, userId)),
    db.select({ chapterIndex: bookChapterProgress.chapterIndex }).from(bookChapterProgress).where(and(eq(bookChapterProgress.userId, userId), eq(bookChapterProgress.bookId, String(bookId)), eq(bookChapterProgress.percentage, 100)))
  ]) : [[], [] as { chapterIndex: number }[]];
  const completedSet = new Set(progressArr.map(p => p.chapterIndex));
  const knownSet = new Set((known as { word: string }[]).map(k => k.word.toLowerCase()));

  return (
    <I18nProvider lang={lang}>
    <ReaderSettingsProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-48 border-r p-4 space-y-4 bg-white/60 backdrop-blur-lg">
          <Link href="/library/programming">
            <Button variant="ghost" size="sm" className="mb-4"><ArrowLeft className="h-5 w-5 mr-1" /> Voltar</Button>
          </Link>
          <h2 className="text-xl font-bold mb-2">Sessões</h2>
          <ChaptersSidebar bookId={bookId} chapters={book.chapters ?? []} currentIndex={chapterIndex} completed={completedSet} />
        </aside>

        {/* Reader */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="relative mb-6 flex items-center justify-between">
            {/* Navegação de capítulos removida: avanço de página é controlado dentro do StoryReader */}
            {chapterIndex > 0 && (
              <Link href={`/reading/book/${bookId}/${chapterIndex - 1}`} className="text-gray-600 hover:text-gray-800" aria-label="Capítulo anterior">
                <ArrowLeft size={28} />
              </Link>
            )}
            <h1 className="text-2xl font-bold">{book.title}</h1>
            {book.chapters && chapterIndex + 1 < book.chapters.length && (
              <Link href={`/reading/book/${bookId}/${chapterIndex + 1}`} className="absolute right-0 top-1 text-gray-600 hover:text-gray-800" aria-label="Próximo capítulo">
                <ArrowRight size={28} />
              </Link>
            )}
          </div>
          <StoryReader lang={lang} text={chapter.content} known={knownSet} bookId={String(bookId)} chapterIndex={chapterIndex} />
        </main>
      </div>
        </ReaderSettingsProvider>
</I18nProvider>
  );
}
