import { useState } from 'react';
import { getInputAdvisory } from '../../services/advisoryService';
import CropResult from './CropResult';
import FertilizerGuide from './FertilizerGuide';

const AdvisoryResults = ({ crops }) => {
    const [selectedCrop, setSelectedCrop] = useState(null);
    const [advisoryData, setAdvisoryData] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch details when a crop is clicked
    const handleCropClick = async (crop) => {
        if (selectedCrop?.id === crop.id) {
            setSelectedCrop(null); // Toggle off
            setAdvisoryData(null);
            return;
        }

        setSelectedCrop(crop);
        setLoading(true);
        const data = await getInputAdvisory(crop.id);
        setAdvisoryData(data);
        setLoading(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-green-700 mb-6 border-b pb-2">Step 2: Recommended Crops</h2>

            {/* List of Crops */}
            <CropResult
                crops={crops}
                selectedCrop={selectedCrop}
                onCropClick={handleCropClick}
            />

            {/* Detailed Advisory for Selected Crop */}
            <FertilizerGuide
                selectedCrop={selectedCrop}
                advisoryData={advisoryData}
                loading={loading}
            />
        </div>
    );
};

export default AdvisoryResults;

// End of file
