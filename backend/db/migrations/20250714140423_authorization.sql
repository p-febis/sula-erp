-- migrate:up
CREATE TABLE role (
	id SERIAL PRIMARY KEY,
	name TEXT NOT NULL UNIQUE
);

CREATE TABLE user_role (
	user_id INTEGER NOT NULL,
	role_id INTEGER NOT NULL,
	PRIMARY KEY (user_id, role_id),
	FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE,
	FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE
);

CREATE TABLE permission (
	id SERIAL PRIMARY KEY,
	key TEXT NOT NULL UNIQUE
);

CREATE TABLE role_permission (
	role_id INTEGER NOT NULL,
	permission_id INTEGER NOT NULL,
	PRIMARY KEY (role_id, permission_id),
	FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE CASCADE,
	FOREIGN KEY (permission_id) REFERENCES permission(id) ON DELETE CASCADE
);

-- migrate:down
DROP TABLE role_permission;
DROP TABLE permission;
DROP TABLE user_role;
DROP TABLE role;
