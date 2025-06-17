const puppeteer = require('puppeteer');

// const scrapeProductDetails = async (productUrl) => {
//     if (!productUrl) throw new Error("No productUrl provided");

//     const productPageUrl = `https://www.instacart.com${productUrl}`;
//     console.log(`🔗 Visiting product page: ${productPageUrl}`);

//     const browser = await puppeteer.launch({ headless: true });
//     const page = await browser.newPage();

//     try {
//         await page.goto(productPageUrl, {
//             waitUntil: "domcontentloaded",
//             timeout: 60000,
//         });

//         await page.waitForSelector(".e-sry5x7 ul.e-grl6el", { timeout: 10000 });

//         try {
//             await page.waitForSelector(".e-1d3w5wq", { timeout: 5000 });
//         } catch {
//             console.log("ℹ️ Detail sections not found, continuing...");
//         }

//         const productDetail = await page.evaluate(() => {
//             const imageList = [];

//             const liElements = document.querySelectorAll('li.e-1s9gh2j');
//             liElements.forEach(li => {
//                 li.querySelectorAll('img').forEach(img => {
//                     const src = img.getAttribute('src');
//                     if (src) imageList.push(src);
//                 });
//             });

//             const mainImage = document.querySelector('.ic-image-zoomer img');
//             if (mainImage) {
//                 const mainSrc = mainImage.getAttribute('src');
//                 if (mainSrc && !imageList.includes(mainSrc)) {
//                     imageList.unshift(mainSrc);
//                 }
//             }

//             function getSectionText(title) {
//                 const section = Array.from(document.querySelectorAll('.e-1d3w5wq')).find(sec => {
//                     const heading = sec.querySelector('h2');
//                     return heading && heading.textContent.trim().toLowerCase() === title.toLowerCase();
//                 });
//                 if (section) {
//                     return Array.from(section.querySelectorAll('p'))
//                         .map(p => p.textContent.trim())
//                         .join(' ');
//                 }
//                 return null;
//             }

//             function getWarningText() {
//                 const section = Array.from(document.querySelectorAll('div')).find(div => {
//                     const h2 = div.querySelector('h2');
//                     return h2 && h2.textContent.trim().toLowerCase() === 'warnings';
//                 });
//                 if (section) {
//                     return Array.from(section.querySelectorAll('p'))
//                         .map(p => p.textContent.trim())
//                         .join(' ');
//                 }
//                 return null;
//             }

//             function getSize() {
//                 const sizeEl = document.querySelector('.e-k008qs .e-f17zur');
//                 return sizeEl ? sizeEl.textContent.trim() : null;
//             }

//             return {
//                 allImages: imageList,
//                 details: getSectionText('Details'),
//                 ingredients: getSectionText('Ingredients'),
//                 directions: getSectionText('Directions'),
//                 warnings: getWarningText(),
//                 size: getSize(),
//             };
//         });
//         console.log("productDetail===============>", productDetail);
//         return productDetail;

//     } catch (error) {
//         console.warn(`⚠️ Failed to scrape product page ${productPageUrl}`, error);
//         return null;
//     } finally {
//         await browser.close();
//     }
// };

const scrapeProductDetails = async (productUrl) => {
    if (!productUrl) throw new Error("No productUrl provided");

    const productPageUrl = `https://www.instacart.com${productUrl}`;
    console.log(`🔗 Visiting product page: ${productPageUrl}`);

    const MAX_ATTEMPTS = 4;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        console.log(`🕵️ Attempt ${attempt} of ${MAX_ATTEMPTS}`);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
        });
        const page = await browser.newPage();

        try {
            await page.goto(productPageUrl, {
                waitUntil: "domcontentloaded",
                timeout: 1000000,
            });

            await page.waitForSelector(".e-sry5x7 ul.e-grl6el", { timeout: 10000 });

            try {
                await page.waitForSelector(".e-1d3w5wq", { timeout: 5000 });
            } catch {
                console.log("ℹ️ Detail sections not found, continuing...");
            }

            const productDetail = await page.evaluate(() => {
                const imageList = [];

                const liElements = document.querySelectorAll('li.e-1s9gh2j');
                liElements.forEach(li => {
                    li.querySelectorAll('img').forEach(img => {
                        const src = img.getAttribute('src');
                        if (src) imageList.push(src);
                    });
                });

                const mainImage = document.querySelector('.ic-image-zoomer img');
                if (mainImage) {
                    const mainSrc = mainImage.getAttribute('src');
                    if (mainSrc && !imageList.includes(mainSrc)) {
                        imageList.unshift(mainSrc);
                    }
                }

                function getSectionText(title) {
                    const section = Array.from(document.querySelectorAll('.e-1d3w5wq')).find(sec => {
                        const heading = sec.querySelector('h2');
                        return heading && heading.textContent.trim().toLowerCase() === title.toLowerCase();
                    });
                    if (section) {
                        return Array.from(section.querySelectorAll('p'))
                            .map(p => p.textContent.trim())
                            .join(' ');
                    }
                    return null;
                }

                function getWarningText() {
                    const section = Array.from(document.querySelectorAll('div')).find(div => {
                        const h2 = div.querySelector('h2');
                        return h2 && h2.textContent.trim().toLowerCase() === 'warnings';
                    });
                    if (section) {
                        return Array.from(section.querySelectorAll('p'))
                            .map(p => p.textContent.trim())
                            .join(' ');
                    }
                    return null;
                }

                function getSize() {
                    const sizeEl = document.querySelector('.e-k008qs .e-f17zur');
                    return sizeEl ? sizeEl.textContent.trim() : null;
                }

                return {
                    allImages: imageList,
                    details: getSectionText('Details'),
                    ingredients: getSectionText('Ingredients'),
                    directions: getSectionText('Directions'),
                    warnings: getWarningText(),
                    size: getSize(),
                };
            });

            console.log(`🖼️ Found ${productDetail.allImages.length} images`);
            console.log(`📝 Extracted details:`, productDetail);

            if (productDetail.details) {
                return productDetail;
            } else {
                console.warn(`⚠️ 'details' is null on attempt ${attempt}, retrying...`);
            }

        } catch (error) {
            console.warn(`⚠️ Failed to scrape product page ${productPageUrl} on attempt ${attempt}`, error);
        } finally {
            await browser.close();
        }
    }

    console.error(`❌ All ${MAX_ATTEMPTS} attempts failed to get 'details'`);
    return null;
};

module.exports = scrapeProductDetails;