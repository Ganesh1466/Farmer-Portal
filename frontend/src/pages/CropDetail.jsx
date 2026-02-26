import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const CropDetail = () => {
    const { id } = useParams();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCrop = async () => {
            try {
                const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
                const response = await fetch(`${API}/api/crops/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch crop details');
                }
                const data = await response.json();
                setCrop(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching crop details:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCrop();
    }, [id]);

    if (loading) return <div className="text-center py-20 text-xl text-green-700">Loading details...</div>;
    if (error) return <div className="text-center py-20 text-red-600 font-bold">Error: {error}</div>;
    if (!crop) return <div className="text-center py-20">Crop not found</div>;

    // Helper for image path
    const getCropImage = (cropName) => {
        const safeName = cropName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        return `/src/assets/images/crops/${safeName}.png`;
    };

    return (
        <div className="container mx-auto p-4 md:p-10">
            <Link to="/crops" className="inline-block mb-6 text-green-600 hover:text-green-800 font-semibold">
                &larr; Back to Encyclopedia
            </Link>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="md:flex">
                    {/* Image Section */}
                    <div className="md:w-1/2 h-96 md:h-auto relative">
                        <img
                            src={getCropImage(crop.name)}
                            alt={crop.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">{crop.name}</h1>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="md:w-1/2 p-8 md:p-12 space-y-6">
                        <div className="prose max-w-none">
                            <h2 className="text-2xl font-bold text-green-800 mb-4">About</h2>
                            <p className="text-gray-700 text-lg leading-relaxed">{crop.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-green-50 p-6 rounded-xl">
                            <div>
                                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">Season</span>
                                <span className="text-lg font-medium text-gray-900">{crop.season}</span>
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">Climate</span>
                                <span className="text-lg font-medium text-gray-900">{crop.climate}</span>
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">Soil</span>
                                <span className="text-lg font-medium text-gray-900">{crop.soil}</span>
                            </div>
                            <div>
                                <span className="block text-sm font-semibold text-gray-500 uppercase tracking-wide">Yield</span>
                                <span className="text-lg font-medium text-blue-600">{crop.yield}</span>
                            </div>
                        </div>

                        {crop.farming_tips && crop.farming_tips.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold text-green-800 mb-3">Farming Tips</h3>
                                <ul className="space-y-2">
                                    {crop.farming_tips.map((tip, index) => (
                                        <li key={index} className="flex items-start">
                                            <span className="text-green-500 mr-2">✔</span>
                                            <span className="text-gray-700">{tip}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mt-6 pt-6 border-t border-gray-100">
                            {crop.sowing && <p><strong>Sowing:</strong> {crop.sowing}</p>}
                            {crop.harvest && <p><strong>Harvest:</strong> {crop.harvest}</p>}
                            {crop.irrigation && <p><strong>Irrigation:</strong> {crop.irrigation}</p>}
                            {crop.market && <p><strong>Market Price:</strong> {crop.market}</p>}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropDetail;
