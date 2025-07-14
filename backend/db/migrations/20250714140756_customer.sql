-- migrate:up
CREATE TABLE customer (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT
);

-- migrate:down
DROP TABLE customer;
