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

const makeDogsFixtures = () => {
    const testUsers = makeUsersArray();
    const testDogs = makeDogsArray(testUsers);
    return { testUsers, testDogs };
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
        owner_description
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
};