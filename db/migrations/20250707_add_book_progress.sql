-- Add book_progress table
CREATE TABLE IF NOT EXISTS book_progress (
  user_id TEXT NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
  book_id TEXT NOT NULL,
  percentage INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, book_id)
); 