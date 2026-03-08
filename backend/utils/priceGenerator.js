const crypto = require('crypto');

const crops = [
    { crop: 'Wheat', min: 2000, max: 2600 },
    { crop: 'Rice', min: 2500, max: 3500 },
    { crop: 'Maize', min: 1800, max: 2200 },
    { crop: 'Bajra', min: 2000, max: 2400 },
    { crop: 'Jowar', min: 2500, max: 3000 },
    { crop: 'Barley', min: 1800, max: 2100 },
    { crop: 'Soybean', min: 3500, max: 5000 },
    { crop: 'Cotton', min: 6000, max: 8000 },
    { crop: 'Groundnut', min: 5000, max: 6500 },
    { crop: 'Mustard', min: 4500, max: 5500 },
    { crop: 'Sunflower', min: 4000, max: 5500 },
    { crop: 'Tur (Arhar Dal)', min: 8000, max: 10000 },
    { crop: 'Chana (Gram)', min: 5000, max: 6500 },
    { crop: 'Moong', min: 7000, max: 8500 },
    { crop: 'Urad', min: 7500, max: 9000 },
    { crop: 'Onion', min: 800, max: 2000 },
    { crop: 'Potato', min: 700, max: 1500 },
    { crop: 'Tomato', min: 1000, max: 2500 },
    { crop: 'Sugarcane', min: 300, max: 450 },
    { crop: 'Banana', min: 1500, max: 3000 }
];

// Seeded random number generator so that the same date+mandi always returns the same prices
// This makes the mock data feel "real" as it won't jump around on every single refresh 
// unless we intentionally add a small noise factor later if desired.
function generateSeededPrices(seedString) {
    // Generate a quick hash from the seed string to use as integer base
    const hash = crypto.createHash('md5').update(seedString).digest('hex');

    // We will take chunks of the hash to create pseudo-random values 0-1
    return crops.map((c, index) => {
        // use different parts of hash for each crop
        const hashSegment = hash.substring((index % 12) * 2, (index % 12) * 2 + 6);
        const randomFactor = parseInt(hashSegment, 16) / 0xFFFFFF; // value between 0 and 1

        // Let's add slight variations
        const minPrice = Math.floor(c.min + (c.max - c.min) * 0.2 * randomFactor);
        const maxPrice = Math.floor(c.max - (c.max - c.min) * 0.2 * randomFactor);

        // Modal is somewhere in the middle
        const modalPrice = Math.floor(minPrice + (maxPrice - minPrice) * (0.3 + 0.4 * randomFactor));

        return {
            crop: c.crop,
            minPrice: minPrice,
            maxPrice: maxPrice,
            modalPrice: modalPrice
        };
    });
}

// Generate the final response object
function generateMandiData(state, district, mandi, dateStr) {
    try {
        const hardcodedData = require('../data/MandiBhav.js');
        const match = hardcodedData.find(item =>
            item.state === state &&
            item.district === district &&
            item.mandi === mandi &&
            item.date === dateStr
        );

        if (match) {
            return match;
        }
    } catch (e) {
        // Ignore if file doesn't exist or has errors
        console.error("Error loading MandiBhav config:", e);
    }

    const seed = `${state}-${district}-${mandi}-${dateStr}`;
    const generatedPrices = generateSeededPrices(seed);

    return {
        state,
        district,
        mandi,
        date: dateStr,
        prices: generatedPrices
    };
}

module.exports = { generateMandiData };
