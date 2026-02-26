import { useState, useEffect } from 'react';
import CropCard from '../components/Crops/CropCard';


const Seasons = () => {
    const [inputSeason, setInputSeason] = useState('');
    const [resultCrops, setResultCrops] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setHasSearched(true);
        setResultCrops([]);

        try {
            const API = import.meta.env.VITE_API_URL || 'https://farmer-portal.onrender.com';
            const response = await fetch(`${API}/api/seasons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ season: inputSeason }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to fetch crops');
            }

            const data = await response.json();
            setResultCrops(data);
        } catch (err) {
            console.error("Error fetching season crops:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-green-800">Browse Crops by Season</h1>

            {/* Input Form */}
            <div className="max-w-md mx-auto mb-10 bg-white p-6 rounded-xl shadow-md border border-green-100">
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="seasonInput" className="block text-gray-700 font-semibold mb-2">
                            Select Season
                        </label>
                        <select
                            id="seasonInput"
                            value={inputSeason}
                            onChange={(e) => setInputSeason(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                            required
                        >
                            <option value="" disabled>-- Choose a Season --</option>
                            <option value="Kharif">Kharif</option>
                            <option value="Rabi">Rabi</option>
                            <option value="Zaid">Zaid</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none mt-8">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-2 px-4 rounded-lg text-white font-bold transition-colors ${loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                            }`}
                    >
                        {loading ? 'Searching...' : 'Find Crops'}
                    </button>
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-center text-red-600 mb-8 font-medium">
                    {error}
                </div>
            )}

            {/* Results Grid */}
            {resultCrops.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
                    {resultCrops.map((crop) => (
                        <CropCard key={crop.id} crop={crop} />
                    ))}
                </div>
            ) : (
                hasSearched && !loading && !error && (
                    <div className="text-center py-10 text-gray-500">
                        No crops found for "{inputSeason}".
                    </div>
                )
            )}
        </div>
    );
};

export default Seasons;
