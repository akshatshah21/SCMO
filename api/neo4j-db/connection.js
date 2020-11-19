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

            await session.run(
                    "MATCH (s1:Stage{stageId:$stage1Id})"+
                    "MATCH (s2:Stage{stageId:$stage2Id})"+
                    "CREATE (s1)-[:PART_OF]->(c:Connection{connectionId:$connectionId})<-[:PART_OF]-(s2)"
                ,{
                    stage1Id : stage1Id,
                    stage2Id : stage2Id,
                    connectionId : connectionId
            });

            await session.close();
        }catch(err){
            console.log(`[ERR] addConnection: ${err}`);
        }
    },

    /**
     * Get all connections of a stage
     * @param {Number} stageId - The id of the stage
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
                console.log(connection);
            }else{
                connection =-1;
            }
            await session.close();
            return connection;
        }catch(err){
            console.log(`[ERR] getConnectionBetweenStages: ${err}`);
        }
    },
};
