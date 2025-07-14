-- Add priority column to todos
ALTER TABLE todos
  ADD COLUMN priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high'));

-- Create index for filtering by priority
CREATE INDEX IF NOT EXISTS todos_priority_idx ON todos(priority);
