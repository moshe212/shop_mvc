const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  UserName: String,
  Password: String,
  FullName: String,
  Home: String,
  Street: String,
  City: String,
  Telephone: Number,
  CellPhone: Number,
});

module.exports = mongoose.model("Customer", CustomerSchema);

// mongoose.model("Customer", CustomerSchema);
