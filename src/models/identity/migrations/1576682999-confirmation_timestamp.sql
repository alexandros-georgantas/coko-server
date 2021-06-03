alter table only identities

add column confirmation_token_timestamp timestamp with time zone,
add constraint unique_confirmation_token unique(confirmation_token)
;
