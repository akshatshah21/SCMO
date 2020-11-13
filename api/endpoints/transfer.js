const bodyParser = require("body-parser");
const uuid = require("uuid");
const { customAlphabet } = require("nanoid");
const router = require("express").Router();
const { urlencoded } = require("body-parser");

const {CODESTRING,CODELENGTH, TRANSFER_STATUS} = require("../config/options");
const transfer = require('../neo4j-db/transfer');
const connection = require('../neo4j-db/connection');
const { getTransferById } = require("../neo4j-db/transfer");

const nanoid = customAlphabet(CODESTRING,CODELENGTH); // Creating the nanoid object to generate the code
let urlencodedParser = bodyParser.urlencoded({extended:false});


/*
    function to create a transfer node object and send a code.
*/
router.post('/initiate',urlencodedParser,async(req,res) => {
    console.log(req.body);
    // changing productIds to Number
    let products = req.body.products;
    products.forEach((product) => {
        product.productId = Number(product.productId);
    });

    // creating the trans object.
    let trans = {
        connectionId : "",
        sourceId : Number(req.body.senderId),
        destinationId : Number(req.body.recipientId),
        sourceCode : "",
        destinationCode : "",
        transferId : uuid.v1(),
        transferStatus : TRANSFER_STATUS.PENDING,
        products : req.body.products
    };
    
    // getting the connection id between the two stages
    let result = await connection.getConnectionBetweenStages(trans.sourceId,trans.destinationId);
    if(result==-1){
        // creating an connection b/w the two stages if it isn't present.
        trans.connectionId = uuid.v1();
        await connection.addConnection(trans.sourceId,trans.destinationId,trans.connectionId);
        result = await connection.getConnectionBetweenStages(trans.sourceId,trans.destinationId);
    }
    trans.connectionId = result.connectionId;

    //generating the source and destination Code.
    let code = {};
    code.sourceCode = nanoid();
    code.destinationCode = nanoid();
    trans.sourceCode = code.sourceCode;
    trans.destinationCode = code.destinationCode;

    //adding the transfer;
    console.log(trans);
    await transfer.addTransfer(trans);

    // return the code to the sender.
    res.status(200).json(code);
});

router.post('/finish',async(req,res) => {
    let trans = await getTransferById(req.body.transferId);
    res.status(200);
    res.json(trans);
});

router.post('/verifySourceCode',urlencodedParser,async(req,res) => {
    let code = req.body.code;
    let found = await transfer.getTransferBySourceCode(code); 
    console.log(found);

    res.status(200);

    if(found){
        // since the code checks out we need to change its status to ongoing
        let trans = await transfer.changeTransferStatus(found.transferId,TRANSFER_STATUS.ONGOING);
        console.log(trans);
        res.json({transferFound:true});
    }else res.json({transferFound:false});
});

router.post('/verifyDestinationCode',urlencodedParser,async(req,res) => {
    let code = req.body.code;
    // getting the transfer by code
    let found = await transfer.getTransferByDestinationCode(code); 
    console.log(found);

    res.status(200);

    if(found){
        // since the code checks out we need to change its status to completed
        let trans = await transfer.changeTransferStatus(found.transferId,TRANSFER_STATUS.COMPLETED);
        console.log(trans);
        res.json({transferFound:true});
    }else res.json({transferFound:false});
});

module.exports = router;