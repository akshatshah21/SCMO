const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");

const auth = require("./endpoints/auth");
const stage = require("./endpoints/stage");
const product = require("./endpoints/product");
const transfer = require("./endpoints/transfer");
const app = express();

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
require("./config/passport");

app.use("/api/auth", auth);
app.use("/api/stage",stage);
app.use("/api/transfer",transfer);
app.use("/api/product",product);
const PORT = process.env.port || 5000;

app.get("/", (req, res) => res.send("Hello World"));

app.listen(PORT, () => console.log(`App running on port ${PORT}`));

