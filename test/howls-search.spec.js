const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe(`Howls search endpoint`, function() {
    let db;

    const testArray = helpers.makeDataArrayForTestingSearch();

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('cleanup', () => helpers.cleanTables(db));

    beforeEach(`insert test data`, () =>
        helpers.seedTablesForHowlsSearch(db)
    );

    afterEach('cleanup', () => helpers.cleanTables(db));

    context(`Given a zipcode filter`, () => {
        const zipcodeToTest = '01108';
        it(`responds with howls in the given zipcode`, () => {
            const expectedResults = testArray.filter(h => {
                return h.location.zipcode === zipcodeToTest;
            });
            
            return supertest(app)
                .get(`/api/howls/?zipcode=${zipcodeToTest}`)
                .expect(200, expectedResults);
        });
    });

    context(`Given a rating filter`, () => {
        const rating = 4;
        it(`responds with howls belonging to dogs with the given rating or better`, () => {
            return supertest(app)
                .get(`/api/howls?rating_filter=${rating}`)
                .expect(200, [testArray[3]]);
        });
    });

    context(`Given a type_of_meeting filter`, () => {
        context(`Given a search for 'once'`, ()=> {
            const expectedArray = testArray.filter(h => {
                return h.meeting_type === 'once';
            });
            it(`reponds with howls that are one time meetings`, () => {
                return supertest(app)
                    .get(`/api/howls?type_of_meeting=once`)
                    .expect(200, expectedArray);
            });
        });

        context(`Given a search for 'recurring'`, () => {
            const expectedArray = testArray.filter(h => {
                return h.meeting_type === 'recurring';
            });
            it(`reponds with howls that are recurring meetings`, () => {
                return supertest(app)
                    .get(`/api/howls?type_of_meeting=recurring`)
                    .expect(200, expectedArray);
            });
        })
    });

    context(`Given a days_of_week filter`, () => {
        it(`responds with howls that occur only on the requested days of the week`, () => {
            const days_of_week = 'Monday|Sunday';
            return supertest(app)
                .get(`/api/howls?days_of_week=${days_of_week}`)
                .expect(200, [testArray[0], testArray[1], testArray[3]]);
        });
    });

    context(`Given a recurring_meeting_windows filter`, () => {
        it(`responds with howls that occuring during the requested windows`, () => {
            // days_of_week will always be present if recurring_meeting_windows is present
            const days_of_week = 'Monday|Saturday|Sunday';
            const recurring_meeting_windows = `test1,Monday,05:00,12:00|test2,Sunday,05:00,12:00|test3,Saturday,05:00,08:00`
            return supertest(app)
                .get(`/api/howls?days_of_week=${days_of_week}&recurring_meeting_windows=${recurring_meeting_windows}`)
                .expect(200, [testArray[0], testArray[1]]);
        });
    });

    context(`Given a date filter`, () => {
        it(`responds with howls that occur on that date`, () => {
            const date = '2020-08-30';
            return supertest(app)
                .get(`/api/howls?date=${date}`)
                .expect(200, [testArray[1], testArray[3]]);
        });
    });

    context(`Given a time_windows filter`, () => {
        // date will always be present if time_windows is used
        const date = '2020-08-15';
        const time_windows = '10:00,12:00|17:00,20:00';
        return supertest(app)
            .get(`/api/howls?date=${date}&time_windows=${time_windows}`)
            .expect(200, [testArray[0], testArray[2], testArray[3]]);
    });

    context(`Given search parameters that don't return results`, () => {
        const badParams = {
            zipcode: '00000',
            rating_filter: 5,
            days_of_week: 'Thursday',
            date: '2020-08-27',
        };

        for (const [key, value] of Object.entries(badParams)) {
            it(`returns an empty array when ${key} match no howls`, () => {
                return supertest(app)
                    .get(`/api/howls?${key}=${value}`)
                    .expect(200, []);
            });
        }

        it(`returns an empty array when no meetings occur during recurring_meeting_windows`, () => {
            const days_of_week = 'Monday';
            const recurring_meeting_windows = `test1,Monday,05:00,06:00`
            return supertest(app)
                .get(`/api/howls?days_of_week=${days_of_week}&recurring_meeting_windows=${recurring_meeting_windows}`)
                .expect(200, []);
        });

        it(`returns an empty array when not meetings occuring during time_windows`, () => {
            const date = '2020-08-15';
            const time_windows = '05:00,07:00|22:00,24:00';
            return supertest(app)
                .get(`/api/howls?date=${date}&time_windows=${time_windows}`)
                .expect(200, []);
        });
    });

    context(`Given multiple filters`, () => {
        it(`returns howls that fall within search parameters`, () => {
            return supertest(app)
                .get(`/api/howls/?rating_filter=2&type_of_meeting=recurring&days_of_week=Monday|Saturday|Sunday&recurring_meeting_windows=test1,Monday,05:00,12:00|test2,Sunday,05:00,12:00|test3,Saturday,05:00,08:00`)
                .expect(200, [testArray[0]]);
        });

        it(`returns howls that fall within search parameters`, () => {
            return supertest(app)
                .get(`/api/howls/?rating_filter=2&date=2020-08-15&time_windows=10:00,12:00|17:00,20:00`)
                .expect(200, [testArray[0], testArray[2], testArray[3]]);
            });
    });

});