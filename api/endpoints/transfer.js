const bodyParser = require("body-parser");
const uuid = require("uuid");
const { customAlphabet } = require("nanoid");
const router = require("express").Router();

const {CODESTRING,CODELENGTH, TRANSFER_STATUS} = require("../config/options");
const transfer = require('../neo4j-db/transfer');
const pgtransfer = require('../postgis-db/transfer');
const connection = require('../neo4j-db/connection');
const driver = require("../neo4j-db/db");
const { getTransferById } = require("../neo4j-db/transfer");
const stage = require("../neo4j-db/stage");
const pgstage = require("../postgis-db/stage");
const util = require("../util.js");

const nanoid = customAlphabet(CODESTRING,CODELENGTH); // Creating the nanoid object to generate the code
let urlencodedParser = bodyParser.urlencoded({extended:false});

/*
    function to return the transfer location, and associated products along with the details of destination and source.
    return object : 
    {
        "coordinates" : [x,y],
        "products" : [
            {
                "productId" : String,
                "quatity" : Number
            },....
        ]
        "destination" : {
            destinationId : String,
        },
        "source" : {
            sourceId : String,...
        }
    }
*/
router.get('/:transferId/details', async (req,res) => {

    let trans = await transfer.getTransferById(req.params.transferId);
    if(!trans) {
        res.status(404).json({error: "No such transfer found"});
    }
    
    if(trans.transferStatus === "ongoing") {
        let transferLocation = await pgtransfer.getTransferById(req.params.transferId);
        if(transferLocation.features && transferLocation.features.length > 0 && transferLocation.features[0].geometry) {
            trans.coordinates = transferLocation.features[0].geometry.coordinates;
        }
    }
    
    trans.products = await transfer.getAllProducts(req.params.transferId);

    trans.source = await stage.getStageById(trans.sourceId);
    trans.destination = await stage.getStageById(trans.destinationId);

    trans.source.location = (await pgstage.getStageById(trans.sourceId)).features[0].geometry.coordinates;
    trans.destination.location = (await pgstage.getStageById(trans.destinationId)).features[0].geometry.coordinates;

    res.json(trans);

});

/**
 * @route GET api/transfer/transfersInBuffer
 * @desc Returns the location of all transfers around the buffer in Geojson.
 * @access Public
 */
router.get("/transfersInBuffer",async (req,res) => {
    // the radius accepts values in metres.
    let data = await pgtransfer.getTransfersInBuffer(req.body.latitude,req.body.longitude,req.body.radius);

    let result = [];
    for(i=0;i<data.rows.length;i++){
        let temp = await util.getTransferDetailsById(data.rows[i].transferid);
        result.push(temp);
    }
    res.status(200).json(result);
});

/**
 * @route GET api/transfer/closestTransfers
 * @desc Returns the location of limited closest transfers wrt a reference point in Geojson.
 * @access Public
 */
router.get("/closestTransfers",async (req,res) => {
    let data = await pgstage.getClosestTransfers(res.body.latitude,res.body.longitude,res.body.limit);
    res.status(200).json(data);
});

/*
    function to create a transfer node object and send a code.
*/
router.post('/initiate', async (req,res) => {
    // TODO: Add validation

    //changing datatype of products from string to number
    req.body.products.forEach((prod) => {
        prod.quantity = Number(prod.quantity);
    });

    // creating the trans object.
    let trans = {
        transferId : uuid.v1(),
        transferStatus : TRANSFER_STATUS.PENDING,
        connectionId : "",
        sourceId : req.body.senderId,
        destinationId : req.body.recipientId,
        sourceCode : "",
        destinationCode : "",
        transferLat : Number(req.body.latitude),
        transferLon : Number(req.body.longitude),
        // transferStartTime : req.body.startTime, 
        products : req.body.products
    };
    
    // getting the connection id between the two stages
    let result = await connection.getConnectionBetweenStages(trans.sourceId,trans.destinationId);
    if(result.connection === -1){
        // creating a connection b/w the two stages if it isn't present.
        trans.connectionId = uuid.v1();
        result = await connection.addConnection(trans.sourceId,trans.destinationId,trans.connectionId);
        if(result.err) {
            console.error(result.err);
            return res.status(500).json(result.err);
        }
        // result = await connection.getConnectionBetweenStages(trans.sourceId,trans.destinationId);
    }
    trans.connectionId = result.connection.connectionId;

    //generating the source code.
    let code = {};
    code.sourceCode = nanoid();
    trans.sourceCode = code.sourceCode;

    //reducing the quantity of products in the stage.
    trans.products.forEach(async (prod) => {
        await stage.updateQuantity(trans.sourceId,prod.productId,-prod.quantity);
    });

    //creating the transfer node object
    result = await transfer.addTransfer(trans);
    if(result.err) {
        res.status(500).json(result.err);
    }
    console.log("Node in Neo4j is created");
    
    //inserting the row into the transfer relation
    result = await pgtransfer.addTransfer(trans);
    await pgtransfer.updateTransferLocation(trans.transferId,trans.transferLat,trans.transferLon);
    if(result.err) {
        res.status(500).json(result.err);
    }
    console.log("Data inserted into transfer relation");

    // returning the code to the sender.
    res.status(200).json(code);
});

