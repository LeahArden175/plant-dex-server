const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const supertest = require('supertest')
const {makePlantInfoArray} = require('./plants.fixtures')

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

    describe.only('GET /api/plants', () => {
        context('Given no plants', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/plants')
                    .expect(200, [])
            })
        })
    })

})