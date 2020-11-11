const driver = require("./db");

module.exports = {
    /**
     * Add a Connection between two stages, as a node in the database
     * @param {Number} sourceId - The id of the source stage
     * @param {Number} destinationId - The id of the destination stage
     */
    addConnection: (stage1Id, stage2Id) => {},

    /**
     * Get all connections of a stage
     * @param {Number} stageId - The id of the stage
     * @return {Array} - Array of Connection Node objects
     */
    getConnectionsOfStage: (stageId) => {},

    /**
     * Get the Connection between two stages
     * @param {Number} stage1Id - id of the first stage
     * @param {Number} stage2Id - id of the second stage
     * @return {Object} - The Connection Node object
     */
    getConnectionBetweenStages: (stage1Id, stage2Id) => {},
};
