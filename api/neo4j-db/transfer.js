const driver = require("./db");

module.exports = {
    /**
     * Add a transfer node in the database
     * @param1 {Number} connectionId - The id of the connection
     * @param2 {Object} transferDetails - Details of the transfer
     */
    addTransfer: async(connectionId, transferDetails) => { 
        try{
            let session = driver.session();

            await session.run(
                "MATCH (c:Connection{connectionId:$connectionId}) "+
                "CREATE (c)<-[:BELONGS_TO]-(t:Transfer{transferId:$transferId});"
                ,{
                    connectionId: connectionId,
                    transferId: transferDetails.transferId,
                }
            );

            await session.run(
                "MATCH (s:Stage{stageId:$sourceId}) "+
                "MATCH (t:Transfer{transferId:$transferId}) "+
                "CREATE (s)<-[:SOURCE]-(t);"
                ,{
                    sourceId : transferDetails.sourceId,
                    transferId: transferDetails.transferId
                }
            );

            await session.run(
                "MATCH (s:Stage{stageId:$destinationId}) "+
                "MATCH (t:Transfer{transferId:$transferId}) "+
                "CREATE (s)<-[:DESTINATION]-(t);"
                ,{
                    destinationId : transferDetails.destinationId,
                    transferId: transferDetails.transferId
                }
            );

            await session.close();
        }catch(err){
            console.log(`[ERR] addTransfer(): ${err}`);
        }
    },

    /**
     * Get a transfer by its id
     * @param {Number} id - The id of the transfer
     * @return {Object} - The Transfer Node object
     */
    getTransferById: async(id) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (t:Transfer {transferId:$transferId}) return t;"
                ,{
                    transferId : id
                }
            );
            let transfer;
            if(result.records[0].get('t').properties){
                transfer = result.records[0].get('t').properties;
                console.log(transfer);
            }

            await session.close();
            return transfer;
        }catch(err){
            console.log(`[ERR] getTransferById(): ${err}`);
        }
    },

    /**
     * Get all the transfers of a Source
     * @param {id} stage - The id of the Source
     * @return {Array} - An array of Transfer Node objects
     */
    getTransfersOfSource: async(stage) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (s:Stage{stageId:$stageId})<-[:SOURCE]-(t:Transfer) return t;"
                ,{
                    stageId: stage
            });

            let transfers = [];
            if(result.records.length>0){
                result.records.forEach((trans) => {
                    transfers.push(trans.get('t').properties);
                    console.log(trans.get('t').properties);
                })
            }

            await session.close();
            return transfers;
        }catch(err){
            console.log(`[ERR] getTransfersOfSource(): ${err}`);
        }
    },

    /**
     * Get all the transfers of a Destination
     * @param {id} stage - The id of the Destination
     * @return {Array} - An array of Transfer Node objects
     */
    getTransfersOfDestination: async(stage) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (s:Stage{stageId:$stageId})<-[:DESTINATION]-(t:Transfer) return t;"
                ,{
                    stageId: stage
            });

            let transfers = [];
            if(result.records.length>0){
                result.records.forEach((trans) => {
                    transfers.push(trans.get('t').properties);
                    console.log(trans.get('t').properties);
                })
            }

            await session.close();
            return transfers;
        }catch(err){
            console.log(`[ERR] getTransfersOfDestination(): ${err}`);
        }
    }

};
