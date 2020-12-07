const router = require("express").Router();
const bodyParser = require("body-parser");
const uuid = require("uuid");

const stage = require('../neo4j-db/stage');
const pgstage = require('../postgis-db/stage');
const { validateCreation, validateProductAddition } = require("../validation/stage");

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
 * @route GET api/stage/allStageLocations
 * @desc Returns the location of all stages in Geojson.
 * @access Public
 */
router.get("/allStageLocations",async (req,res) => {
    let data = await pgstage.getAllStages();
    res.status(200).json(data);
});

/**
 * @route POST api/stage/create
 * @desc Creates a stage. Currently only handles stageName
 * @access Public, change to admin only later
 */
router.post("/create", async(req,res) => {
    const { isValid, errors } = validateCreation(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }
    let data = {
      stageName: req.body.stageName,
      stageId: uuid.v1(),
      stageLat : Number(req.body.latitude),
      stageLon : Number(req.body.longitude),
      stageAdd : req.body.address,
      stageEmail : req.body.email
    };
      // add a comma above to include the below properties.
      // staffCount : Number(req.body.staffCount),
      // electricity : stage.electricity,

    //adding the stage to the neo4j db.
    console.log('adding stage to neo4j');
    let err = await stage.addStage(data);
    if(err) {
        res.status(500).json(err);
    }

    //adding the stage to pg db.
    console.log('adding stage to pg');
    err = await pgstage.addStage(data);
    if(err){
        res.status(500).json(err);
    } else {
        res.status(200).end();
    }
});

router.post("/addProduct", async(req,res) => {
    const { errors, isValid } = validateProductAddition(req.body);
    if(!isValid) {
        return res.status(400).json(errors);
    }
    let productId = req.body.productId;
    let stageId = req.body.stageId;
    let quantity = Number(req.body.quantity);
    let result = await stage.addProductToStage(stageId, productId, quantity);
    if(result === "OK") {
        console.log(`:HAS_STOCK created between ${stageId} and ${productId} of ${quantity}`);
        res.status(200).send("OK");
    } else {
        res.status(400).send(result);
    }
});

/**
 * @route GET api/stage/:stageId/products
 * @desc return all products of a stage
 * @access Public for now, change to protected later
 */
router.get("/:stageId/products", async (req, res) => {
    let stageId = req.params.stageId;
    let result = await stage.getProducts(stageId);
    if(result.err) {
        res.status(500).json( {error: result.err.message} );
    } else {
        res.status(200).json(result.products);
    }
})

router.put("/updateQuantity",urlencodedParser, async(req,res) => {
    let productId = req.body.productId;
    let stageId = req.body.stageId;
    let deltaQuantity = req.body.deltaQuantity;
    await stage.updateQuantity(stageId,productId,deltaQuantity);
    res.status(200).json();
    console.log(`update the ${productId} in ${stageId} by ${deltaQuantity}`);
});

module.exports = router;