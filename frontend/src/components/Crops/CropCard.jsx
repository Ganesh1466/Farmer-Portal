import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const CropCard = ({ crop }) => {
    // Helper to get image path
    const getCropImage = (cropName) => {
        const safeName = cropName.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        return `/images/crops/${safeName}.png`;
    };

    return (
        <Link to={`/crops/${crop.id}`} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 block">
            <div className="h-48 overflow-hidden bg-gray-200 relative">
                <img
                    src={getCropImage(crop.name)}
                    alt={crop.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'; // Fallback image
                    }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white font-bold text-2xl drop-shadow-md">{crop.name}</h3>
                </div>
            </div>

            <div className="p-6">
                <div className="space-y-3">
                    {crop.season && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Season</span>
                            <span className="text-green-700 font-semibold">{crop.season}</span>
                        </div>
                    )}

                    {crop.climate && (
                        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium shrink-0">Climate</span>
                            <span className="text-gray-800 text-right text-sm">{crop.climate}</span>
                        </div>
                    )}

                    {crop.soil && (
                        <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium shrink-0">Soil</span>
                            <span className="text-gray-800 text-right text-sm">{crop.soil}</span>
                        </div>
                    )}

                    {crop.yield && (
                        <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                            <span className="text-gray-500 text-sm font-medium">Yield</span>
                            <span className="text-blue-600 font-semibold text-sm">{crop.yield}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-500">
                        {crop.sowing && <div><span className="font-bold">Sowing:</span> {crop.sowing}</div>}
                        {crop.harvest && <div><span className="font-bold">Harvest:</span> {crop.harvest}</div>}
                        {crop.irrigation && <div className="col-span-2"><span className="font-bold">Irrigation:</span> {crop.irrigation}</div>}
                    </div>
                </div>
            </div>
        </Link>
    );
};

CropCard.propTypes = {
    crop: PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        season: PropTypes.string,
        climate: PropTypes.string,
        soil: PropTypes.string,
        yield: PropTypes.string,
        sowing: PropTypes.string,
        harvest: PropTypes.string,
        irrigation: PropTypes.string,
    }).isRequired,
};

export default CropCard;
