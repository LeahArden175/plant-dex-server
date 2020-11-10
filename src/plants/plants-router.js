const express = require('express')
const PlantsService = require('./plants-service')


const plantsRouter = express.Router()
const jsonParser = express.json()

plantsRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        PlantsService.getAllPlants(knexInstance)
            .then((plants) => {
                res.json(plants)
            })
            .catch(next)
    })

module.exports = plantsRouter    