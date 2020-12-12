const driver = require("./db");
const stage = require("./stage");

module.exports = {
    /**
     * Add a Connection between two stages, as a node in the database
     * @param1 {Number} sourceId - The id of the source stage
     * @param2 {Number} destinationId - The id of the destination stage
     * @param3 {Number} connectionId - The id of the connection
     */
    addConnection: async (stage1Id, stage2Id,connectionId) => {
        try{
            let session = driver.session();
            // await session.run("CREATE (c:Connection{ avg_cost: $avg_cost, avg_time: $avg_time, transfer_cost: $transfer_cost, distance: $distance,});");

            let result = await session.run(`
                    MATCH (s1:Stage{stageId:$stage1Id})
                    MATCH (s2:Stage{stageId:$stage2Id})
                    CREATE (s1)-[:PART_OF]->
                        (c:Connection{
                            connectionId:$connectionId,
                            transferCount : 0,
                            avgTransferTime : 0
                        })<-[:PART_OF]-(s2)
                    RETURN c;
                    `,
                    /*
                        attributes to add:
                        distance
                    */
                {
                    stage1Id : stage1Id,
                    stage2Id : stage2Id,
                    connectionId : connectionId
            });

            await session.close();
            return {
                connection: result.records[0].get("c").properties
            };
        }catch(err){
            console.log(`[ERR] addConnection: ${err}`);
            return {err};
        }
    },

    /**
     * Update the avgTransferTime of a connection
     * @param {String} connectionId - id of the connection to be updated.
     * @param {String} transferId - id of the transfer
     * @param {String} startTime - starting time of the transfer
     * @param {String} endTime - finishing time of the transfer
     */
    updateConnectionData: async (connectionId,transferId,startTime,endTime) => {
        try{
            console.log(connectionId);
            let session = driver.session();

            //updating the value of transfercount and avgTransferTime in the connection node.
            await session.run(`
                    MATCH (c:Connection{connectionId : $connectionId})
                    SET c.avgTransferTime = 
                        (c.avgTransferTime*c.transferCount + duration.between($startTime,$endTime).minutes)/(c.transferCount+1)
                    SET c.transferCount = c.transferCount+1
                    ;
                `,{
                    connectionId : connectionId,
                    startTime : startTime,
                    endTime : endTime
                }
            );
            console.log("updating quantity of products");
            //updating the quatity of products delivered via a particular connection.
            await session.run(`
                MATCH (c:Connection{connectionId:$connectionId})<-[:BELONGS_TO]-(t:Transfer{transferId:$transferId})-[ipo:IS_PART_OF]->(p:Product)
                MATCH (c)-[of:OF]->(p)
                SET of.totalQuantity = of.totalQuantity + ipo.quantity
                SET of.timesDelivered = of.timesDelivered + 1;
            `,{
                connectionId : connectionId,
                transferId : transferId
            });

            await session.close();
        }catch(err){
            console.log(`[ERR] updateConnectionData(): ${err}`);
        }
    },

    /**
     * Get all connections of a stage
     * @param {String} stageId - The id of the stage
     * @return {Array} Array of Connection Node objects
     */
    getConnectionsOfStage: async (stageId) => {
        try{
            let session = driver.session();
            let result = await session.run(
                "MATCH (s:Stage {stageId:$stageId})-[:PART_OF]->(c:Connection)"+
                "return c"
                ,{
                    stageId
                }
            );
            let connections = [];
            if(result.records.length>0){
                result.records.forEach((conn) =>{
                    console.log(conn.get('c').properties);
                    connections.push(conn.get('c').properties);
                });
            }
            await session.close();
            return connections;
        }catch(err){
            console.log(`[ERR] getConnectionsofStage(): ${err}`);
        }
    },

    /**
     * Get connection belonging to a transfer
     * @param {String} transferId - The id of the transfer
     * @return {Object} ConnectionNode object.
     */
    getConnectionOfTransfer: async (transferId) => {
        try{
            let session = driver.session();
            let result = await session.run(`
                    MATCH (t:Transfer{transferId:$transferId})-[:BELONGS_TO]->(c:Connection)
                    RETURN c;
                `,{
                    transferId
                }
            );
            let conn;
            if(result.records.length>0){
                conn = result.records[0].get('c').properties;
                console.log(conn)
            }
            await session.close();
            return conn;
        }catch(err){
            console.log(`[ERR] getConnectionofTransfer(): ${err}`);
        }
    },

    /**
     * Get the Connection between two stages
     * @param {Number} stage1Id - id of the first stage
     * @param {Number} stage2Id - id of the second stage
     * @return {Object} The Connection Node object
     */
    getConnectionBetweenStages: async (stage1Id, stage2Id) => {
        try{
            let session = driver.session();
            let result = await session.run(
                "MATCH (s1:Stage {stageId:$stage1Id})-[:PART_OF]->(c:Connection)"+
                "<-[:PART_OF]-(s2:Stage {stageId:$stage2Id}) return c"
                ,{
                    stage1Id: stage1Id,
                    stage2Id: stage2Id
                }
            );
            let connection;
            if(result.records.length>0){
                connection = result.records[0].get('c').properties;
            }else{
                connection =-1;
            }
            await session.close();
            return { connection };
        }catch(err){
            console.log(`[ERR] getConnectionBetweenStages: ${err}`);
        }
    },

    /**
     * get the connection where the product is in most demand.
     * @param {String} productId the id of the product whose demand is to be analyzed. 
     * @return {Object} the Connection Node
     */
    getMostDemandingConnections: async (productId) => {
        try{
            let session = driver.session();
            let result = await session.run(`
                    MATCH (:Connection)-[of:OF]->(:Product{productId : $productId})
                    WITH MAX(of.totalQuantity) AS maxi
                    MATCH (c:Connection)-[f:OF]->(:Product{productId : $productId})
                    WHERE f.totalQuantity = maxi
                    RETURN c;
                `,{
                    productId : productId
                }
            );
            let conns = [];
            if(result.records.length>0){
                result.records.forEach((temp) => {
                    let data = temp.get('c').properties;
                    conns.push(data);
                })
            }
            console.log(conns);
            await session.close();
            return conns;
        }catch(err){
            console.log(`[ERR] getMostDemandingConnections: ${err}`);
        }
    },
};
