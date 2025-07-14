export function splitTextIntoChapters(text: string, wordsPerChapter: number = 6000): string[] {
  const words = text.split(/\s+/);
  const chapters: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerChapter) {
    chapters.push(words.slice(i, i + wordsPerChapter).join(" "));
  }
  return chapters;
} 