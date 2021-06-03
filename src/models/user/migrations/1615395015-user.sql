alter table only users

drop column if exists collections,
drop column if exists fragments,
drop column if exists teams,
drop column if exists email,

alter column admin set default false,

add column agreed_tc boolean not null default false,
add column is_active boolean default true,
add column affiliations jsonb,
add column invitation_token text,

add column given_names text,
add column surname text,
add column title_pre text,
add column title_post text
;
