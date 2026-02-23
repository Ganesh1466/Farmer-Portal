import PropTypes from 'prop-types';

const SeasonTabs = ({ seasons, selectedSeason, onSelect }) => {
    return (
        <div className="flex justify-center mb-8 gap-4">
            {seasons.map((season) => (
                <button
                    key={season}
                    onClick={() => onSelect(season)}
                    className={`px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-300 ${selectedSeason === season
                            ? 'bg-green-700 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {season}
                </button>
            ))}
        </div>
    );
};

SeasonTabs.propTypes = {
    seasons: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedSeason: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default SeasonTabs;
