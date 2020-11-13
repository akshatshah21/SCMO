const router = require("express").Router();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const { addProduct } = require("../neo4j-db/product");

const stage = require('../neo4j-db/stage');

const urlencodedParser = bodyParser.urlencoded({extended:false});

router.get("/",async (req,res) => {
    let data = await stage.getAllStages();
    res.status(200).json(data);
});

router.post("/create",urlencodedParser, async(req,res) => {
    let data;
    data = {
        stageName : req.body.stageName,
        stageId : uuid.v1(),
        staffCnt : Number(req.body.staffCnt),
        latitude : Number(req.body.latitude),
        longitude : Number(req.body.longitude),
        //electricity : stage.electricity,
    }
    await stage.addStage(data);
    res.status(200).json();
});

router.post("/addProduct",urlencodedParser, async(req,res) => {
    let productId = req.body.productId;
    let stageId = req.body.stageId;
    let quantity = Number(req.body.quantity);
    await stage.addProductToStage(stageId, productId, quantity);
    res.status(200).json();
    console.log(`:HAS_STOCK created between ${stageId} and ${productId} of ${quatity}`)
});

module.exports = router;