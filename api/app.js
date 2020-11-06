const express = require("express");
const bodyParser = require("body-parser");

const driver = require("./neo4j-db/db");
const app = express();

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.port || 5000;

app.get("/", (req, res) => res.send("Hello World"));

app.listen(PORT, () => console.log(`App running on port ${PORT}`));
