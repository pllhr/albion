-- Add quiz_score column
ALTER TABLE book_chapter_progress ADD COLUMN IF NOT EXISTS quiz_score INTEGER;

-- Create book_chapter_words table
CREATE TABLE IF NOT EXISTS book_chapter_words (
  user_id TEXT NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  chapter_index INTEGER NOT NULL,
  word TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id, chapter_index, word)
); 