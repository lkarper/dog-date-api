CREATE TYPE meeting_type AS ENUM (
    'recurring',
    'once'
);

CREATE TABLE dog_date_howls (
    id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INT REFERENCES dog_date_users(id) ON DELETE CASCADE NOT NULL,
    howl_title TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zipcode TEXT NOT NULL,
    lat TEXT,
    lon TEXT,
    date TEXT,
    meeting_type meeting_type NOT NULL,
    personal_message TEXT
);