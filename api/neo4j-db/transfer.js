const driver = require("./db");

module.exports = {
    /**
     * Add a transfer node in the database
     * @param {Object} transferDetails - Details of the transfer
     */
    addTransfer: async(transferDetails) => { 
        try{
            let session = driver.session();
            await session.run(`
                MATCH (c:Connection{connectionId:$connectionId})
                CREATE (c)<-[:BELONGS_TO]-(t:Transfer{
                    transferId : $transferId,
                    transferStatus : $transferStatus, 
                    sourceCode : $sourceCode,
                    destinationCode : $destinationCode
                });`
                ,{
                    connectionId: transferDetails.connectionId,
                    transferId: transferDetails.transferId,
                    transferStatus : transferDetails.transferStatus,
                    sourceCode : transferDetails.sourceCode,
                    destinationCode : transferDetails.destinationCode
                }
            );

            //creating the source relationship.
            await session.run(
                "MATCH (s:Stage{stageId:$sourceId}) "+
                "MATCH (t:Transfer{transferId:$transferId}) "+
                "CREATE (s)<-[:SOURCE]-(t);"
                ,{
                    sourceId : transferDetails.sourceId,
                    transferId: transferDetails.transferId
                }
            );

            //creating the destination relationship.
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

            //updating the IS_PART_OF and OF relationships
            let products = transferDetails.products;
            products.forEach(async (product) => {
                let sess = driver.session();
                await sess.run(`
                        MATCH (p:Product{productId:$productId})
                        MATCH (t:Transfer{transferId:$transferId})
                        MATCH (c:Connection{connectionId:$connectionId})
                        CREATE (p)<-[ipo:IS_PART_OF{quantity:$quantity}]-(t)
                        MERGE (p)<-[:OF{totalQuantity:0,timesDelivered:0}]-(c);
                    `,{
                        productId : product.productId,
                        quantity : product.quantity,
                        transferId : transferDetails.transferId,
                        connectionId : transferDetails.connectionId
                    }
                );
                await sess.close();
            })
            return "OK";
        }catch(err){
            console.log(`[ERR] addTransfer(): ${err}`);
            return {err};
        }
    },

    /**
     * Set start time of the transfer
     * @param {String} transferId - ID of the transfer
     */
    setStartTime: async (transferId) => {
        try {
            let session = driver.session();
            await session.run(
                "MATCH (t:Transfer {transferId: $transferId} ) " +
                "SET t.transferStartTime = localdatetime()",
                {
                    transferId
                }
            );
            await session.close();
        } catch (error) {
            console.log(error);
        }
    },

    /**
     * Set end time of the transfer
     * @param {String} transferId - ID of the transfer
     */
    setEndTime: async (transferId) => {
        try {
            let session = driver.session();
            await session.run(`
                    MATCH (t:Transfer {transferId: $transferId} )
                    SET t.transferEndTime = localdatetime();
                `,{
                    transferId
                }
            );
            await session.close();
        } catch (error) {
            console.log(error);
        }
    },

    /**
     * getting all the products in a specific transfer.
     * @param {String} transferId  - The source code to be checked.
     * @return {Array} array of objects with productid and quantity.
     */
    getAllProducts: async(transferId) => {
        try{
            let session = driver.session();
            let result = await session.run(`
                    MATCH (t:Transfer{ transferId : $transferId })
                    MATCH (p:Product)<-[ipo:IS_PART_OF]-(t)
                    RETURN p,ipo;
                `,{
                    transferId : transferId
                }
            );
            let prods = [];
            if(result.records.length>0){
                result.records.forEach((prod) => {
                    let temp = prod.get('p').properties;
                    temp.quantity = Number(prod.get('ipo').properties.quantity);
                    prods.push(temp);
                });
            }
            await session.close();
            return prods;
        }catch(err){
            console.log(`[ERR] getAllProducts(): ${err}`);
        }
    },

    /**
     * check whether the source code sent is associated with a particular transfer
     * @param {Number} code - The source code to be checked.
     * @return {Object} The Transfer Node object
     */
    getTransferBySourceCode: async(code) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (t:Transfer {sourceCode:$sourceCode})-[:DESTINATION]->(s:Stage) " + 
                "RETURN t, s.stageId AS destinationId;"
                ,{
                    sourceCode : code
                }
            );
            let transfer;
            if(result.records.length>0){
                transfer = result.records[0].get('t').properties;
                transfer.destinationId = result.records[0].get("destinationId");
            }

            await session.close();
            return {transfer};
        }catch(err){
            console.log(`[ERR] getTransferBySourceCode(): ${err}`);
            return {err};
        }
    },

    /**
     * check whether the destination code sent is associated with a particular transfer
     * @param {Number} code - The destination code to be checked.
     * @return {Object} The Transfer Node object
     */
    getTransferByDestinationCode: async(code) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (t:Transfer {destinationCode:$destinationCode}) return t;"
                ,{
                    destinationCode : code
                }
            );
            let transfer;
            if(result.records.length>0){
                transfer = result.records[0].get('t').properties;
            }

            await session.close();
            return {transfer};
        }catch(err){
            console.log(`[ERR] getTransferByDestinationCode(): ${err}`);
            return {err}
        }
    },

    /**
     * Get a transfer by its id
     * @param {Number} id - The id of the transfer
     * @return {Object} The Transfer Node object
     */
    getTransferById: async(id) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (src:Stage)<-[:SOURCE]-(t:Transfer {transferId:$transferId})-[:DESTINATION]->(dest:Stage) " +
                "RETURN t, src, dest;"
                ,{
                    transferId : id
                }
            );
            let transfer;
            if(result.records[0]){
                transfer = result.records[0].get('t').properties;
                transfer.sourceId = result.records[0].get("src").properties.stageId,
                transfer.sourceName = result.records[0].get("src").properties.stageName,
                transfer.destinationId = result.records[0].get("dest") .properties.stageId,
                transfer.destinationName = result.records[0].get("dest").properties.stageName
            }

            await session.close();
            return transfer;
        }catch(err){
            console.log(`[ERR] /getTransferById(): ${err}`);
        }
    },

    /**
     * Get all the transfers of a Source
     * @param {Number} stage - The id of the Source
     * @return {Array} An array of Transfer Node objects
     */
    getTransfersOfSource: async(stageId) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (src:Stage{stageId:$stageId})<-[:SOURCE]-(t:Transfer)-[:DESTINATION]->(dest:Stage) " +
                " return t, src, dest;"
                ,{
                    stageId: stageId
            });

            let transfers = [];
            if(result.records.length>0){
                result.records.forEach((record) => {
                    let transfer = {
                        ...record.get('t').properties,
                        sourceId: record.get("src").properties.stageId,
                        sourceName: record.get("src").properties.stageName,
                        destinationId: record.get("dest") .properties.stageId,
                        destinationName: record.get("dest").properties.stageName
                    }
                    transfers.push(transfer);
                    
                })
            }

            await session.close();
            return transfers;
        }catch(err){
            console.log(`[ERR] getTransfersOfSource(): ${err}`);
            return {err};
        }
    },

    /**
     * Get all the transfers of a Destination
     * @param {Number} stage - The id of the Destination
     * @return {Array} An array of Transfer Node objects
     */
    getTransfersOfDestination: async(stageId) => {
        try{
            let session = driver.session();

            let result = await session.run(
                "MATCH (dest:Stage{stageId:$stageId})<-[:DESTINATION]-(t:Transfer)-[:SOURCE]->(src:Stage) " +
                "RETURN t, src, dest;"
                ,{
                    stageId: stageId
            });
            console.log("query ran");

            let transfers = [];
            if(result.records.length>0){
                result.records.forEach((record) => {
                    let transfer = {
                        ...record.get('t').properties,
                        sourceId: record.get("src").properties.stageId,
                        sourceName: record.get("src").properties.stageName,
                        destinationId: record.get("dest") .properties.stageId,
                        destinationName: record.get("dest").properties.stageName
                    }
                    transfers.push(transfer);
                })
            }

            await session.close();
            return transfers;
        }catch(err){
            console.log(`[ERR] getTransfersOfDestination(): ${err}`);
        }
    },

    /**
     * give a list of all transfers having a particular transfer status.
     * @param {String} code - The destination code to be checked.
     * @return {Array} an Array of transfer node objects.
     */
    getTransfersByStatus: async(status) => {
        try{
            let session = driver.session();
            let result = await session.run(
                "MATCH (t:Transfer{ transferStatus : $transferStatus}) "+
                "RETURN t;"
                ,{
                    transferStatus : status
                }
            );

            let transfers = [];
            if(result.records.length>0){
                result.records.forEach((transfer) => {                        
                    transfers.push(tranfer.get('t').properties);
                });
            }

            await session.close();
            return transfers;
        }catch(err){
            console.log(`[ERR] getTransfersByStatus(): ${err}`);
        }
    },

    /**
     * change the transfer status of a particular transfer node object.
     * @param {Number} id - The transfer id to be changed.
     * @param {String} status the status value to be changed to.
     */
    changeTransferStatus : async(id,status) => {
        try{
            let session = driver.session();
            let trans = await session.run(`
                MATCH (t:Transfer{ transferId : $transferId})
                SET t.transferStatus = $transferStatus
                RETURN t;
                `,{
                    transferId : id,
                    transferStatus : status
                }
            );                    
            await session.close();
            return trans.records[0].get('t').properties;
        }catch(err){
            console.log(`[ERR] getTransfersByStatus(): ${err}`);
        }
    }
};