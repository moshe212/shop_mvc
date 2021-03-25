const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: String,
  image: String,
  quantity: Number,
  price: Number,
  subCategoryID: { type: mongoose.Schema.Types.ObjectId, ref: "subCategorys" },
  mainCategoryID: { type: mongoose.Schema.Types.ObjectId, ref: "categorys" },
});

module.exports = mongoose.model("Product", ProductSchema);
// mongoose.model("Product", ProductSchema);
