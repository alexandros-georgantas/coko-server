CREATE TABLE teams (
  id UUID PRIMARY KEY,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT current_timestamp,
  updated TIMESTAMP WITH TIME ZONE,
  object_id UUID,
  object_type varchar(255),
  name TEXT,
  role TEXT NOT NULL,
  members JSONB,
  owners JSONB,
  global BOOLEAN DEFAULT false,
  type TEXT NOT NULL
);

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
