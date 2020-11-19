const router = require("express").Router();
const bodyParser = require("body-parser");
const uuid = require("uuid");

const stage = require('../neo4j-db/stage');

const urlencodedParser = bodyParser.urlencoded({extended:false});

/**
 * @route GET api/stage/
 * @desc Returns list of all stages. Currently only stageIds and stageNames
 * @access Public
 */
router.get("/",async (req,res) => {
    let data = await stage.getAllStages();
    res.status(200).json(data);
});

/**
 * @route POST api/stage/create
 * @desc Creates a stage. Currently only handles stageName
 * @access Public, change to admin only later
 */
router.post("/create",urlencodedParser, async(req,res) => {
    let data;
    data = {
      stageName: req.body.stageName,
      stageId: uuid.v1(),
      // staffCount : Number(req.body.staffCount),
      // latitude : Number(req.body.latitude),
      // longitude : Number(req.body.longitude),
      // electricity : stage.electricity,
    };
    let err = await stage.addStage(data);
    if(err) {
        res.status(500).send(err);
    } else {
        res.status(200).json();
    }
});

router.post("/addProduct",urlencodedParser, async(req,res) => {
    let productId = req.body.productId;
    let stageId = req.body.stageId;
    let quantity = Number(req.body.quantity);
    await stage.addProductToStage(stageId, productId, quantity);
    res.status(200).json();
    console.log(`:HAS_STOCK created between ${stageId} and ${productId} of ${quantity}`);
});

router.put("/updateQuantity",urlencodedParser, async(req,res) => {
    let productId = req.body.productId;
    let stageId = req.body.stageId;
    let deltaQuantity = req.body.deltaQuantity;
    await stage.updateQuantity(stageId,productId,deltaQuantity);
    res.status(200).json();
    console.log(`update the ${productId} in ${stageId} by ${deltaQuantity}`);
});

module.exports = router;