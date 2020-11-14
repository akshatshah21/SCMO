const router = require('express').Router();
const bodyParser = require('body-parser');
const uuid = require('uuid');

const product = require('../neo4j-db/product');

const urlencodedParser = bodyParser.urlencoded({extended:false});

router.get("/", async (req,res) => {
    let data = await product.getAllProducts();
    res.status(200).json(data);
});

router.post("/create", urlencodedParser, async(req,res) => {
    let data;
    data = {
        productId : uuid.v1(),
        productName : req.body.productName,
        mrp : Number(req.body.mrp)
    };
    await product.addProduct(data);
    res.status(200).json();
});
module.exports = router;