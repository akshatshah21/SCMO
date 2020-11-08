const driver = require("./db");

module.exports = {
    /**
     * Add a product
     * @param {Object} - Product details
     */
    addProduct: (product) => {},

    /**
     * Get a product by its id
     * @param {Number} id - The id of the product
     * @return {Object} - The Product Node Object
     */
    getProductById: (id) => {},

    /**
     * Get a product by its name
     * @param {String} name - The name of the product
     * @return {Object} - The Product Node Object
     */
    getProductByName: (name) => {},
};
