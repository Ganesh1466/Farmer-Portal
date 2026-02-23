import { useRef, useEffect } from 'react';
import { FaFlask, FaSprayCan } from 'react-icons/fa';

const FertilizerGuide = ({ selectedCrop, advisoryData, loading }) => {
    const advisoryRef = useRef(null);

    // Auto-scroll to advisory details when opened
    useEffect(() => {
        if (selectedCrop && advisoryRef.current) {
            setTimeout(() => {
                advisoryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [selectedCrop]);

    if (!selectedCrop) return null;

    return (
        <div
            ref={advisoryRef}
            className="mt-8 bg-green-100 rounded-xl p-6 border border-green-200 animate-fade-in-up"
        >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Advisory for {selectedCrop.crop_name}</h3>

            {loading ? (
                <p className="text-gray-600">Loading specific advisory...</p>
            ) : advisoryData && advisoryData.length > 0 ? (
                <div className="space-y-6">
                    {advisoryData.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                                    <FaFlask />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800">Fertilizer Recommendation</h4>
                                    <p className="text-gray-700"><strong>Name:</strong> {item.fertilizer_name}</p>
                                    <p className="text-gray-700"><strong>Dosage:</strong> {item.dosage_per_acre} per acre</p>
                                    <p className="text-gray-600 text-sm italic">Apply at: {item.application_stage}</p>
                                </div>
                            </div>

                            {item.pesticide_name && (
                                <div className="flex items-start gap-4 mt-4 pt-4 border-t border-gray-100">
                                    <div className="p-3 bg-red-100 rounded-full text-red-600">
                                        <FaSprayCan />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">Pest Control</h4>
                                        <p className="text-gray-700"><strong>Pesticide:</strong> {item.pesticide_name}</p>
                                        <p className="text-gray-600 text-sm">{item.remarks}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-600">No specific advisory data found for this crop currently.</p>
            )}
        </div>
    );
};

export default FertilizerGuide;
