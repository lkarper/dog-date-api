const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const makeUsersArray = () => {
    return [
        {
            id: 1,
            username: 'test-user-1',
            password: 'password',
            phone: '123-456-7890',
            email: 'sample1@fakeemail.com',
        },
        {
            id: 2,
            username: 'test-user-2',
            password: 'password',
            phone: '987-654-3210',
            email: 'sample2@fakeemail.com',
        },
        {
            id: 3,
            username: 'test-user-3',
            password: 'password',
            phone: '574-655-7841',
            email: 'sample3@fakeemail.com',
        },
        {
            id: 4,
            username: 'test-user-4',
            password: 'password',
            phone: '123-654-7899',
            email: 'sample4@fakeemail.com',
        },
        {
            id: 5,
            username: 'test-user-5',
            password: 'password',
            phone: '',
            email: 'sample5@fakeemail.com'
        },
    ];
}

const makeDogsArray = (users) => {
    return [
        {
            id: 1, 
            owner_id: users[0].id,
            name: 'First test dog!',
            profile_img_url: 'http://placehold.it/500x500',
            age_years: 1,
            age_months: 1,
            sex: 'test sex 1',
            breed: 'test breed 1',
            weight: 10,
            energy: 'test energy 1',
            temperment: 'test temperment 1',
            obedience: 'test obedience 1',
            dislikes_puppies: false,
            dislikes_men: false,
            dislikes_women: false,
            dislikes_children: false,
            recently_adopted: false,
            prefers_people: false,
            leash_aggression: false,
            elderly_dog: false,
            little_time_with_other_dogs: false,
            much_experience_with_other_dogs: false,
            aggressive: false,
            owner_description: 'Excepteur adipisicing ex id consectetur consequat ex dolore nisi esse ad cillum anim elit commodo.',
        },
        {
            id: 2, 
            owner_id: users[1].id,
            name: 'Second test dog!',
            profile_img_url: 'http://placehold.it/500x500',
            age_years: 2,
            age_months: 2,
            sex: 'test sex 2',
            breed: 'test breed 2',
            weight: 20,
            energy: 'test energy 2',
            temperment: 'test temperment 2',
            obedience: 'test obedience 2',
            dislikes_puppies: false,
            dislikes_men: false,
            dislikes_women: false,
            dislikes_children: false,
            recently_adopted: false,
            prefers_people: false,
            leash_aggression: false,
            elderly_dog: false,
            little_time_with_other_dogs: false,
            much_experience_with_other_dogs: false,
            aggressive: false,
            owner_description: 'Excepteur adipisicing ex id consectetur consequat ex dolore nisi esse ad cillum anim elit commodo.',
        },
        {
            id: 3, 
            owner_id: users[2].id,
            name: 'Third test dog!',
            profile_img_url: 'http://placehold.it/500x500',
            age_years: 3,
            age_months: 3,
            sex: 'test sex 3',
            breed: 'test breed 3',
            weight: 30,
            energy: 'test energy 3',
            temperment: 'test temperment 3',
            obedience: 'test obedience 3',
            dislikes_puppies: false,
            dislikes_men: false,
            dislikes_women: false,
            dislikes_children: false,
            recently_adopted: false,
            prefers_people: false,
            leash_aggression: false,
            elderly_dog: false,
            little_time_with_other_dogs: false,
            much_experience_with_other_dogs: false,
            aggressive: false,
            owner_description: 'Excepteur adipisicing ex id consectetur consequat ex dolore nisi esse ad cillum anim elit commodo.',
        },
        {
            id: 4, 
            owner_id: users[3].id,
            name: 'Fourth test dog!',
            profile_img_url: 'http://placehold.it/500x500',
            age_years: 4,
            age_months: 4,
            sex: 'test sex 4',
            breed: 'test breed 4',
            weight: 40,
            energy: 'test energy 4',
            temperment: 'test temperment 4',
            obedience: 'test obedience 4',
            dislikes_puppies: false,
            dislikes_men: false,
            dislikes_women: false,
            dislikes_children: false,
            recently_adopted: false,
            prefers_people: false,
            leash_aggression: false,
            elderly_dog: false,
            little_time_with_other_dogs: false,
            much_experience_with_other_dogs: false,
            aggressive: false,
            owner_description: 'Excepteur adipisicing ex id consectetur consequat ex dolore nisi esse ad cillum anim elit commodo.',
        },
    ];
}

const makeReviews = (users, dogs) => {
    return dogs.map((dog, i) => {
        return users.map((user, index) => {
            return {
                id: (i * users.length) + (index + 1),
                date_created: '2020-07-31T19:35:31.457Z',
                dog_id: dog.id,
                review_title: 'Ad nisi duis officia sunt laborum Lorem ad mollit et proident.',
                reviewer: user.username,
                friendliness_dogs: 3,
                friendliness_people: 3,
                playing_interest: 3,
                obedience: 3,
                profile_accuracy: 3,
                location_suitability: 3,
                address: '123 Fake St',
                city: 'fake city',
                state: 'MA',
                zipcode: '00000', 
                lat: '0',
                lon: '0',
                date: '2020-08-25',
                start_time: '08:00',
                end_time: '12:00',
                personal_message: 'Irure ut aliquip dolor quis ad ullamco proident voluptate aliquip.'
            };
        });
    });
}

const makeComments = (users, reviews) => {
    return reviews.map((review, i) => {
        return users.map((user, index) => {
            return {
                id: (i * users.length) + (index + 1),
                review_id: review.id,
                commenter: user.username,
                date_time: '2020-07-31T19:35:31.457Z',
                comment: 'Cillum deserunt ullamco quis mollit voluptate consequat incididunt pariatur.',
                edited: false
            };
        });
    });
}

