const knex = require("knex");
const app = require("../src/app");
const helpers = require("./test-helpers");
const supertest = require("supertest");

describe("Protected endpoints", function () {
  let db;

  const { testUsers, testPlants } = helpers.makePlantsFixtures();

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  beforeEach('insert plants', () => helpers.seedPlantsTables(db,testUsers,testPlants))

  const protectedEndpoints = [
      {
          name: 'GET /api/plants/:plant_id',
          path: '/api/plants/1',
          method: supertest(app).get
      },
      {
        name: 'POST /api/plants',
        path: '/api/plants',
        method: supertest(app).post
    }
  ]

  protectedEndpoints.forEach(endpoint => {
      describe(endpoint.name, () => {
          it('responds with 401 missing bearer token when no bearer token', () => {
              return endpoint.method(endpoint.path)
                .expect(401, {error: `Missing bearer token`})
          })
          it('responds with 401 unauthorized request when invalid JWT secret', () => {
              const validUser = testUsers[0]
              const invalidSecret = 'WRONG'
              return endpoint.method(endpoint.path)
                .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
                .expect(401, {error: 'Unauthorized request'})
            })
            it('responds with 401 unauthorized request when invaid sub in payload', () => {
                const invalidUser = {username: 'WRONG', id: 1}
                return endpoint.method(endpoint.path)
                    .set('Authorization', helpers.makeAuthHeader(invalidUser))
                    .expect(401, {error: 'Unauthorized request'})
            })
      })
  })
});
