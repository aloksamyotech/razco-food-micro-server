require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Product = require('./models/meatData');
const Category = require('./models/category');
const SubCategory = require('./models/subCategory');
const DuplicateProduct = require('./models/duplicateProduct');
const NewProduct = require('./models/newProduct');
const axios = require("axios");
const DuplicateProductUrl = require('./models/duplicatewithUrl');
const NewProductUrl = require('./models/productWithUrl');
const scrapeProductDetails = require('./helper/scrap');

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI2, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

app.get('/', async (req, res) => {
    // await SubCategory.create({
    //     subcategoryName: "gfh",
    //     slug: "dasa",
    //     subcategoryImage: "sadsa",
    //     category: '6798a4ced507edc43cd84398',

    // })

    // try {
    //     const result = await NewProduct.updateMany(
    //         {

    //             category: "Canned Tomatoes"
    //         },
    //         { $set: { category: "Canned Goods & Soups" } }
    //     );

    //     console.log(`✅ Updated ${result.modifiedCount} products`);
    // } catch (error) {
    //     console.error("❌ Error updating subCategory:", error);
    // }
    res.send('Hello from Node.js + MongoDB server!');
});


// app.post('/meatData', async (req, res) => {
//     const payload = req.body;

//     console.log("req body======>", req.body);

//     if (!payload) {
//         return res.status(201).json({
//             success: true
//         });
//     }

//     try {
//         for (const item of payload) {
//             if (item.image_urls && item.image_urls.length > 0) {

//                 const categoryData = await Category.findOne({
//                     name: { $regex: new RegExp(`^${item.categoryName}$`, "i") },
//                 });

//                 if (!categoryData) continue;

//                 const existingProduct = await Product.findOne({
//                     productName: { $regex: new RegExp(`^${item.productName}$`, "i") }
//                 });

//                 if (existingProduct) {
//                     console.log(`⚠️ Skipped duplicate product: ${item.productName}`);
//                     continue;
//                 }

//                 let payload = {
//                     productName: item.productName || "",
//                     productImage: item?.image_urls || [],
//                     slug: item.productName
//                         ?.toLowerCase()
//                         .replace(/\s+/g, "-"),
//                     price: item.price,
//                     category: categoryData._id,
//                     subCategory: item.subcategoryName,
//                 };
//                 const result = await Product.create(payload);
//                 if (result) {
//                     console.log(`✅ Product created: ${result.productName}`);
//                 }
//             }
//         }
//         return res.status(201).json({
//             success: true
//         });
//     } catch (error) {
//         console.error(error);
//     }
// })


app.post('/meatData', async (req, res) => {
    const payload = req.body;

    // console.log("req body ======>", payload);

    if (!Array.isArray(payload) || payload.length === 0) {
        return res.status(200).json({
            success: true
        });
    }

    try {
        // Cache categories to reduce repeated DB calls
        // const categoryCache = new Map();

        for (const item of payload) {
            console.log("processing item ==========>", item.productName);
            // if (!item.image_urls || item.image_urls.length === 0) {
            //     console.log("image url not found ====>", item);
            //     continue;
            // };

            // const categoryNameKey = item.categoryName.toLowerCase();

            // let categoryData = categoryCache.get(categoryNameKey);
            // if (!categoryData) {
            //     categoryData = await Category.findOne({
            //         name: { $regex: new RegExp(`^${item.categoryName}$`, "i") },
            //     });
            //     if (!categoryData) {
            //         console.log("categoryData not found ====>", item);
            //         continue;
            //     };;
            //     categoryCache.set(categoryNameKey, categoryData);
            // }

            const existingProduct = await Product.findOne({
                productName: { $regex: new RegExp(`^${item.productName}$`, "i") }
            });

            if (existingProduct) {
                await DuplicateProduct.create({
                    productName: item.productName || "",
                    productImage: item.image_urls || [],
                    slug: item.productName?.toLowerCase().replace(/\s+/g, "-") || "",
                    price: item.price || 0,
                    category: item.categoryName,
                    subCategory: item.subcategoryName || "",
                })
                console.log(`⚠️ Skipped duplicate product: ${item.productName}`);
                continue;
            }

            const productData = {
                productName: item.productName || "",
                productImage: item.image_urls || [],
                slug: item.productName?.toLowerCase().replace(/\s+/g, "-") || "",
                price: item.price || 0,
                category: item.categoryName,
                subCategory: item.subcategoryName || "",
            };

            const result = await Product.create(productData);
            if (result) {
                console.log(`✅ Product created: ${result.productName}`);
            }
        }

        console.log("Processed Product ==========>", payload.length);

        return res.status(201).json({ success: true });
    } catch (error) {
        console.error("❌ Error creating products:", error);
        return res.status(500).json({ success: false, error: "Server Error" });
    }
});

