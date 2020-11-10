const knex = require('knex');

const UsersService = {
    getAllUsers(knex) {
        return knex.select('*').from('plant_dex_users')
    },

    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('plant_dex_users')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, id) {
        return knex
            .from('plant_dex_users')
            .select('*')
            .where('id', id)
            .first()
    },

    deleteUser(knex, id) {
        return knex('plant_dex_users')
            .where({ id })
            .delete()
    },
     updateUser(knex, id, newUserFields) {
         return knex('plant_dex_users')
            .where({ id })
            .update(newUserFields)
     },
}

module.exports = UsersService