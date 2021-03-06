CREATE TABLE plant_dex_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    username TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    nickname TEXT,
    password TEXT NOT NULL,
    date_created TIMESTAMPTZ DEFAULT now() NOT NUll,
    date_modified TIMESTAMPTZ
);