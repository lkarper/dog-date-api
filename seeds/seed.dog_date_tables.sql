BEGIN;

TRUNCATE
    dog_date_users,
    dog_date_dog_profiles,
    dog_date_howls,
    dog_date_dogs_in_howls,
    dog_date_time_windows,
    dog_date_reviews,
    dog_date_review_comments,
    dog_date_user_saved_howls,
    dog_date_pack_members RESTART IDENTITY CASCADE;

SET CLIENT_ENCODING TO 'utf8';

INSERT INTO dog_date_users (email, phone, username, password)
VALUES
    ('sample@fake-email.com', '123-456-7890', 'pjfry2000', '$2y$12$SE5C7zJX1fNKzahMTjqA9eLrkPBYUcSccGhngn.jKp9F88e8qn5AC'),
    ('sample2@fake-email.com', null, 'bart_man', '$2y$12$Ig08Ui83i8J19srIBVw0m.qYfbQtbZWuaJDYY.wLfXP/iNfkeqHy.'),
    ('sample3@fake-email.com', '987-654-3210', 'theAhnold', '$2y$12$eDl79LW3vaZ5x1u9HindtOIZjyT.vumHiJkQTvPqDFIRFc53YzveS');

INSERT INTO dog_date_dog_profiles (
    owner_id, 
    name, 
    profile_img_url,
    age_years,
    age_months,
    sex, 
    breed,
    weight,
    energy,
    temperment,
    obedience,
    dislikes_puppies,
    dislikes_men,
    dislikes_women,
    dislikes_children,
    recently_adopted,
    prefers_people,
    leash_aggression,
    elderly_dog,
    little_time_with_other_dogs,
    much_experience_with_other_dogs,
    aggressive,
    owner_description
) VALUES
    (1, 'Seymour', 'https://images.unsplash.com/photo-1580579674179-931317ab63fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', '15', '0', 'Male, unneutered', 'mixed-Schnauzer', '20', 'About as energetic as the average dog.', 'Outgoing and eager to be friends with most dogs', 'Some training, but not always obedient', 'false', 'false', 'false', 'false', 'true', 'true', 'false', 'true', 'false', 'true', 'false', 'Seymour is a sweet dog who loves walking on sunshine, swimming, and eating meatballs.  He enjoys playing with other dogs, though he gets along better with smaller dogs.  If you see us in Central Park, come say hi!'),
    (1, 'Nibbler', 'https://images.unsplash.com/photo-1572297448250-ac6dcaedf2a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1188&q=80', '5', '0', 'Male, unneutered', 'Boston Terrier', '25', 'Very energetic.', 'Shy, but not skiddish or nervous', 'Not trained at all and struggles with obedience...', 'false', 'false', 'false', 'false', 'true', 'true', 'false', 'false', 'true', 'false', 'true', 'I recently adopted Nibbler after I found him in the wild on a work trip.  He isn’t trained yet, but he’s very sweet around people, once he gets to know them.  He’s a bit shy around other dogs, very protective of his food, and I suspect that he needs to be socialized.  If your dog is an expert in bringing other dogs out of their shells, send me an email!'),
    (2, 'Santos L. Halper', 'https://images.unsplash.com/photo-1483434748604-140edba26886?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=926&q=80', '8', '0', 'Male, unneutered', 'Greyhound', '35', 'So...much...energy...it never runs out.', 'Outgoing and eager to be friends with most dogs', 'Some training, but not always obedient', 'false', 'false', 'false', 'false', 'true', 'false', 'false', 'false', 'false', 'false', 'false', 'Santos is a retired racing hound whom I just adopted.  He’s still getting used to commands and obeying me, but he’s very sweet and plays well with other dogs.  He’s very energetic and needs similarly speedy dogs to play with.  If you live in the greater Springfield area, look for us out on the town!'),
    (2, 'Laddie', 'https://images.unsplash.com/photo-1524729429516-485db0307e59?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1049&q=80', '2', '0', 'Male, neutered', 'Border collie', '40', 'Very energetic.', 'Somewhat indifferent to most dogs', 'Very-well trained and always obedient', 'true', 'false', 'false', 'false', 'false', 'true', 'false', 'false', 'true', 'false', 'false', 'Laddie is brilliant and highly trained.  He is extremely loyal and very friendly towards people.  He does not, however, seem to enjoy playing with other dogs.  He is not aggressive: he simply ignores other dogs, especially puppies, which seem to annoy him a lot.  I just got a new dog, however, so I want him to learn to play with other dogs.'),
    (3, 'Abner', 'https://images.unsplash.com/photo-1529927066849-79b791a69825?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1049&q=80', '7', '0', 'Female, spayed', 'pug', '15', 'Not very...', 'Nervous around new people or dogs', 'Well trained in basic commands and generally obedient', 'false', 'true', 'false', 'false', 'true', 'false', 'true', 'false', 'true', 'false', 'true', 'Abner is a dog in recovery from an abusive past.  I just adopted her and so she is still learning how to live in a loving home.  She’s very shy around new people, especially men, but I want to start introducting her to strangers very slowly.  She can be aggressive on the leash and around food, so I’m looking for a very patient dog to help her find her way.');

