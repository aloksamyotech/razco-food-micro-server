const mongoose = require("mongoose");

const duplicateProductSchema = new mongoose.Schema(
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
const DuplicateProduct = mongoose.model("DuplicateProduct", duplicateProductSchema);

module.exports = DuplicateProduct;