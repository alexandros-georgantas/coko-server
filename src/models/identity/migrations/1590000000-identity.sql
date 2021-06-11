alter table only identities

add column email text not null,
add column orcid text,
add column is_confirmed boolean not null,
add column confirmation_token text,
add column confirmation_token_timestamp timestamp with time zone,
add constraint unique_confirmation_token unique(confirmation_token),
add constraint unique_email unique(email)
;
