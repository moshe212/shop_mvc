const http = require("http");
const socketIo = require("socket.io");
const express = require("express");
const fs = require("fs");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const csv = require("csvtojson");
const utf8 = require("utf8");
const dotenv = require("dotenv");
const server = http.createServer(app);
const io = socketIo.listen(server);
const mongoose = require("mongoose");
const autoIncrement = require("mongoose-auto-increment");

const { models } = require("./models");
// const { connectToDB } = require("./models");

// const OrderDetails = mongoose.model("OrderDetails", OrderDetailsSchema);

dotenv.config();
app.use(bodyParser.json());

app.use(cors());
app.use(require("./routes"));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "Client/build")));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}

let Mongo_Path = process.env.Mongo_Path;

function connectToDB() {
  // const connection = mongoose.connect("mongodb://localhost/Shop", {

  const connection = mongoose.connect(Mongo_Path, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
  // autoIncrement.initialize(connection);
  // ProductSchema.plugin(autoIncrement.plugin, "Product");

  return connection;
}

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// Category.find({}).then((res) => {
//   console.log(res);
// });

//עדכון מלאי
// app.put("/UpdateQuantity/:id", async (req, res) => {
//   // console.log(req.query);
//   // console.log(req.body);
//   const productId = req.params.id;
//   const Quantity = +req.body.quantity;
//   console.log(productId);
//   Product.findByIdAndUpdate(
//     productId,
//     { $set: { ...req.body } },
//     // (options.new = true),
//     (err, prod) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log("update", prod);
//       }
//     }
//   );

//   productItems = await Product.find().exec();

//   res.send(productItems);
//   io.emit("UpdateQuantity", { id: productId, quantity: Quantity });
// });

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/Client/build/index.html"));
});

connectToDB().then(() => {
  server.listen(port, () => {
    console.log("Example app listening on port " + port);
  });
});
