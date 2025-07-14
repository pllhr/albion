-- Migration: Add crystals column to user_progress
ALTER TABLE user_progress ADD COLUMN crystals INTEGER NOT NULL DEFAULT 0;
