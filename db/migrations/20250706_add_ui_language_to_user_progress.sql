-- add enum for UI language and column to user_progress
CREATE TYPE ui_language AS ENUM ('de', 'en', 'pt');

ALTER TABLE user_progress
ADD COLUMN ui_language ui_language;
