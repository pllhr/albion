-- Corrige o caminho da bandeira do curso de Alemão
UPDATE courses SET image_src = '/alemao.png' WHERE lower(title) = 'german'; 