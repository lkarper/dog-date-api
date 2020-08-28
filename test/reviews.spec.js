const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');
const supertest = require('supertest');

describe(`Reviews endpoints`, () => {
    let db;

    const {
        testUsers,
        testDogs,
        testReviews,
        testComments
    } = helpers.makeReviewsFixtures();

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

    describe(`GET /api/reviews`, () => {
        context(`Given no reviews in the database`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/reviews')
                    .expect(200, []);
            });
        });

        context(`Given that there are reviews in the database`, () => {
            beforeEach('seed reviews and comments', () => 
                helpers.seedReviews(
                    db,
                    testUsers,
                    testDogs,
                    testReviews,
                    testComments
                )
            );

            it(`responds with 200 and all the reviews`, () => {
                const expectedResults = testReviews.map(r => {
                    return helpers.makeExpectedReview(r, testDogs, testComments);
                });

                return supertest(app)
                    .get('/api/reviews')
                    .expect(200, expectedResults);
            });
        });

        context(`Given an XSS attack review`, () => {
            const testUser = helpers.makeUsersArray()[1];
            const {
                maliciousProfile,
                expectedProfile,
            } = helpers.makeMaliciousProfile(testUser);
            const maliciousReview = helpers.makeMaliciousReview(testUser);
            const maliciousComment = helpers.makeMaliciousComment(testUser);
            const sanitizedReview = helpers.makeSanitizedReview(testUser);
            beforeEach(`seed malicious content`, () =>
                helpers.seedReviews(
                    db,
                    testUsers,
                    [maliciousProfile],
                    [maliciousReview],
                    [maliciousComment]
                )
            );

            it(`removes XSS attack content`, () => {
                return supertest(app)
                    .get('/api/reviews')
                    .expect(200, [sanitizedReview]);
            });
        });
    });

    describe(`POST /api/reviews`, () => {
        beforeEach(() => 
            helpers.seedDogProfileTables(
                db,
                testUsers,
                testDogs
            )
        );

        const testNewReview = testReviews[0];
                
        const requiredFields = [
            'date_created',
            'dog_id',
            'reviewer',
            'friendliness_dogs',
            'friendliness_people',
            'playing_interest',
            'obedience',
            'profile_accuracy',
            'location_suitability',
            'address',
            'city',
            'state',
            'zipcode',
            'date',
            'start_time',
            'end_time',
        ];

        context(`Given that there is no authorization header`, () => {
            it(`responds with 401 and an error message`, () => {
                return supertest(app)
                    .post(`/api/reviews`)
                    .send(testNewReview)
                    .expect(401, { error: `Missing bearer token` });
            });
        });

        context(`Given that there is an authorization header`, () => {
            requiredFields.forEach(field => {
                const postAttemptBody = { ...testNewReview };

                it(`responds with 400 require error when '${field}' is missing`, () => {
                    delete postAttemptBody[field];
                    return supertest(app)
                        .post('/api/reviews')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(postAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`,
                        });
                });
            });

            context(`Given that all required fields are present in the body`, () => {
                it(`creates a review, responds with 201 and the new review`, () => {
                    return supertest(app)
                        .post('/api/reviews')
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .send(testNewReview)
                        .expect(201)
                        .expect(res => {
                            const expectedReview = helpers.makeExpectedReview(
                                testNewReview,
                                testDogs,
                                []
                            );
                            expect(res.headers.location).to.eql(`/api/reviews/${res.body.id}`);
                            expect(res.body).to.eql(expectedReview);
                        })
                        .then(postRes => {
                            return supertest(app)
                                .get(`/api/reviews/${postRes.body.id}`)
                                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                                .expect(res => {
                                    const expectedReview = helpers.makeExpectedReview(
                                        testNewReview,
                                        testDogs,
                                        []
                                    );
                                    expect(res.body).to.eql(expectedReview);
                                })
                        });
                });
            })
        });

    });

    describe(`GET /api/by-dog/:dog_id`, () => {
        beforeEach(`insert reviews`, () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );
        
        context(`Given that there are no reviews of a dog`, () => {
            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/reviews/by-dog/100')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, []);
            });
        });

        context(`Given that there are reviews of a dog`, () => {

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/reviews/by-dog/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                it(`responds with 200 and the reviews of a dog`, () => {
                    const testUser = testUsers[0];
                    const dogIdForSearch = 1;
                    const expectedReviews = testReviews
                        .filter(r => r.dog_id === dogIdForSearch)
                        .map(r => helpers.makeExpectedReview(r, testDogs, testComments));

                    return supertest(app)
                        .get(`/api/reviews/by-dog/${dogIdForSearch}`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedReviews);
                });
            });

        });
    });

    describe(`GET /api/reviews/:review_id`, () => {

        const testUser = testUsers[0];

        beforeEach(`seed reviews`, () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );
        context(`Given that the requested review does not exist`, () => {
            it(`responds with 404 and an error message`, () => {
                return supertest(app)
                    .get('/api/reviews/1000')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: `Review doesn't exist` }, 
                    });
            });
        });

        context(`Given that the review exists`, () => {

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/reviews/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                it(`responds with 200 and the requested review`, () => {
                    const reviewId = 1;
                    const expectedResponse = helpers.makeExpectedReview(
                        testReviews[0],
                        testDogs,
                        testComments
                    );
                    return supertest(app)
                        .get(`/api/reviews/${reviewId}`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedResponse);
                });
            });
        });
    });

    describe(`DELETE /api/reviews/:review_id`, () => {
        const testUser = testUsers[0];

        beforeEach(`seed reviews`, () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );

        context(`Given that the requested review does not exist`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .delete('/api/reviews/1000')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: `Review doesn't exist` }, 
                    });
            });
        });

        context(`Given that the requested review does exist`, () => {
        
            context(`Given that there is no authorization header`, () => {

                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .delete(`/api/reviews/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {

                context(`Given that a user attempts to delete a review that does not belong to them`, () => {
                    it('responds with 401', () => {
                        const idToRemove = 3;
                        return supertest(app)
                            .delete(`/api/reviews/${idToRemove}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(401, { error: `Unauthorized request` });
                        
                    });
                });

                context(`Given that a user attempts to delete a review that does belong to them`, () => {
                    it(`responds with 204`, () => {
                        const idToRemove = 1;

                        const expectedReviews = testReviews
                            .filter(r => r.id !== idToRemove)
                            .map(r => helpers.makeExpectedReview(
                                r,
                                testDogs,
                                testComments
                            ));

                        return supertest(app)
                                .delete(`/api/reviews/${idToRemove}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .expect(204)
                                .then(res =>
                                    supertest(app)
                                        .get(`/api/reviews`)
                                        .expect(200, expectedReviews)    
                                );
                    });
                });

            });

        });
    });

    describe(`PATCH /api/reviews/:review_id`, () => {

        const testUser = testUsers[0];

        beforeEach(`seed reviews`, () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );

        context(`Given that the requested review does not exist`, () => {
            it(`responds with 404`, () => {
                return supertest(app)
                    .patch('/api/reviews/1000')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send({
                        friendliness_dogs: 1,
                    })
                    .expect(404, {
                        error: { message: `Review doesn't exist` }, 
                    });
            });
        });

        context(`Given that the requested review does exist`, () => {

            context(`Given that there is no authorization header`, () => {

                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .patch(`/api/reviews/1`)
                        .send({
                            friendliness_dogs: 1,
                        })
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {

                context(`Given that a user attempts to update a review that does not belong to them`, () => {
                    it('responds with 401', () => {
                        const idToUpdate = 3;
                        return supertest(app)
                            .patch(`/api/reviews/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .send({
                                friendliness_dogs: 1,
                            })
                            .expect(401, { error: `Unauthorized request` });
                    });
                });

                context(`Given that a user attempts to update a review that does belong to them`, () => {
                    
                    context(`Given that there is no update body`, () => {
                        it(`responds with 400 and an error message`, () => {
                            const idToUpdate = 1;
                            return supertest(app)
                                .patch(`/api/reviews/${idToUpdate}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .send({})
                                .expect(400, {
                                    error: {
                                        message: `Request body must contain one of 'date_created', 'review_title', 'dog_id', 'friendliness_dogs', 'friendliness_people', 'playing_interest', 'obedience', 'profile_accuracy', 'location_suitability', 'address', 'city', 'state', 'zipcode', 'lat', 'lon', 'date', 'start_time', 'end_time', 'personal_message'.`,
                                    }
                                });
                        });
                    });

                    context(`Given that there is an update body`, () => {
                    
                        it(`responds with 204 and updates review`, () => {
                            const idToUpdate = 1;
                            return supertest(app)
                                .patch(`/api/reviews/${idToUpdate}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .send({
                                    friendliness_dogs: 1,
                                })
                                .expect(204)
                                .then(res => 
                                    supertest(app)
                                        .get(`/api/reviews/1`)
                                        .set('Authorization', helpers.makeAuthHeader(testUser))
                                        .expect(res => {
                                            expect(res.body.friendliness_dogs).to.eql(1);
                                        })
                                );
                        });
                    });
                });
            });

        });
    });

    describe(`GET /api/reviews/:review_id/comments`, () => {
        const testUser = testUsers[0];

        beforeEach('seed reviews', () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );

        context(`Given that the review does not exist`, () => {
            it(`responds with 404 and an error message`, () => {
                return supertest(app)
                    .get('/api/reviews/1000/comments')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: `Review doesn't exist` },
                    });
            });
        });

        context(`Given that the review does exist`, () => {
            context(`Given that there is no authorization header`, () => {

                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/reviews/1/comments`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {

                it(`responds with 200 and the comments for the requested review`, () => {
                    const reviewId = 1;
                    const expectedComments = testComments.filter(c => c.review_id === reviewId);

                    return supertest(app)
                        .get(`/api/reviews/${reviewId}/comments`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedComments);
                });
            });
        });
    });

    describe('POST /api/reviews/:review_id/comments', () => {
        const testUser = testUsers[0];

        beforeEach('seed reviews', () => 
            helpers.seedReviewsWithoutComments(
                db,
                testUsers,
                testDogs,
                testReviews
            )
        );

        const newComment = {
            date_time: '2020-07-31T19:35:31.457Z',
            comment: 'Esse ex sint quis laboris est incididunt aute nisi sint pariatur magna nostrud tempor.',
            edited: false,
        };

        context(`Given that the review does not exist`, () => {
            it(`responds with 404 and an error message`, () => {
                return supertest(app)
                    .post('/api/reviews/1000/comments')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send(newComment)
                    .expect(404, {
                        error: { message: `Review doesn't exist` },
                    });
            });
        });

        context(`Given that the review does exist`, () => {
            context(`Given that there is no authorization header`, () => {

                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .post(`/api/reviews/1/comments`)
                        .send(newComment)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                
                const requiredFields = [
                    'date_time',
                    'comment',
                    'edited',
                ];

                requiredFields.forEach(field => {
                    const postAttemptBody = { ...newComment };
                    it(`responds with 400 require error when '${field}' is missing`, () => {
                        delete postAttemptBody[field];
                        return supertest(app)
                            .post('/api/reviews/1/comments')
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .send(postAttemptBody)
                            .expect(400, {
                                error: `Missing '${field}' in request body`,
                            });

                    });
                });

                context(`Given that all required fields are present in the body`, () => {
                    it(`creates a comment and responds with 201 and the new comment`, () => {
                        return supertest(app)
                            .post('/api/reviews/1/comments')
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .send(newComment)
                            .expect(201)
                            .expect(res => {
                                expect(res.headers.location).to.eql(`/api/reviews/1/comments/${res.body.id}`);
                                expect(res.body).to.have.property('id');
                                expect(res.body.review_id).to.eql(1);
                                expect(res.body.commenter).to.eql(testUser.username);
                                expect(res.body.date_time).to.eql(newComment.date_time);
                                expect(res.body.comment).to.eql(newComment.comment);
                                expect(res.body.edited).to.eql(newComment.edited);
                            })
                            .then(postRes => 
                                supertest(app)
                                    .get(`/api/reviews/${postRes.body.review_id}/comments/${postRes.body.id}`)
                                    .set('Authorization', helpers.makeAuthHeader(testUser))
                                    .expect(res => {
                                        expect(res.body.review_id).to.eql(1);
                                        expect(res.body.commenter).to.eql(testUser.username);
                                        expect(res.body.date_time).to.eql(newComment.date_time);
                                        expect(res.body.comment).to.eql(newComment.comment);
                                        expect(res.body.edited).to.eql(newComment.edited);
                                    })
                            );
                    });
                });
            });
        });
    });

    describe(`GET /api/reviews/:review_id/comments/:comment_id`, () => {
        
        const testUser = testUsers[0];

        beforeEach(`seed reviews and comments`, () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );
        
        context(`Given that the comment requested doesn't exist`, () => {
            it(`responds with 404 and an error message`, () => {
                return supertest(app)
                    .get('/api/reviews/1/comments/1000')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: `Comment doesn't exist` }
                    });
            });
        });

        context(`Given that the comment requested does exist`, () => {

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/reviews/1/comments/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                it(`responds with 200 and the requested comment`, () => {
                    const expectedComment = testComments[0];
                    return supertest(app)
                        .get(`/api/reviews/1/comments/1`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedComment);
                });
            });
        });
    });

    describe(`DELETE /api/reviews/:review_id/comments/:comment_id`, () => {

        const testUser = testUsers[0];

        beforeEach(`seed reviews and comments`, () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );

        context(`Given that the requested comment does not exist`, () => {
            it(`responds with 404 and an error message`, () => {
                return supertest(app)
                    .delete('/api/reviews/1/comments/1000')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(404, {
                        error: { message: `Comment doesn't exist` }
                    });
            });
        });

        context(`Given that the requested comment does exist`, () => {
            
            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .delete(`/api/reviews/1/comments/1`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {

                context(`Given that a user attempts to delete a comment that does not belong to them`, () => {
                    it(`responds with 401 and an error message`, () => {
                        const idToDelete = 3;
                        return supertest(app)
                            .delete(`/api/reviews/1/comments/${idToDelete}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(401, { error: `Unauthorized request` });
                    });
                });

                context(`Given that a user attempts to delete a comment that does belong to them`, () => {
                    it(`responds with 204 and deletes the comment`, () => {
                        const idToDelete = 1;
                        const expectedComments = testComments
                            .filter(c => c.review_id === 1)    
                            .filter(c => c.id !== idToDelete);
                        return supertest(app)
                            .delete(`/api/reviews/1/comments/${idToDelete}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .expect(204)
                            .then(res =>
                                supertest(app)
                                    .get('/api/reviews/1/comments')
                                    .set('Authorization', helpers.makeAuthHeader(testUser))
                                    .expect(200, expectedComments)    
                            );
                    });
                });
            });
        });
    });

    describe(`PATCH /api/reviews/:review_id/comments/:comment_id`, () => {
        
        const testUser = testUsers[0];
        
        beforeEach(`seed reviews and comments`, () => 
            helpers.seedReviews(
                db,
                testUsers,
                testDogs,
                testReviews,
                testComments
            )
        );

        context(`Given that the requested comment doesn't exist`, () => {
            it(`responds with 404 and an error message`, () => {
                return supertest(app)
                    .patch('/api/reviews/1/comments/1000')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .send({
                        comment: 'Sint aliqua duis est eiusmod nulla adipisicing officia proident nisi labore.',
                    })
                    .expect(404, {
                        error: { message: `Comment doesn't exist` }
                    });
            });
        });

        context(`Given that the requested comment does exist`, () => {

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .patch(`/api/reviews/1/comments/1`)
                        .send({
                            comment: 'Sint aliqua duis est eiusmod nulla adipisicing officia proident nisi labore.',
                        })
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {

                context(`Given that the user attempts to patch a comment that does not belong to them`, () => {
                    it(`responds with 401 and an error message`, () => {
                        const idToPatch = 2;
                        return supertest(app)
                            .patch(`/api/reviews/1/comments/${idToPatch}`)
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .send({
                                comment: 'Sint aliqua duis est eiusmod nulla adipisicing officia proident nisi labore.',
                            })
                            .expect(401, { error: `Unauthorized request` });
                    });
                });

                context(`Given that the user attempts to patch a comment that does belong to them`, () => {
                    const idToPatch = 1;

                    context(`Given that the user attempts to patch a comment with no fields in the body`, () => {
                        it(`responds with 400 and an error message`, () => {
                            return supertest(app)
                                .patch(`/api/reviews/1/comments/${idToPatch}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .send({})
                                .expect(400, {
                                    error: {
                                        message: `Request body must contain one of 'date_time', 'comment', 'edited'.`
                                    },
                                });
                        });
                    });

                    context(`Given that the user attempts to patch a comment with a properly formatted body`, () => {
                        it(`responds with 204 and updates the comment`, () => {
                        
                            
                            
                            const expectedComment = {
                                id: 1,
                                review_id: 1,
                                commenter: testUser.username,
                                date_time: '2020-08-26T19:35:31.457Z',
                                comment: 'Anim nulla laboris exercitation mollit in.',
                                edited: true,
                            };

                            return supertest(app)
                                .patch(`/api/reviews/1/comments/${idToPatch}`)
                                .set('Authorization', helpers.makeAuthHeader(testUser))
                                .send({
                                    date_time: '2020-08-26T19:35:31.457Z',
                                    comment: 'Anim nulla laboris exercitation mollit in.',
                                    edited: true,
                                })
                                .expect(204)
                                .then(res => 
                                    supertest(app)
                                        .get(`/api/reviews/${expectedComment.review_id}/comments/${expectedComment.id}`)
                                        .set('Authorization', helpers.makeAuthHeader(testUser))
                                        .expect(200, expectedComment)
                                );

                        });
                    });
                });
            });
        });
    });

    describe(`GET /api/reviews/by-owner`, () => {

        const testUser = testUsers[0];

        context(`Given there are no reviews of a user's dogs`, () => {
            beforeEach('seeds dogs and users', () =>
                helpers.seedDogProfileTables(
                    db,
                    testUsers,
                    testDogs
                )
            );

            it(`responds with 200 and an empty array`, () => {
                return supertest(app)
                    .get('/api/reviews/by-owner')
                    .set('Authorization', helpers.makeAuthHeader(testUser))
                    .expect(200, []);
            });
        });

        context(`Given there are reviews of a user's dogs`, () => {
            beforeEach(`seed reviews and comments`, () => 
                helpers.seedReviews(
                    db,
                    testUsers,
                    testDogs,
                    testReviews,
                    testComments
                )
            );

            context(`Given that there is no authorization header`, () => {
                it(`responds with 401 and an error message`, () => {
                    return supertest(app)
                        .get(`/api/reviews/by-owner`)
                        .expect(401, { error: `Missing bearer token` });
                });
            });

            context(`Given that there is an authorization header`, () => {
                it(`responds with the reviews for a user's dogs`, () => {
                    const expectedReviews = testReviews
                        .map(r => helpers.makeExpectedReview(r, testDogs, testComments))
                        .filter(r => r.dog_profile.owner_id === testUser.id);

                    return supertest(app)
                        .get('/api/reviews/by-owner')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .expect(200, expectedReviews);
                });
            });
        });
    });
});