const { crops } = require('./cropController');

const getSeasonCrops = (req, res) => {
    const { season } = req.body;

    if (!season) {
        return res.status(400).json({ message: "Season is required" });
    }

    // Filter crops that include the requested season (case-insensitive)
    const filteredCrops = crops.filter(crop =>
        crop.season && crop.season.toLowerCase().includes(season.toLowerCase())
    );

    res.json(filteredCrops);
};

module.exports = { getSeasonCrops };
