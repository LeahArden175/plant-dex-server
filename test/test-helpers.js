const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function makePlantInfoArray() {
  return [
    {
      id: 1,
      nickname: "UFO Plant",
      scientificname: "Pilea Peperomiodes",
      datepurchased: "2020-01-22T00:00:00.000Z",
      purchaseplace: "Father Natures",
      date_last_watered: "2020-01-22T00:00:00.000Z",
      days_between_watering: 5,
      user_id: 1,
    },
    {
      id: 2,
      nickname: "Musaica",
      scientificname: "Calathea Musaica",
      datepurchased: "2020-01-22T00:00:00.000Z",
      purchaseplace: "Plant Vine",
      date_last_watered: "2020-01-22T00:00:00.000Z",
      days_between_watering: 5,
      user_id: 1,
    },
    {
      id: 3,
      nickname: "Monstera",
      scientificname: "Monstera Deliciosa",
      datepurchased: "2020-01-22T00:00:00.000Z",
      purchaseplace: "Plant Vine",
      date_last_watered: "2020-01-22T00:00:00.000Z",
      days_between_watering: 5,
      user_id: 1,
    },
  ];
}
function makeUsersArray() {
  return [
    {
      username: "dunder",
      full_name: "Dunder Mifflin",
      nickname: "test",
      password: "password",
      id: 1,
    },
    {
      username: "leah",
      full_name: "Leah Arden",
      nickname: "leah",
      password: "password",
      id: 2,
    },
    {
      username: "scoops",
      full_name: "Nick Dardaris",
      nickname: "scoops",
      password: "password",
      id: 3,
    },
  ];
}
function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: "HS256",
  });
  return `Bearer ${token}`;
}
function makeMaliciousPlant() {
  const maliciousPlant = {
    id: 911,
    purchaseplace: 'Naughty naughty very naughty <script>alert("xss");</script>',
    datepurchased: new Date().toISOString(),
    scientificname:'Naughty naughty very naughty <script>alert("xss");</script>',
    nickname: 'Naughty naughty very naughty <script>alert("xss");</script>',
    date_last_watered: new Date().toISOString(),
    days_between_watering: 5,
    user_id: 1,
  };
  const expectedPlant = {
    ...maliciousPlant,
    scientificname:'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    nickname: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
    purchaseplace: 'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
  };
  return {
    maliciousPlant,
    expectedPlant,
  };
}
function makePlantsFixtures() {
  const testUsers = makeUsersArray();
  const testPlants = makePlantInfoArray(testUsers);
  return { testPlants, testUsers };
}
function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("plant_dex_users")
    .insert(preppedUsers)
    .then(() => {
      db.raw(`SELECT setval('plant_dex_users_id_seq, ?)`, [
        users[users.length - 1].id,
      ]);
    });
}
function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
          plant_dex_plant_info,
          plant_dex_users
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE plant_dex_plant_info_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(
            `ALTER SEQUENCE plant_dex_users_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`SELECT setval('plant_dex_plant_info_id_seq', 0)`),
          trx.raw(`SELECT setval('plant_dex_users_id_seq', 0)`),
        ])
      )
  );
}
function seedPlantsTables(db, users, plants) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async (trx) => {
    await seedUsers(trx, users);
    await trx.into('plant_dex_plant_info').insert(plants);
    // update the auto sequence to match the forced id values
    await trx.raw(`SELECT setval('plant_dex_plant_info_id_seq', ?)`, [
      plants[plants.length - 1].id,
    ]);
  });
}

module.exports = {
  makePlantInfoArray,
  makeUsersArray,
  makeAuthHeader,
  makeMaliciousPlant,
  makePlantsFixtures,
  seedUsers,
  cleanTables,
  seedPlantsTables,
};
