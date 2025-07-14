import { db } from '@/lib/db';
import { stories, knownWord } from '@/db/schema';
import { StoryReader } from '@/components/story-reader';
import { I18nProvider } from '@/providers/i18n-provider';
import { t } from '@/utils/i18n';
import { eq } from 'drizzle-orm';
import { auth } from '@clerk/nextjs';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function StoryPage({ params }: { params: { slug: string } }) {
  const { userId } = auth();
  const story = await db.query.stories.findFirst({ where: eq(stories.slug, params.slug) });
  if (!story) return <div>Not found</div>;

  const lang = story.lang as 'en' | 'pt' | 'de';

  const known = userId ? await db.select({ word: knownWord.word }).from(knownWord).where(eq(knownWord.userId, userId)) : [];
  const knownSet = new Set(known.map(k => k.word.toLowerCase()));

  // TODO highlight only unknown words; pass full text for now
  return (
    <I18nProvider lang={lang}>
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/reading">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-5 w-5 stroke-2 text-neutral-400" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{story.title}</h1>
        </div>
        <StoryReader lang={lang} text={story.content} known={knownSet} />
      </div>
    </I18nProvider>
  );
}
