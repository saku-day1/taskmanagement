INSERT INTO tasks (title, description, deadline, priority, status, created_at, updated_at)
SELECT '要件定義書を作成する', 'お客さん向けの説明資料をまとめる', '2026-05-10', 'HIGH', 'IN_PROGRESS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = '要件定義書を作成する');

INSERT INTO tasks (title, description, deadline, priority, status, created_at, updated_at)
SELECT 'ログイン機能を実装する', 'JWT認証を使ったログインAPIを作る', '2026-05-20', 'HIGH', 'TODO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'ログイン機能を実装する');

INSERT INTO tasks (title, description, deadline, priority, status, created_at, updated_at)
SELECT 'UIデザインを決める', NULL, '2026-05-15', 'MEDIUM', 'TODO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'UIデザインを決める');

INSERT INTO tasks (title, description, deadline, priority, status, created_at, updated_at)
SELECT 'テストを書く', '主要APIのユニットテストを追加する', NULL, 'LOW', 'DONE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM tasks WHERE title = 'テストを書く');
