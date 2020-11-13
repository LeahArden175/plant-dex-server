const knex = require("knex");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const helpers = require("./test-helpers");
const supertest = require("supertest");
const { default: expectCt } = require("helmet/dist/middlewares/expect-ct");

describe("Auth Endpoints", function () {
  let db;

  const { testUsers } = helpers.makePlantsFixtures();
  const testUser = testUsers[0];

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

  describe("POST /api/auth/login", () => {
    beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

    const requiredFields = ["username", "password"];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password,
      };

      it(`responds with 400 and required error when '${field}' is missing`, () => {
          delete loginAttemptBody[field]

          return supertest(app)
            .post('/api/auth/login')
            .send(loginAttemptBody)
            .expect(400, {
                error: `Missing ${field} in request body`
            })
      });
      it('responds with 400 error when bad username', () => {
        const invalidUser = {username:'WRONG', password: 'existy'}
        return supertest(app)
          .post('/api/auth/login')
          .send(invalidUser)
          .expect(400, {error: "Incorrect username or password"})

      })
      it('responds with 400 and error when bad password', () => {
        const userInvalidPass = {username: testUser.username,  password: 'WRONG'}
        return supertest(app)
          .post('/api/auth/login')
          .send(userInvalidPass)
          .expect(400, {error: "Incorrect username or password"} )
      })
      it('responds with 200 and JWT token using secret when valid creds', () => {
        const userValidCreds = {
          username : testUser.username,
          password : testUser.password
        }
        const expectedToken = jwt.sign(
          {user_id: testUser.id},
          process.env.JWT_SECRET,
          {
            subject: testUser.username,
            algorithm: "HS256"
          }
        )
        return supertest(app)
          .post('/api/auth/login')
          .send(userValidCreds)
          .expect(200, {
            authToken: expectedToken
          })
      })
    });
  });
});
