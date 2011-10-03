-- DROP database test
-- CREATE database test
-- USE test

-- CREATE TABLE `users` (
-- 	`id` integer PRIMARY KEY AUTOINCREMENT, -- `id` int unsigned PRIMARY KEY,
-- 	-- `email` varchar(256) UNIQUE NOT NULL, -- CHARACTER SET latin1,
-- 	`device_push_id` varchar(256) DEFAULT NULL
-- ) -- DEFAULT CHARSET=utf8

CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT, -- `id` bigint unsigned PRIMARY KEY,
	`user_id` int unsigned NOT NULL,
	`device_type_id` mediumint unsigned NOT NULL,
	`activity_type_id` int unsigned NOT NULL,
	`start_time` timestamp NOT NULL,
	`duration` int NOT NULL,
	-- FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (activity_id) REFERENCES activity_types(id)
	-- FOREIGN KEY (device_type_id) REFERENCES device_types(id)
);

CREATE TABLE `current_activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`activity_type_id` mediumint unsigned NOT NULL,
	`start_time` integer NOT NULL
);

CREATE TABLE `localities` (
	`id` integer PRIMARY KEY AUTOINCREMENT, -- `id` bigint unsigned PRIMARY KEY,
	`user_id` int unsigned NOT NULL,
	`device_type_id` mediumint unsigned NOT NULL,
	`time` timestamp NOT NULL,
	`lat` decimal(10,7) NOT NULL,
	`lng` decimal(10,7) NOT NULL,
	FOREIGN KEY (user_id) REFERENCES users(id),
	FOREIGN KEY (device_type_id) REFERENCES devices(id)
);

CREATE TABLE `activity_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT, -- `id` int unsigned PRIMARY KEY,
	`name` varchar(256) NOT NULL -- CHARACTER SET latin1,
);

-- CREATE TABLE `device_types` (
-- 	`id` mediumint UNSIGNED PRIMARY KEY,
-- 	`make` varchar(256) NOT NULL,
-- 	`operating_system` varchar(256) NOT NULL
-- )

CREATE TABLE `schema_versions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`version` integer
);

INSERT INTO activity_types (name) VALUES ("Working");
INSERT INTO activity_types (name) VALUES ("Sleeping");
INSERT INTO activity_types (name) VALUES ("Reading");
INSERT INTO activity_types (name) VALUES ("Cooking");
INSERT INTO activity_types (name) VALUES ("Eating");
INSERT INTO activity_types (name) VALUES ("Facebook");
