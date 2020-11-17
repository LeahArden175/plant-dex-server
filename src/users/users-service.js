const knex = require('knex');
const bcrypt = require('bcryptjs')
const xss = require('xss')


const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/


const UsersService = {
    validatePassword(password) {
        if (password.length < 8) {
          return 'Password must be longer than 8 characters'
        }
        if (password.length > 72) {
          return 'Password must be less than 72 characters'
        }
        if (password.startsWith(' ') || password.endsWith(' ')) {
          return 'Password must not start or end with empty spaces'
        }
        if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
          return 'Password must contain one upper case, lower case, number and special character'
        }
        return null
      },
      hasUserWithUserName(db, username) {
        return db('plant_dex_users')
          .where({ username })
          .first()
          .then(user => !!user)
      },
    getAllUsers(knex) {
        return knex.select('*').from('plant_dex_users')
    },

    insertUser(knex, newUser) {
        return knex
            .insert(newUser)
            .into('plant_dex_users')
            .returning('*')
            .then(([user]) => user)
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
     hashPassword(password) {
        return bcrypt.hash(password, 12)
      },
      serializeUser(user) {
        return {
          id: user.id,
          full_name: xss(user.full_name),
          username: xss(user.username),
          nickname: xss(user.nickname),
          date_created: new Date(user.date_created),
        }
      },
}

module.exports = UsersService