app.post('/newProduct', async (req, res) => {
    const payload = req.body;

    // console.log("req body ======>", payload);

    if (!Array.isArray(payload) || payload.length === 0) {
        return res.status(200).json({
            success: true
        });
    }

    try {
        // Cache categories to reduce repeated DB calls
        // const categoryCache = new Map();

        for (const item of payload) {
            console.log("processing item ==========>", item.productName);
            // if (!item.image_urls || item.image_urls.length === 0) {
            //     console.log("image url not found ====>", item);
            //     continue;
            // };

            // const categoryNameKey = item.categoryName.toLowerCase();

            // let categoryData = categoryCache.get(categoryNameKey);
            // if (!categoryData) {
            //     categoryData = await Category.findOne({
            //         name: { $regex: new RegExp(`^${item.categoryName}$`, "i") },
            //     });
            //     if (!categoryData) {
            //         console.log("categoryData not found ====>", item);
            //         continue;
            //     };;
            //     categoryCache.set(categoryNameKey, categoryData);
            // }

            const existingProduct = await NewProduct.findOne({
                productName: { $regex: new RegExp(`^${item.productName}$`, "i") }
            });

            if (existingProduct) {
                await DuplicateProduct.create({
                    productName: item.productName || "",
                    productImage: item.image_urls || [],
                    slug: item.productName?.toLowerCase().replace(/\s+/g, "-") || "",
                    price: item.price || 0,
                    category: item.categoryName,
                    subCategory: item.subcategoryName || "",
                })
                console.log(`⚠️ Skipped duplicate product: ${item.productName}`);
                continue;
            }

            const productData = {
                productName: item.productName || "",
                productImage: item.image_urls || [],
                slug: item.productName?.toLowerCase().replace(/\s+/g, "-") || "",
                price: item.price || 0,
                category: item.categoryName,
                subCategory: item.subcategoryName || "",
            };

            const result = await NewProduct.create(productData);
            if (result) {
                console.log(`✅ Product created: ${result.productName}`);
            }
        }

        console.log("Processed Product ==========>", payload.length);

        return res.status(201).json({ success: true });
    } catch (error) {
        console.error("❌ Error creating products:", error);
        return res.status(500).json({ success: false, error: "Server Error" });
    }
});

app.post('/newProductUrl', async (req, res) => {
    const payload = req.body;

    // console.log("req body ======>", payload);

    if (!Array.isArray(payload) || payload.length === 0) {
        return res.status(200).json({
            success: true
        });
    }

    try {

        for (const item of payload) {
            console.log("processing item ==========>", item.productName);

            const existingProduct = await NewProductUrl.findOne({
                productName: { $regex: new RegExp(`^${item.productName}$`, "i") }
            });

            if (existingProduct) {
                await DuplicateProductUrl.create({
                    productName: item.productName || "",
                    price: item.price || 0,
                    category: item.categoryName,
                    subCategory: item.subcategoryName || "",
                    productUrl: item.productUrl || ""
                })
                console.log(`⚠️ Skipped duplicate product: ${item.productName}`);
                continue;
            }

            const productData = {
                productName: item.productName || "",
                price: item.price || 0,
                category: item.categoryName,
                subCategory: item.subcategoryName || "",
                productUrl: item.productUrl || ""
            };

            const result = await NewProductUrl.create(productData);
            if (result) {
                console.log(`✅ Product created: ${result.productName}`);
            }
        }

        console.log("Processed Product ==========>", payload.length);

        return res.status(201).json({ success: true });
    } catch (error) {
        console.error("❌ Error creating products:", error);
        return res.status(500).json({ success: false, error: "Server Error" });
    }
});

const BATCH_SIZE = 50;
const TARGET_API_URL = 'http://localhost:3015/api/v1/product/new-scraped-data';

async function sendProductsInBatches() {
    let skip = 0;
    let hasMore = true;

    while (hasMore) {
        const products = await NewProduct.find({
            category: "Meat & Seafood"
        }).skip(skip).limit(BATCH_SIZE).lean();

        if (products.length === 0) {
            console.log("✅ All products have been sent.");
            break;
        }

        for (const product of products) {
            try {
                await axios.post(TARGET_API_URL, product);
                console.log(`✅ Sent product: ${product.productName}`);
            } catch (error) {
                console.error(`❌ Failed to send product ${product.productName}:`, error.message);

            }
        }

        skip += BATCH_SIZE;
        hasMore = products.length === BATCH_SIZE;
    }
}
// sendProductsInBatches();


async function scrapeProduct(start = 0, end = Infinity) {
    let skip = start;
    let hasMore = true;

    while (hasMore && skip < end) {
        const limit = Math.min(BATCH_SIZE, end - skip); // Prevent reading beyond the end
        const products = await NewProductUrl.find().skip(skip).limit(limit).lean();

        if (products.length === 0) {
            console.log("✅ All products in range have been processed.");
            break;
        }

        for (const product of products) {
            try {
                console.log("scraping for------->", product?.productName);
                const productData = await scrapeProductDetails(product?.productUrl);

                const {
                    allImages,
                    details,
                    ingredients,
                    directions,
                    warnings,
                    size
                } = productData;

                await NewProductUrl.findByIdAndUpdate(
                    product._id,
                    {
                        productImage: allImages,
                        details,
                        ingredients,
                        Directions: directions,
                        Warnings: warnings,
                        size
                    }
                );

                console.log(`✅ saved productData: ${product._id}`);
            } catch (error) {
                console.error(`❌ Failed to save productData for ${product._id} (${product.productUrl}):`, error.message);
            }
        }

        skip += BATCH_SIZE;
        hasMore = products.length === BATCH_SIZE;
    }

    console.log("✅ Processed all product in your range. ✅");
}

scrapeProduct(0, 2);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});