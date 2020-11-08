const driver = require("./db");

module.exports = {
  /**
   * Add a transfer node in the database
   * @param {Number} connectionId - The id of the connection
   * @param {Object} transferDetails - Details of the transfer
   */
  addTransfer: (linkId, transferDetails) => {},

  /**
   * Get a transfer by its id
   * @param {Number} id - The id of the transfer
   * @return {Object} - The Transfer Node object
   */
  getTransferById: (id) => {},

  /**
   * Get all the transfers of a stage
   * @param {id} stageId - The id of the stage
   * @return {Array} - An array of Transfer Node objects
   */
  getTransfersOfStage: (stage) => {},
};
