CREATE UNIQUE INDEX only_one_author_chat_per_manuscript
ON chat_threads (related_object_id, chat_type)
WHERE chat_type = 'author';

CREATE UNIQUE INDEX only_one_science_officer_chat_per_manuscript
ON chat_threads (related_object_id, chat_type)
WHERE chat_type = 'scienceOfficer';
