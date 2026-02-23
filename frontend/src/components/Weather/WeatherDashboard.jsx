import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { stateDistricts } from '../../utils/stateDistricts';
import { fetchWeather as fetchWeatherApi } from '../../Api/api';
import io from 'socket.io-client';
// Connect to backend socket
const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5001'); // Ensure this matches backend URL

const WeatherDashboard = () => {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Search inputs
    const [district, setDistrict] = useState('');
    const [state, setState] = useState('');
    const hasFetchedWeather = useRef(false);

    // const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; // Removed as it is handled in api.js

    const fetchWeather = async (queryDistrict, queryState) => {
        setLoading(true);
        setError(null);
        try {
            let query = '';

            // 1. Explicit Search (State/District selected via UI)
            if (queryDistrict && queryState) {
                query = `${queryDistrict}, ${queryState}`;
            }
            // 2. User Profile Location
            else if (user) {
                // Simplified Query: Just use District (most reliable)
                // If they want village specific, they can type it in the search bar manually
                query = user.district || user.state || 'Delhi';
            } else {
                query = 'Delhi'; // Default fallback
            }

            console.log("Fetching weather for:", query);

            // Using Shared API Service
            const data = await fetchWeatherApi(query);

            setWeather(data);
            setLoading(false);
        } catch (err) {
            console.error("Weather fetch error:", err);
            // Fallback logic could go here (e.g. if village not found, try district)
            setError(err.message || 'Error fetching weather data');
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch - only once on mount
        if (!hasFetchedWeather.current) {
            hasFetchedWeather.current = true;
            fetchWeather(district, state);
        }

        // Listen for real-time location updates
        socket.on('location_updated', (data) => {
            console.log('Received location update via socket:', data);

            // If data is just district/state (from Profile update)
            if (data.district || data.state) {
                const newDistrict = data.district || '';
                const newState = data.state || '';

                setDistrict(newDistrict);
                setState(newState);

                fetchWeather(newDistrict, newState);
            }
        });

        return () => {
            socket.off('location_updated');
        };
    }, []); // Empty dependency array - only run once on mount

    const handleSearch = (e) => {
        e.preventDefault();
        fetchWeather(district, state);
    };

    const handleStateChange = (e) => {
        const newState = e.target.value;
        setState(newState);
        setDistrict(''); // Reset district when state changes
    };

    if (loading && !weather) return <div className="text-center p-4">Loading weather...</div>;

    return (
        <div className="p-6 bg-blue-50 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">
                Live Weather
            </h2>

            {/* State & District Search Form */}
            <form onSubmit={handleSearch} className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-2">
                {/* State Dropdown */}
                <select
                    value={state}
                    onChange={handleStateChange}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                    <option value="">Select State</option>
                    {Object.keys(stateDistricts).map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>

                {/* District Dropdown */}
                <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!state}
                    className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${!state ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <option value="">{state ? 'Select District' : 'Select State First'}</option>
                    {state && stateDistricts[state]?.map((dist) => (
                        <option key={dist} value={dist}>{dist}</option>
                    ))}
                </select>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                    Get Weather
                </button>
            </form>

            {error && <div className="text-center p-3 text-red-500 mb-4 bg-white rounded-lg border border-red-100 text-sm">{error}</div>}

            {weather && weather.current && (
                <>
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">
                        Weather in {weather.location.name}, {weather.location.region}
                    </h3>

                    {/* Display Location Context if using User Profile */}
                    {!district && user && (
                        <div className="mb-2 text-sm text-green-600">
                            Using location from profile: {user.village ? `${user.village}, ${user.taluka}` : user.district || 'Default'}
                        </div>
                    )}

                    {/* Rain Logic: WeatherAPI has specific codes or condition text */}
                    {/* Check for rain related text or precip_mm > 0 */}
                    {(weather.current.condition.text.toLowerCase().includes('rain') || weather.current.precip_mm > 0) && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 animate-pulse" role="alert">
                            <p className="font-bold">Heavy Rain Alert!</p>
                            <p>Rain detected. Protect your crops!</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between">
                            <div>
                                <div className="text-lg font-semibold text-gray-600">Temperature</div>
                                <div className="text-4xl font-bold text-gray-800">{weather.current.temp_c}°C</div>
                                <div className="text-sm text-gray-500 capitalize">
                                    {weather.current.condition.text}
                                </div>
                            </div>
                            <img
                                src={`https:${weather.current.condition.icon}`}
                                alt={weather.current.condition.text}
                                className="w-20 h-20"
                            />
                        </div>

                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-sm font-semibold text-gray-600">Humidity</div>
                                    <div className="text-xl">{weather.current.humidity}%</div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-600">Wind</div>
                                    <div className="text-xl">{weather.current.wind_kph} kph</div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-600">Cloud Cover</div>
                                    <div className="text-xl">{weather.current.cloud}%</div>
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-600">Precipitation</div>
                                    <div className="text-xl">{weather.current.precip_mm} mm</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WeatherDashboard;
