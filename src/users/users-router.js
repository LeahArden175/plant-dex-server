const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
    id: user.id,
    full_name: xss(user.full_name),
    username: xss(user.username),
    nickname: xss(user.nickname),
    date_created: user.date_created,
    date_modified: user.date_modified,
    password: xss(user.password)
  })

  usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(serializeUser))
      })
      .catch(next)
  })
  .post(jsonParser, (req,res,next) => {
      const {full_name, username, nickname, password} = req.body
      const newUser = { full_name, username }

      for(const [key, value] of Object.entries(newUser))
            if(value == null) 
                return res.status(400).json({
                    error: { message : `Missing ${key} in request body`}
                })

      newUser.nickname = nickname
      newUser.password = password
      
      UsersService.insertUser(
          req.app.get('db'),
          newUser
      )
      .then( user => {
          res
            .status(201)
            .location(path.posix.join(req.originalUrl, `/${user.id}`))
            .json(serializeUser(user))
      })
      .catch(next)
  })

module.exports = usersRouter  