const makeHowls = (dogs) => {
    return dogs.map((_, i) => {
        return {
            id: i + 1,
            user_id: i + 1,
            howl_title: `Test howl ${i + 1}`,
            address: `Test address ${i + 1}`,
            city: `Test city ${i + 1}`,
            state: `PA`,
            zipcode: '11111',
            lat: `0`,
            lon: `0`,
            date: i % 2 === 0 ? `2020-08-${i + 11}` : '',
            meeting_type: i % 2 === 0 ? 'once' : 'recurring',
            personal_message: 'Ullamco Lorem velit excepteur magna nostrud eu proident sunt cillum culpa eiusmod dolore ipsum.'
        };
    });
}

const makeDogsInHowls = (dogs) => {
    return dogs.map((dog, i) => {
        return {
            id: i + 1,
            howl_id: i + 1,
            dog_id: dog.id,
        }
    });
} 

const makeTimeWindows = (howls) => {
    return howls.map((_, i) => {
        return {
            id: i + 1,
            howl_id: i + 1,
            day_of_week: i % 2 === 0 ? '' : 'Monday',
            start_time: '08:00',
            end_time: '18:00'
        };
    });
}

const makeUserSavedHowls = (users, howls) => {
    return howls.map((howl, i) => {
        return users.map((user, index) => {
            return {
                id: (i * users.length) + (index + 1),
                user_id: user.id,
                howl_id: howl.id
            };
        });
    });
}

const makePackMembersArray = (testUsers, testDogs) => {
    return testUsers.map((user, i) => {
        return {
            id: i + 1,
            user_id: user.id,
            pack_member_id: testDogs[i > 3 ? 0 : 3 - i].id
        };
    });
}

const makeDogsFixtures = () => {
    const testUsers = makeUsersArray();
    const testDogs = makeDogsArray(testUsers);
    const testPackMembers = makePackMembersArray(testUsers, testDogs);
    return { 
        testUsers, 
        testDogs, 
        testPackMembers 
    };
}

const makeHowlsFixtures = () => {
    const testUsers = makeUsersArray();
    const testDogs = makeDogsArray(testUsers);
    const testHowls = makeHowls(testDogs);
    const testDogsInHowls = makeDogsInHowls(testDogs);
    const testTimeWindows = makeTimeWindows(testHowls);
    const testUserSavedHowls = makeUserSavedHowls(testUsers, testHowls).flat();
    return {
        testUsers,
        testDogs,
        testHowls,
        testDogsInHowls,
        testTimeWindows,
        testUserSavedHowls
    };
}

const makeReviewsFixtures = () => {
    const testUsers = makeUsersArray();
    const testDogs = makeDogsArray(testUsers);
    const testReviews = makeReviews(testUsers, testDogs).flat();
    const testComments = makeComments(testUsers, testReviews).flat();
    return {
        testUsers,
        testDogs,
        testReviews,
        testComments
    };
}

const cleanTables = (db) => {
    return db.raw(
        `TRUNCATE
            dog_date_users,
            dog_date_dog_profiles,
            dog_date_howls,
            dog_date_dogs_in_howls,
            dog_date_time_windows,
            dog_date_reviews,
            dog_date_review_comments,
            dog_date_user_saved_howls,
            dog_date_pack_members RESTART IDENTITY CASCADE;`
    );
}

const seedTablesForHowlsSearch = (db) => {
    return db.raw(
        `
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
            (1, 'Seymour', E'https://images.unsplash.com/photo-1580579674179-931317ab63fc\\?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60', '15', '0', 'Male, unneutered', 'mixed-Schnauzer', '20', 'About as energetic as the average dog.', 'Outgoing and eager to be friends with most dogs', 'Some training, but not always obedient', 'false', 'false', 'false', 'false', 'true', 'true', 'false', 'true', 'false', 'true', 'false', 'Seymour is a sweet dog who loves walking on sunshine, swimming, and eating meatballs.  He enjoys playing with other dogs, though he gets along better with smaller dogs.  If you see us in Central Park, come say hi!'),
            (1, 'Nibbler', E'https://images.unsplash.com/photo-1572297448250-ac6dcaedf2a7\\?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1188&q=80', '5', '0', 'Male, unneutered', 'Boston Terrier', '25', 'Very energetic.', 'Shy, but not skiddish or nervous', 'Not trained at all and struggles with obedience...', 'false', 'false', 'false', 'false', 'true', 'true', 'false', 'false', 'true', 'false', 'true', 'I recently adopted Nibbler after I found him in the wild on a work trip.  He isn’t trained yet, but he’s very sweet around people, once he gets to know them.  He’s a bit shy around other dogs, very protective of his food, and I suspect that he needs to be socialized.  If your dog is an expert in bringing other dogs out of their shells, send me an email!'),
            (2, 'Santos L. Halper', E'https://images.unsplash.com/photo-1483434748604-140edba26886\\?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=926&q=80', '8', '0', 'Male, unneutered', 'Greyhound', '35', 'So...much...energy...it never runs out.', 'Outgoing and eager to be friends with most dogs', 'Some training, but not always obedient', 'false', 'false', 'false', 'false', 'true', 'false', 'false', 'false', 'false', 'false', 'false', 'Santos is a retired racing hound whom I just adopted.  He’s still getting used to commands and obeying me, but he’s very sweet and plays well with other dogs.  He’s very energetic and needs similarly speedy dogs to play with.  If you live in the greater Springfield area, look for us out on the town!'),
            (2, 'Laddie', E'https://images.unsplash.com/photo-1524729429516-485db0307e59\\?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1049&q=80', '2', '0', 'Male, neutered', 'Border collie', '40', 'Very energetic.', 'Somewhat indifferent to most dogs', 'Very-well trained and always obedient', 'true', 'false', 'false', 'false', 'false', 'true', 'false', 'false', 'true', 'false', 'false', 'Laddie is brilliant and highly trained.  He is extremely loyal and very friendly towards people.  He does not, however, seem to enjoy playing with other dogs.  He is not aggressive: he simply ignores other dogs, especially puppies, which seem to annoy him a lot.  I just got a new dog, however, so I want him to learn to play with other dogs.'),
            (3, 'Abner', E'https://images.unsplash.com/photo-1529927066849-79b791a69825\\?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1049&q=80', '7', '0', 'Female, spayed', 'pug', '15', 'Not very...', 'Nervous around new people or dogs', 'Well trained in basic commands and generally obedient', 'false', 'true', 'false', 'false', 'true', 'false', 'true', 'false', 'true', 'false', 'true', 'Abner is a dog in recovery from an abusive past.  I just adopted her and so she is still learning how to live in a loving home.  She’s very shy around new people, especially men, but I want to start introducting her to strangers very slowly.  She can be aggressive on the leash and around food, so I’m looking for a very patient dog to help her find her way.');

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
            (1, E'Heading to Acadia for the day; who wants to join me\\?', 'Acadia National Park', 'Bar Harbor', 'ME', '04609', '44.35', '-68.216667', '2020-08-30', 'once', 'Heading to Acadia for the day with my dog Seymour.  Looking for some well-trained dogs to hike with us.'),
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
        `
    );
}

