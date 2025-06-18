// const axios = require('axios');

// const payload = {
//     api_key: 'bda1166764c34d3432e7e758faaeb763',
//     url: 'https://www.instacart.com/products/42556-totino-s-pepperoni-party-pizza-frozen-pizza-10-200-oz?retailerSlug=razco-foods-supermarket', // Put your target URL here
//     render: true
// };

// axios.get('https://api.scraperapi.com/', { params: payload })
//     .then(response => {
//         console.log(response.data);
//     })
//     .catch(error => {
//         console.error('Error fetching data:', error.message);
//     });


const axios = require('axios');
const cheerio = require('cheerio');

// const scrapeProductDetailsFromScrapAPI = async (productUrl) => {
//     if (!productUrl) throw new Error("No productUrl provided");

//     const productPageUrl = `https://www.instacart.com${productUrl}`;
//     console.log(`🔗 Fetching product page via ScraperAPI: ${productPageUrl}`);

//     const payload = {
//         api_key: '94b9e86359f8cb0d6f148f54d2386c9e',
//         url: productPageUrl,
//         render: true,
//         session_number: Math.floor(Math.random() * 100000)
//     };

//     try {
//         const res = await axios.get('https://api.scraperapi.com/', { params: payload });
//         const $ = cheerio.load(res.data); // parse HTML with Cheerio

//         // 🔍 Extract image URLs
//         const imageList = [];
//         $('li.e-1s9gh2j').each((_, li) => {
//             $(li).find('img').each((_, img) => {
//                 const src = $(img).attr('src') || $(img).data('src');
//                 if (src && !imageList.includes(src)) {
//                     imageList.push(src);
//                 }
//             });
//         });

//         const mainImg = $('.ic-image-zoomer img').attr('src');
//         if (mainImg && !imageList.includes(mainImg)) {
//             imageList.unshift(mainImg);
//         }

//         // 📦 Extract text sections
//         const getSectionText = (title) => {
//             let sectionText = null;
//             $('.e-1d3w5wq').each((_, section) => {
//                 const h2 = $(section).find('h2').first().text().trim().toLowerCase();
//                 if (h2 === title.toLowerCase()) {
//                     sectionText = $(section).find('p').map((_, p) => $(p).text().trim()).get().join(' ');
//                 }
//             });
//             return sectionText;
//         };

//         const getWarningText = () => {
//             let text = null;
//             $('div').each((_, div) => {
//                 const h2 = $(div).find('h2').first().text().trim().toLowerCase();
//                 if (h2 === 'warnings') {
//                     text = $(div).find('p').map((_, p) => $(p).text().trim()).get().join(' ');
//                 }
//             });
//             return text;
//         };

//         const getSize = () => {
//             return $('.e-k008qs .e-f17zur').text().trim() || null;
//         };

//         const productDetail = {
//             allImages: imageList,
//             details: getSectionText('Details'),
//             ingredients: getSectionText('Ingredients'),
//             directions: getSectionText('Directions'),
//             warnings: getWarningText(),
//             size: getSize()
//         };

//         console.log("✅ Extracted Product Detail:", productDetail);
//         return productDetail;

//     } catch (error) {
//         console.error(`❌ Failed to scrape product page ${productPageUrl}`, error.message);
//         return null;
//     }
// };

const scrapeProductDetailsFromScrapAPI = async (productUrl) => {
    if (!productUrl) throw new Error("No productUrl provided");

    const productPageUrl = `https://www.instacart.com${productUrl}`;
    console.log(`🔗 Fetching product page via ScraperAPI: ${productPageUrl}`);

    const payload = {
        api_key: '94b9e86359f8cb0d6f148f54d2386c9e',
        url: productPageUrl,
        render: true,
        session_number: Math.floor(Math.random() * 100000)
    };

    try {
        const res = await axios.get('https://api.scraperapi.com/', { params: payload });
        const html = res.data;
        const $ = cheerio.load(html);

        // 🧠 Try to find the window.__INITIAL_STATE__ script block
        const scriptContent = $('script')
            .map((_, el) => $(el).html())
            .get()
            .find(content => content && content.includes('__INITIAL_STATE__'));

        let allImages = [];
        if (scriptContent) {
            const jsonString = scriptContent.match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/s);
            if (jsonString && jsonString[1]) {
                const state = JSON.parse(jsonString[1]);
                const productData = Object.values(state.entities.products || {})[0];
                if (productData && productData.item && productData.item.images) {
                    allImages = productData.item.images.map(img => img.url);
                }
            }
        }

        // Fallback to DOM scraping in case script block fails
        if (allImages.length === 0) {
            $('li.e-1s9gh2j img').each((_, img) => {
                const src = $(img).attr('src') || $(img).data('src');
                if (src && !allImages.includes(src)) allImages.push(src);
            });

            const mainImg = $('.ic-image-zoomer img').attr('src');
            if (mainImg && !allImages.includes(mainImg)) {
                allImages.unshift(mainImg);
            }
        }

        const getSectionText = (title) => {
            let sectionText = null;
            $('.e-1d3w5wq').each((_, section) => {
                const h2 = $(section).find('h2').first().text().trim().toLowerCase();
                if (h2 === title.toLowerCase()) {
                    sectionText = $(section).find('p').map((_, p) => $(p).text().trim()).get().join(' ');
                }
            });
            return sectionText;
        };

        const getWarningText = () => {
            let text = null;
            $('div').each((_, div) => {
                const h2 = $(div).find('h2').first().text().trim().toLowerCase();
                if (h2 === 'warnings') {
                    text = $(div).find('p').map((_, p) => $(p).text().trim()).get().join(' ');
                }
            });
            return text;
        };

        const getSize = () => {
            return $('.e-k008qs .e-f17zur').text().trim() || null;
        };

        const productDetail = {
            allImages,
            details: getSectionText('Details'),
            ingredients: getSectionText('Ingredients'),
            directions: getSectionText('Directions'),
            warnings: getWarningText(),
            size: getSize()
        };

        console.log("✅ Extracted Product Detail:", productDetail);
        return productDetail;

    } catch (error) {
        console.error(`❌ Failed to scrape product page ${productPageUrl}`, error.message);
        return null;
    }
};

module.exports = scrapeProductDetailsFromScrapAPI;