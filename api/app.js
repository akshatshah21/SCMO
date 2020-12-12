const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const http = require("http");
const socketIo = require("socket.io");

const auth = require("./endpoints/auth");
const stage = require("./endpoints/stage");
const product = require("./endpoints/product");
const transfer = require("./endpoints/transfer");
const connection = require("./endpoints/connection");

const pgtransfer = require("./postgis-db/transfer");

const app = express();

const PORT = process.env.port || 5000;
const HOSTNAME = "0.0.0.0";

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
require("./config/passport");

app.use("/api/auth", auth);
app.use("/api/stage", stage);
app.use("/api/transfer", transfer);
app.use("/api/product", product);
//app.use("/api/connection", connection);

app.get("/", (req, res) => res.send("Hello World"));

const server = http.createServer(app);
const io = socketIo(server);

server.listen(PORT, HOSTNAME, () => console.log(`Listening on port ${PORT}`));

// Map for transferId --> location
// let locationMap = new Map();

// Map for socket id --> interval
let intervalMap = new Map();

io.on("connection", socket => {
  console.log("New client connected");

  socket.on('disconnect', (message) => {
    console.log("Client disconnected");
    if(intervalMap.has(socket.id)) {
      clearInterval(intervalMap.get(socket.id));
    }
  });

  // Phone to api
	socket.on("location-update", async(message) => {
    console.log(message);
    // add to DB
    await pgtransfer.updateTransferLocation(message.transferId,message.latitude,message.longitude);
  });
  
  // api to browser
  socket.on("map-client", async(message) => {
    // console.log("map-client, with transferId:" + message.transferId);
    let interval = setInterval(async() => {
      // retrieve loc from db
      let coordinates = await pgtransfer.getTransferById(message.transferId);
      coordinates = coordinates.features[0];
      // console.log(coordinates);
      let location = {
        latitude: coordinates.transferlat,
        longitude: coordinates.transferlon
      };
      socket.emit("location-update", location);
    }, 5000);
    intervalMap.set(socket.id, interval);
  })
})

module.exports = app;
