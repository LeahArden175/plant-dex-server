const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const helpers = require('./test-helpers')

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

    describe('GET /api/plants', () => {
        context('Given no plants in the DB', () => {

            const testUsers = helpers.makeUsersArray();

            beforeEach('insert users and plants', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
            })

            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/plants')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, [])
            })
        })

        context('Given there are plants in the DB', () => {
            const testPlants = helpers.makePlantInfoArray()
            const testUsers = helpers.makeUsersArray();

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
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, testPlants)
            })
        })
    })

    describe.only('GET /plants/:plant_id', () => {

        context('Given there are no plants in the DB',() => {

            const testUsers = helpers.makeUsersArray();

            beforeEach('insert users and plants', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
            })

            it('responds with 404', () => {
                const plant_id = 123
                return supertest(app)
                    .get(`/api/plants/${plant_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: {message: 'Plant does not exist'}
                    })
            })
        })

        context('Given plants in the DB', () => {
            const testPlants = helpers.makePlantInfoArray()
            const testUsers = helpers.makeUsersArray();

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
            it('responds with 200 and specified plant', () =>{
                const plant_id = 2
                const expectedPlant = testPlants[plant_id -1]

                return supertest(app)
                .get(`/api/plants/${plant_id}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .expect(200, expectedPlant)
            })
        })
    }) 
})