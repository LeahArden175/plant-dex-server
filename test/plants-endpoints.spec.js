const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const helpers = require('./test-helpers')
const { default: expectCt } = require('helmet/dist/middlewares/expect-ct')

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

        context('Given an XSS attack plant', () => {
            const testUsers = helpers.makeUsersArray()
            const {maliciousPlant, expectedPlant} = helpers.makeMaliciousPlant()

            beforeEach('insert malicious plant', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('plant_dex_plant_info')
                            .insert([ maliciousPlant ])
                    })
            })

            it('removes the XSS attack content', () => {
                return supertest(app)
                    .get('/api/plants')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res => {
                        expect(res.body[0].purchaseplace).to.eql(expectedPlant.purchaseplace)
                        expect(res.body[0].scientificname).to.eql(expectedPlant.scientificname)
                        expect(res.body[0].nickname).to.eql(expectedPlant.nickname)
                    })
            })
        })
    })

    describe('GET /plants/:plant_id', () => {

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

        context('Given an xss attack plant', () => {
            const testUsers = helpers.makeUsersArray()
            const {maliciousPlant, expectedPlant} = helpers.makeMaliciousPlant()

            beforeEach('insert malcious plant', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
                    .then(() => {
                        return db
                            .into('plant_dex_plant_info')
                            .insert([maliciousPlant])
                    })
            })

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/plants/${maliciousPlant.id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200)
                    .expect(res => {
                        expect(res.body.scientificname).to.eql(expectedPlant.scientificname)
                        expect(res.body.purchaseplace).to.eql(expectedPlant.purchaseplace)
                        expect(res.body.nickname).to.eql(expectedPlant.nickname)
                    })
            })
        })
    }) 
    
    describe('POST /api/plant', () => {
        const testUsers = helpers.makeUsersArray();

            beforeEach('insert users and plants', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
            })

        it('creates a new plant, responding with 201 and the new plant', () => {
            const newPlant= {
                "nickname": 'TEST NICKNAME',
                "scientificname": 'TEST PLANT',
                "datepurchased": '2020-01-22T00:00:00.000Z',
                "purchaseplace": 'TEST PLANT',
                "date_last_watered": '2020-01-22T00:00:00.000Z',
                "days_between_watering": 5,
                "user_id": 1
              }

              return supertest(app)
              .post(`/api/plants`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .send(newPlant)
              .expect(201)
              .expect(res => {
                  expect(res.body.nickname).to.eql(newPlant.nickname)
                  expect(res.body.scientificname).to.eql(newPlant.scientificname)
                  expect(res.body.datepurchased).to.eql(newPlant.datepurchased)
                  expect(res.body.purchaseplace).to.eql(newPlant.purchaseplace)
                  expect(res.body.date_last_watered).to.eql(newPlant.date_last_watered)
                  expect(res.body.days_between_watering).to.eql(newPlant.days_between_watering)
                  expect(res.body.user_id).to.eql(newPlant.user_id)
                  expect(res.body).to.have.property('id')
                  expect(res.headers.location).to.eql(`/api/plants/${res.body.id}`)
              })
                .then(postRes => {
                    supertest(app)
                        .get(`/api/plants/${postRes.body.id}`)
                        .expect(postRes.body)
                }) 
        })

        const requiredFields = ['nickname', 'scientificname', 'datepurchased', 'purchaseplace', 'date_last_watered', 'days_between_watering']

        requiredFields.forEach((field) =>{
            const newPlant = {
                nickname : 'TEST PLANT',
                scientificname : 'TEST PLANT',
                datepurchased : '2020-01-22T00:00:00.000Z',
                purchaseplace : 'TEST PLANT',
                date_last_watered: '2020-01-22T00:00:00.000Z',
                days_between_watering: 5
            }
            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newPlant[field]
    
                return supertest(app)
                    .post('/api/plants')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(newPlant)
                    .expect(400, {
                        error: { message: `Missing ${field} in request body` }
                    })
            })
            it('removes an XSS attack', () => {
                const {maliciousPlant, expectedPlant} = helpers.makeMaliciousPlant()

                return supertest(app)
                    .post('/api/plants')
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(maliciousPlant)
                    .expect(201)
                    .expect(res => {
                        expect(res.body.scientificname).to.eql(expectedPlant.scientificname)
                        expect(res.body.nickname).to.eql(expectedPlant.nickname)
                        expect(res.body.purchaseplace).to.eql(expectedPlant.purchaseplace)
                    })
            })
        })
    })

    describe('DELETE /api/plants/:plant_id', () => {
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

            it('responds with 204 and removes the specified plant', () => {
                const idToDelete = 2
                const expectedPlants = testPlants.filter(plant => plant.id !== idToDelete)
                return supertest(app)
                    .delete(`/api/plants/${idToDelete}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(204)
                    .then(res => {
                        supertest(app)
                            .get('/api/plants')
                            .expect(expectedPlants)
                    })
            })
        })
        context('Given no plants in DB', () => {
            const testUsers = helpers.makeUsersArray();

            beforeEach('insert users and plants', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
            })

            it('responds with 404', () => {
                const plantId = 123
                return supertest(app)
                    .delete(`/api/plants/${plantId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error : {message: 'Plant does not exist'}})
            })
        })
    })

    describe('PATCH /api/plants/:plant_id', () => {
        context('Given no plants in the DB', () => {

            const testUsers = helpers.makeUsersArray();

            beforeEach('insert users and plants', () => {
                return db
                    .into('plant_dex_users')
                    .insert(testUsers)
            })

            it('responds with 404', () => {
                const plantId = 123
                return supertest(app)
                    .patch(`/api/plants/${plantId}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, {
                        error: {message: 'Plant does not exist'}
                    })                    
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
            it('responds with 200 and updates plant', () => {
                const idToUpdate = 2
                const updatePlant = {
                    nickname: 'updated',
                    scientificname: 'updated',
                    datepurchased: '2020-01-22T00:00:00.000Z',
                    purchaseplace: 'updated',
                    user_id: 1
                }
                const expectedPlant ={
                    ...testPlants[idToUpdate - 1],
                    ...updatePlant
                }
                return supertest(app)
                    .patch(`/api/plants/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updatePlant)
                    .expect(200)
                    .then(res => {
                        supertest(app)
                            .get(`/api/plants/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedPlant)
                    })
            })
            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/plants/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send({irrelevantField : 'foo' })
                    .expect(400, {
                        error: {message: 'Request body must contain either nickname, scientificname, datepurchased, days_between_watering, or purchaseplace'}
                    })
            })
            it('responds wth 200 when only editing some fields', () => {
                const idToUpdate = 2
                const updatePlant = {
                    nickname : 'updated name'
                }
                const expectedPlant = {
                    ...testPlants[ idToUpdate - 1],
                    ...updatePlant
                }

                return supertest(app)
                .patch(`/api/plants/${idToUpdate}`)
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send({
                    ...updatePlant,
                    fieldToIgnore: 'Should not be in GET response'
                })
                .expect(200)
                .then(res => {
                    supertest(app)
                        .get(`/api/plants/${idToUpdate}`)
                        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                        .expect(expectedPlant)
                })
            })
        })
    })
})