const makeDataArrayForTestingSearch = () => {
    return [
        {
            "id": 1,
            "user_id": 1,
            "user_info": {
                "username": "pjfry2000",
                "email": "sample@fake-email.com",
                "phone": "123-456-7890"
            },
            "howl_title": "Looking for some energetic pups near Central Park!",
            "date": "",
            "meeting_type": "recurring",
            "personal_message": "Looking for a few dogs to howl with Seymour and Nibbler!",
            "dogs": [
                {
                    "dog_id": 1,
                    "profile": {
                        "name": "Seymour",
                        "profile_img_url": "https://images.unsplash.com/photo-1580579674179-931317ab63fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
                        "age_years": 15,
                        "age_months": 0,
                        "sex": "Male, unneutered",
                        "breed": "mixed-Schnauzer",
                        "weight": 20,
                        "energy": "About as energetic as the average dog.",
                        "temperment": "Outgoing and eager to be friends with most dogs",
                        "obedience": "Some training, but not always obedient",
                        "dislikes_puppies": false,
                        "dislikes_men": false,
                        "dislikes_women": false,
                        "dislikes_children": false,
                        "recently_adopted": true,
                        "prefers_people": true,
                        "leash_aggression": false,
                        "elderly_dog": true,
                        "little_time_with_other_dogs": false,
                        "much_experience_with_other_dogs": true,
                        "aggressive": false,
                        "owner_description": "Seymour is a sweet dog who loves walking on sunshine, swimming, and eating meatballs.  He enjoys playing with other dogs, though he gets along better with smaller dogs.  If you see us in Central Park, come say hi!"
                    },
                    "owner": {
                        "id": 1,
                        "email": "sample@fake-email.com",
                        "username": "pjfry2000",
                        "phone": "123-456-7890"
                    }
                },
                {
                    "dog_id": 2,
                    "profile": {
                        "name": "Nibbler",
                        "profile_img_url": "https://images.unsplash.com/photo-1572297448250-ac6dcaedf2a7?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1188&q=80",
                        "age_years": 5,
                        "age_months": 0,
                        "sex": "Male, unneutered",
                        "breed": "Boston Terrier",
                        "weight": 25,
                        "energy": "Very energetic.",
                        "temperment": "Shy, but not skiddish or nervous",
                        "obedience": "Not trained at all and struggles with obedience...",
                        "dislikes_puppies": false,
                        "dislikes_men": false,
                        "dislikes_women": false,
                        "dislikes_children": false,
                        "recently_adopted": true,
                        "prefers_people": true,
                        "leash_aggression": false,
                        "elderly_dog": false,
                        "little_time_with_other_dogs": true,
                        "much_experience_with_other_dogs": false,
                        "aggressive": true,
                        "owner_description": "I recently adopted Nibbler after I found him in the wild on a work trip.  He isn’t trained yet, but he’s very sweet around people, once he gets to know them.  He’s a bit shy around other dogs, very protective of his food, and I suspect that he needs to be socialized.  If your dog is an expert in bringing other dogs out of their shells, send me an email!"
                    },
                    "owner": {
                        "id": 1,
                        "email": "sample@fake-email.com",
                        "username": "pjfry2000",
                        "phone": "123-456-7890"
                    }
                }
            ],
            "location": {
                "address": "Central Park",
                "city": "New York",
                "state": "NY",
                "zipcode": "10024",
                "lat": "40.7812",
                "lon": "-73.9665"
            },
            "time_windows": [
                {
                    "day_of_week": "Monday",
                    "start_time": "10:00",
                    "end_time": "13:00"
                },
                {
                    "day_of_week": "Saturday",
                    "start_time": "15:00",
                    "end_time": "18:00"
                }
            ]
        },
        {
            "id": 2,
            "user_id": 1,
            "user_info": {
                "username": "pjfry2000",
                "email": "sample@fake-email.com",
                "phone": "123-456-7890"
            },
            "howl_title": "Heading to Acadia for the day; who wants to join me?",
            "date": "2020-08-30",
            "meeting_type": "once",
            "personal_message": "Heading to Acadia for the day with my dog Seymour.  Looking for some well-trained dogs to hike with us.",
            "dogs": [
                {
                    "dog_id": 1,
                    "profile": {
                        "name": "Seymour",
                        "profile_img_url": "https://images.unsplash.com/photo-1580579674179-931317ab63fc?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
                        "age_years": 15,
                        "age_months": 0,
                        "sex": "Male, unneutered",
                        "breed": "mixed-Schnauzer",
                        "weight": 20,
                        "energy": "About as energetic as the average dog.",
                        "temperment": "Outgoing and eager to be friends with most dogs",
                        "obedience": "Some training, but not always obedient",
                        "dislikes_puppies": false,
                        "dislikes_men": false,
                        "dislikes_women": false,
                        "dislikes_children": false,
                        "recently_adopted": true,
                        "prefers_people": true,
                        "leash_aggression": false,
                        "elderly_dog": true,
                        "little_time_with_other_dogs": false,
                        "much_experience_with_other_dogs": true,
                        "aggressive": false,
                        "owner_description": "Seymour is a sweet dog who loves walking on sunshine, swimming, and eating meatballs.  He enjoys playing with other dogs, though he gets along better with smaller dogs.  If you see us in Central Park, come say hi!"
                    },
                    "owner": {
                        "id": 1,
                        "email": "sample@fake-email.com",
                        "username": "pjfry2000",
                        "phone": "123-456-7890"
                    }
                }
            ],
            "location": {
                "address": "Acadia National Park",
                "city": "Bar Harbor",
                "state": "ME",
                "zipcode": "04609",
                "lat": "44.35",
                "lon": "-68.216667"
            },
            "time_windows": [
                {
                    "day_of_week": "",
                    "start_time": "08:00",
                    "end_time": "19:00"
                }
            ]
        },
        {
            "id": 3,
            "user_id": 2,
            "user_info": {
                "username": "bart_man",
                "email": "sample2@fake-email.com",
                "phone": ""
            },
            "howl_title": "Dogs love to play by the lake: join Santos!",
            "date": "2020-08-15",
            "meeting_type": "once",
            "personal_message": "Santos has a lot of energy and loves to run by the lake.  He’s seemed a bit lonely lately, and I think that he’s looking for another dog to run with.",
            "dogs": [
                {
                    "dog_id": 3,
                    "profile": {
                        "name": "Santos L. Halper",
                        "profile_img_url": "https://images.unsplash.com/photo-1483434748604-140edba26886?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=926&q=80",
                        "age_years": 8,
                        "age_months": 0,
                        "sex": "Male, unneutered",
                        "breed": "Greyhound",
                        "weight": 35,
                        "energy": "So...much...energy...it never runs out.",
                        "temperment": "Outgoing and eager to be friends with most dogs",
                        "obedience": "Some training, but not always obedient",
                        "dislikes_puppies": false,
                        "dislikes_men": false,
                        "dislikes_women": false,
                        "dislikes_children": false,
                        "recently_adopted": true,
                        "prefers_people": false,
                        "leash_aggression": false,
                        "elderly_dog": false,
                        "little_time_with_other_dogs": false,
                        "much_experience_with_other_dogs": false,
                        "aggressive": false,
                        "owner_description": "Santos is a retired racing hound whom I just adopted.  He’s still getting used to commands and obeying me, but he’s very sweet and plays well with other dogs.  He’s very energetic and needs similarly speedy dogs to play with.  If you live in the greater Springfield area, look for us out on the town!"
                    },
                    "owner": {
                        "id": 2,
                        "email": "sample2@fake-email.com",
                        "username": "bart_man",
                        "phone": ""
                    }
                }
            ],
            "location": {
                "address": "Lake Lookout",
                "city": "Springfield",
                "state": "MA",
                "zipcode": "01109",
                "lat": "42.114719256689966",
                "lon": "-72.5379143322001"
            },
            "time_windows": [
                {
                    "day_of_week": "",
                    "start_time": "17:00",
                    "end_time": "19:00"
                },
                {
                    "day_of_week": "",
                    "start_time": "10:00",
                    "end_time": "13:00"
                }
            ]
        },
        {
            "id": 4,
            "user_id": 2,
            "user_info": {
                "username": "bart_man",
                "email": "sample2@fake-email.com",
                "phone": ""
            },
            "howl_title": "Shout if you’ll be at the farmer’s market!",
            "date": "",
            "meeting_type": "recurring",
            "personal_message": "I take my dog Laddie to the park every weekend to visit the Farmer’s Market.  He needs some extra mental stimulation, so I’m looking for some smart, energetic dogs to join us!",
            "dogs": [
                {
                    "dog_id": 4,
                    "profile": {
                        "name": "Laddie",
                        "profile_img_url": "https://images.unsplash.com/photo-1524729429516-485db0307e59?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1049&q=80",
                        "age_years": 2,
                        "age_months": 0,
                        "sex": "Male, neutered",
                        "breed": "Border collie",
                        "weight": 40,
                        "energy": "Very energetic.",
                        "temperment": "Somewhat indifferent to most dogs",
                        "obedience": "Very-well trained and always obedient",
                        "dislikes_puppies": true,
                        "dislikes_men": false,
                        "dislikes_women": false,
                        "dislikes_children": false,
                        "recently_adopted": false,
                        "prefers_people": true,
                        "leash_aggression": false,
                        "elderly_dog": false,
                        "little_time_with_other_dogs": true,
                        "much_experience_with_other_dogs": false,
                        "aggressive": false,
                        "owner_description": "Laddie is brilliant and highly trained.  He is extremely loyal and very friendly towards people.  He does not, however, seem to enjoy playing with other dogs.  He is not aggressive: he simply ignores other dogs, especially puppies, which seem to annoy him a lot.  I just got a new dog, however, so I want him to learn to play with other dogs."
                    },
                    "owner": {
                        "id": 2,
                        "email": "sample2@fake-email.com",
                        "username": "bart_man",
                        "phone": ""
                    }
                }
            ],
            "location": {
                "address": "Forest Park",
                "city": "Springfield",
                "state": "MA",
                "zipcode": "01108",
                "lat": "42.0903723",
                "lon": "-72.5703659"
            },
            "time_windows": [
                {
                    "day_of_week": "Saturday",
                    "start_time": "08:00",
                    "end_time": "12:00"
                },
                {
                    "day_of_week": "Sunday",
                    "start_time": "13:00",
                    "end_time": "17:00"
                }
            ]
        }
    ];
}

