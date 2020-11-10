const driver = require("./db");

module.exports = {
    /**
     * Add a product
     * @param {Object} - Product details
     */
    addProduct: async (product) => {
        try{
            let session = driver.session();
            await session.run("CREATE (p:Product{ productName: $productName, productId: $productId, mrp : $mrp });",
                {
                    productName : product.productName,
                    productId : product.productId,
                    mrp : product.mrp
                }
            );
            await session.close();
        }catch(err){
            console.log(`[ERR] addProduct: ${err}`);
        }
    },

    /**
     * Get a product by its id
     * @param {Number} id - The id of the product
     * @return {Object} - The Product Node Object
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
     * @return {Object} - The Product Node Object
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
