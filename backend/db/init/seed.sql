
WITH models AS (
  SELECT unnest(ARRAY['customer', 'role', 'user', 'permission']) AS model
),
actions AS (
  SELECT unnest(ARRAY['create', 'read', 'update', 'delete']) AS action
),
permissions_to_insert AS (
  SELECT action || ':' || model AS key
  FROM models, actions
)

INSERT INTO permission (key)
SELECT key
FROM permissions_to_insert
WHERE NOT EXISTS (
  SELECT 1 FROM permission p WHERE p.key = permissions_to_insert.key
);
