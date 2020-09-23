const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Users Endpoints', () => {
    let db;

    const { testUsers } = helpers.makeDogsFixtures();
    const testUser = testUsers[0];

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnet from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    afterEach('cleanup', () => helpers.cleanTables(db));

    describe(`POST /api/users`, () => {
        context(`User Validation`, () => {
            beforeEach(`insert users`, () => 
                helpers.seedUsers(db, testUsers)
            );

            const requiredFields = ['username', 'password', 'email'];

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    username: 'test username',
                    password: 'test password',
                    email: 'testemail@test.com',
                    phone: '123-456-7890',
                };

                it(`responds with 400 require error when '${field}' is missing`, () => {
                    delete registerAttemptBody[field];

                    return supertest(app)
                        .post(`/api/users`)
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing '${field}' in request body`,
                        });
                });
            });

            it(`responds with 400 'Password must be at least 8 characters' when empty password`, () => {
                const userShortPassword = {
                    username: 'test username',
                    password: '1234567',
                    email: 'testemail@test.com',
                    phone: '',
                };
                return supertest(app)
                    .post(`/api/users`)
                    .send(userShortPassword)
                    .expect(400, { error: `Password must be at least 8 characters` });
            });

            it(`responds 400 'Password must be less than 72 characters' when long password`, () => {
                const userLongPassword = {
                    username: 'test username',
                    password: `*`.repeat(73),
                    email: 'testemail@test.com',
                    phone: '',
                };
                return supertest(app)
                    .post(`/api/users`)
                    .send(userLongPassword)
                    .expect(400, { error: `Password must be less than 72 characters` });
            });

            it(`responds 400 error when password starts with spaces`, () => {
                const userPasswordStartsSpaces = {
                    username: 'test username',
                    password: ' 12345678',
                    email: 'testemail@test.com',
                    phone: '',
                };
                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordStartsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` });
            });

            it(`responds 400 error when password ends with spaces`, () => {
                const userPasswordEndsSpaces = {
                    username: 'test username',
                    password: '12345678 ',
                    email: 'testemail@test.com',
                    phone: '',
                };
                return supertest(app)
                    .post(`/api/users`)
                    .send(userPasswordEndsSpaces)
                    .expect(400, { error: `Password must not start or end with empty spaces` });
            });

            it(`responds 400 error when password isn't complex enough`, () => {
                const userPasswordNotComplex = {
                    username: 'test username',
                    password: '12345678abc',
                    email: 'testemail@test.com',
                    phone: '',
                };
                return supertest(app)
                    .post('/api/users')
                    .send(userPasswordNotComplex)
                    .expect(400, { error: `Password must contain 1 upper case letter, lower case letter, number and special character` });
            });

            it(`responds 400 'Username already taken' when username isn't unique`, () => {
                const duplicateUser = {
                    username: testUser.username,
                    password: '12345678abcC!',
                    email: 'testemail@test.com',
                    phone: '',
                };
                return supertest(app)
                    .post('/api/users')
                    .send(duplicateUser)
                    .expect(400, { error: `Username already taken` });
            });

            it(`responds 400 'Account already registered with that email' when email isn't unique`, () => {
                const duplicateEmail = {
                    username: 'test username',
                    password: '123AAaaCC!!',
                    email: testUser.email,
                    phone: '',
                };
                return supertest(app)
                    .post('/api/users')
                    .send(duplicateEmail)
                    .expect(400, { error: `Account already registered with that email` });
            });
        });

        context(`Given a valid request body`, () => {
            it(`responds 201, serialized user, storing bcrypted password`, () => {
                const newUser = {
                    username: 'test username',
                    password: '11AAaa!!',
                    email: 'testemail@testemail.edu',
                    phone: '123-456-7890',
                };

                return supertest(app)
                    .post('/api/users')
                    .send(newUser)
                    .expect(201)
                    .expect(res => {
                        expect(res.body).to.have.property('id');
                        expect(res.body.username).to.eql(newUser.username);
                        expect(res.body.email).to.eql(newUser.email);
                        expect(res.body.phone).to.eql(newUser.phone);
                        expect(res.body).to.not.have.property('password');
                        expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
                    })
                    .expect(res =>
                        db
                            .from('dog_date_users')
                            .select('*')
                            .where({ id: res.body.id })
                            .first()
                            .then(row => {
                                expect(row.username).to.eql(newUser.username);
                                expect(row.email).to.eql(newUser.email);
                                expect(row.phone).to.eql(newUser.phone);
                                return bcrypt.compare(newUser.password, row.password);
                            })
                            .then(compareMatch => {
                                expect(compareMatch).to.be.true;
                            })
                    );
            });
        });
    });

    describe(`PATCH /api/users`, () => {
        beforeEach(`Seed users`, () => 
            helpers.seedUsers(
                db,
                testUsers
            )
        );

        context(`Given that there is no authorization header`, () => {
            it(`responds with 401 and an error message`, () => {
                return supertest(app)
                    .patch(`/api/users`)
                    .send({
                        email: 'test@test.test',
                    })
                    .expect(401, { error: `Missing bearer token` });
            });
        });

        context(`Given that there is an authorization header`, () => {
            context(`Given that there is no update body`, () => {
                it(`responds with 400 and an error message`, () => {
                    return supertest(app)
                        .patch(`/api/users`)
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({})
                        .expect(400, {
                            error: {
                                message: `Request body must contain one of 'email' or 'phone'.`,
                            }
                        });
                });
            });

            context(`Given that there is an update body with an unchanged email`, () => {
                it(`responds with 204 and updates the user`, () => {
                    return supertest(app)
                        .patch('/api/users')
                        .set('Authorization', helpers.makeAuthHeader(testUser))
                        .send({
                            email: testUser.email,
                            phone: '987-654-3210',
                        })
                        .expect(204)
                        .then(res => {
                            const userValidCreds = {
                                username: testUser.username,
                                password: testUser.password,
                            };
                            const expectedToken = jwt.sign(
                                { user_id: testUser.id },
                                process.env.JWT_SECRET,
                                {
                                    subject: testUser.username,
                                    expiresIn: process.env.JWT_EXPIRY,
                                    algorithm: 'HS256',
                                }
                            );
                            return supertest(app)
                                .post(`/api/auth/login`)
                                .send(userValidCreds)
                                .expect(200, {
                                    authToken: expectedToken,
                                    id: testUser.id,
                                    username: testUser.username,
                                    email: testUser.email,
                                    phone: '987-654-3210',
                                });
                        });
                });
            });

            context(`Given that there is an update body with a new email`, () => {
                
                context(`Given that the email is in use by another member`, () => {
                    it(`responds 400 'Account already registered with that email' when email isn't unique`, () => {
                        const duplicateEmail = {
                            email: testUsers[1].email,
                            phone: '',
                        };
                        return supertest(app)
                            .patch('/api/users')
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .send(duplicateEmail)
                            .expect(400, { error: `Account already registered with that email` });
                    });
                });

                context(`Given that the new email is unique`, () => {
                    it(`responds with 204 and updates the user`, () => {
                        return supertest(app)
                            .patch('/api/users')
                            .set('Authorization', helpers.makeAuthHeader(testUser))
                            .send({
                                email: 'test@test.test',
                                phone: '987-654-3210',
                            })
                            .expect(204)
                            .then(res => {
                                const userValidCreds = {
                                    username: testUser.username,
                                    password: testUser.password,
                                };
                                const expectedToken = jwt.sign(
                                    { user_id: testUser.id },
                                    process.env.JWT_SECRET,
                                    {
                                        subject: testUser.username,
                                        expiresIn: process.env.JWT_EXPIRY,
                                        algorithm: 'HS256',
                                    }
                                );
                                return supertest(app)
                                    .post(`/api/auth/login`)
                                    .send(userValidCreds)
                                    .expect(200, {
                                        authToken: expectedToken,
                                        id: testUser.id,
                                        username: testUser.username,
                                        email: 'test@test.test',
                                        phone: '987-654-3210',
                                    });
                            });
                    });
                });
            });
        });
    });
});
