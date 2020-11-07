import driver from "./db.js";

module.exports = {
    /**
     * Add a stage in the database
     * @param {Object} stage - An object with the stage details
     */
    addStage: (stage) => {
        console.log(`Add stage ${stage.name}`);
    },

    /**
     * Get a stage by its name
     * @param {String} name - Name of the stage
     * @return {Object} - The Stage object
     */

    getStageByName: (name) => {},

    /**
     * Get a stage by its id
     * @param {Number} id - The id of the stage
     * @return {Object} - The Stage object
     */
    getStageById: (id) => {},

    /**
     * Remove a stage
     * @param {Number} id - The id of the stage
     */
    removeStage: (id) => {},
};
