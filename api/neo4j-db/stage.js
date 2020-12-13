const driver = require("./db");
const product = require("./product");

module.exports = {
  /**
   * Add a stage in the database
   * @param {Object} stage - An object with the stage details
   */
  addStage: async (stage) => {
    console.log(`Add stage ${stage.stageName}`);
    try {
      let session = driver.session();
      await session.run(
        `CREATE (s:Stage {
          stageName: $stageName,
          stageId: $stageId,
          stageAdd: $stageAdd,
          stageEmail: $stageEmail
        });`,
          // staffCount: $staffCount,
          // electricity: $electricity
        {
          stageName: stage.stageName,
          stageId: stage.stageId,
          stageAdd: stage.stageAdd,
          stageEmail: stage.stageEmail,
          // staffCount: stage.staffCount,
          // latitude: stage.latitude,
          // longitude: stage.longitude,
          // electricity : stage.electricity,
        }
      );
      await session.close();
    } catch (err) {
      console.log(`[ERR] addStage(): ${err}`);
      if(err.name === "Neo4jError") {
        if(err.code === "Neo.ClientError.Schema.ConstraintValidationFailed") {
            return {
                error: `Stage with name '${stage.stageName}' already exists`
            }
          }
        }
      return err;
    }
  },


  /**
   * Create a relation between stage and product.
   * @param {Number} stageId - the stage id
   * @param {Number} productId - the product id
   * @param {Number} quantity - quantity of Products there in the stage.
   */
  addProductToStage: async (stageId, productId, quantity) => {
    try {
      let session = driver.session();
      // add checks for whether product or stage exist. Right now records.len == 0 if no matches
      let result = await session.run(`
        MATCH (p:Product{ productId : $productId })
        MATCH (s:Stage{ stageId : $stageId })
        MERGE (p)<-[hs:HAS_STOCK{ quantity : $quantity }]-(s)
        RETURN hs;
        `,{
          productId: productId,
          stageId: stageId,
          quantity: quantity,
        }
      );
      
      await session.close();
      if(result.records.length === 0) {
        return {
          error: "Invalid input. Check if product and/or stage exists"
        };
      } else {
        return "OK";
      }
    } catch (err) {
      console.log(`[ERR] addProductToStage(): ${err}`);
    }
  },

  /**
   * Get all Stages
   * @return {Array} an array of Stage Node objects
   */
  getAllStages: async () => {
    try {
      let session = driver.session();
      let result = await session.run("MATCH (s:Stage) RETURN s;", {});
      let stages = [];
      if (result.records.length > 0) {
        result.records.forEach((stage) => {
          stages.push(stage.get("s").properties);
        });
      }
      await session.close();
      return stages;
    } catch (err) {
      console.log(`[ERR] getAllStages(): ${err}`);
    }
  },

  /**
   * Get a stage by its name
   * @param {String} name - Name of the stage
   * @return {Object} The Stage object
   */
  getStageByName: async (name) => {
    try {
      let session = driver.session();
      let result = await session.run(
        "MATCH (s:Stage { stageName: $stageName }) RETURN s;",
        {
          stageName: name,
        }
      );
      let stage;
      if (result.records[0].get("s").properties) {
        stage = result.records[0].get("s").properties;
        // console.log(stage);
      }
      await session.close();
      return stage;
    } catch (err) {
      console.log(`[ERR] getStageByName(): ${err}`);
    }
  },

  /**
   * Get a stage by its id
   * @param {Number} id - The id of the stage
   * @return {Object} The Stage object
   */
  getStageById: async (id) => {
    try {
      let session = driver.session();
      let result = await session.run(
        "MATCH (s:Stage { stageId: $stageId }) RETURN s;",
        {
          stageId: id,
        }
      );
      let stage;
      if (result.records[0].get("s").properties) {
        stage = result.records[0].get("s").properties;
        // console.log(stage);
      }
      await session.close();
      return stage;
    } catch (err) {
      console.log(`[ERR] neo4j-db.getStageById(): ${err}`);
    }
  },

  /**
   * Returning an array of stages having most quantity of a product.
   * @param {String} productId - The id of the product.
   */
  getStagesHavingMostQuantity: async (productId) => {
    try {
      let session = driver.session();
      let result = await session.run(`
        MATCH (:Product{ productId : $productId })<-[hs:HAS_STOCK]-()
        WITH MAX(hs.quantity) AS maxi
        MATCH (:Product{ productId : $productId })<-[hss:HAS_STOCK]-(s:Stage)
        WHERE hss.quantity = maxi
        RETURN s;
        `,{
          productId
        }
      );
      let stages = [];
      if (result.records.length>0) {
        result.records.forEach((temp) => {
          stages.push(temp.get("s").properties);
        });
      }
      await session.close();
      return stages;
    } catch (err) {
      console.log(`[ERR] getStagesHavingMostQuantity: ${err}`);
    }
  },

  /**
   * Remove a stage
   * @param {String} name - The name of the stage
   */
  removeStageByName: async (name) => {
    try {
      let session = driver.session();
      await session.run(
        "MATCH (s:Stage { stageName: $stageName }) DETACH DELETE s;",
        {
          stageName: name,
        }
      );
      await session.close();
    } catch (err) {
      console.log(`[ERR] removeStageByName: ${err}`);
    }
  },

  /**
   * Remove a stage
   * @param {Number} id - The id of the stage
   */
  removeStageById: async (id) => {
    try {
      let session = driver.session();
      await session.run(
        "MATCH (s:Stage { stageId: $stageId }) DETACH DELETE s;",
        {
          stageId: id,
        }
      );
      await session.close();
    } catch (err) {
      console.log(`[ERR] removeStageById: ${err}`);
    }
  },

  /**
   * Updates the quantity of a product in a stage.
   * @param {Number} stageId - The id of the stage
   * @param {Number} productId - The id of the product
   * @param {Number} deltaQuantity - the change in quantity of the product.
   */
  updateQuantity: async (stageId, productId, deltaQuantity) => {
    try {
      let session = driver.session();
      let hs = await session.run(
        "MATCH (s:Stage{ stageId : $stageId}) " +
        "MATCH (p:Product{ productId : $productId }) " +
        "MATCH (p)<-[hs:HAS_STOCK]-(s) RETURN hs;",
        {
          stageId: stageId,
          productId: productId,
        }
      );
      if (hs.records.length == 0) {
        //addProductToStage
        console.log(`adding Product to stage ${deltaQuantity}`);
        await session.run(
          "MATCH (p:Product{ productId : $productId }) " +
          "MATCH (s:Stage{ stageId : $stageId }) " +
          "CREATE (p)<-[:HAS_STOCK{ quantity : $deltaQuantity }]-(s) ;",
          {
            productId: productId,
            stageId: stageId,
            deltaQuantity: deltaQuantity,
          }
        );
      } else {
        await session.run(
          "MATCH (s:Stage{ stageId : $stageId}) " +
          "MATCH (p:Product{ productId : $productId }) " +
          "MATCH (p)<-[hs:HAS_STOCK]-(s) " +
          "SET hs.quantity= hs.quantity + $deltaQuantity;",
          {
            stageId: stageId,
            productId: productId,
            deltaQuantity: deltaQuantity,
          }
        );
      }
      await session.close();
    } catch (err) {
      console.log(`[ERR] updateQuantity(): ${err}`);
    }
  },

  /**
   * Get all products that are in stock in a stage
   * 
   * @param {String} stageId - The id of the stage
   * @return {Object} having a products list. If an error, then err
   */
  getProducts: async (stageId) => {
    try {
      let session = driver.session();
      let result = await session.run(
        "MATCH (s: Stage { stageId: $stageId })-[hs:HAS_STOCK]-(p: Product) " +
        "RETURN p, hs.quantity AS quantity;",
        { stageId }
      );
      await session.close();
      if(result.records.length === 0) {
        throw Error("Invalid input, check stageId");
      }
      let products = result.records.map(record => ({
        ...record.get("p").properties,
        quantity: record.get("quantity")
      }));
      return {products};
    } catch (err) {
      console.log(`[ERR] getProducts(): ${err}`);
      return {err};
    }
  }
};
