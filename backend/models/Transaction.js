const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  isSold: Boolean,
  category: String,
});

module.exports = mongoose.model("Transaction", TransactionSchema);
