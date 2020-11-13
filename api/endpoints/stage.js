const stage = require('../neo4j-db/stage');
const router = require("express").Router();

router.get("/",async (req,res) => {
    let data = await stage.getAllStages();
    res.status(200).json(data);
});
module.exports = router;