const seedUsers = (db, users) => {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }));
    return db
        .into('dog_date_users')
        .insert(preppedUsers);
}

const seedDogProfileTables = (db, users, dogs) => {
    return db.transaction(async trx => {
        await seedUsers(trx, users);
        await trx.into('dog_date_dog_profiles').insert(dogs);
    });
}

const seedHowls = (db, users, dogs, howls, dogsInHowls, timeWindows) => {
    return db.transaction(async trx => {
        await seedDogProfileTables(db, users, dogs);
        await trx.into('dog_date_howls').insert(howls);
        await trx.into('dog_date_dogs_in_howls').insert(dogsInHowls);
        await trx.into('dog_date_time_windows').insert(timeWindows);
    });
}

const seedUserSavedHowls = (db, users, dogs, howls, dogsInHowls, timeWindows, userSavedHowls) => {
    return db.transaction(async trx => {
        await seedHowls(db, users, dogs, howls, dogsInHowls, timeWindows);
        await trx.into('dog_date_user_saved_howls').insert(userSavedHowls);
    });
}

const seedPackMembers = (db, users, dogs, packMembers) => {
    return db.transaction(async trx => {
        await seedDogProfileTables(db, users, dogs);
        await trx.into('dog_date_pack_members').insert(packMembers);
    });
}

