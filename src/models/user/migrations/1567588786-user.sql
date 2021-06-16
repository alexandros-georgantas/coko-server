CREATE TABLE users (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  admin BOOLEAN DEFAULT false,
  username TEXT UNIQUE,
  password_hash TEXT,
  password_reset_token TEXT,
  password_reset_timestamp TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL,
  agreed_tc boolean not null default false,
  is_active boolean default true,
  affiliations jsonb,
  invitation_token text,
  given_names text,
  surname text,
  title_pre text,
  title_post text
);

CREATE TABLE identities (
  id UUID PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  type TEXT NOT NULL, -- local, orcid
  identifier TEXT, -- e.g. orcid ID
  name TEXT,
  aff TEXT,
  oauth JSONB,
  is_default BOOLEAN
);

CREATE UNIQUE INDEX is_default_idx ON identities (is_default, user_id) WHERE is_default IS true;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
