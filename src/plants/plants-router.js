const express = require('express')
const path = require('path')
const xss = require('xss')
const PlantsService = require('./plants-service')
const { json } = require('express')
const {requireAuth} = require('../middleware/jwt-auth')


const plantsRouter = express.Router()
const jsonParser = express.json()

const serializePlant = plant => ({
    id: plant.id,
    purchaseplace: xss(plant.purchaseplace),
    scientificname: xss(plant.title), //sanitize title
    nickname: xss(plant.content),  //sanitize content
    datepurchased: plant.date_published,
    user_id: plant.user,
})

plantsRouter
    .route('/')
    .all(requireAuth)
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        PlantsService.getAllPlants(knexInstance)
            .then((plants) => {
                res.json(plants)
            })
            .catch(next)
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const {nickname,scientificname, datepurchased, purchaseplace} = req.body
        const newPlant = {nickname,scientificname, datepurchased, purchaseplace}
        
        for(const [key, value] of Object.entries(newPlant)) {
            if( value == null) {
                return res.status(400).json({
                    error: {message : `Missing ${key} is request body`}
                })
            }
        }
        newPlant.user_id = req.user.id
        PlantsService.insertPlant(
            req.app.get('db'),
            newPlant
        )
        .then(plant => {
            res
                .status(201)
                .location(path.posix.join(req.originalUrl, `/${plant.id}`))
                .json(plant)
        })
        .catch(next)
    })

 plantsRouter
    .route('/:plant_id') 
    .all(requireAuth)
    .all((req, res, next) => {
        PlantsService.getById(
            req.app.get('db'),
            req.params.plant_id
        )
        .then(plant => {
            if(!plant) {
                return res.status(404).json({
                    error: { message : 'Plant does not exist'}
                })
            }
            res.plant = plant //save plant for the next middleware
            next() //makes the next middleware happen
        })
        .catch(next)
    })
    .get((req, res, next) => {
        res.json(res.plant)
    })
    .delete((req, res, next) => {
        PlantsService.deletePlant(
            req.app.get('db'),
            req.params.plant_id
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })
    .patch(jsonParser, (req, res, next) => {
        const {nickname, scientificname, datepurchased, purchaseplace, user_id} = req.body
        const plantToUpdate = {nickname, scientificname, datepurchased, purchaseplace}

        const numberOfValues = Object.values(plantToUpdate).filter(Boolean).length
         if(numberOfValues === 0) {
             return res.status(400).json({
                 error: { message : `Request body must contain either nickname, scientificname, datepurchased, or purchaseplace`}
             })
         }

         PlantsService.editPlant(
             req.app.get('db'),
             req.params.plant_id,
             plantToUpdate
         )
         .then(numRowsAffected => {
             res.status(200).json(numRowsAffected)
         })
         .catch(next)
    })

module.exports = plantsRouter  