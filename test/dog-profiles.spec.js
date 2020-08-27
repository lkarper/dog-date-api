const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Dog profiles endpoints', () => {
    let db;
    
    const { 
        testUsers, 
        testDogs, 
        testPackMembers 
    } = helpers.makeDogsFixtures();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe(`GET /api/dog-profiles`, () => {
        context(`Given no dog profiles`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/dog-profiles')
                    .expect(200, []);
            });
        });

        context(`Given there are dog profiles in the database`, () => {
            beforeEach(`insert dogs`, () =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers, 
                    testDogs
                ) 
            );

            it(`responds with 200 and all of the profiles`, () => {
                const expectedProfiles = testDogs.map(dog =>
                    helpers.makeExpectedProfile(
                        testUsers,
                        dog
                    )
                );
                return supertest(app)
                    .get('/api/dog-profiles')
                    .expect(200, expectedProfiles);
            });
        });

        context(`Given an XSS attack profile`, () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousProfile,
                expectedProfile,
            } = helpers.makeMaliciousProfile(testUser);

            beforeEach(`insert malicious profile`, () => {
                return helpers.seedMaliciousProfile(
                    db,
                    testUser,
                    maliciousProfile,
                );
            });

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/dog-profiles`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedProfile.name)
                        expect(res.body[0].owner_description).to.eql(expectedProfile.owner_description)
                    });
            });
        });
    });

    describe(`POST /api/dog-profiles`, () => {
        beforeEach(() => 
            helpers.seedUsers(db, testUsers)
        );

        const testUser = testUsers[0];
        const newProfile = {
            name: 'Test dog',
            age_years: 1,
            age_months: 1,
            sex: 'test sex 1',
            breed: 'test breed 1',
            weight: 10,
            energy: 'test energy 1',
            temperment: 'test temperment 1',
            obedience: 'test obedience 1',
            dislikes_puppies: true,
            dislikes_men: true,
            dislikes_women: true,
            dislikes_children: true,
            recently_adopted: true,
            prefers_people: true,
            leash_aggression: true,
            elderly_dog: true,
            little_time_with_other_dogs: true,
            much_experience_with_other_dogs: true,
            aggressive: true,
            owner_description: 'Sit veniam Lorem adipisicing et duis aliqua incididunt voluptate.',
        };

        const requiredFields = [
            'name', 
            'age_years', 
            'age_months', 
            'sex', 
            'breed', 
            'weight', 
            'energy', 
            'temperment', 
            'obedience', 
            'dislikes_puppies', 
            'dislikes_men', 
            'dislikes_women', 
            'dislikes_children', 
            'recently_adopted', 
            'prefers_people', 
            'leash_aggression', 
            'elderly_dog', 
            'little_time_with_other_dogs', 
            'much_experience_with_other_dogs', 
            'aggressive', 
            'owner_description',
        ];

        context(`Given that there is no authorization header`, () => {
            it(`responds with 401 and an error message`, () => {
                return supertest(app)
                    .post(`/api/dog-profiles/`)
                    .send(newProfile)
                    .expect(401, { error: `Missing bearer token` });
            });
        });

        context(`Given that there is an authorization header`, () => {
            requiredFields.forEach(field => {
                const postAttemptBody = { ...newProfile };
            
                it(`responds with 400 require error when '${field}' is missing`, () => {
                    delete postAttemptBody[field];
                    return supertest(app)
                        .post('/api/dog-profiles')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(postAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`,
                        });
                });
            });

            context(`Given that a profile photo is included in the profile`, () => {
                it(`creates a dog profile, responds with 201 and the new profile`, () => {
                    newProfile.profile_img = helpers.makeProfileImgString();
                    return supertest(app)
                        .post('/api/dog-profiles')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(newProfile)
                        .expect(201)
                        .expect(res => {
                            expect(res.headers.location).to.eql(`/api/dog-profiles/${res.body.id}`)
                            expect(res.body).to.have.property('id');
                            expect(res.body.profile_img_url).to.not.eql('');
                            expect(res.body.name).to.eql(newProfile.name);
                            expect(res.body.age_years).to.eql(newProfile.age_years);
                            expect(res.body.age_months).to.eql(newProfile.age_months);
                            expect(res.body.sex).to.eql(newProfile.sex);
                            expect(res.body.breed).to.eql(newProfile.breed);
                            expect(res.body.weight).to.eql(newProfile.weight);
                            expect(res.body.energy).to.eql(newProfile.energy);
                            expect(res.body.temperment).to.eql(newProfile.temperment);
                            expect(res.body.obedience).to.eql(newProfile.obedience);
                            expect(res.body.dislikes_puppies).to.eql(newProfile.dislikes_puppies);
                            expect(res.body.dislikes_men).to.eql(newProfile.dislikes_men);
                            expect(res.body.dislikes_women).to.eql(newProfile.dislikes_women);
                            expect(res.body.dislikes_children).to.eql(newProfile.dislikes_children);
                            expect(res.body.recently_adopted).to.eql(newProfile.recently_adopted);
                            expect(res.body.prefers_people).to.eql(newProfile.prefers_people);
                            expect(res.body.leash_aggression).to.eql(newProfile.leash_aggression);
                            expect(res.body.elderly_dog).to.eql(newProfile.elderly_dog);
                            expect(res.body.little_time_with_other_dogs).to.eql(newProfile.little_time_with_other_dogs);
                            expect(res.body.much_experience_with_other_dogs).to.eql(newProfile.much_experience_with_other_dogs);
                            expect(res.body.aggressive).to.eql(newProfile.aggressive);
                            expect(res.body.owner_description).to.eql(newProfile.owner_description);
                            expect(res.body.owner).to.eql({
                                id: testUser.id,
                                username: testUser.username,
                                email: testUser.email,
                                phone: testUser.phone,
                            });
                        })
                        .then(postRes => {
                            return supertest(app)
                                .get(`/api/dog-profiles/${postRes.body.id}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(res => {
                                    expect(res.body).to.have.property('id');
                                    expect(res.body.name).to.eql(newProfile.name);
                                    expect(res.body.profile_img_url).to.not.eql('');
                                    expect(res.body.age_years).to.eql(newProfile.age_years);
                                    expect(res.body.age_months).to.eql(newProfile.age_months);
                                    expect(res.body.sex).to.eql(newProfile.sex);
                                    expect(res.body.breed).to.eql(newProfile.breed);
                                    expect(res.body.weight).to.eql(newProfile.weight);
                                    expect(res.body.energy).to.eql(newProfile.energy);
                                    expect(res.body.temperment).to.eql(newProfile.temperment);
                                    expect(res.body.obedience).to.eql(newProfile.obedience);
                                    expect(res.body.dislikes_puppies).to.eql(newProfile.dislikes_puppies);
                                    expect(res.body.dislikes_men).to.eql(newProfile.dislikes_men);
                                    expect(res.body.dislikes_women).to.eql(newProfile.dislikes_women);
                                    expect(res.body.dislikes_children).to.eql(newProfile.dislikes_children);
                                    expect(res.body.recently_adopted).to.eql(newProfile.recently_adopted);
                                    expect(res.body.prefers_people).to.eql(newProfile.prefers_people);
                                    expect(res.body.leash_aggression).to.eql(newProfile.leash_aggression);
                                    expect(res.body.elderly_dog).to.eql(newProfile.elderly_dog);
                                    expect(res.body.little_time_with_other_dogs).to.eql(newProfile.little_time_with_other_dogs);
                                    expect(res.body.much_experience_with_other_dogs).to.eql(newProfile.much_experience_with_other_dogs);
                                    expect(res.body.aggressive).to.eql(newProfile.aggressive);
                                    expect(res.body.owner_description).to.eql(newProfile.owner_description);
                                    expect(res.body.owner).to.eql({
                                        id: testUser.id,
                                        username: testUser.username,
                                        email: testUser.email,
                                        phone: testUser.phone,
                                    });
                                });
                        });
                });
            });
            
            context(`Given that no profile photo is included`, () => {
                it(`creates a dog profile, responding with 201 and the new profile`, () => {
                    newProfile.profile_img = '';
                    return supertest(app)
                        .post('/api/dog-profiles')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(newProfile)
                        .expect(201)
                        .expect(res => {
                            expect(res.headers.location).to.eql(`/api/dog-profiles/${res.body.id}`);
                            expect(res.body).to.have.property('id');
                            expect(res.body.profile_img_url).to.eql('');
                            expect(res.body.name).to.eql(newProfile.name);
                            expect(res.body.age_years).to.eql(newProfile.age_years);
                            expect(res.body.age_months).to.eql(newProfile.age_months);
                            expect(res.body.sex).to.eql(newProfile.sex);
                            expect(res.body.breed).to.eql(newProfile.breed);
                            expect(res.body.weight).to.eql(newProfile.weight);
                            expect(res.body.energy).to.eql(newProfile.energy);
                            expect(res.body.temperment).to.eql(newProfile.temperment);
                            expect(res.body.obedience).to.eql(newProfile.obedience);
                            expect(res.body.dislikes_puppies).to.eql(newProfile.dislikes_puppies);
                            expect(res.body.dislikes_men).to.eql(newProfile.dislikes_men);
                            expect(res.body.dislikes_women).to.eql(newProfile.dislikes_women);
                            expect(res.body.dislikes_children).to.eql(newProfile.dislikes_children);
                            expect(res.body.recently_adopted).to.eql(newProfile.recently_adopted);
                            expect(res.body.prefers_people).to.eql(newProfile.prefers_people);
                            expect(res.body.leash_aggression).to.eql(newProfile.leash_aggression);
                            expect(res.body.elderly_dog).to.eql(newProfile.elderly_dog);
                            expect(res.body.little_time_with_other_dogs).to.eql(newProfile.little_time_with_other_dogs);
                            expect(res.body.much_experience_with_other_dogs).to.eql(newProfile.much_experience_with_other_dogs);
                            expect(res.body.aggressive).to.eql(newProfile.aggressive);
                            expect(res.body.owner_description).to.eql(newProfile.owner_description);
                            expect(res.body.owner).to.eql({
                                id: testUser.id,
                                username: testUser.username,
                                email: testUser.email,
                                phone: testUser.phone,
                            });
                        })
                        .then(postRes => {
                            return supertest(app)
                                .get(`/api/dog-profiles/${postRes.body.id}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(res => {
                                    expect(res.body).to.have.property('id');
                                    expect(res.body.name).to.eql(newProfile.name);
                                    expect(res.body.profile_img_url).to.eql('');
                                    expect(res.body.age_years).to.eql(newProfile.age_years);
                                    expect(res.body.age_months).to.eql(newProfile.age_months);
                                    expect(res.body.sex).to.eql(newProfile.sex);
                                    expect(res.body.breed).to.eql(newProfile.breed);
                                    expect(res.body.weight).to.eql(newProfile.weight);
                                    expect(res.body.energy).to.eql(newProfile.energy);
                                    expect(res.body.temperment).to.eql(newProfile.temperment);
                                    expect(res.body.obedience).to.eql(newProfile.obedience);
                                    expect(res.body.dislikes_puppies).to.eql(newProfile.dislikes_puppies);
                                    expect(res.body.dislikes_men).to.eql(newProfile.dislikes_men);
                                    expect(res.body.dislikes_women).to.eql(newProfile.dislikes_women);
                                    expect(res.body.dislikes_children).to.eql(newProfile.dislikes_children);
                                    expect(res.body.recently_adopted).to.eql(newProfile.recently_adopted);
                                    expect(res.body.prefers_people).to.eql(newProfile.prefers_people);
                                    expect(res.body.leash_aggression).to.eql(newProfile.leash_aggression);
                                    expect(res.body.elderly_dog).to.eql(newProfile.elderly_dog);
                                    expect(res.body.little_time_with_other_dogs).to.eql(newProfile.little_time_with_other_dogs);
                                    expect(res.body.much_experience_with_other_dogs).to.eql(newProfile.much_experience_with_other_dogs);
                                    expect(res.body.aggressive).to.eql(newProfile.aggressive);
                                    expect(res.body.owner_description).to.eql(newProfile.owner_description);
                                    expect(res.body.owner).to.eql({
                                        id: testUser.id,
                                        username: testUser.username,
                                        email: testUser.email,
                                        phone: testUser.phone,
                                    });
                                });
                        });
                });
            });
        });
    });

    describe(`GET /api/dog-profiles/user-dogs`, () => {

        context(`Given no dog profiles`, () => {
            beforeEach(() => 
                helpers.seedUsers(db, testUsers)
            );

            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/dog-profiles/user-dogs')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context(`Given that there are dog profiles`, () => {
            beforeEach('insert profiles', () =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers,
                    testDogs
                )
            );

            context(`Given that the user has not created a dog profile`, () => {
                it(`responds with 200 and an empty array`, () => {
                    return supertest(app)
                        .get(`/api/dog-profiles/user-dogs`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[4]))
                        .expect(200, []);
                });
            });

            context(`Given that the user has created one or more profiles`, () => {
                it(`responds with 200 and a user's dog profiles`, () => {
                    const expectedProfile = [helpers.makeExpectedProfile(testUsers, testDogs[0])];
                    return supertest(app)
                        .get('/api/dog-profiles/user-dogs')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedProfile);
                });
            });

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/dog-profiles/user-dogs`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });
        });

        context(`Given an XSS attack profile`, () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousProfile,
                expectedProfile,
            } = helpers.makeMaliciousProfile(testUser);

            beforeEach(`insert malicious profile`, () => {
                return helpers.seedMaliciousProfile(
                    db,
                    testUser,
                    maliciousProfile,
                );
            });

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/dog-profiles/user-dogs`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].name).to.eql(expectedProfile.name)
                        expect(res.body[0].owner_description).to.eql(expectedProfile.owner_description)
                    });
            });
        });

    });

    describe(`GET /api/dog-profiles/:dog_id`, () => {
        context(`Given no profiles`, () => {
            beforeEach(() => 
                helpers.seedUsers(db, testUsers)
            );

            it(`responds with 404`, () => {
                const dogId = 123456;
                return supertest(app)
                    .get(`/api/dog-profiles/${dogId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: 
                        { message: `Dog profile doesn't exist` }
                    });
            });
        });

        context(`Given there are dog profiles in the database`, () => {
            beforeEach('insert profiles', () =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers,
                    testDogs
                )
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/dog-profiles/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                it(`responds with 200 and the specified profile`, () => {
                    const profileId = 2;
                    const expectedProfile = helpers.makeExpectedProfile(
                        testUsers,
                        testDogs[profileId - 1],
                    );
    
                    return supertest(app)
                        .get(`/api/dog-profiles/${profileId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedProfile);
                });
            });
        });

        context(`Given an XSS attack profile`, () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousProfile,
                expectedProfile,
            } = helpers.makeMaliciousProfile(testUser);

            beforeEach('insert malicious profile', () => {
                return helpers.seedMaliciousProfile(
                    db,
                    testUser,
                    maliciousProfile,
                );
            });

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get(`/api/dog-profiles/${maliciousProfile.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.name).to.eql(expectedProfile.name);
                        expect(res.body.owner_description).to.eql(expectedProfile.owner_description);
                    });
            });
        });
    });

    describe('DELETE /api/dog-profiles/:dog_id', () => {
        context('given no profiles', () => {
            it('responds with 404', () => {
                const profileId = 123456;
                return supertest(app)
                    .delete(`/api/dog-profiles/${profileId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { 
                        error: { message: `Dog profile doesn't exist` },
                    });
            });
        });

        context('given there are profiles in the database', () => {
            const testProfiles = helpers.makeDogsArray(testUsers);
            beforeEach(`insert dogs`, () =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers, 
                    testDogs
                ) 
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .delete(`/api/dog-profiles/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });
            
            context(`Given that there is an authorization header`, () => {
                context(`given a user attempts to delete a dog profile that does not belong to that user`, () => {
                    it(`responds with 401 unauthorized request`, () => {
                        const idToRemove = 3;
                        
                        return supertest(app)
                            .delete(`/api/dog-profiles/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(401, { error: `Unauthorized request` });
    
                    });
                });
    
                context(`given a user attempts to delete a dog profile that does belong to that user`, () => {
                    it(`responds with 204 and removes the profile`, () => {
                        const idToRemove = 1;
                        const expectedProfiles = testProfiles
                            .filter(p => p.id !== idToRemove)
                            .map(dog => helpers.makeExpectedProfile(testUsers, dog));
                        
                        return supertest(app)
                            .delete(`/api/dog-profiles/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(204)
                            .then(res => 
                                supertest(app)
                                    .get(`/api/dog-profiles`)
                                    .expect(expectedProfiles)   
                            );
                    });    
                });
            });          
        });
    });

    describe('PATCH /api/dog-profiles/:dog_id', () => {
        context('given no profiles', () => {
            it('responds with 404', () => {
                const profileId = 123456;
                return supertest(app)
                    .patch(`/api/dog-profiles/${profileId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({ name: 'Fluffy' })
                    .expect(404, { 
                        error: { message: `Dog profile doesn't exist` },
                    });
            });
        });

        context('given there are profiles in the database', () => {
            const testProfiles = helpers.makeDogsArray(testUsers);
            beforeEach(`insert dogs`, () =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers, 
                    testDogs
                ) 
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .patch(`/api/dog-profiles/1`)
                        .send({ name: 'Fluffy' })
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {

                context(`given a user attempts to update a dog profile that does not belong to that user`, () => {
                    it(`responds with 401 unauthorized request`, () => {
                        const idToUpdate = 3;
                        
                        return supertest(app)
                            .patch(`/api/dog-profiles/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send({ name: 'Fluffy' })
                            .expect(401, { error: `Unauthorized request` });
                    });
                });
    
                context(`given a user attempts to update a dog profile that does belong to that user`, () => {
                    it(`responds with 204 and updates profile`, () => {
                        const idToUpdate = 1;
                        const authHeader = helpers.makeAuthHeader(testUsers[0]);
                        
                        return supertest(app)
                            .patch(`/api/dog-profiles/${idToUpdate}`)
                            .set('Authorization', authHeader)
                            .send({ name: 'Fluffy' })
                            .expect(204)
                            .then(res => 
                                supertest(app)
                                    .get(`/api/dog-profiles/${idToUpdate}`)
                                    .set('Authorization', authHeader)
                                    .expect(res => {
                                        expect(res.body.name).to.eql('Fluffy');
                                    })
                            );
                    });
                });
    
                context(`given no fields are provided to update profile`, () => {
                    it(`responds with 400 and and error message`, () => {
                        const idToUpdate = 1;
                        const authHeader = helpers.makeAuthHeader(testUsers[0]);
                        
                        return supertest(app)
                            .patch(`/api/dog-profiles/${idToUpdate}`)
                            .set('Authorization', authHeader)
                            .send({ })
                            .expect(400, { error: 
                                { message: `Request body must contain one of 'name', 'profile_img', 'profile_img_url', 'age_years', 'age_months', 'sex', 'breed', 'weight', 'energy', 'temperment', 'obedience', 'dislikes_puppies', 'dislikes_men', 'dislikes_women', 'dislikes_children', 'recently_adopted', 'prefers_people', 'leash_aggression', 'elderly_dog', 'little_time_with_other_dogs', 'much_experience_with_other_dogs', 'aggressive', 'owner_description'.` } 
                            });
                    });
                });
    
            });
        });
    });

    describe(`GET /api/dog-profiles/pack-members`, () => {

        context(`Given there is no authorization header`, () => {
            beforeEach(() => 
                helpers.seedDogProfileTables(db, testUsers, testDogs)
            );
            it(`responds with 401 and an error message`, () => {
                return supertest(app)
                    .get(`/api/dog-profiles/pack-members`)
                    .expect(401, { error: `Missing bearer token` });
            });
        });

        context(`Given there is an authorization header`, () => {
            const authHeader = helpers.makeAuthHeader(testUsers[0]);
            context(`Given no pack members`, () => {
                beforeEach(() => 
                    helpers.seedDogProfileTables(db, testUsers, testDogs)
                );
                it(`responds with 200 and an empty array`, () => {
                    return supertest(app)
                        .get(`/api/dog-profiles/pack-members`)
                        .set('Authorization', authHeader)
                        .expect(200, []);
                });
            });

            context(`Given that there are pack members`, () => {
                beforeEach(() => 
                    helpers.seedPackMembers(db, testUsers, testDogs, testPackMembers)
                );

                it(`responds with 200 and the pack members`, () => {
                    const expectedPackMember = helpers
                        .makeExpectedPackMember(testUsers, testUsers[0], testDogs[3]);
                    return supertest(app)
                        .get('/api/dog-profiles/pack-members')
                        .set('Authorization', authHeader)
                        .expect(200, [expectedPackMember]);                
                });
            });
        });
    });

    describe(`POST /api/dog-profiles/pack-members`, () => {

        const testUser = testUsers[0];
        const newPackMember = {
            user_id: testUser.id,
            pack_member_id: 1
        };

        context(`Given there is no authorization header`, () => {
            beforeEach(() => 
                helpers.seedDogProfileTables(db, testUsers, testDogs)
            );
            it(`responds with 401 and an error message`, () => {
                return supertest(app)
                    .post(`/api/dog-profiles/pack-members`)
                    .send(newPackMember)
                    .expect(401, { error: `Missing bearer token` });
            });
        });

        context(`Given there is an authorization header`, () => {

            context(`Given that the pack_member_id is missing from the body`, () => {
                beforeEach(() => 
                    helpers.seedDogProfileTables(db, testUsers, testDogs)
                );
                it(`responds with 400 and an error message`, () => {
                    return supertest(app)
                        .post('/api/dog-profiles/pack-members')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({})
                        .expect(400, {
                            error: {
                                message: `Request body must contain 'pack_member_id'`,
                            },
                        });
                });
            });

            context(`Given that the user has not yet added the dog to their pack and the body is properly formatted`, () => {
                beforeEach(() => 
                    helpers.seedDogProfileTables(db, testUsers, testDogs)
                );
                it(`creates a new pack-member and responds with 201 and the pack member profile`, () => {
                    const expectedDogProfile = helpers.makeExpectedProfile(testUsers, testDogs[newPackMember.pack_member_id - 1]);
                    return supertest(app)
                        .post('/api/dog-profiles/pack-members')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(newPackMember)
                        .expect(201)
                        .expect(res => {
                            expect(res.headers.location).to.eql(`/api/dog-profiles/pack-members/${res.body.id}`);
                            expect(res.body).to.have.property('id');
                            expect(res.body.user_id).to.eql(newPackMember.user_id)
                            expect(res.body.profile).to.eql(expectedDogProfile);
                        })
                        .then(postRes => {
                            return supertest(app)
                                .get(`/api/dog-profiles/pack-members/${postRes.body.id}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(res => {
                                    expect(res.body).to.have.property('id');
                                    expect(res.body.user_id).to.eql(newPackMember.user_id)
                                    expect(res.body.profile).to.eql(expectedDogProfile);
                                });
                        });
                });
            });

            context(`Given that the user has already added the dog to their pack`, () => {
                beforeEach(() =>
                    helpers.seedPackMembers(db, testUsers, testDogs, testPackMembers)
                );
                it(`responds with 200 and the profile`, () => {
                    return supertest(app)
                        .post('/api/dog-profiles/pack-members')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({
                            user_id: 1,
                            pack_member_id: 4
                        })
                        .expect(200)
                        .expect(res => {
                            const expectedDogProfile = helpers.makeExpectedProfile(testUsers, testDogs[3]);
                            expect(res.body).to.have.property('id');
                            expect(res.body.user_id).to.eql(1)
                            expect(res.body.profile).to.eql(expectedDogProfile);
                        })
                       
                });
            });

            context(`Given that a dog profile doesn't exist and a user attempts to add it to their pack`, () => {
                beforeEach(() =>
                    helpers.seedPackMembers(db, testUsers, testDogs, testPackMembers)
                );
                it(`responds with 404 and an error message`, () => {
                    return supertest(app)
                        .post('/api/dog-profiles/pack-members')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({
                            user_id: 1,
                            pack_member_id: 44
                        })
                        .expect(404, { error: 
                            { message: `Dog profile doesn't exist` }
                        });
                });
            });
        });
    });

    describe(`GET '/api/dog-profiles/pack-member/:entry_id`, () => {
        context(`Given no pack members`, () => {
            beforeEach(() => {
                helpers.seedDogProfileTables(db, testUsers, testDogs)
            });
            it(`responds with 404`, () => {
                const entryId = 123456;
                return supertest(app)
                    .get(`/api/dog-profiles/pack-members/${entryId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: 
                        { message: `Pack member doesn't exist` }
                    });
            });
        });

        context(`Given that there are pack members`, () => {
            beforeEach(() => 
                helpers.seedPackMembers(db, testUsers, testDogs, testPackMembers)
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/dog-profiles/pack-members/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                it(`responds with 200 and the sepcified pack member`, () => {
                    const entryId = 1;
                    const expectedPackMember = helpers
                        .makeExpectedPackMember(testUsers, testUsers[0], testDogs[3]);
                    return supertest(app)
                        .get(`/api/dog-profiles/pack-members/${entryId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedPackMember);
                });
            });
        });
    });

    describe(`DELETE /api/dog-profiles/pack-members/:entry_id`, () => {

        context('given no pack members', () => {
            beforeEach(() => {
                helpers.seedDogProfileTables(db, testUsers, testDogs);
            });
            it('responds with 404', () => {
                const packMemberId = 123456;
                return supertest(app)
                    .delete(`/api/dog-profiles/${packMemberId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { 
                        error: { message: `Dog profile doesn't exist` },
                    });
            });
        });

        context('given there are pack members in the database', () => {
            beforeEach(`insert pack members`, () =>
                helpers.seedPackMembers(
                    db,
                    testUsers, 
                    testDogs,
                    testPackMembers
                ) 
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .delete(`/api/dog-profiles/pack-members/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });
            
            context(`Given that there is an authorization header`, () => {
                context(`given a user attempts to delete a pack member that does not belong to that user`, () => {
                    it(`responds with 401 unauthorized request`, () => {
                        const idToRemove = 3;
                        
                        return supertest(app)
                            .delete(`/api/dog-profiles/pack-members/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(401, { error: `Unauthorized request` });
                    });
                });
    
                context(`given a user attempts to delete a pack member that does belong to that user`, () => {
                    it(`responds with 204 and removes the pack member`, () => {
                        const idToRemove = 1;

                        return supertest(app)
                            .delete(`/api/dog-profiles/pack-members/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(204)
                            .then(res => {
                                return supertest(app)
                                    .get(`/api/dog-profiles/pack-members`)
                                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                    .expect([]);
                            });
                    });    
                });
            });          
        });
    })
});