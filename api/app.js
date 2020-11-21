const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const http = require("http");
const socketIo = require("socket.io");

const auth = require("./endpoints/auth");
const stage = require("./endpoints/stage");
const product = require("./endpoints/product");
const transfer = require("./endpoints/transfer");
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

app.get("/", (req, res) => res.send("Hello World"));

const server = http.createServer(app);
const io = socketIo(server);

server.listen(PORT, HOSTNAME, () => console.log(`Listening on port ${PORT}`));

io.on("connection", socket => {
  console.log("New client connected");

  socket.on('disconnect', () => {
      console.log("Client disconnected");
  });
	socket.on("location-update", (message) => {
		console.log(message);
	});
})

module.exports = app;
