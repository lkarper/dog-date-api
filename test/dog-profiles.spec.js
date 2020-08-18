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

            beforeEach(`insert malicious article`, () => {
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
                    .expect(404, { error: `Dog profile doesn't exist` });
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
});