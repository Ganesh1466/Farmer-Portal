import { useState, useEffect } from 'react';
import api from '../services/api';

const Mandi = () => {
    const [selectedState, setSelectedState] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedMandi, setSelectedMandi] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const [stateOptions, setStateOptions] = useState([]);
    const [districtOptions, setDistrictOptions] = useState([]);
    const [mandiOptions, setMandiOptions] = useState([]);

    const [filteredData, setFilteredData] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch States on Mount
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await api.get('/api/states');
                setStateOptions(response.data || []);
            } catch (err) {
                console.error("Failed to fetch states:", err);
            }
        };
        fetchStates();
    }, []);

    // Fetch Districts when State changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (!selectedState) {
                setDistrictOptions([]);
                setSelectedDistrict('');
                return;
            }
            try {
                const response = await api.get('/api/districts', { params: { state: selectedState } });
                setDistrictOptions(response.data || []);
            } catch (err) {
                console.error("Failed to fetch districts:", err);
            }
        };
        fetchDistricts();
    }, [selectedState]);

    // Fetch Mandis when District changes
    useEffect(() => {
        const fetchMandis = async () => {
            if (!selectedDistrict) {
                setMandiOptions([]);
                setSelectedMandi('');
                return;
            }
            try {
                const response = await api.get('/api/mandis', { params: { district: selectedDistrict } });
                setMandiOptions(response.data || []);
            } catch (err) {
                console.error("Failed to fetch mandis:", err);
            }
        };
        fetchMandis();
    }, [selectedDistrict]);

    // Fetch Prices
    const fetchMandiData = async () => {
        if (!selectedState || !selectedDistrict || !selectedMandi) {
            setError('Please select state, district, and mandi to view prices.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const params = {
                state: selectedState,
                district: selectedDistrict,
                mandi: selectedMandi,
                date: selectedDate
            };

            const response = await api.get('/api/prices', { params });
            setFilteredData(response.data);
        } catch (err) {
            setFilteredData(null);
            if (err.response && err.response.status === 404) {
                setError("No market data found for the selected filters.");
            } else if (err.response && err.response.status === 400) {
                setError(err.response.data.message || "Invalid date or parameters selected.");
            } else {
                setError("Failed to fetch data. Please try again later.");
                console.error("Mandi API Error:", err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Auto-fetch data if all filters are applied
    useEffect(() => {
        if (selectedState && selectedDistrict && selectedMandi) {
            fetchMandiData();
        } else {
            setFilteredData(null);
        }
    }, [selectedState, selectedDistrict, selectedMandi, selectedDate]);

    const handleRefresh = () => {
        if (selectedState && selectedDistrict && selectedMandi) {
            fetchMandiData();
        }
    };

    const handleClearFilters = () => {
        setSelectedState('');
        setSelectedDistrict('');
        setSelectedMandi('');
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setFilteredData(null);
    };

    // Get today's date in YYYY-MM-DD format for max date attribute
    const todayStr = new Date().toISOString().split('T')[0];

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-green-800">Live Mandi Bhav</h1>
                <button
                    onClick={handleRefresh}
                    disabled={!selectedState || !selectedDistrict || !selectedMandi || loading}
                    className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 transition disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.992 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    <span>Refresh Data</span>
                </button>
            </div>

            {/* Selection Panel */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-t-4 border-green-600">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

                    {/* State Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white"
                        >
                            <option value="">Select State</option>
                            {stateOptions.map((state) => (
                                <option key={state} value={state}>{state}</option>
                            ))}
                        </select>
                    </div>

                    {/* District Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedState}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100"
                        >
                            <option value="">Select District</option>
                            {districtOptions.map((dist) => (
                                <option key={dist} value={dist}>{dist}</option>
                            ))}
                        </select>
                    </div>

                    {/* Mandi Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mandi</label>
                        <select
                            value={selectedMandi}
                            onChange={(e) => setSelectedMandi(e.target.value)}
                            disabled={!selectedDistrict}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100"
                        >
                            <option value="">Select Mandi</option>
                            {mandiOptions.map((mandi) => (
                                <option key={mandi} value={mandi}>{mandi}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            max={todayStr}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                {/* Clear Filters Link */}
                <div className="mt-3 text-right">
                    <button
                        onClick={handleClearFilters}
                        disabled={!selectedState}
                        className="text-sm text-green-600 hover:text-green-800 underline disabled:opacity-50 disabled:no-underline"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Results Status */}
            {loading && (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-green-700">Fetching live market data...</p>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded-r">
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            )}

            {/* Data Table */}
            {!loading && filteredData && filteredData.prices && filteredData.prices.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in-up">
                    {/* Summary Header */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Showing prices for {filteredData.mandi}, {filteredData.district} ({filteredData.state}) on {filteredData.date}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Crop</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Min Price (₹)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Max Price (₹)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Modal Price (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.prices.map((item, index) => (
                                    <tr key={index} className="hover:bg-green-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.crop}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{item.minPrice}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{item.maxPrice}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-800 font-bold text-lg">{item.modalPrice}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && (!filteredData || !filteredData.prices || filteredData.prices.length === 0) && !error && selectedState && selectedDistrict && selectedMandi && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matching records</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your filters.</p>
                </div>
            )}

            {!loading && (!selectedState || !selectedDistrict || !selectedMandi) && !error && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Please select State, District, and Mandi to view prices.</p>
                </div>
            )}
        </div>
    );
};

export default Mandi;
