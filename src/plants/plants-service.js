const knex = require('knex');

const PlantsService = {
    getAllPlants(knex) {
        return knex
        .select('*')
        .orderBy('datepurchased')
        .orderBy('id')
        .from('plant_dex_plant_info')
    },
    insertPlant(knex, newPlant) {
        return knex
            .insert(newPlant)
            .into('plant_dex_plant_info')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex
            .from('plant_dex_plant_info')
            .select('*')
            .where({ id })
            .first()
    },
    deletePlant(knex, id){
        return knex('plant_dex_plant_info')
            .where({ id })
            .delete()
    },
    editPlant(knex, id , newPlantFields){
        return knex('plant_dex_plant_info')
            .where({ id })
            .update(newPlantFields)
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    }
}

module.exports = PlantsService