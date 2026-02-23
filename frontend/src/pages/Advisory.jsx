import { useState } from 'react';
import AdvisoryForm from '../components/advisory/AdvisoryForm';
import AdvisoryResults from '../components/advisory/AdvisoryResults';
import { getRecommendedCrops, saveFarmerInput } from '../services/advisoryService';
import { FaTractor } from 'react-icons/fa';

const Advisory = () => {
    const [crops, setCrops] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFormSubmit = async (formData) => {
        setLoading(true);
        // 1. Fetch recommended crops
        const recommended = await getRecommendedCrops(formData);
        setCrops(recommended);

        // 2. Save analytics (fire and forget)
        saveFarmerInput({
            ...formData,
            recommended_crops: recommended.map(c => c.id) // Analytics: Store IDs of recommended crops
        });

        // 3. Show Result
        setLoading(false);
        setShowResults(true);
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="text-center mb-10">
                <div className="flex justify-center mb-4">
                    <span className="bg-green-100 p-4 rounded-full text-green-600 text-4xl">
                        <FaTractor />
                    </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">Smart Crop Advisory</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Get scientifically backed crop recommendations based on your soil health and seasonal conditions.
                </p>
            </div>

            <AdvisoryForm onSubmit={handleFormSubmit} loading={loading} />

            {showResults && (
                <div className="mt-8 animate-fade-in-up">
                    <AdvisoryResults crops={crops} />

                    <div className="text-center mt-8">
                        <button
                            onClick={() => setShowResults(false)}
                            className="text-green-600 font-semibold hover:underline"
                        >
                            Analyze Another Farm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Advisory;
