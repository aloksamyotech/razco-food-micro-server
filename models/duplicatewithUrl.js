const mongoose = require("mongoose");

const duplicateProductSchema = new mongoose.Schema(
    {
        productName: {
            type: String
        },
        price: {
            type: String
        },
        category: {
            type: String
        },
        subCategory: {
            type: String
        },
        productUrl: {
            type: String
        }
    },
    { timestamps: true }
);
const DuplicateProductUrl = mongoose.model("DuplicateProductUrl", duplicateProductSchema);

module.exports = DuplicateProductUrl;