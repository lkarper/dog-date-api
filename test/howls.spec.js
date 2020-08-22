const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe(`Howls endpoints`, () => {
    let db;

    const {
        testUsers,
        testDogs,
        testHowls,
        testDogsInHowls,
        testTimeWindows,
    } = helpers.makeHowlsFixtures();

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

    describe(`GET /api/howls`, () => {
        context(`Given no howls in the database`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/howls')
                    .expect(200, []);
            });
        });

        context(`Given that there are howls in the database`, () => {
            beforeEach(`insert howls`, () => 
                helpers.seedHowls(
                    db,
                    testUsers,
                    testDogs,
                    testHowls,
                    testDogsInHowls,
                    testTimeWindows
                )
            );

            it(`responds with 200 and all the howls`, () => {
                const expectedHowls = testHowls.map(howl =>
                    helpers.makeExpectedHowl(
                        testUsers,
                        testDogs,
                        howl,
                        testTimeWindows,
                        testDogsInHowls
                    )
                );
                return supertest(app)
                    .get(`/api/howls`)
                    .expect(200, expectedHowls);
            });
        });
    });

    describe.only(`POST /api/howls`, () => {
        beforeEach(() => 
            helpers.seedDogProfileTables(
                db,
                testUsers,
                testDogs
            )
        );

        const howlForTest = testHowls[0];
        const newDogInHowl = testDogsInHowls[0];
        const testWindow = testTimeWindows[0];
        const { id, user_id, ...rest } = howlForTest;

        const testUser = testUsers[0];
        const testDog = testDogs[0];
        const newHowl = {
            ...rest,
            dog_ids: [ newDogInHowl.id ],
            time_windows: [{
                day_of_week: testWindow.day_of_week,
                start_time: testWindow.start_time,
                end_time: testWindow.end_time,
            }],
        };

        const requiredFields = [
            'howl_title',
            'address',
            'city',
            'state',
            'zipcode',
            'date',
            'meeting_type',
            'personal_message',
            'dog_ids',
            'time_windows',
        ];

        context(`Given that there is no authorization header`, () => {
            it(`responds with 401 and an error message`, () => {
                return supertest(app)
                    .post(`/api/howls`)
                    .send(newHowl)
                    .expect(401, { error: `Missing bearer token` });
            });
        });

        context(`Given that there is an authorization header`, () => {
            requiredFields.forEach(field => {
                const postAttemptBody = { ...newHowl };

                it(`responds with 400 require error when '${field}' is missing`, () => {
                    delete postAttemptBody[field];
                    return supertest(app)
                        .post('/api/howls')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(postAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`,
                        });
                });
            });
        });

    });
});