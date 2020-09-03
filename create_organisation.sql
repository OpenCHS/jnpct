select create_db_user('jnpct', 'password');

INSERT into organisation (name, db_user, media_directory, uuid, parent_organisation_id)
values ('Jashoda Narottam Public Charitable Trust',
        'jnpct','jnpct', '2a8b0070-8869-41b6-94f8-c90a35d094f9', null);
