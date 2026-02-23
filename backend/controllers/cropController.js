const crops = [
    {
        id: 1,
        name: "Rice (Paddy)",
        season: "Kharif",
        climate: "20–35°C, high rainfall",
        soil: "Clay / loamy, pH 5.5–7",
        sowing: "June–July (transplanting)",
        irrigation: "Standing water required",
        pest: "Stem borer, blast",
        harvest: "120–150 days",
        yield: "20–25 qtl/acre",
        market: "₹1800–2500/qtl",
        description: "Rice is the most important staple food crop in India. It requires a hot and humid climate with plenty of water. It is primarily a Kharif crop but can be grown in Rabi in areas with good irrigation.",
        farming_tips: [
            "Maintain standing water of 2-5 cm during the early growth stages.",
            "Use organic manure to improve soil fertility and water retention.",
            "Monitor for stem borer attacks early and use bio-pesticides like Neem oil.",
            "Harvest when 80% of the panicles turn golden yellow."
        ]
    },
    {
        id: 2,
        name: "Wheat",
        season: "Rabi",
        climate: "Cool, dry",
        soil: "Loamy, pH 6–7.5",
        sowing: "Oct–Nov",
        irrigation: "4–6 times",
        disease: "Rust",
        harvest: "March–April",
        yield: "18–22 qtl/acre",
        market: "₹2000–2600/qtl",
        description: "Wheat is a major Rabi crop, requiring cool weather for growth and warm weather for ripening. It thrives in well-drained loamy soil.",
        farming_tips: [
            "Ensure proper seed treatment before sowing to prevent soil-borne diseases.",
            "Apply irrigation at critical stages like crown root initiation and flowering.",
            "Watch out for yellow rust and use resistant varieties if possible.",
            "Rotate with legume crops to maintain soil nitrogen levels."
        ]
    },
    {
        id: 3,
        name: "Maize",
        season: "Kharif / Rabi",
        climate: "Warm",
        soil: "Well-drained loam",
        sowing: "June–July",
        irrigation: "As needed, critical at tasseling",
        pest: "Fall armyworm",
        harvest: "90–100 days",
        yield: "20–25 qtl/acre",
        market: "₹1700–2300/qtl",
        description: "Maize is widely cultivated for food, feed, and fodder. It is sensitive to water stagnation, so good drainage is key.",
        farming_tips: [
            "Ensure field is well-drained; maize cannot tolerate waterlogging.",
            "Apply nitrogen in split doses for better yield.",
            "Control Fall Armyworm using pheromone traps and recommended sprays.",
            "Harvest when the cob husk turns dry and pale."
        ]
    },
    {
        id: 4,
        name: "Barley",
        season: "Rabi",
        climate: "Cool & dry",
        soil: "Sandy loam",
        sowing: "Oct–Nov",
        irrigation: "2–3 times",
        harvest: "110–120 days",
        yield: "15–20 qtl/acre",
        description: "Barley is a hardy crop that can tolerate saline and alkaline soil conditions better than wheat. It is used for food and malt production.",
        farming_tips: [
            "Suitable for areas with limited water availability.",
            "Avoid excessive nitrogen application to prevent lodging.",
            "Harvest when the moisture content in grain is below 14%."
        ]
    },
    {
        id: 5,
        name: "Gram (Chana)",
        season: "Rabi",
        climate: "Dry, cool",
        soil: "Light loam",
        sowing: "Oct–Nov",
        irrigation: "1–2 times",
        pest: "Pod borer",
        harvest: "March–April",
        yield: "8–12 qtl/acre",
        description: "Bengal Gram or Chana is a major pulse crop. It enriches the soil by fixing atmospheric nitrogen.",
        farming_tips: [
            "Do not over-irrigate; it is sensitive to excess moisture.",
            "Nipping (pruning top leaves) at 30-40 days increases branching and yield.",
            "Use pheromone traps for Helicoverpa (Pod borer) management."
        ]
    },
    {
        id: 6,
        name: "Tur (Pigeon Pea)",
        season: "Kharif",
        climate: "Warm",
        soil: "Loamy",
        sowing: "June–July",
        irrigation: "Rainfed / 1-2 times",
        duration: "160–180 days",
        harvest: "Jan–Feb",
        yield: "8–10 qtl/acre",
        description: "Tur is a drought-tolerant crop and a major source of protein. It has a deep root system that helps in breaking hard soil pans.",
        farming_tips: [
            "Intercropping with soybean or groundnut is highly profitable.",
            "Avoid waterlogging during the seedling stage.",
            "Monitor for pod borer and plume moth during flowering."
        ]
    },
    {
        id: 7,
        name: "Masoor (Lentil)",
        season: "Rabi",
        climate: "Cool",
        soil: "Light loam",
        sowing: "Oct–Nov",
        irrigation: "1–2 times",
        harvest: "Feb–March",
        yield: "6–8 qtl/acre",
        description: "Masoor is a valuable pulse known for its quick cooking quality. It is grown on residual soil moisture in many areas.",
        farming_tips: [
            "Requires a weed-free field for the first 4–6 weeks.",
            "Can be grown as a relay crop in paddy fields.",
            "Harvest when plants turn yellow and pods are dry."
        ]
    },
    {
        id: 8,
        name: "Moong",
        season: "Kharif / Zaid",
        climate: "Warm",
        sowing: "June–July / March",
        irrigation: "3–4 times (Zaid)",
        duration: "60–70 days",
        harvest: "60–70 days",
        yield: "5–7 qtl/acre",
        description: "Moong is a short-duration pulse crop that fits well in crop rotations. It improves soil fertility.",
        farming_tips: [
            "Use yellow mosaic virus-resistant varieties.",
            "Pick pods as they mature to prevent shattering.",
            "Seed inoculation with Rhizobium culture increases yield."
        ]
    },
    {
        id: 9,
        name: "Soybean",
        season: "Kharif",
        soil: "Black soil",
        sowing: "June–July",
        irrigation: "Critical at pod filling",
        duration: "90–110 days",
        harvest: "Sep–Oct",
        yield: "10–15 qtl/acre",
        description: "Soybean is known as the 'Golden Bean' due to its high protein and oil content. It thrives in well-drained, fertile soils.",
        farming_tips: [
            "Maintain optimum plant population for high yield.",
            "Weed management is critical in the first 45 days.",
            "Harvest when leaves turn yellow and drop off."
        ]
    },
    {
        id: 10,
        name: "Mustard",
        season: "Rabi",
        climate: "Cool",
        soil: "Sandy loam",
        sowing: "Oct–Nov",
        irrigation: "2–3 times",
        harvest: "Feb–March",
        yield: "6–8 qtl/acre",
        description: "Mustard is a major oilseed crop. It requires cool weather for vegetative growth and warm weather for maturity.",
        farming_tips: [
            "Control aphids promptly as they can severely damage yield.",
            "Sulfur application improves oil content in seeds.",
            "Thinning of plants at 15-20 days helps in better growth."
        ]
    },
    {
        id: 11,
        name: "Groundnut",
        season: "Kharif",
        soil: "Sandy loam",
        sowing: "June–July",
        irrigation: "Critical at pegging",
        pest: "Leaf miner",
        harvest: "100–120 days",
        yield: "12–15 qtl/acre",
        description: "Groundnut is an important oilseed and food crop. It prefers sandy loam soils which facilitate pegging and pod development.",
        farming_tips: [
            "Earthing up should be done before pegging starts (45 days).",
            "Apply gypsum to improve pod filling.",
            "Control tikka disease using recommended fungicides."
        ]
    },
    {
        id: 12,
        name: "Cotton",
        season: "Kharif",
        climate: "Warm",
        soil: "Black",
        sowing: "May–June",
        irrigation: "4–6 times",
        duration: "150–180 days",
        harvest: "Oct–Dec",
        yield: "8–12 qtl/acre",
        description: "Cotton is the most important fiber crop, often called 'White Gold'. It requires a long frost-free period.",
        farming_tips: [
            "Manage sucking pests like aphids and jassids early on.",
            "Avoid water stress during the flowering and boll development stages.",
            "Pick cotton only when bolls are fully open and dry."
        ]
    },
    {
        id: 13,
        name: "Sugarcane",
        season: "Annual",
        climate: "Hot & humid",
        soil: "Deep loam",
        sowing: "Feb–March",
        irrigation: "Regular (15–20 times)",
        duration: "10–12 months",
        harvest: "Jan–March",
        yield: "30–40 tons/acre",
        description: "Sugarcane is a long-duration commercial cash crop. It requires heavy fertilization and regular irrigation.",
        farming_tips: [
            "Use healthy setts for planting to ensure good germination.",
            "Trash mulching helps in moisture conservation and weed control.",
            "Propping is needed to prevent lodging in grown-up crops."
        ]
    },
    {
        id: 14,
        name: "Jute",
        season: "Kharif",
        climate: "Hot & humid",
        soil: "Alluvial",
        sowing: "March–April",
        irrigation: "Rainfed",
        harvest: "July–Aug",
        yield: "18–25 qtl/acre",
        description: "Jute is a bast fiber used for making sacks and bags. It requires warm and humid climate with plenty of rainfall.",
        farming_tips: [
            "Harvest at the small pod stage for the best quality fiber.",
            "Retting in clean, slow-moving water is crucial for fiber quality.",
            "Weeding and thinning are important in the early stages."
        ]
    },
    {
        id: 15,
        name: "Potato",
        season: "Rabi",
        climate: "Cool",
        soil: "Sandy loam",
        sowing: "Oct–Nov",
        irrigation: "7–10 days interval",
        duration: "90–120 days",
        harvest: "Feb–March",
        yield: "80–100 qtl/acre",
        description: "Potato is a major tuber crop. It requires cool nights for tuberization and well-pulverized soil.",
        farming_tips: [
            "Earthing up helps in proper tuber development.",
            "Protect from late blight disease during foggy weather.",
            "Stop irrigation 10-15 days before harvesting to harden the skin."
        ]
    },
    {
        id: 16,
        name: "Onion",
        season: "Rabi / Kharif",
        climate: "Mild",
        soil: "Loamy",
        sowing: "Aug–Sep / Jan–Feb",
        irrigation: "Weekly",
        harvest: "100–150 days",
        yield: "100–150 qtl/acre",
        description: "Onion is a widely used vegetable for its pungent bulbs. It is sensitive to day length and temperature.",
        farming_tips: [
            "Transplant healthy seedlings of 6-8 weeks age.",
            "Maintain uniform moisture to prevent bulb splitting.",
            "Curing (drying) after harvest is essential for storage."
        ]
    },
    {
        id: 17,
        name: "Tomato",
        season: "All",
        climate: "Warm",
        sowing: "Aug–Sep / Nov–Dec",
        irrigation: "Regular/Drip",
        pest: "Fruit borer",
        harvest: "75–90 days (Green)",
        yield: "200–250 qtl/acre",
        description: "Tomato is a versatile vegetable grown year-round. It requires staking for indeterminate varieties.",
        farming_tips: [
            "Use trap crops like marigold to control fruit borers.",
            "Regular pruning improves fruit size and quality.",
            "Avoid water fluctuation to prevent blossom end rot."
        ]
    },
    {
        id: 18,
        name: "Banana",
        season: "Year-round",
        climate: "Tropical",
        sowing: "June–July",
        irrigation: "Regular (20–25 times)",
        duration: "12 months",
        harvest: "12–14 months",
        yield: "30–40 tons/acre",
        description: "Banana is a major fruit crop. It requires a lot of water and regular nutrient supply.",
        farming_tips: [
            "Use tissue culture plants for disease-free cultivation.",
            "Desuckering (removing side shoots) should be done regularly.",
            "Propping is essential to support heavy bunches."
        ]
    },
    {
        id: 19,
        name: "Mango",
        season: "Perennial",
        climate: "Tropical",
        sowing: "July–Aug (Planting)",
        irrigation: "Regular for young plants",
        harvest: "March–July",
        yield: "8–10 tons/acre",
        description: "Mango is the 'King of Fruits'. It requires a distinct dry season for flowering and fruit set.",
        farming_tips: [
            "Pruning of dead and diseased branches is important.",
            "Control mango hopper during flowering to prevent fruit drop.",
            "Regular irrigation is needed during fruit development."
        ]
    }
];

const getCrops = (req, res) => {
    res.json(crops);
};

const getCropById = (req, res) => {
    const crop = crops.find(c => c.id === parseInt(req.params.id));
    if (crop) {
        res.json(crop);
    } else {
        res.status(404).json({ message: 'Crop not found' });
    }
};

module.exports = { getCrops, getCropById, crops };
