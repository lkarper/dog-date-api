CREATE TABLE dog_date_review_comments (
    id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    review_id INT REFERENCES dog_date_reviews(id) ON DELETE CASCADE NOT NULL,
    commenter TEXT REFERENCES dog_date_users(username) ON DELETE CASCADE NOT NULL,
    date_time TIMESTAMPTZ NOT NULL,
    comment TEXT NOT NULL,
    edited BOOLEAN DEFAULT FALSE NOT NULL
);