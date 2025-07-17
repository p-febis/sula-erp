-- migrate:up
CREATE TABLE category (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES category(id) ON DELETE SET NULL
)

-- migrate:down
DROP TABLE category;
