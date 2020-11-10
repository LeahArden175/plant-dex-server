const knex = require('knex');

const PlantsService = {
    getAllPlants(knex) {
        return knex
        .select('*')
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
    }
}

module.exports = PlantsService