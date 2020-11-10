const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const {makePlantInfoArray} = require('./plants.fixtures')
const {makeUsersArray} = require('./users.fixtures')

describe('Plants Endpoints', function() {

    let db

    before("make knex instance", () => {
        db = knex({
          client: "pg",
          connection: process.env.TEST_DATABASE_URL,
        });
        app.set("db", db);
      });

    after('disconnect from db', () => {
        db.raw('TRUNCATE plant_dex_users, plant_dex_plant_info RESTART IDENTITY CASCADE')
    })

    before('clean the table', () => {
        db.raw('TRUNCATE plant_dex_users, plant_dex_plant_info RESTART IDENTITY CASCADE')
    })
    
    afterEach("cleanup", () =>
    db.raw('TRUNCATE plant_dex_users, plant_dex_plant_info RESTART IDENTITY CASCADE')
    )

    describe.only('GET /api/plants', () => {
        context('Given no plants in the DB', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/plants')
                    .expect(200, [])
            })
        })

        context('Given there are plant in the DB', () => {
            const testPlants = makePlantInfoArray()
            const testUsers = makeUsersArray();

            beforeEach('insert users and plants', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('plant_dex_plant_info')
                            .insert(testPlants)
                    })
            })

            it('responds with 200 and all the plants', () => {
                return supertest(app)
                    .get('/api/plants')
                    .expect(200, testPlants)
            })
        })
    })

})