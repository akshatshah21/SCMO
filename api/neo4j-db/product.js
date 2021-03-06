const driver = require("./db");

module.exports = {
    /**
     * Add a product
     * @param {Object} product - Product details
     */
    addProduct: async (product) => {
        try {
            let session = driver.session();
            await session.run("CREATE (p:Product{ productName: $productName, productId: $productId, mrp : $mrp });",
                {
                    productName : product.productName,
                    productId : product.productId,
                    mrp : product.mrp
                }
            );
            await session.close();
            return "OK";
        } catch (err) {
            console.log(`[ERR] addProduct: ${err}`);
            if(err.name === "Neo4jError") {
                if(err.code === "Neo.ClientError.Schema.ConstraintValidationFailed") {
                    return {
                        error: `Product with name '${product.productName}' already exists`
                    }
                }
            }
            return err;
        }
    },

    /**
     * Get all Products
     * @return {Array} an array of Product Node objects
     */
    getAllProducts: async() => {
        try{
            let session = driver.session();
            let result = await session.run(
                "MATCH (p:Product) RETURN p;"
                ,{}
            );
            let products = [];
            if(result.records.length>0){
                result.records.forEach((product) => {
                    products.push(product.get('p').properties);
                });
            }
            await session.close();
            return products;
        }catch(err){
            console.log(`[ERR] getAllProducts(): ${err}`);
        }
    },

    /**
     * Get a product by its id
     * @param {Number} id - The id of the product
     * @return {Object} The Product Node Object
     */
    getProductById: async (id) => {
        try{
            let session = driver.session();
            let result = await session.run("MATCH (p:Product {productId: $productId }) RETURN p;",
                {
                    productId : id
                }
            );
            let product;
            if(result.records[0].get('p').properties){
                product = result.records[0].get('p').properties;
                console.log(product);
            }
            await session.close();
            return product;
        }catch(err){
            console.log(`[ERR] getProductById(): ${err}`);
        }
    },

    /**
     * Get a product by its name
     * @param {String} name - The name of the product
     * @return {Object} The Product Node Object
     */
    getProductByName: async (name) => {
        try{
            let session = driver.session();
            let result = await session.run("MATCH (p:Product {productName: $productName }) RETURN p;",
                {
                    productName : name
                }
            );
            let product;
            if(result.records[0].get('p').properties){
                product = result.records[0].get('p').properties;
                console.log(product);
            }
            await session.close();
            return product;
        }catch(err){
            console.log(`[ERR] getProductByName(): ${err}`);
        }
    },

    /**
     * Most transfered product via a connection
     * @param {String} connectionId the id of the connection to be queried.
     * @return {Object} the most transferred product
     */
    getMostTransferredProducts: async (connectionId) => {
        try{
            let session = driver.session();
            let result = await session.run(`
                    MATCH (:Connection{connectionId : $connectionId})-[of:OF]->(:Product)
                    WITH MAX(of.totalQuantity) AS maxi
                    MATCH (:Connection{connectionId : $connectionId})-[f:OF]->(p:Product)
                    WHERE f.totalQuantity = maxi
                    RETURN p;
                `,{
                    connectionId : connectionId
                }
            );
            let prods = [];
            if(result.records.length>0){
                result.records.forEach((temp) => {
                    let data = temp.get('p').properties;
                    prods.push(data);
                })
            }
            console.log(prods);
            await session.close();
            return prods;
        }catch(err){
            console.log(`[ERR] getMostTransferredProducts: ${err}`);
        }
    },

    /**
     * Get Products having the most units stored at a stage
     * @return {Array} an array of Product Node objects
     */
    getMostStoredProducts: async(stageId) => {
        try{
            let session = driver.session();
            let result = await session.run(`
                MATCH (:Product)<-[hs:HAS_STOCK]-(:Stage{stageId : $stageId})
                WITH MAX(hs.quantity) as maxi
                MATCH (p:Product)<-[hss:HAS_STOCK]-(:Stage{stageId : $stageId})
                WHERE hss.quantity = maxi
                RETURN p;
                `,{
                    stageId : stageId
                }
            );
            let products = [];
            if(result.records.length>0){
                result.records.forEach((product) => {
                    products.push(product.get('p').properties);
                });
            }
            await session.close();
            return products;
        }catch(err){
            console.log(`[ERR] getMostStoredProducts(): ${err}`);
        }
    },

    /**
     * Remove a product based on its id
     * @param {Number} id - The id of the product
     */
    removeProductById: async (id) => {
        try{
            let session = driver.session();
            await session.run("MATCH (p:Product{ productId: $productId }) DETACH DELETE p;",{
                productId : id
            });
            await session.close();
        }catch(err){
            console.log(`[ERR] removeProductById: ${err}`);
        }
    },

    /**
     * Remove a product based on its name
     * @param {String} name - The name of the product
     */
    removeProductByName: async (name) => {
        try{
            let session = driver.session();
            await session.run("MATCH (p:Product{ productName: $productName }) DETACH DELETE p;",{
                productName : name
            })
            await session.close();
        }catch(err){
            console.log(`[ERR] removeProductByName: ${err}`);
        }
    },
};
