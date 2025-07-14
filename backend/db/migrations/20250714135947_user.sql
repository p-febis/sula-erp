-- migrate:up

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  is_super_user BOOLEAN NOT NULL DEFAULT FALSE,
  refresh_token_version INTEGER NOT NULL DEFAULT 1,
  password TEXT NOT NULL
);

CREATE INDEX idx_user_username ON "user"(username);


-- migrate:down
DROP INDEX idx_user_username;
DROP TABLE "user"
