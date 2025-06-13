const mongoose = require("mongoose");
 
const subcategorySchema = new mongoose.Schema(
  {
    subcategoryName: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
    },
    subcategoryImage: {
      type: String,
      required: true,
    },
    clickedCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);
 
const SubCategory = mongoose.model("SubCategory", subcategorySchema);
 
module.exports = SubCategory;
 