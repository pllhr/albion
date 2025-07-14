-- Add tables for guided reading feature

CREATE TABLE story (
    id SERIAL PRIMARY KEY,
    lang text NOT NULL,
    title text NOT NULL,
    difficulty text NOT NULL, -- basic, intermediate, advanced
    slug text NOT NULL UNIQUE,
    content text NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE reading_progress (
    user_id text NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
    story_id integer NOT NULL REFERENCES story(id) ON DELETE CASCADE,
    completed boolean NOT NULL DEFAULT false,
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, story_id)
);

CREATE TABLE known_word (
    user_id text NOT NULL REFERENCES user_progress(user_id) ON DELETE CASCADE,
    lang text NOT NULL,
    word text NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, lang, word)
);