const seedReviewsWithoutComments = (db, users, dogs, reviews) => {
    return db.transaction(async trx => {
        await seedDogProfileTables(db, users, dogs);
        await trx.into('dog_date_reviews').insert(reviews);
     });
}

const seedReviews = (db, users, dogs, reviews, comments) => {
    return db.transaction(async trx => {
       await seedDogProfileTables(db, users, dogs);
       await trx.into('dog_date_reviews').insert(reviews);
       await trx.into('dog_date_review_comments').insert(comments);
    });
}

const makeExpectedProfile = (users, dog) => {
    const {
        id,
        name, 
        owner_id,
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
        owner_description,
    } = dog;

    const owner = users.find(user => user.id === owner_id);

    return {
        id,
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
        owner_description,
        owner: {
            id: owner.id,
            email: owner.email,
            username: owner.username,
            phone: owner.phone,
        },
    };
}

const makeExpectedPackMember = (users, user, dog) => {
    return {
        id: user.id,
        user_id: user.id,
        profile: makeExpectedProfile(users, dog),
    };
}

const makeExpectedHowl = (users, dogs, howl, timeWindows, dogsInHowls) => {

    const dogId = dogsInHowls.find(dih => dih.howl_id === howl.id).dog_id;
    const dog = dogs.find(dog => dog.id === dogId);
    const profile = makeExpectedProfile(users, dog);
    const { owner, id, ...rest } = profile;
    const expectedProfile = rest;

    const timeWindow = timeWindows.find(tw => tw.howl_id === howl.id);

    return {
        id: howl.id,
        user_id: howl.id,
        user_info: {
            username: owner.username,
            email: owner.email,
            phone: owner.phone,
        },
        howl_title: `Test howl ${howl.id}`,
        date: howl.id % 2 === 0 ? '' : `2020-08-${howl.id + 10}`,
        meeting_type: howl.id % 2 === 0 ? 'recurring' : 'once',
        personal_message: 'Ullamco Lorem velit excepteur magna nostrud eu proident sunt cillum culpa eiusmod dolore ipsum.',
        dogs: [
            {
                dog_id: dogId,
                profile: expectedProfile,
                owner: owner
            },
        ],
        location: {
            address: `Test address ${howl.id}`,
            city: `Test city ${howl.id}`,
            state: 'PA',
            zipcode: '11111',
            lat: '0',
            lon: '0',
        },
        time_windows: [
            {
                day_of_week: timeWindow.day_of_week,
                start_time: timeWindow.start_time,
                end_time: timeWindow.end_time,
            },
        ],
    };
}

const makeExpectedReview = (review, dogs, testComments) => {
    const {
        id,
        date_created,
        review_title,
        reviewer,
        friendliness_dogs,
        friendliness_people,
        playing_interest,
        obedience,
        profile_accuracy,
        location_suitability,
        date,
        start_time,
        end_time,
        personal_message,
        address,
        city,
        state,
        zipcode,
        lat,
        lon,
        dog_id,
    } = review;

    const dog = dogs.find(d => d.id === dog_id);
    const { owner, ...rest } = dog;
    const dog_profile = { 
        ...rest,
    };
    const comments = testComments.filter(c => c.review_id === id);

    return {
        id,
        date_created,
        review_title,
        reviewer,
        friendliness_dogs,
        friendliness_people,
        playing_interest,
        obedience,
        profile_accuracy,
        location_suitability,
        date,
        start_time,
        end_time,
        personal_message,
        location: {
            address,
            city,
            state,
            zipcode,
            lat,
            lon,
        },
        dog_profile, 
        comments: comments.map(c => {
            const { date_time, ...rest } = c;
            return {
                ...rest,
                date_time: `${date_time.slice(0, date_time.length - 1 )}+00:00`
            };
        }),
    };
}

const makeMaliciousProfile = (user) => {
    const maliciousProfile = {
        id: 911,
        owner_id: 2,
        name: 'Naughty naughty very naughty <script>alert("xss");</script>', 
        profile_img_url: 'http://placehold.it/500x500',
        age_years: 4,
        age_months: 4,
        sex: 'test sex 4',
        breed: 'test breed 4',
        weight: 40,
        energy: 'test energy 4',
        temperment: 'test temperment 4',
        obedience: 'test obedience 4',
        dislikes_puppies: false,
        dislikes_men: false,
        dislikes_women: false,
        dislikes_children: false,
        recently_adopted: false,
        prefers_people: false,
        leash_aggression: false,
        elderly_dog: false,
        little_time_with_other_dogs: false,
        much_experience_with_other_dogs: false,
        aggressive: false,
        owner_description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    }
    const expectedProfile = {
        ...makeExpectedProfile([user], maliciousProfile),
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        owner_description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
        maliciousProfile,
        expectedProfile,
    };
}

