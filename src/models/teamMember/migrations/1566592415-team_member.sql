alter table only team_members

alter column team_id set not null,
alter column user_id set not null,

drop column alias_id,

add unique(team_id, user_id)
;

drop table if exists aliases;
