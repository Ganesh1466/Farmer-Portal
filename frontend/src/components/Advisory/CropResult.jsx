import React from 'react';
import { FaLeaf, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const CropResult = ({ crops, selectedCrop, onCropClick }) => {
    if (!crops || crops.length === 0) {
        return (
            <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-center">
                <p className="text-yellow-800 font-medium">No suitable crops found for these conditions. Try adjusting the Soil Type or pH.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
                <div
                    key={crop.id}
                    className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-300 ${selectedCrop?.id === crop.id ? 'border-green-600 bg-green-50 shadow-md' : 'border-gray-200 hover:border-green-400 hover:shadow'}`}
                    onClick={() => onCropClick(crop)}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{crop.crop_name}</h3>
                        <FaLeaf className="text-green-500" />
                    </div>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Season:</span> {crop.season}</p>
                    <p className="text-sm text-gray-600"><span className="font-semibold">Duration:</span> {crop.duration_days} days</p>

                    <div className="mt-4 flex justify-between items-center text-green-700 font-semibold text-sm">
                        <span>View Advisory</span>
                        {selectedCrop?.id === crop.id ? <FaChevronUp /> : <FaChevronDown />}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CropResult;