const makeMaliciousHowl = (expectedProfile) => {
    const badText = 'Naughty naughty very naughty <script>alert("xss");</script>'; 
    const saniText = 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;';
    const { owner_id, id, owner, ...rest } = expectedProfile;
    const saniProfile = {
        ...rest,
    };
    const maliciousHowl = {
        id: 911,
        user_id: 2,
        howl_title: badText,
        date: badText,
        meeting_type: 'once',
        personal_message: badText,
        address: badText,
        city: badText,
        state: badText,
        zipcode: badText,
        lat: badText,
        lon: badText,
        dog_ids: [911],
        time_windows: [{
            day_of_week: badText,
            start_time: badText,
            end_time: badText,
        }],
    };
    const expectedHowl = {
        id: 911,
        user_id: 2,
        user_info: {
            username: saniText,
            email: saniText,
            phone: saniText,
        },
        howl_title: saniText,
        date: saniText,
        meeting_type: 'once',
        personal_message: saniText,
        location: {
            address: saniText,
            city: saniText,
            state: saniText,
            zipcode: saniText,
            lat: saniText,
            lon: saniText,
        },
        dogs: [{
            dog_id: 911,
            profile: saniProfile,
            owner: owner
        }],
        time_windows: [{
            day_of_week: saniText,
            start_time: saniText,
            end_time: saniText,
        }],
    };

    return {
        maliciousHowl,
        expectedHowl
    };

}

const makeMaliciousReview = (user) => {
    const badText = 'Naughty naughty very naughty <script>alert("xss");</script>'; 

    return {
        id: 911,
        date_created: '2020-07-31T19:35:31.457Z',
        dog_id: 911,
        review_title: 'Naughty naughty very naughty <script>alert("xss");</script>',
        reviewer: user.username,
        friendliness_dogs: 3,
        friendliness_people: 3,
        playing_interest: 3,
        obedience: 3,
        profile_accuracy: 3,
        location_suitability: 3,
        address: badText,
        city: badText,
        state: badText,
        zipcode: badText,
        lat: badText,
        lon: badText,
        date: badText,
        start_time: badText,
        end_time: badText,
        personal_message: badText,
    };
}

const makeMaliciousComment = (user) => {
    const badText = 'Naughty naughty very naughty <script>alert("xss");</script>'; 

    return {
        id: 911,
        review_id: 911,
        commenter: user.username,
        date_time: '2020-07-31T19:35:31.457Z',
        comment: badText,
        edited: false,
    };
}

const makeSanitizedReview = (user) => {
    const saniText = 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;';

    const { expectedProfile } = makeMaliciousProfile(user);

    const dog = expectedProfile;
    const { owner, ...rest } = dog;
    const dog_profile = { ...rest, owner_id: owner.id };

    return {
        id: 911,
        date_created: '2020-07-31T19:35:31.457Z',
        review_title: saniText,
        reviewer: user.username,
        friendliness_dogs: 3,
        friendliness_people: 3,
        playing_interest: 3,
        obedience: 3,
        profile_accuracy: 3,
        location_suitability: 3,
        date: saniText,
        start_time: saniText,
        end_time: saniText,
        personal_message: saniText,
        location: {
            address: saniText,
            city: saniText,
            state: saniText,
            zipcode: saniText,
            lat: saniText,
            lon: saniText
        },
        dog_profile,
        comments: [
            {
                id: 911,
                review_id: 911,
                commenter: user.username,
                date_time: `2020-07-31T19:35:31.457+00:00`,
                comment: saniText,
                edited: false,
            },
        ],
    };
}

const seedMaliciousProfile = (db, user, profile) => {
    return seedUsers(db, [user])
        .then(() => 
            db
                .into('dog_date_dog_profiles')
                .insert([profile])
            );
}

const makeAuthHeader = (user, secret = process.env.JWT_SECRET) => {
    const token = jwt.sign({ user_id: user.id }, secret, {
        subject: user.username,
        algorithm: 'HS256',
    });
    return `Bearer ${token}`;
}

