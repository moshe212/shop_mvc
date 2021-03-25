const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  UserName: String,
  Password: Number,
  LastNmme: String,
  FirstName: String,
  Title: String,
  BirthDate: Date,
  HireDate: Date,
  Address: String,
  City: String,
  Region: String,
  PostalCode: String,
  HomePhone: String,
  CellPhone: String,
  Notes: String,
  Admin: Boolean,
});

module.exports = mongoose.model("User", UserSchema);

// mongoose.model("User", UserSchema);
