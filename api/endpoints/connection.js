const router = require("express").Router();
const bodyParser = require("body-parser");

const connection = require("../neo4j-db/connection");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * @route GET api/connection/mostDemandingConnections
 * @desc Returns a list of all Connections that have delivered the most quantity of a product.
 * @access Public
 */
router.get("/mostDemandingConnections", async (req, res) => {
  let data = await connection.getMostDemandingConnections(req.body.productId);
  res.status(200).json(data);
});

module.exports = router;