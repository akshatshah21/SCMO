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
    let id = req.params.transferId;
    let ans = {};

    // getting the coordinates of the transfer.
    let trans = await pgtransfer.getTransferById(id);
    let temp = trans.features;
    if(temp.length>0){
        ans.coordinates = temp[0].geometry.coordinates;
    }else{
        res.status(400).json({error: "Invalid transfer ID"});
    }

    //getting all products of the transfer
    temp = await transfer.getAllProducts(id); 
    ans.products = temp;

    //getting details of destination.
    temp = trans.features[0]["destinationId".toLowerCase()];
    console.log(temp);
    ans.destination = await stage.getStageById(temp);

    //getting details of source.
    temp = trans.features[0]["sourceId".toLowerCase()];
    ans.source = await stage.getStageById(temp);

    res.status(200).json(ans);
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
        transferStartTime : req.body.startTime, 
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
    trans.products.forEach((prod) => {
        stage.updateQuantity(trans.sourceId,prod.productId,-prod.quantity);
    });

    //creating the transfer node object
    result = await transfer.addTransfer(trans);
    if(result.err) {
        res.status(500).json(result.err);
    }
    console.log("Node in Neo4j is created");
    
    //inserting the row into the transfer relation
    result = await pgtransfer.addTransfer(trans);
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
    let transferEndTime = req.body.endTime;

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

    //updating the destinationCode and transferEndTime of the transfer in Neo4j.
    try{
        let session = driver.session();
        await session.run(
            "MATCH (t:Transfer{ transferId : $transferId }) "+
            "SET t.destinationCode = $destinationCode, t.tranferEndTime = $transferEndTime;"
            ,{
                transferId : trans.transferId,
                destinationCode : trans.destinationCode,
                transferEndTime : transferEndTime
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

        res.status(200).json({transferId : trans.transferId, destinationId : result.transfer.destinationId, transferFound : true});
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
        //getting all the products in the transfer.
        let prods = await transfer.getAllProducts(transferId);
        
        //updating the quantity of products on the receiver's end.
        prods.forEach((prod) => {
            stage.updateQuantity(destinationId,prod.productId,prod.quantity);
        });

        //deleting the transfer row from transfer relation from postgis.
        await pgtransfer.deleteTransferById(transferId);

        res.status(200).json({transferFound:true});
    }else {
        res.status(400).json({transferFound:false});
    }
});


router.get("/:stageId/incoming", async (req, res) => {
    let transfers = await transfer.getTransfersOfDestination(req.params.stageId);
    if(Array.isArray(transfers)) {
        return res.status(200).json(transfers);
    } else {
        return res.status(400).json(transfers);
    }
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
    if(products.length === 0) {
        res.status(404).json({error: "No such transfer found (no products for this transfer)"});
    } else {
        res.status(200).json(products);
    }
});

module.exports = router;