// Used to test upload to Cloudinary
const makeProfileImgString = () => {
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAIAAAAP3aGbAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAESKSURBVHhe7Z15vE1V/8cbFSKiyZg8ImUoIaHI01NCiDQrTRqkUp7ql1QPzWlSpFFKAwlNmkNUyhgh8xBlllCo/N6vvb/nvI69z7n3TPe66/Z5/8Fde6+9zhq+67O+33X23mcPIYRwgp07d+5lfwohRIFHgiWEcAYJlhDCGSRYQghnkGAJIZxBgiWEcAYJlhDCGfa0/+Oxc+dO+0sIIfKePffMRZHkYQkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZJFhCCGeQYAkhnEGCJYRwBgmWEMIZCptgbd++/bTTTtszhn322addu3Z2WgjhMvKwhBDOsKf9H4+dO3faX0mzfv36bdu2WSJp9tprr3333df/F4oUKWInUgcPq1WrVp9++qml99hj7733bt269ahRoywthCioEBLZX/FAkbIsWKeffvrHH39siaQpVapU3bp1DzzwwNq1a59wwgkNGzYsWrTo/vvvn4ZySbCEcJdcBatAhIQbN24cO3bs6NGj+/Tp07Zt26OPPvqGG2748MMP8dcQIMskhPjHUxD3sDZs2DB48OB27dp16tRpzJgxmzZtshNCiH82BXfTHffvs88+69Chw913371mzZq///7bToiMoW9xXXFsV69ebYeEyBFsZtu2bTgT69ats0O7g4L+LeFff/31+OOPt2zZcsGCBdKsDInq1E8//UTE3bNnz7POOsvOCRGPqE4tWrRo1KhR119/fdeuXe3c7iA/Nt0rVqxof8UDGdrhQb/88ccfcVVpzz33PP7444cPH16lShU7lABtuieC0Vy/fv3EiRPfffdd1ArN4mD58uX9P4QIg7uwatWq8ePHv/fee4Q7v/zyCwcbN248YcIEP0PWyXXT3f6KC6dT5T//+Y9dHAG9sHMJYBZNmjTplVdeueaaa2rWrFmqVKm99orj91FOly5dfv/9d7ssAajev//9b7vGgwvbtm1rp//B/Pbbb3fccYd1SgQEy04LEYLF7NprrzVbiYBg2ek8wD4jAWTY/SFh6dKlGzRocNFFFw0YMAAt79u3b40aNfbff387HQGxR9TkKAnxT6Zg7WGVKVPmuuuuGzduXIcOHYoVK2ZHI6BZvXv3xsmytBDiH0ZB3HQvW7bs4MGDL7744n322ccOeeAQLlmy5IMPPrC0EOIfRgH9lhCp6tOnT+3atS0dASfrtddes4QQ4h9GARUsIDzs1atXYAP+77//xsNK43FFIUQhoOAKFlLVqlWrww47zNIR0Kyvv/7aEkKIfxIFV7AAzWrevLklIuzcuXPevHmWEEL8kyjQguXfL2qJCAjW5s2bLZEZO3bs2LRp06pVq3766aeFMZBcvXo1p/7880/Lmgfw6b/++uuaNWtWrly5bNky+2yPJUuW/Pzzz2vXrv3tt99cfPybMaLa0dYtXbrUGubhbuv8dm3cuPGXX35Zvny5tWfhwsWLF3Nk3bp1W7duzbvnMfh0bIZOo+vo1dgKAHWgV327ddFmkiTP73Tfe++90572jP24ceNOPfVUS3vss88+Dz74YI8ePSy9KwxVMne6k23Dhg0zZ86cOHHipEmTmFGzZ8/2T+HWHXvssUccccSJJ5540kkn1ahRo3Tp0pm8oisAvYFJMZkXLFjw1VdfzZ07F8ujAtE7zpFpPrFWrVqVK1c++uij69Spc8wxx3CkePHicW+pDcPAMXMwX0t7cGTQoEEDBgywtMehhx6aw13LdDX9YInk8FtH386fP5/I/ccff0SLaR0TzM9AE8qUKUMP+62rW7cu/5YqVSr51mUd6ozc/PHHH5b2KnnAAQcccsghlva69Pfff0d/Z82ahc1MnjwZ2aWN/lkq37BhwyOPPLKBR8WKFRPd/5weTAS/V+lJzBWbIchAmzAhy7HHHiVKlKhXr17ZsmXpW/6oXbt2yZIlaUXgq/ZE8BFIIQ20tAdr+cCBA4cOHWppDwp/4403LBGiaNGi5cuXt0TqOHCnew789ddfn3/+uRUUgQHo16+f5QiR653uDAwj/dFHH3Xq1MlyJIbPateu3QcffIC+2PUZwPLI2ohA3HDDDRUqVLDPyA3svnr16mj09OnTsVorK0fohKzcYcvEsxKTgNbRsWPHjr3uuuvKlStnReQGPYwcM6Dff/99kq3LOqhA48aNrUIezPOrrrrKTu/ciaIhuy+//PLJJ59sORKDVDG+P/zwAwpo12cAU2D9+vVTp07t1avXv/71L/uM3MDmUc877rjjm2++wR+kECsuMXT+M888Y9dnQNOmTa3EtLBSEpBLBr+IlCjggsWkYlG64oor7Fxy7Lfffg888ACLj19IGvjLF/7U9ddfb4WmCCvPYYcd9tBDD+GI5Wp/+SxYtA5BHz9+fNqPxSLKlSpVeuyxx1asWJHM7MouOQsWujNlypRklrcomBwq/P7772/ZssUvJA3oVS6fMWNGz549qY8VnSI4ib179yZ6IKSwchMgwTIyFCxG3QqKkLZgMWbffvttzZo17UQq7Lvvvpdddhmi439KSmB5RBzPPfccTrsVly60nSh12rRpNNNKj0d+ChZjhMo89dRTmbeOuJvwH1cr59ZlnRwEC8l47733qlWrZidSATdzyJAh6bWFXsVd5fKqVatacemC/R933HFffPFFzurpimAV6E136jd58mRLRMDXCD9pmCuoBjPh0ksvje5VATMEB56wP0qipQzX7LXXXnv11Vf5ww4lB5+7fPnyvn37XnnlleidHY0BeypevLh9fIQDDzwQibQcMRCbfP3112eddda4ceMKwsYq82rRokX/+9//unXrFrd1KCxdaq2KULJkybito0VElB06dCBqLgitQ2twG2+66aboXhW2h7sdazNlypQpWrSofzbAypUr77rrru+++87SSUOv4kc//fTT11577cKFC+1oDP4WGx9tlfCgVnF3WimNFQ7LHzly5NatW+2osxToTXcu7NKlCzJhaQ9GZeLEiSeccIKldwVDD2+6c2TgwIHnnHMOQZl/0J9F1atXx2GJbrggLrNmzfJ3rNauXesfjOIHZXh8rFd2KDfoQLyPG2+8ccSIEXYoAqWhU6VLl65QoYL/Jns74VVj2bJlCBNaQE2AI3bOg2u56qWXXmrWrBmts6MxoKr0wCWXXGJpDyqDvQZMFtPH7i0Rgp6ZPn26JUJQq8WLF/fo0eOdd96xQxGoIT180EEHUc86derE9hhjikfzzTffLFmyZOPGjSzsgdZRJdwKHFLWav62o3kJvX3BBRdgVJb2zOPcc89FhS+//PKp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SLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwXKPP//8c9q0acOHDx88ePDIkSNnz569bds2O5eYzZs39+rVa89dqVChgp0ukPzxxx9vvvmm1TVCxYoVp0yZYjnyka1btw4ZMsQqEaFq1aqMheUQeY8EyzG2b9/+/vvv33PPPddee+3ll1/evXv3+++//4MPPrDTQhRqJFgu8ddff82aNeu2224bPXr02rVr//77759++un111/v06fPggULLJMQhRcJlkvgXo0dO3bu3LmW9kDF5s2bN2zYMEsLUXiRYLkELtXGjRstEcOff/45c+ZMSwhReJFgucSee+5ZrFgxS8Sw9957V6xY0RJCFF4kWC6x77771qtXr1y5cpb22GuvvcqXL3/22WdbWojCiwTLJRCsxo0bd+/eHdkqUaIEDtdBBx3EkSuuuOLEE0+0TEIUXiRYjkFIeNNNN919993XX399165db7jhhnvuuadbt252WohCjQTLPYoUKdK6det777134MCBvXv3bt68edyNLSEKHxIsIYQzSLCEEM4gwRJCOIMESwjhDBIsIYQzSLCEEM4gwRJCOMOe9n88du7caX9lxsqVK3/++ec1a9Zs27Zt9erVf/zxh398zz33PNDjkEMOOfzwwytXruwfd5e///6blsLatWtpJo2Nvlpvr732KlmyZKlSpWhsuXLl8v/Rv82bNz/wwAP33nuvpT3Kly//008/WSJFaOyvv/66atWqdevW0d6tW7fyr53bY4999tmnQoUKRYsW5V8+pUSJEnYiFejD0aNHn3feeZb2oMBRo0bVq1fP0hH8J8OpD/2/YcMGrM4/vvfee2NjpUuXps+5lj/846lCA996661LLrnE0h5HHnkkB4877jhLp8X27duXL1/OBKHmNIGR8o8XKVIEUylevDgdeOihh2I8/vFCDJpgf8UDRcpDwZo3b97ChQvnz5+/aNGixYsXMyS///77smXLGHjLscceZcuWPfjgg7EkBv7444/HCmvWrLn//vvb6Xhgl1OmTPn6668t7YEc1K9fv2HDhpZOC9pLJZkMlvZg4p100kl169a1dDz++usvmhnb2BUrVmzZssVvsp+HkaCxqBWNrVq1qt/Y6tWr59zYMCjg+++/H6syTEgKPOOMMyydgGwJFv2/fv362bNn+41lQJEG2vvbb79FNQL23XffatWqHXDAAUcddVSNGjVoLE2m+XY6OZIUrD///JOunj59+nfffbd06VL6H9mibv5Z+oeeZ8LT29SkVq1amMoRRxzhn02erAsWPblp06aZM2diz/xLH2JCiH70hRzYBuWjtv/61798m6lTp06lSpX8s4WSXAXL/ooLp9OAccVuBg4c2Llz55QGkpWkbdu2jz32GHZvZcUD63zjjTfsmggY5YUXXmg50oWFrn///lZihGLFir3zzjuWY1cwOFTgm2++eeqppy666KLatWvbNbnhu5YdOnTgQhZVKy45EIvmzZtbQR777bcfU9pOJwZBueOOO+yaCAiWnU4Ceh4tePPNN2+99dZTTjkleVcF8cISbr/99okTJ6JBVlwSIPfhsUawJk+e7GdgCHCmPvzwwyuvvJKlznIkBjtBqq655hpUhp70C0kSVqCXX37ZCoqAoEydOtVypAKljR079p577mE0k1m08LZo4PXXX89yRZOtlEKHtTYBuWTwi0gJlutHHnmkTZs2aT8swpp800034Z1ZiSGwUdaiwDqDBGDHONWWKS2wIeahleiB48ZMI+SxHDHgVTF7H3zwwZYtWxL42AWpQJ0POuggJv+CBQus0CTYXYLFOvT2229fddVVrPZ2cYowLXEDEaDkNStnwfIFlBWucePGdi45kC1acd9993G5/0HJkC3BwnJwAF944YUkpSoWZAsn66GHHsKRtOIKF9bOBOSSwS8ieZASzCu92RsL9nTZZZehSlZuiB07drDUWO4IzFtmlOVIHcwIywtUnjIJoyzHruCODR48OPPG8hFXX3118n7W7hIsanjMMcfYZelCfM18I6CzQnMjB8FCrVjVunfvfvjhh9uJFMHJ7dGjR/KalRXBwnR//PFHnM00YtIoZcqUYZ1bsmSJFVqIsBYmgAxZ/paQ4Y/u2gRghBo0aNAkhvr16x966KF2Oga0A8t47rnnWIrt0K7g+Fxw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';
}

module.exports = {
    makeUsersArray,
    makeDogsArray,
    makeDogsFixtures,
    cleanTables,
    seedUsers,
    seedDogProfileTables,
    makeExpectedProfile,
    makeMaliciousProfile,
    seedMaliciousProfile,
    makeAuthHeader,
    makeProfileImgString,
    seedPackMembers,
    makeExpectedPackMember,
    makePackMembersArray,
    makeHowlsFixtures,
    seedHowls,
    makeExpectedHowl,
    makeMaliciousHowl,
    seedUserSavedHowls,
    seedTablesForHowlsSearch,
    makeDataArrayForTestingSearch,
    seedReviews,
    makeReviewsFixtures,
    makeExpectedReview,
    makeMaliciousReview,
    makeMaliciousComment,
    makeSanitizedReview,
    seedReviewsWithoutComments,
};
