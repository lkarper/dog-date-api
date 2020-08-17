CREATE TABLE dog_date_pack_members (
    id INT PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INT REFERENCES dog_date_users(id) ON DELETE CASCADE NOT NULL,
    pack_member_id INT REFERENCES dog_date_dog_profiles(id) ON DELETE CASCADE NOT NULL
);