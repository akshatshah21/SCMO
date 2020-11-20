const bodyParser = require("body-parser");
const uuid = require("uuid");
const { customAlphabet } = require("nanoid");
const router = require("express").Router();
const { urlencoded } = require("body-parser");

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
    console.log(req.body);

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
    if(result === -1){
        // creating a connection b/w the two stages if it isn't present.
        console.log('creating new connection');
        trans.connectionId = uuid.v1();
        result = await connection.addConnection(trans.sourceId,trans.destinationId,trans.connectionId);
        if(result.err) {
            console.error(result.err);
            return res.status(500).json(result.err);
        }
        // result = await connection.getConnectionBetweenStages(trans.sourceId,trans.destinationId);
    }
    trans.connectionId = result.connectionId;

    //generating the source code.
    let code = {};
    code.sourceCode = nanoid();
    trans.sourceCode = code.sourceCode;

    //reducing the quantity of products in the stage.
    trans.products.forEach((prod) => {
        stage.updateQuantity(trans.sourceId,prod.productId,-prod.quantity);
    });

    //creating the transfer node object
    console.log(trans);
    await transfer.addTransfer(trans);

    // returning the code to the sender.
    res.status(200).json(code);
});

router.post('/finish',async(req,res) => {
    let destinationId = req.body.destinationId;
    let transferId = req.body.transferId;
    console.log(transferId);

    let trans = await getTransferById(transferId);
    console.log(trans);

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

router.post('/verifySourceCode',urlencodedParser,async(req,res) => {
    let code = req.body.code;
    let found = await transfer.getTransferBySourceCode(code); 
    console.log(found);

    res.status(200);

    if(found){
        // since the code checks out we need to change its status to ongoing
        let trans = await transfer.changeTransferStatus(found.transferId,TRANSFER_STATUS.ONGOING);
        console.log(trans);
        res.json({transferId : trans.transferId,destinationId : trans.destinationId, transferFound : true});
    }else res.json({transferFound:false});
});

router.post('/verifyDestinationCode',urlencodedParser,async(req,res) => {
    let code = req.body.code;
    let transferId = req.body.transferId;
    let destinationId = req.body.destinationId;
    // getting the transfer by code
    let found = await transfer.getTransferByDestinationCode(code); 
    console.log(found);

    res.status(200);

    if(found){
        // since the code checks out we need to change its status to completed
        let trans = await transfer.changeTransferStatus(found.transferId,TRANSFER_STATUS.COMPLETED);
        console.log(trans);
        //getting all the products in the transfer.
        let prods = await transfer.getAllProducts(transferId);
        console.log(prods);
        
        //updating the quantity of products on the receiver's end.
        prods.forEach((prod) => {
            stage.updateQuantity(destinationId,prod.productId,prod.quantity);
        });
        res.json({transferFound:true});
    }else res.json({transferFound:false});
});

module.exports = router;