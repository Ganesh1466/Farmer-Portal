import { useState, useEffect } from 'react';
import CropCard from '../Crops/CropCard';

const CropList = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCrops = async () => {
            try {
                // Assuming backend is running and proxy is not set up or configured to point there
                const response = await fetch('http://localhost:5001/api/crops');
                if (!response.ok) {
                    throw new Error('Failed to fetch crops');
                }
                const data = await response.json();
                setCrops(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching crops:", err);
                setError(err.message);
                setLoading(false);
            }
        };

        fetchCrops();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading crop data...</div>;
    }

    if (error) {
        return <div className="text-center py-10 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {crops.map((crop) => (
                <CropCard key={crop.id} crop={crop} />
            ))}
        </div>
    );
};

export default CropList;
