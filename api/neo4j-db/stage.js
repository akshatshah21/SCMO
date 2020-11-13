const driver = require("./db");
const product = require("./product");

module.exports = {
    /**
     * Add a stage in the database
     * @param {Object} stage - An object with the stage details
     */
    addStage: async (stage) => {
        console.log(`Add stage ${stage.stageName}`);
        try{
            let session = driver.session();
            await session.run("CREATE (s:Stage {stageName: $stageName,stageId: $stageId,staffCnt: $staffCnt,latitude : $latitude,longitude : $longitude});"
                ,
                {
                    stageName : stage.stageName,
                    stageId : stage.stageId,
                    staffCnt : stage.staffCnt,
                    latitude : stage.latitude,
                    longitude : stage.longitude,
                    //electricity : stage.electricity,
                }
            );
            await session.close();
        }catch(err){
            console.log(`[ERR] addStage(): ${err}`);
        }
    },

    /**
     * Create a relation between stage and product.
     * @param {Number} stageId - the stage id
     * @param {Number} productId - the product id
     * @param {Number} quantity - quantity of Products there in the stage.
     */
    addProductToStage: async(stageId,productId,quantity) =>{
        try{
            let session = driver.session();
            await session.run(
                "MATCH (p:Product{ productId : $productId }) "+
                "MATCH (s:Stage{ stageId : $stageId }) "+
                "CREATE (p)<-[hs:HAS_STOCK{ quantity : $quantity }]-(s);"
                ,{
                    productId : productId,
                    stageId : stageId,
                    quantity : quantity
                }
            );
            await session.close();
        }catch(err){
            console.log(`[ERR] addProductToStage(): ${err}`);
        }
    },

    /**
     * Get all Stages
     * @return {Array} - an array of Stage Node objects
     */
    getAllStages: async() => {
        try{
            let session = driver.session();
            let result = await session.run(
                "MATCH (s:Stage) RETURN s;"
                ,{}
            );
            let stages = [];
            if(result.records.length>0){
                result.records.forEach((stage) => {
                    console.log(stage.get('s').properties);
                    stages.push(stage.get('s').properties);
                });
            }
            await session.close();
            return stages;
        }catch(err){
            console.log(`[ERR] getAllStages(): ${err}`);
        }
    },

    /**
     * Get a stage by its name
     * @param {String} name - Name of the stage
     * @return {Object} - The Stage object
     */
    getStageByName: async(name) => {
        try{
            let session = driver.session();
            let result = await session.run("MATCH (s:Stage { stageName: $stageName }) RETURN s;",
                {
                    stageName : name
                }
            );
            let stage;
            if(result.records[0].get('s').properties){
                stage = result.records[0].get('s').properties;
                console.log(stage);
            }
            await session.close();
            return stage;
        }catch(err){
            console.log(`[ERR] getStageByName(): ${err}`);
        }
    },

    /**
     * Get a stage by its id
     * @param {Number} id - The id of the stage
     * @return {Object} - The Stage object
     */
    getStageById: async(id) => {
        try{
            let session = driver.session();
            let result = await session.run("MATCH (s:Stage { stageId: $stageId }) RETURN s;",
                {
                    stageId : id
                }
            );
            let stage;
            if(result.records[0].get('s').properties){
                stage = result.records[0].get('s').properties;
                console.log(stage);
            }
            await session.close();
            return stage;
        }catch(err){
            console.log(`[ERR] getStageByName(): ${err}`);
        }

    },

    /**
     * Remove a stage
     * @param {String} name - The name of the stage
     */
    removeStageByName: async (name) => {
        try{
            let session = driver.session();
            await session.run("MATCH (s:Stage { stageName: $stageName }) DETACH DELETE s;",{
                stageName : name
            });
            await session.close();
        }catch(err){
            console.log(`[ERR] removeStageByName: ${err}`);
        }
    },

    /**
     * Remove a stage
     * @param {Number} id - The id of the stage
     */
    removeStageById: async(id) => {
        try{
            let session = driver.session();
            await session.run("MATCH (s:Stage { stageId: $stageId }) DETACH DELETE s;",{
                stageId : id
            });
            await session.close();
        }catch(err){
            console.log(`[ERR] removeStageById: ${err}`);
        }
    },
};
