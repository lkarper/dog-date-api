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
        testUserSavedHowls,
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

        context(`Given an XSS attack howl`, () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousProfile,
                expectedProfile,
            } = helpers.makeMaliciousProfile(testUser);
            const {
                maliciousHowl,
                expectedHowl
            } = helpers.makeMaliciousHowl(testUser, expectedProfile);

            beforeEach(`insert malicious data`, () => {
                const { dog_ids, time_windows, ...rest } = maliciousHowl;
                const timeWindows = [{
                    howl_id: 911,
                    day_of_week: time_windows[0].day_of_week,
                    start_time: time_windows[0].start_time,
                    end_time: time_windows[0].end_time,
                }];
                return helpers.seedHowls(
                    db,
                    testUsers,
                    [maliciousProfile],
                    [{...rest}],
                    [{
                        howl_id: 911,
                        dog_id: 911,
                    }],
                    timeWindows              
                );
            });

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/api/howls')
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].id).to.eql(expectedHowl.id);
                        expect(res.body[0].user_id).to.eql(expectedHowl.user_id);
                        expect(res.body[0].howl_title).to.eql(expectedHowl.howl_title);
                        expect(res.body[0].date).to.eql(expectedHowl.date);
                        expect(res.body[0].meeting_type).to.eql(expectedHowl.meeting_type);
                        expect(res.body[0].personal_message).to.eql(expectedHowl.personal_message);
                        expect(res.body[0].dogs).to.eql(expectedHowl.dogs);
                        expect(res.body[0].time_windows).to.eql(expectedHowl.time_windows);
                    });
            });
        });
    });

    describe(`POST /api/howls`, () => {
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

            context(`Given that all required fields are present in body`, () => {
                it(`creates a howl, responds with 201 and the new howl`, () => {
                    return supertest(app)
                        .post('/api/howls')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(newHowl)
                        .expect(201)
                        .expect(res => {
                            const expectedResponse = helpers.makeExpectedHowl(
                                testUsers, 
                                testDogs, 
                                res.body, 
                                testTimeWindows,
                                testDogsInHowls
                            );
                            expect(res.headers.location).to.eql(`/api/howls/${res.body.id}`);
                            expect(res.body).to.have.property('id');
                            expect(res.body.user_id).to.eql(testUser.id);
                            expect(res.body.howl_title).to.eql(newHowl.howl_title);
                            expect(res.body.date).to.eql(newHowl.date);
                            expect(res.body.meeting_type).to.eql(newHowl.meeting_type);
                            expect(res.body.personal_message).to.eql(newHowl.personal_message);
                            expect(res.body.dogs).to.eql(expectedResponse.dogs);
                            expect(res.body.location).to.eql({
                                address: newHowl.address,
                                city: newHowl.city,
                                state: newHowl.state,
                                zipcode: newHowl.zipcode,
                                lat: newHowl.lat,
                                lon: newHowl.lon,
                            });
                            expect(res.body.time_windows).to.eql(expectedResponse.time_windows);
                        })
                        .then(postRes => {
                            return supertest(app)
                                .get(`/api/howls/${postRes.body.id}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(res => {
                                    const expectedResponse = helpers.makeExpectedHowl(
                                        testUsers, 
                                        testDogs, 
                                        res.body, 
                                        testTimeWindows,
                                        testDogsInHowls
                                    );
                                    expect(res.body).to.have.property('id');
                                    expect(res.body.user_id).to.eql(testUser.id);
                                    expect(res.body.howl_title).to.eql(newHowl.howl_title);
                                    expect(res.body.date).to.eql(newHowl.date);
                                    expect(res.body.meeting_type).to.eql(newHowl.meeting_type);
                                    expect(res.body.personal_message).to.eql(newHowl.personal_message);
                                    expect(res.body.dogs).to.eql(expectedResponse.dogs);
                                    expect(res.body.location).to.eql({
                                        address: newHowl.address,
                                        city: newHowl.city,
                                        state: newHowl.state,
                                        zipcode: newHowl.zipcode,
                                        lat: newHowl.lat,
                                        lon: newHowl.lon,
                                    });
                                    expect(res.body.time_windows).to.eql(expectedResponse.time_windows);
                                });
                        });
                });
            });
        });

    });

    describe(`GET /user-saved`, () => {
        
        context(`Given no saved howls`, () => {
            beforeEach(() => 
                helpers.seedHowls(
                    db,
                    testUsers,
                    testDogs,
                    testHowls,
                    testDogsInHowls,
                    testTimeWindows
                )
            );

            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get(`/api/howls/user-saved`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context(`Given that there are saved howls`, () => {

            beforeEach(() => 
                helpers.seedUserSavedHowls(
                    db,
                    testUsers,
                    testDogs,
                    testHowls,
                    testDogsInHowls,
                    testTimeWindows,
                    testUserSavedHowls
                )
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/howls/user-saved`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {

                it(`responds with 200 and the user's saved howls`, () => {
                    const testUser = testUsers[0];
                    const expectedHowls = testUserSavedHowls
                        .filter(ush => ush.user_id === testUser.id)
                        .map(ush => {
                            const howl = testHowls.find(th => th.id === ush.howl_id);
                            const expectedHowl = helpers.makeExpectedHowl(
                                testUsers,
                                testDogs,
                                howl,
                                testTimeWindows,
                                testDogsInHowls,
                            );
                            return {
                                id: (howl.id - 1) * 5 + 1,
                                user_id: testUser.id,
                                howl: expectedHowl
                            }
                        });
                    return supertest(app)
                        .get(`/api/howls/user-saved`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedHowls);
                });
            });
        });
    });

    describe(`POST /api/howls/user-saved`, () => {
        const testUser = testUsers[0];

        const newSavedHowl = {
            user_id: testUser.id,
            howl_id: 2,
        };

        context(`Given there is no authorization header`, () => {
            beforeEach(() => 
                helpers.seedUserSavedHowls(
                    db,
                    testUsers,
                    testDogs,
                    testHowls,
                    testDogsInHowls,
                    testTimeWindows,
                    testUserSavedHowls
                )
            );
            it(`responds with 401 and an error message`, () => {
                return supertest(app)
                    .post(`/api/howls/user-saved`)
                    .send(newSavedHowl)
                    .expect(401, { error: `Missing bearer token` });
            });
        });

        context(`Given there is an authorization header`, () => {

            context(`Given that the 'howl_id' fields is missing from the body`, () => {
                
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
                it(`responds with 400 and an error message`, () => {
                    return supertest(app)
                        .post('/api/howls/user-saved')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({})
                        .expect(400, {
                            error: {
                                message: `Request body must contain 'howl_id'.`,
                            },
                        });
                });
            });

            context(`Given that the user has not yet saved the howl, the howl exists, and the body is properly formatted`, () => {
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
                
                it(`creates a saved howl and responds with 201 and the howl`, () => {
                    const howl = testHowls.find(th => th.id === newSavedHowl.howl_id);
                    const expectedHowl = helpers.makeExpectedHowl(
                        testUsers,
                        testDogs,
                        howl,
                        testTimeWindows,
                        testDogsInHowls
                    );
                    return supertest(app)
                        .post('/api/howls/user-saved')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send(newSavedHowl)
                        .expect(201)
                        .expect(res => {
                            expect(res.headers.location).to.eql(`/api/howls/user-saved/${res.body.id}`);
                            expect(res.body).to.have.property('id');
                            expect(res.body.user_id).to.eql(testUser.id);
                            expect(res.body.howl).to.eql(expectedHowl);
                        })
                        .then(postRes => {
                            return supertest(app)
                                .get(`/api/howls/user-saved/${postRes.body.id}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(res => {
                                    expect(res.body).to.have.property('id');
                                    expect(res.body.user_id).to.eql(testUser.id);
                                    expect(res.body.howl).to.eql(expectedHowl);
                                });
                        });
                });
            });

            context(`Given that the user has already saved the howl`, () => {
                beforeEach(() => 
                    helpers.seedUserSavedHowls(
                        db,
                        testUsers,
                        testDogs,
                        testHowls,
                        testDogsInHowls,
                        testTimeWindows,
                        testUserSavedHowls
                    )
                );
                const howlForTest = testHowls[0];
                const newDogInHowl = testDogsInHowls[0];
                const testWindow = testTimeWindows[0];
                const { id, user_id, ...rest } = howlForTest;
        
                const testUser = testUsers[0];
                const newHowl = {
                    ...rest,
                    dog_ids: [ newDogInHowl.id ],
                    time_windows: [{
                        day_of_week: testWindow.day_of_week,
                        start_time: testWindow.start_time,
                        end_time: testWindow.end_time,
                    }],
                };

                it(`responds with 200 and the howl`, () => {
                    return supertest(app)
                        .post('/api/howls/user-saved')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({
                            user_id: testUser.id,
                            howl_id: howlForTest.id
                        })
                        .expect(200)
                        .expect(res => {
                            const expectedResponse = helpers.makeExpectedHowl(
                                testUsers, 
                                testDogs, 
                                res.body, 
                                testTimeWindows,
                                testDogsInHowls
                            );
                            expect(res.body).to.have.property('id');
                            expect(res.body.user_id).to.eql(testUser.id);
                            expect(res.body.howl_title).to.eql(newHowl.howl_title);
                            expect(res.body.date).to.eql(newHowl.date);
                            expect(res.body.meeting_type).to.eql(newHowl.meeting_type);
                            expect(res.body.personal_message).to.eql(newHowl.personal_message);
                            expect(res.body.dogs).to.eql(expectedResponse.dogs);
                            expect(res.body.location).to.eql({
                                address: newHowl.address,
                                city: newHowl.city,
                                state: newHowl.state,
                                zipcode: newHowl.zipcode,
                                lat: newHowl.lat,
                                lon: newHowl.lon,
                            });
                            expect(res.body.time_windows).to.eql(expectedResponse.time_windows);
                        });
                        
                });
            });

            context(`given that the howl doesn't exist`, () => {
                beforeEach(() => 
                    helpers.seedUserSavedHowls(
                        db,
                        testUsers,
                        testDogs,
                        testHowls,
                        testDogsInHowls,
                        testTimeWindows,
                        testUserSavedHowls
                    )
                );

                it(`responds with 404 and an error message`, () => {
                    return supertest(app)
                        .post(`/api/howls/user-saved`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({
                            user_id: 1,
                            howl_id: 100,
                        })
                        .expect(404, {
                            error: { message: `Howl doesn't exist` },
                        });
                });
            });
        });
    });

    describe(`GET /api/howls/user-saved/:entry_id`, () => {
        context(`Given no saved howls`, () => {
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

            it(`responds with 404`, () => {
                return supertest(app)
                    .get('/api/howls/user-saved/100')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Saved howl doesn't exist` },
                    });
            });
        });

        context(`Given that there are user saved howls`, () => {
            beforeEach(() => 
                helpers.seedUserSavedHowls(
                    db,
                    testUsers,
                    testDogs,
                    testHowls,
                    testDogsInHowls,
                    testTimeWindows,
                    testUserSavedHowls
                )
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/howls/user-saved/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`given that there is an authorization header`, () => {
                it(`responds with 200 and the specified howl`, () => {
                    const entryId = 1;
                    const expectedResponse = {
                        id: 1,
                        user_id: testUsers[0].id,
                        howl: helpers.makeExpectedHowl(
                            testUsers,
                            testDogs,
                            testHowls.find(th => th.id === 1),
                            testTimeWindows,
                            testDogsInHowls
                        ),
                    };
                    return supertest(app)
                        .get(`/api/howls/user-saved/${entryId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedResponse);
                });
            });
        });
    });

    describe(`DELETE /api/howls/user-saved/:entry_id`, () => {
        
        context('Given no user saved howls', () => {
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

            it('responds with 404', () => {
                return supertest(app)
                    .delete('/api/howls/user-saved/100')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Saved howl doesn't exist` },
                    });
            });
        });

        context(`Given there are user saved howls`, () => {
            beforeEach(() => 
                helpers.seedUserSavedHowls(
                    db,
                    testUsers,
                    testDogs,
                    testHowls,
                    testDogsInHowls,
                    testTimeWindows,
                    testUserSavedHowls
                )
            );

            context(`Given that there is no authorization header`, () => {

                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .delete(`/api/howls/user-saved/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                context(`Given that a user attempts to delete a saved howl that doesn't belong to them`, () => {

                    
                    it(`responds with 401`, () => {
                        const idToRemove = 3;
                        return supertest(app)
                        .delete(`/api/howls/user-saved/${idToRemove}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(401, { error: `Unauthorized request` });
                    })

                });

                context(`Given that a user attempts to delete a saved howl that does belong to them`, () => {
                    it(`responds with 204`, () => {
                        
                        const idToRemove = 1;

                        const expectedHowls = testUserSavedHowls
                            .filter(ush => ush.user_id === testUsers[0].id)
                            .map(ush => {
                                const howl = testHowls.find(th => th.id === ush.howl_id);
                                const expectedHowl = helpers.makeExpectedHowl(
                                    testUsers,
                                    testDogs,
                                    howl,
                                    testTimeWindows,
                                    testDogsInHowls,
                                );
                                return {
                                    id: (howl.id - 1) * 5 + 1,
                                    user_id: testUsers[0].id,
                                    howl: expectedHowl
                                }
                            }).filter(howl => howl.id !== idToRemove);

                        return supertest(app)
                            .delete(`/api/howls/user-saved/1`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(204)
                            .then(res => 
                                supertest(app)
                                    .get(`/api/howls/user-saved`)
                                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                    .expect(200, expectedHowls)
                            );
                    });
                });
            });
        });
    });

    describe(`GET /api/howls/:howl_id`, () => {
        context(`Given no howls`, () => {
            beforeEach(() =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers,
                    testDogs
                )
            );

            it(`responds with 404`, () => {
                const howlId = 123456;
                return supertest(app)
                    .get(`/api/howls/${howlId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Howl doesn't exist` },
                    });
            });
        });

        context(`Given there are howls in the database`, () => {

            context(`Given that there is no authorization header`, () => {
                beforeEach('insert howls', () => 
                    helpers.seedHowls(
                        db,
                        testUsers,
                        testDogs,
                        testHowls,
                        testDogsInHowls,
                        testTimeWindows
                    )
                );

                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/howls/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                beforeEach('insert howls', () => 
                    helpers.seedHowls(
                        db,
                        testUsers,
                        testDogs,
                        testHowls,
                        testDogsInHowls,
                        testTimeWindows
                    )
                );
                
                it(`responds with 200 and the specified howl`, () => {
                    const howlId = 2;
                    const expectedHowl = helpers.makeExpectedHowl(
                        testUsers,
                        testDogs,
                        testHowls[howlId - 1],
                        testTimeWindows,
                        testDogsInHowls
                    );

                    return supertest(app)
                        .get(`/api/howls/${howlId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(200, expectedHowl);
                });
            });

            context(`Given an XSS attack howl`, () => {
                const testUser = helpers.makeUsersArray()[1];
                const {
                    maliciousProfile,
                    expectedProfile,
                } = helpers.makeMaliciousProfile(testUser);
                const {
                    maliciousHowl,
                    expectedHowl
                } = helpers.makeMaliciousHowl(testUser, expectedProfile);
    
                beforeEach(`insert malicious data`, () => {
                    const { dog_ids, time_windows, ...rest } = maliciousHowl;
                    const timeWindows = [{
                        howl_id: 911,
                        day_of_week: time_windows[0].day_of_week,
                        start_time: time_windows[0].start_time,
                        end_time: time_windows[0].end_time,
                    }];
                    return helpers.seedHowls(
                        db,
                        testUsers,
                        [maliciousProfile],
                        [{...rest}],
                        [{
                            howl_id: 911,
                            dog_id: 911,
                        }],
                        timeWindows              
                    );
                });
    
                it(`removes XSS attack content`, () => {
                    return supertest(app)
                        .get('/api/howls/911')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200)
                        .expect(res => {
                            expect(res.body.id).to.eql(expectedHowl.id);
                            expect(res.body.user_id).to.eql(expectedHowl.user_id);
                            expect(res.body.howl_title).to.eql(expectedHowl.howl_title);
                            expect(res.body.date).to.eql(expectedHowl.date);
                            expect(res.body.meeting_type).to.eql(expectedHowl.meeting_type);
                            expect(res.body.personal_message).to.eql(expectedHowl.personal_message);
                            expect(res.body.dogs).to.eql(expectedHowl.dogs);
                            expect(res.body.time_windows).to.eql(expectedHowl.time_windows);
                        });
                });
            });
        });
    });

    describe(`DELETE /api/howls/:howl_id`, () => {
        context('Given no howls', () => {
            beforeEach('insert dogs and users', () =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers,
                    testDogs
                )
            );
            it('responds with 404', () => {
                const howlId = 123456;
                return supertest(app)
                    .delete(`/api/howls/${howlId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: { message: `Howl doesn't exist` },
                    });
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

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .delete(`/api/howls/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                context(`Given that a user attempts to delete a howl that does not belong to them`, () => {
                    it(`responds with 401 unauthorized request`, () => {
                        const idToRemove = 3;

                        return supertest(app)
                            .delete(`/api/howls/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(401, { error: `Unauthorized request` });
                    });
                });

                context(`Given a user attempts to delete a howl that does belong to them`, () => {
                    it(`responds with 204 and removes the howl`, () => {
                        const idToRemove = 1;
                        const expectedHowls = testHowls
                            .filter(h => h.id !== idToRemove)
                            .map(howl => helpers.makeExpectedHowl(
                                testUsers,
                                testDogs,
                                howl,
                                testTimeWindows,
                                testDogsInHowls
                            ));
                        
                        return supertest(app)
                                .delete(`/api/howls/${idToRemove}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(204)
                                .then(res =>
                                    supertest(app)
                                        .get('/api/howls')
                                        .expect(expectedHowls)    
                                );
                    });
                });
            });
        });
    });

    describe('PATCH /api/howls/:howl_id', () => {

        context('given no howls', () => {
            beforeEach('seed users and dogs', () => 
                helpers.seedDogProfileTables(
                    db,
                    testUsers,
                    testDogs
                )
            );

            it('reponds with 404', () => {
                const howlId = 123456;
                return supertest(app)
                    .patch(`/api/howls/${howlId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({
                        howl_title: 'Test title edited'
                    })
                    .expect(404, {
                        error: { message: `Howl doesn't exist` },
                    });
            });

        });

        context(`Given that there are howls in the database`, () => {
            beforeEach('insert howls', () =>
                helpers.seedHowls(
                    db,
                    testUsers,
                    testDogs,
                    testHowls,
                    testDogsInHowls,
                    testTimeWindows
                )
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .patch('/api/howls/1')
                        .send({
                            howl_title: 'Test title edited'
                        })
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                
                context(`Given a user attempts to update a howl that does not belong to them`, () => {
                    it(`responds with 401 unauthorized request`, () => {
                        const idToUpdate = 3;

                        return supertest(app)
                            .patch(`/api/howls/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .send({
                                howl_title: 'Test title edited'
                            })
                            .expect(401, { error: `Unauthorized request` });
                    });
                });

                context(`Given that a user attempts to update a howl that does belong to them`, () => {
                    it(`responds with 204 and updates howl`, () => {
                        const idToUpdate = 1;
                        const authHeader = helpers.makeAuthHeader(testUsers[0]);
                        return supertest(app)
                            .patch(`/api/howls/${idToUpdate}`)
                            .set('Authorization', authHeader)
                            .send({
                                howl_title: 'Test title edited',
                            })
                            .expect(204)
                            .then(res =>
                                supertest(app)
                                    .get(`/api/howls/${idToUpdate}`)
                                    .set('Authorization', authHeader)
                                    .expect(res => {
                                        expect(res.body.howl_title).to.eql('Test title edited');
                                    })
                            );
                    });
                });
            });
        });
    });
});