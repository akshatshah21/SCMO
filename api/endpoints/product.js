const router = require('express').Router();
const product = require('../neo4j-db/product');

router.get("/", async (req,res) => {
    let data = await product.getAllProducts();
    res.status(200).json(data);
});

module.exports = router;