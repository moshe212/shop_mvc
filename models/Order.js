const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  CustomerID: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  Products: [
    {
      productid: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  OrderDate: Date,
  RequiredDate: Date,
  ShippedDate: Date,
  ShipStreet: String,
  ShipHome: String,
  ShipCity: String,
  Status: Boolean,
  TotalAmount: Number,
});

module.exports = mongoose.model("Order", OrderSchema);
// mongoose.model("Order", OrderSchema);
