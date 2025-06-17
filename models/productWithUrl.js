const mongoose = require("mongoose");

const newProductUrlSchema = new mongoose.Schema(
    {
        productName: {
            type: String
        },
        price: {
            type: String
        },
        productImage: {
            type: [String],
            default: null
        },
        category: {
            type: String
        },
        subCategory: {
            type: String
        },
        productUrl: {
            type: String,
            default: null
        },
        details: {
            type: String,
            default: null
        },
        ingredients: {
            type: String,
            default: null
        },
        Directions: {
            type: String,
            default: null
        },
        Warnings: {
            type: String,
            default: null
        },
        size: {
            type: String,
            default: null
        }
    },
    { timestamps: true }
);
const NewProductUrl = mongoose.model("newProductUrl", newProductUrlSchema);

module.exports = NewProductUrl;