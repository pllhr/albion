import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';

import { I18nProvider } from '@/providers/i18n-provider';
import { t } from '@/utils/i18n';
import { getStories, getUserStoryLikes, getUserStorySaves } from '@/db/queries';
import { stories } from '@/db/schema';
import { StoryCard } from '@/components/cards/story-card';

export const dynamic = 'force-dynamic';

export default async function ReadingPage() {
  // TODO: identify user uiLanguage from progress (reuse helper)
  const lang: 'en' | 'pt' | 'de' = 'en';

  const { userId } = auth();
  const [storiesData, userStoryLikes, userStorySaves] = await Promise.all([
    getStories(),
    getUserStoryLikes(userId),
    getUserStorySaves(userId),
  ]);

  type Story = typeof stories.$inferSelect;

  // Agrupar por idioma
  const grouped: Record<string, Story[]> = {};
  storiesData.forEach((s) => {
    if (!grouped[s.lang]) grouped[s.lang] = [];
    grouped[s.lang].push(s);
  });

  const langNames: Record<string, string> = { en: 'English', pt: 'Português', de: 'Deutsch' };
  const flagSrc: Record<string, string> = { en: '/eua.png', pt: '/brasil.png', de: '/alemao.png' };

  return (
    <I18nProvider lang={lang}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-extrabold mb-4">{t('reading', lang)}</h1>
        {Object.entries(grouped).map(([lng, storiesArr]) => (
          <div key={lng} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              {flagSrc[lng] && (
                <div className="transition-transform duration-300 hover:scale-110">
                  <Image src={flagSrc[lng]} alt={`${lng} flag`} width={38} height={28} className="rounded-sm" />
                </div>
              )}
              <h2 className="text-xl font-bold">{langNames[lng] ?? lng.toUpperCase()}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {storiesArr.map((story) => (
                <StoryCard
                  key={story.id}
                  id={story.id}
                  title={story.title}
                  imageSrc={story.imageSrc!}
                  slug={story.slug}
                  isLiked={userStoryLikes.some((like) => like.storyId === story.id)}
                  isSaved={userStorySaves.some((save) => save.storyId === story.id)}
                  disabled={!userId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </I18nProvider>
  );
}
