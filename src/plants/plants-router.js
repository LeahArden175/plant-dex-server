// const express = require('express')
// const PlantsService = require('./plants-service')


// const plantsRouter = express.Router()

// plantsRouter
//     .route('/')
//     .get((req, res, next) => {
//         const knexInstance = req.app.get('db')
//         PlantsService.getAllPlants(knexInstance)
//             .then((plants) => {
//                 res.json(plants)
//             })
//             .catch(next)
//     })