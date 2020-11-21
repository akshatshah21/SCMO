const bodyParser = require("body-parser");
const uuid = require("uuid");
const { customAlphabet } = require("nanoid");
const router = require("express").Router();

const {CODESTRING,CODELENGTH, TRANSFER_STATUS} = require("../config/options");
const transfer = require('../neo4j-db/transfer');
const connection = require('../neo4j-db/connection');
const driver = require("../neo4j-db/db");
const { getTransferById } = require("../neo4j-db/transfer");
const stage = require("../neo4j-db/stage");

const nanoid = customAlphabet(CODESTRING,CODELENGTH); // Creating the nanoid object to generate the code
let urlencodedParser = bodyParser.urlencoded({extended:false});


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
        connectionId : "",
        sourceId : req.body.senderId,
        destinationId : req.body.recipientId,
        sourceCode : "",
        destinationCode : "",
        transferId : uuid.v1(),
        transferStatus : TRANSFER_STATUS.PENDING,
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
    } else {
        // returning the code to the sender.
        res.status(200).json(code);
    }
});

router.post('/finish',async(req,res) => {
    let destinationId = req.body.stageId;
    let transferId = req.body.transferId;

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

    //updating the destinationCode of the transfer in the database.
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

module.exports = router;