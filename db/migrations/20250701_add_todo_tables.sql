-- Migration: add todo_categories and todos tables

-- 1. todo_categories table
CREATE TABLE IF NOT EXISTS todo_categories (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_by TEXT NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. todos table
CREATE TABLE IF NOT EXISTS todos (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES todo_categories(id) ON DELETE SET NULL,
    user_id TEXT NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_rich_text TEXT,
    is_done BOOLEAN NOT NULL DEFAULT FALSE,
    is_private BOOLEAN NOT NULL DEFAULT TRUE,
    position INTEGER NOT NULL DEFAULT 0,
    due_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_todo_course ON todos(course_id);
CREATE INDEX IF NOT EXISTS idx_todo_user ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_position ON todos(position);