router.post('/finish',async(req,res) => {
    let destinationId = req.body.stageId;
    let transferId = req.body.transferId;
    

    //getting the transfer node.
    let trans = await getTransferById(transferId);
    if(!trans) {
        res.status(400).json({error: "Invalid destination or transfer ID"});
    }
    if(trans.destinationId !== destinationId) {
        res.status(400).json({error: "Invalid destination ID"});
    }
    // generating the destination code
    let code = {};
    code.destinationCode = nanoid();
    trans.destinationCode = code.destinationCode;

    //updating the destinationCode of the transfer in Neo4j.
    try{
        let session = driver.session();
        await session.run(
            "MATCH (t:Transfer{ transferId : $transferId }) "+
            "SET t.destinationCode = $destinationCode;"
            ,{
                transferId : trans.transferId,
                destinationCode : trans.destinationCode
            }
        );
        await session.close();
    }catch(err){
        console.log("[ERR] router.post('/finish'): error occured while updating destinationCode");
    }

    res.status(200);
    res.json(code);
});

router.post('/verifySourceCode', async (req,res) => {
    let code = req.body.code;
    let result = await transfer.getTransferBySourceCode(code); 

    if(result.transfer) {

        // since the code checks out we need to change its status to ongoing
        let trans = await transfer.changeTransferStatus(result.transfer.transferId,TRANSFER_STATUS.ONGOING);
        await transfer.setStartTime(trans.transferId);
        const destinationLocation = (await pgstage.getStageById(result.transfer.destinationId)).features[0].geometry.coordinates;
        res.status(200).json({
            transferFound: true,
            transferId: trans.transferId, 
            destinationId: result.transfer.destinationId,
            destinationLatitude: destinationLocation[1],
            destinationLongitude: destinationLocation[0] 
        });
    } else {
        res.status(400).json({transferFound:false});
    }
});

router.post('/verifyDestinationCode',urlencodedParser,async(req,res) => {
    let code = req.body.code;
    let transferId = req.body.transferId;
    let destinationId = req.body.destinationId;
    // getting the transfer by code
    let found = await transfer.getTransferByDestinationCode(code); 
    

    if(found.transfer){
        found = found.transfer;
        // since the code checks out we need to change its status to completed
        let trans = await transfer.changeTransferStatus(found.transferId,TRANSFER_STATUS.COMPLETED);
        // setting the endTime of the transfer.
        await transfer.setEndTime(trans.transferId, (new Date()).toISOString());
        console.log(req.body);

        //getting the connectionNode belonging to the transfer.
        let conn = await connection.getConnectionOfTransfer(trans.transferId);
        // updating data stored in the connection node.
        await connection.updateConnectionData(conn.connectionId, trans.transferId,trans.transferStartTime,trans.transferEndTime);

        //getting all the products in the transfer.
        let prods = await transfer.getAllProducts(transferId);
        //updating the quantity of products on the receiver's end.
        prods.forEach( async (prod) => {
            await stage.updateQuantity(destinationId,prod.productId,prod.quantity);
        });

        //deleting the transfer row from transfer relation from postgis.
        await pgtransfer.deleteTransferById(transferId);

        res.status(200).json({transferFound:true});
    }else {
        res.status(400).json({transferFound:false});
    }
});


router.get("/:stageId/incoming", async (req, res) => {
    //console.log("starting with the queries");
    let result = {
        "ongoing":[],
        "pending":[],
        "completed":[]
    };
    let trans = await transfer.getTransfersOfDestination(req.params.stageId);
    let stg = await pgstage.getStageById(req.params.stageId);
    //getting all the list of closest transfers in data.
    let data = await pgtransfer.getClosestTransfers(stg.features[0].stagelat,stg.features[0].stagelon,1000000);

    //filtering out all pending and completed transfers from trans and adding them to result
    for(i=0;i<trans.length;i++){
        if(trans[i].transferStatus===TRANSFER_STATUS.COMPLETED){
            result.completed.push(trans[i]);
        }else if(trans[i].transferStatus===TRANSFER_STATUS.PENDING){
            result.pending.push(trans[i]);
        }
    }

    //filtering out ongoing transfers from data and adding them to result
    for(i=0; i<data.rows.length; i++){
        let temp = data.rows[i];
        let ans = await transfer.getTransferById(temp.transferid);
        ans.transferLat = temp.transferlat;
        ans.transferLon = temp.transferlon;
        if(ans.transferStatus === TRANSFER_STATUS.ONGOING) result.ongoing.push(ans);
    }
    console.log(result);
    return res.status(200).json(result);
});

router.get("/:stageId/outgoing", async (req, res) => {
    let transfers = await transfer.getTransfersOfSource(req.params.stageId);
    if(Array.isArray(transfers)) {
        return res.status(200).json(transfers);
    } else {
        return res.status(400).json(transfers);
    }
});


router.get("/:transferId/products", async (req, res) => {
    let products = await transfer.getAllProducts(req.params.transferId);
    console.log(products);
    if(products.length === 0) {
        res.status(404).json({error: "No such transfer found (no products for this transfer)"});
    } else {
        res.status(200).json(products);
    }
});

// Delete this, for dev only
router.get("/:transferId", async(req, res) => {
    let t = transfer.getTransferById(req.params.transferId);
    if(t) {
        t.sourceName = "Source Stage Name";
        t.destinationName = "Destination Stage Name";
        t.sourceEmail = "source@scmo.com";
        t.destinationEmail = "destination@scmo.com";
        t.sourceLocation = [74, 18];
        t.destinationLocation = [73, 19];
        t.sourceAddress = "Source Address";
        t.destinationAddress = "Destination Address";
        t.status = "completed";
        res.send(t);
    } else {
        res.status(404).json({error: "No such transfer found"});
    }
});

module.exports = router;
