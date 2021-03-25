const mongoose = require("mongoose");

const SubCategorySchema = new mongoose.Schema({
  categoryID: { type: mongoose.Schema.Types.ObjectId, ref: "categorys" },
  name: String,
});

module.exports = mongoose.model("subCategorys", SubCategorySchema);

// mongoose.model("subCategorys", SubCategorySchema);
