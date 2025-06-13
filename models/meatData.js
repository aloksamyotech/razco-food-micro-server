const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String
    },
    price: {
      type: String
    },
    productImage: {
      type: [String]
    },
    slug: {
      type: String
    },
    category: {
      type: String
    },
    subCategory: {
      type: String
    }
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);

module.exports = Product;