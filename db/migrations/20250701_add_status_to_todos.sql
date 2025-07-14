-- add status column to todos
ALTER TABLE todos ADD COLUMN status TEXT NOT NULL DEFAULT 'backlog';

-- create index for faster filtering by status
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
