const mongoose = require("mongoose");

const User = require("./User.js").default;
const Order = require("./Order.js");
const Customer = require("./Customer.js");
const SubCategory = require("./SubCategory.js").default;
const Category = require("./Category.js");
const Product = require("./Product.js").default;

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

const models = { User, Order, Customer, SubCategory, Category, Product };

module.exports = { models };
// module.exports = { connectToDB };
