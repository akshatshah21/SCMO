const router = require("express").Router();
const bodyParser = require("body-parser");
const uuid = require("uuid");

const product = require("../neo4j-db/product");
const { validateCreation } = require("../validation/product");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

/**
 * @route GET api/product
 * @desc Returns list of all products
 * @access Public
 */
router.get("/", async (req, res) => {
  let data = await product.getAllProducts();
  res.status(200).json(data);
});

/**
 * @route GET api/product/mostTransferredProducts
 * @desc Returns a list of all Products that have delivered the most via a connections.
 * @access Public
 */
router.get("/mostTransferredProducts", async (req, res) => {
  let data = await product.getMostTransferredProducts(res.body.connectionId);
  res.status(200).json(data);
});

/**
 * @route POST api/product/create
 * @desc Creates a new product
 * @access Public for now, change to protected
 */
router.post("/create", urlencodedParser, async (req, res) => {
  const { isValid, errors } = validateCreation(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  let data = {
    productId: uuid.v1(),
    productName: req.body.productName,
    mrp: Number(req.body.mrp),
  };

  let result = await product.addProduct(data);
  if (result === "OK") {
    res.status(200).json(data);
  } else {
    res.status(400).json(result);
  }
});
module.exports = router;
