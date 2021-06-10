alter table only teams
alter column global set default false
;

CREATE UNIQUE INDEX unique_global_team
ON teams (role)
WHERE global = true;

CREATE UNIQUE INDEX unique_non_global_team_per_object
ON teams (role, object_id)
WHERE global = false;

ALTER TABLE ONLY teams
ADD CONSTRAINT global_teams_must_not_have_associated_objects_other_teams_must_have_them
CHECK
(
  (global = true AND object_id IS NULL AND object_type IS NULL)
  or
  (global = false AND object_id IS NOT NULL AND object_type IS NOT NULL)
);
