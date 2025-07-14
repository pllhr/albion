import 'dotenv/config';
import { db } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';
import { books, bookChapters } from '@/db/schema';

async function main() {
  try {
    console.log('Seeding books...');

    // Para evitar duplicatas, deletamos todos os livros antes de popular.
    await db.delete(books);

    // Inserimos livros e capturamos o id do Clean Code
    const insertedBooks = await db.insert(books).values([
      {
        title: 'Clean Code',
        category: 'programming',
        imageSrc: '/cleancode.png',
        pdfSrc: '/Codigo Limpo - Completo PT.pdf',
      },
      {
        title: 'The Pragmatic Programmer',
        category: 'programming',
        imageSrc: '/pragmatic.png',
      },
      {
        title: 'A Brief History of Time',
        category: 'science',
        imageSrc: '/books/historyoftime.png',
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        category: 'history',
        imageSrc: '/books/sapiens.png',
      },
    ]).returning();

    const cleanCode = insertedBooks.find(b => b.title === 'Clean Code');

    if (cleanCode) {
      // Ler capítulos markdown
      const dir = path.join(__dirname, 'books', 'clean-code');
      const files = await fs.readdir(dir);
      const mdFiles = files.filter(f => f.endsWith('.md')).sort();

      const chapters = await Promise.all(mdFiles.map(async (file, idx) => {
        const content = await fs.readFile(path.join(dir, file), 'utf-8');
        const firstLineEnd = content.indexOf('\n');
        const titleLine = firstLineEnd !== -1 ? content.slice(0, firstLineEnd).replace(/^#\s*/, '') : `Capítulo ${idx+1}`;
        return {
          bookId: cleanCode.id,
          index: idx,
          title: titleLine,
          content,
        };
      }));

      if (chapters.length) {
        await db.insert(bookChapters).values(chapters);
        console.log(`Inseridos ${chapters.length} capítulos de Clean Code.`);
      }
    }

    console.log('Books seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding books:', error);
    process.exit(1);
  }
}

main();
