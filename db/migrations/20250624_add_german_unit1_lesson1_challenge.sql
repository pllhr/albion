-- Adiciona a primeira questão à primeira lição do curso de Alemão
WITH german_course AS (
    SELECT id FROM courses WHERE lower(title) = 'german' LIMIT 1
), first_unit AS (
    SELECT id FROM units WHERE course_id = (SELECT id FROM german_course) ORDER BY "order" LIMIT 1
), first_lesson AS (
    SELECT id FROM lessons WHERE unit_id = (SELECT id FROM first_unit) ORDER BY "order" LIMIT 1
), inserted_challenge AS (
    INSERT INTO challenges (lesson_id, type, question, "order")
    VALUES ((SELECT id FROM first_lesson), 'SELECT', 'Hallo!', 1)
    RETURNING id
)
INSERT INTO challenge_options (challenge_id, text, correct)
VALUES
    ((SELECT id FROM inserted_challenge), 'Oi', true),
    ((SELECT id FROM inserted_challenge), 'Prazer', false),
    ((SELECT id FROM inserted_challenge), 'Tchau', false),
    ((SELECT id FROM inserted_challenge), 'Obrigado', false); 