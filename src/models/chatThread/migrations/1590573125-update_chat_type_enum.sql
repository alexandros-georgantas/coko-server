ALTER TABLE ONLY chat_threads
DROP CONSTRAINT chat_threads_chat_type_check
;

ALTER TABLE ONLY chat_threads
ADD CONSTRAINT chat_threads_chat_type_check
CHECK
(
  chat_type = ANY(ARRAY['scienceOfficer', 'author', 'reviewer', 'curator'])
)
;
