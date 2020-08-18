const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');
const { expect } = require('chai');

describe('Dog profiles endpoints', () => {
    let db;
    
    const { testUsers, testDogs } = helpers.makeDogsFixtures();

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

        it(`creates a dog profile, responding with 201 and the new profile`, () => {
            const testUser = testUsers[0];
            const newProfile = {
                name: 'Test dog',
                profile_img_url: 'http://placehold.it/500x500',
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
            return supertest(app)
                .post('/api/dog-profiles')
                .set('Authorization', helpers.makeAuthHeader(testUser))
                .send(newProfile)
                .expect(201)
                .expect(res => {
                    expect(res.headers.location).to.eql(`/api/dog-profiles/${res.body.id}`)
                    expect(res.body).to.have.property('id');
                    expect(res.body.name).to.eql(newProfile.name);
                    expect(res.body.profile_img_url).to.eql(newProfile.profile_img_url);
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
                            expect(res.body.profile_img_url).to.eql(newProfile.profile_img_url);
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
                    }
                );
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
                            { message: `Request body must contain one of 'name', 'profile_img_url', 'age_years', 'age_months', 'sex', 'breed', 'weight', 'energy', 'temperment', 'obedience', 'dislikes_puppies', 'dislikes_men', 'dislikes_women', 'dislikes_children', 'recently_adopted', 'prefers_people', 'leash_aggression', 'elderly_dog', 'little_time_with_other_dogs', 'much_experience_with_other_dogs', 'aggressive', 'owner_description'.` } 
                        });
                });
            });


        });
    });
});