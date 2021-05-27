CREATE UNIQUE INDEX only_one_reviewer_chat_per_manuscript_per_reviewer
ON chat_threads (related_object_id, chat_type, user_id)
WHERE chat_type = 'reviewer'
;

CREATE UNIQUE INDEX only_one_curator_chat_per_manuscript_per_curator
ON chat_threads (related_object_id, chat_type, user_id)
WHERE chat_type = 'curator'
;

ALTER TABLE ONLY chat_threads
ADD CONSTRAINT user_id_not_null_for_reviewer_and_curator_type_null_otherwise
CHECK
(
  ((chat_type = 'reviewer' OR chat_type = 'curator') AND user_id IS NOT NULL)
  OR
  (chat_type != 'reviewer' AND chat_type != 'curator' AND user_id IS NULL)
);
