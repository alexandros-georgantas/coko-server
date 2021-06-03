create table identities(
  id uuid primary key,
  created timestamp with time zone not null default current_timestamp,
  updated timestamp with time zone,

  user_id uuid references users,

  email text not null,
  is_default boolean, -- either true or null
  is_confirmed boolean not null,
  confirmation_token text,

  type text not null,

  constraint unique_email unique(email),
  constraint only_one_default_per_user unique (user_id, is_default)
);
