import 'dotenv/config';
import { db } from '@/lib/db';
import { stories } from '@/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const existing = await db.select().from(stories);
  if (existing.length > 0) {
    console.log('Stories already exist, skipping seed.');
    return;
  }

  await db.insert(stories).values([
    { order: 1, lang: 'en', title: 'A Day at the Park', difficulty: 'basic', slug: 'day-at-the-park-en', imageSrc: '/story.svg', content: 'Amy has a dog. The dog is brown. They go to the park. Amy throws a ball. The dog runs and gets the ball. Amy laughs.' },
    { order: 2, lang: 'en', title: 'The Lost Cat', difficulty: 'intermediate', slug: 'lost-cat-en', imageSrc: '/story.svg', content: 'Tom cannot find his cat, Whiskers. He looks under the bed, behind the sofa, and in the garden. Finally, he hears a soft meow from the tree. Tom climbs a ladder and rescues Whiskers.' },
    { order: 3, lang: 'en', title: 'Journey to the Mountains', difficulty: 'advanced', slug: 'journey-mountains-en', imageSrc: '/story.svg', content: 'Maria embarked on a challenging expedition across the rugged mountain range. Battling unpredictable weather and treacherous cliffs, she discovered inner resilience she never knew she possessed.' },

    { order: 4, lang: 'pt', title: 'Um Dia no Parque', difficulty: 'basic', slug: 'dia-no-parque-pt', imageSrc: '/story.svg', content: 'Ana tem um cachorro. O cachorro é marrom. Eles vão ao parque. Ana joga uma bola. O cachorro corre e pega a bola. Ana ri.' },
    { order: 5, lang: 'pt', title: 'O Gato Perdido', difficulty: 'intermediate', slug: 'gato-perdido-pt', imageSrc: '/story.svg', content: 'João não encontra seu gato, Bigodes. Ele procura debaixo da cama, atrás do sofá e no jardim. Finalmente, ele ouve um miado suave vindo da árvore. João sobe a escada e resgata Bigodes.' },
    { order: 6, lang: 'pt', title: 'Viagem às Montanhas', difficulty: 'advanced', slug: 'viagem-montanhas-pt', imageSrc: '/story.svg', content: 'Maria embarcou em uma expedição desafiadora pelas montanhas acidentadas. Enfrentando clima imprevisível e penhascos traiçoeiros, ela descobriu uma resiliência interior que nunca soube que possuía.' },

    { order: 7, lang: 'de', title: 'Ein Tag im Park', difficulty: 'basic', slug: 'tag-im-park-de', imageSrc: '/story.svg', content: 'Anna hat einen Hund. Der Hund ist braun. Sie gehen in den Park. Anna wirft einen Ball. Der Hund rennt und holt den Ball. Anna lacht.' },
    { order: 8, lang: 'de', title: 'Die Verlorene Katze', difficulty: 'intermediate', slug: 'verlorene-katze-de', imageSrc: '/story.svg', content: 'Tom kann seine Katze Whiskers nicht finden. Er sucht unter dem Bett, hinter dem Sofa und im Garten. Schließlich hört er ein leises Miauen vom Baum. Tom klettert die Leiter hinauf und rettet Whiskers.' },
    { order: 9, lang: 'de', title: 'Reise in die Berge', difficulty: 'advanced', slug: 'reise-berge-de', imageSrc: '/story.svg', content: 'Maria begab sich auf eine herausfordernde Expedition über das rauhe Gebirge. Trotz unvorhersehbaren Wetters und gefährlicher Klippen entdeckte sie eine innere Stärke, von der sie nie wusste, dass sie sie besaß.' }
  ]);

  console.log('Stories seeded successfully.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
