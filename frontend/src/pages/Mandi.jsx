import { useState, useEffect } from 'react';
import { stateDistricts } from '../utils/stateDistricts';
import api from '../services/api';

const Mandi = () => {
    const [selectedState, setSelectedState] = useState('');
    const [selectedMandi, setSelectedMandi] = useState('');
    const [selectedCommodity, setSelectedCommodity] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const stateOptions = Object.keys(stateDistricts);

    const [mandiOptions, setMandiOptions] = useState([]);
    const [commodityOptions, setCommodityOptions] = useState([]);

    // Store all data fetched for the state
    const [stateData, setStateData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch Data when State Changes
    useEffect(() => {
        if (selectedState) {
            fetchMandiData(selectedState);
        } else {
            setStateData([]);
            setFilteredData([]);
            setMandiOptions([]);
            setCommodityOptions([]);
            setSelectedMandi('');
            setSelectedCommodity('');
        }
    }, [selectedState]);

    // Apply All Filters
    useEffect(() => {
        let result = stateData;

        // 1. Filter by Mandi
        if (selectedMandi) {
            result = result.filter(item => item.Market === selectedMandi);
        }

        // 2. Filter by Commodity
        if (selectedCommodity) {
            result = result.filter(item => item.Commodity === selectedCommodity);
        }

        // 3. Filter by Date Range
        if (fromDate || toDate) {
            result = result.filter(item => {
                if (!item.Arrival_Date) return false;

                // Parse DD/MM/YYYY to Date object
                const [day, month, year] = item.Arrival_Date.split('/').map(Number);
                const itemDate = new Date(year, month - 1, day);

                if (fromDate) {
                    const start = new Date(fromDate);
                    // Reset time to midnight for comparison
                    start.setHours(0, 0, 0, 0);
                    if (itemDate < start) return false;
                }

                if (toDate) {
                    const end = new Date(toDate);
                    end.setHours(23, 59, 59, 999);
                    if (itemDate > end) return false;
                }

                return true;
            });
        }

        setFilteredData(result);

    }, [selectedMandi, selectedCommodity, fromDate, toDate, stateData]);


    const fetchMandiData = async (state) => {
        setLoading(true);
        setError('');
        setMandiOptions([]);
        setCommodityOptions([]);
        // We generally reset specific choices on refresh/state change, but keeping them might be nicer?
        // Let's reset purely based on state change (already handled)

        try {
            const params = { state: state };

            const response = await api.get('/mandi', { params });
            const records = response.data.records || [];

            setStateData(records);
            setFilteredData(records); // Initial set (useEffect will filter if inputs exist)

            // Extract unique markets and commodities
            const uniqueMarketsMap = new Map();
            const uniqueCommodities = new Set();

            records.forEach(item => {
                // Market Options
                if (!uniqueMarketsMap.has(item.Market)) {
                    uniqueMarketsMap.set(item.Market, item.District);
                }
                // Commodity Options
                uniqueCommodities.add(item.Commodity);
            });

            // Sort Options
            const sortedMandis = Array.from(uniqueMarketsMap, ([market, district]) => ({ market, district }))
                .sort((a, b) => a.market.localeCompare(b.market));

            const sortedCommodities = [...uniqueCommodities].sort();

            setMandiOptions(sortedMandis);
            setCommodityOptions(sortedCommodities);

            if (records.length === 0) {
                setError("No market data found for this state.");
            }

        } catch (err) {
            setError("Failed to fetch data. Please try again later.");
            console.error("Mandi API Error:", err);
            if (err.response) {
                console.error("Server Error Details:", err.response.data);
                if (err.response.data && err.response.data.upstreamError) {
                    console.error("Upstream API Error:", err.response.data.upstreamError);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        if (selectedState) {
            fetchMandiData(selectedState);
        }
    };

    const handleClearFilters = () => {
        setSelectedMandi('');
        setSelectedCommodity('');
        setFromDate('');
        setToDate('');
    };

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-green-800">Live Mandi Bhav</h1>
                <button
                    onClick={handleRefresh}
                    disabled={!selectedState || loading}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

                    {/* State Selector */}
                    <div className="lg:col-span-1">
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

                    {/* Mandi Selector */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mandi</label>
                        <select
                            value={selectedMandi}
                            onChange={(e) => setSelectedMandi(e.target.value)}
                            disabled={!selectedState || loading}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100"
                        >
                            <option value="">All Mandis</option>
                            {mandiOptions.map((item) => (
                                <option key={item.market} value={item.market}>
                                    {item.market}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Commodity Selector */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                        <select
                            value={selectedCommodity}
                            onChange={(e) => setSelectedCommodity(e.target.value)}
                            disabled={!selectedState || loading}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 bg-white disabled:bg-gray-100"
                        >
                            <option value="">All Crops</option>
                            {commodityOptions.map((crop) => (
                                <option key={crop} value={crop}>{crop}</option>
                            ))}
                        </select>
                    </div>

                    {/* From Date */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* To Date */}
                    <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
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
            {!loading && filteredData.length > 0 && (
                <div className="bg-white rounded-lg shadow-lg overflow-hidden animate-fade-in-up">
                    {/* Summary Header */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">
                            Showing {filteredData.length} results
                            {selectedState && ` in ${selectedState}`}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-green-600 text-white">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Crop</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Variety</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Market</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Min Price (₹)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Max Price (₹)</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider">Modal Price (₹)</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredData.map((item, index) => (
                                    <tr key={`${index}-${item.Commodity}-${item.Market}`} className="hover:bg-green-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.Commodity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.Variety}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                            {item.Market}
                                            <span className="block text-xs text-gray-400">{item.District}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.Arrival_Date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{item.Min_Price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">{item.Max_Price}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-800 font-bold text-lg">{item.Modal_Price}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {!loading && filteredData.length === 0 && !error && selectedState && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-sm border border-dashed border-gray-300">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No matching records</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your filters (Date, Commodity, or Mandi).</p>
                </div>
            )}
            {!loading && !selectedState && (
                <div className="text-center py-12 text-gray-500">
                    <p className="text-lg">Please select a State to view prices.</p>
                </div>
            )}
        </div>
    );
};

export default Mandi;