INSERT INTO dog_date_howls (
    user_id, 
    howl_title,
    address,
    city,
    state,
    zipcode,
    lat,
    lon,
    date,
    meeting_type,
    personal_message
) VALUES
    (1, 'Looking for some energetic pups near Central Park!', 'Central Park', 'New York', 'NY', '10024', '40.7812', '-73.9665', null, 'recurring', 'Looking for a few dogs to howl with Seymour and Nibbler!'),
    (1, 'Heading to Acadia for the day; who wants to join me?', 'Acadia National Park', 'Bar Harbor', 'ME', '04609', '44.35', '-68.216667', '2020-08-30', 'once', 'Heading to Acadia for the day with my dog Seymour.  Looking for some well-trained dogs to hike with us.'),
    (2, 'Dogs love to play by the lake: join Santos!', 'Lake Lookout', 'Springfield', 'MA', '01109', '42.114719256689966', '-72.5379143322001', '2020-08-15', 'once', 'Santos has a lot of energy and loves to run by the lake.  He’s seemed a bit lonely lately, and I think that he’s looking for another dog to run with.'),
    (2, 'Shout if you’ll be at the farmer’s market!', 'Forest Park', 'Springfield', 'MA', '01108', '42.0903723', '-72.5703659', null, 'recurring', 'I take my dog Laddie to the park every weekend to visit the Farmer’s Market.  He needs some extra mental stimulation, so I’m looking for some smart, energetic dogs to join us!');

INSERT INTO dog_date_dogs_in_howls (howl_id, dog_id)
VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (3, 3),
    (4, 4);

INSERT INTO dog_date_time_windows (
    howl_id,
    day_of_week,
    start_time,
    end_time
) VALUES
    (1, 'Monday', '10:00', '13:00'),
    (1, 'Saturday', '15:00', '18:00'),
    (2, null, '08:00', '19:00'),
    (3, null, '17:00', '19:00'),
    (3, null, '10:00', '13:00'),
    (4, 'Saturday', '08:00', '12:00'),
    (4, 'Sunday', '13:00', '17:00');

INSERT INTO dog_date_reviews (
    date_created,
    dog_id,
    review_title,
    reviewer,
    friendliness_dogs,
    friendliness_people,
    playing_interest,
    obedience,
    profile_accuracy,
    location_suitability,
    address,
    city,
    state,
    zipcode, 
    lat,
    lon,
    date,
    start_time,
    end_time,
    personal_message
) VALUES
    ('2020-07-31T19:35:31.457Z', 3, 'Love Santos!', 'pjfry2000', '4', '4', '3', '2', '4', '3', 'Lake Lookout', 'Springfield', 'MA', '01109', '42.114719256689966', '-72.5379143322001', '2020-08-15', '17:00', '19:00', 'Santos is a good, friendly dog.  The lake area was very busy, and it was difficult for the dogs to run around, since there were so many people around.  That being said, I highly recommend Santos!'),
    ('2020-07-31T19:35:31.457Z', 1, 'I wanna see more Seymour!', 'bart_man', '5', '5', '2', '3', '3', '5', 'Lake Lookout', 'Springfield', 'MA', '01109', '42.114719256689966', '-72.5379143322001', '2020-08-15', '17:00', '19:00', 'Seymour is great! He’s on the older-side, but he still has some energy and he’s very good with all dogs and people!'),
    ('2020-07-31T19:35:31.457Z', 2, 'Nibbler will nibble on your heart...in a good way!', 'bart_man', '3', '3', '5', '2', '5', '5', 'Lake Lookout', 'Springfield', 'MA', '01109', '42.114719256689966', '-72.5379143322001', '2020-08-15', '17:00', '19:00', 'Nibbler is a young dog and he still has some work to do on his training.  That said, he’s a sweetie, and I think that he’ll grow into a great dog with more playing time.'),
    ('2020-07-31T19:35:31.457Z', 4, 'What a good lad.', 'pjfry2000', '3', '5', '2', '5', '5', '5', 'Lake Lookout', 'Springfield', 'MA', '01109', '42.114719256689966', '-72.5379143322001', '2020-08-15', '17:00', '19:00', 'Laddie isn’t super interested in other dogs, but he loves people and he is one of the most obedient dogs that I’ve ever met.  Definitely recommend that you get to know him; he’ll be a great influence on your dog!'),
    ('2020-07-31T19:35:31.457Z', 5, 'Yay, Abner!', 'pjfry2000', '2', '4', '1', '2', '4', '3', 'Central Park', 'New York', 'NY', '10024', '40.7812', '-73.9665', '2020-08-15', '17:00', '19:00', 'Abner is very sweet, but is a bit afraid of other dogs.  He’s got a long way to go, but his owner is working hard on his rehabilitation.  If your dog is patient with other dogs, you should look up Abner!');

INSERT INTO dog_date_review_comments (
    review_id,
    commenter,
    date_time,
    comment,
    edited
) VALUES
    (1, 'bart_man', '2020-08-06T13:55:38.886Z', 'Santos had a great time playing with Nibbler!  We should do it again soon, maybe at a less-busy park nearby!', 'false');

INSERT INTO dog_date_user_saved_howls (
    user_id,
    howl_id
) VALUES
    (1, 3),
    (1, 4);

INSERT INTO dog_date_pack_members (
    user_id,
    pack_member_id
) VALUES 
    (1, 3),
    (1, 4),
    (1, 5);

COMMIT;