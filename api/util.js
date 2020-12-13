const pgtransfer = require('./postgis-db/transfer.js');
const transfer = require('./neo4j-db/transfer.js');

const pgstage = require('./postgis-db/stage.js');
const stage = require('./neo4j-db/stage.js');

module.exports = {
    /**
     * get all stage details from both the postgis and neo4j db.
     * @param {String} stageId - An object with the stage details
     * @return {Object} an object contain all details of the stage.
     */
    getStageDetailsById: async (stageId) => {
        try{
            let result = await stage.getStageById(stageId);
            let temp = await pgstage.getStageById(stageId);

            result.stageLat = temp.features[0].stagelat;
            result.stageLon = temp.features[0].stagelon;
            console.log(result);

            return result;
        }catch(err){
            console.log(`[ERR] utils.getStageById() : ${err}`);
        }
    },

    /**
     * get all transfer details from both the postgis and neo4j db.
     * @param {String} transferId - An object with the transfer details
     * @return {Object} an object contain all details of the transfer.
     */
    getTransferDetailsById: async (transferId) => {
        try{
            let result = await transfer.getTransferById(transferId);
            let temp = await pgtransfer.getTransferById(transferId);

            result.transferLat = temp.features[0].transferlat;
            result.transferLon = temp.features[0].transferlon;
            //console.log(result);

            return result;
        }catch(err){
            console.log(`[ERR] utils.getTransferDetailsById() : ${err}`);
        }
    }
};