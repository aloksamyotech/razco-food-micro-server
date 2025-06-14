const mongoose = require("mongoose");

const newProductSchema = new mongoose.Schema(
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
const NewProduct = mongoose.model("newProduct", newProductSchema);

module.exports = NewProduct;