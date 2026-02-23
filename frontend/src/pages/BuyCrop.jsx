import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Filter, Package, IndianRupee, MapPin, Calendar, User, Heart, Info, CheckCircle, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';

const socket = io('http://localhost:5001'); // Connect to backend

const BuyCrop = () => {
    const { user, checkProfileCompletion } = useAuth();
    const navigate = useNavigate();
    const [listings, setListings] = useState([]);
    const [filteredListings, setFilteredListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [msgType, setMsgType] = useState('info'); // info, success, error
    const hasFetchedListings = useRef(false);

    const [filters, setFilters] = useState({
        search: '',
        minPrice: '',
        maxPrice: '',
        location: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (!hasFetchedListings.current) {
            hasFetchedListings.current = true;
            fetchListings();
        }
    }, [user, navigate]);

    useEffect(() => {
        applyFilters();
    }, [filters, listings]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('crop_listings')
                .select(`
                    *,
                    profiles:seller_id (
                        name,
                        phone,
                        village,
                        district,
                        state
                    )
                `)
                .eq('status', 'available')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
            setFilteredListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
            showMsg('Error loading crop listings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...listings];

        if (filters.search) {
            filtered = filtered.filter(listing =>
                listing.crop_name.toLowerCase().includes(filters.search.toLowerCase()) ||
                listing.location?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.minPrice) {
            filtered = filtered.filter(listing =>
                listing.price_per_unit >= parseFloat(filters.minPrice)
            );
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(listing =>
                listing.price_per_unit <= parseFloat(filters.maxPrice)
            );
        }

        if (filters.location) {
            filtered = filtered.filter(listing =>
                listing.location?.toLowerCase().includes(filters.location.toLowerCase()) ||
                listing.profiles?.village?.toLowerCase().includes(filters.location.toLowerCase()) ||
                listing.profiles?.district?.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        setFilteredListings(filtered);
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const resetFilters = () => {
        setFilters({
            search: '',
            minPrice: '',
            maxPrice: '',
            location: ''
        });
    };

    const showMsg = (text, type = 'info') => {
        setMessage(text);
        setMsgType(type);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleInterest = async (listing) => {
        if (!user) return;

        if (!checkProfileCompletion()) {
            showMsg("Please complete your profile (Phone, Address) to contact farmers!", "error");
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
            return;
        }

        if (listing.seller_id === user.id) {
            showMsg("You cannot express interest in your own listing", "error");
            return;
        }

        try {
            const receiverId = listing.seller_id;
            const buyerName = user.user_metadata?.full_name || user.email;
            // 1. Prepare Data
            // Payload for Database (Must match Schema)
            const dbPayload = {
                sender_id: user.id,
                receiver_id: receiverId,
                listing_id: listing.id,
                crop_name: listing.crop_name,
                buyer_name: buyerName,
                buyer_contact: user.phone || 'Contact via App',
                message: `${buyerName} is interested in your ${listing.crop_name}`,
                status: 'unread'
            };

            // Payload for Socket (Can include extra UI data like Avatar)
            const socketPayload = {
                ...dbPayload,
                buyer_avatar_url: user.avatar_url || null, // Only for real-time UI
                receiverId, // Backend expects this key for routing
                cropName: listing.crop_name,
                buyerName
            };

            // 2. Save to Supabase
            const { error } = await supabase
                .from('notifications')
                .insert([dbPayload]);

            if (error) {
                console.error("Supabase notification error:", error);
                throw error; // Throw existing error object to catch block
            }

            // 3. Send Real-time Notification via Socket
            socket.emit('send_interest', socketPayload);

            showMsg("Interest sent! The farmer has been notified.", "success");

        } catch (error) {
            console.error(error);
            // Fallback: If table doesn't exist, alerts user
            if (error.message.includes('relation "notifications" does not exist')) {
                showMsg("System Update Required: Notifications table missing.", "error");
            } else {
                showMsg(error.message || "Failed to send interest", "error");
            }
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <p className="text-red-600 text-lg font-semibold">Please log in to access this page</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 py-8 px-4 font-sans">
            <div className="container mx-auto max-w-7xl">

                {/* Header */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8 border border-white/50">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="p-5 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                            <ShoppingCart size={40} />
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-cyan-700 tracking-tight">
                                Marketplace
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg font-medium">
                                Discover fresh crops directly from farmers.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Message Toast */}
                {message && (
                    <div className={`fixed top-24 right-5 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border-l-4 animate-slide-in-right bg-white ${msgType === 'success' ? 'border-green-500 text-green-700' :
                        msgType === 'error' ? 'border-red-500 text-red-700' :
                            'border-blue-500 text-blue-700'
                        }`}>
                        {msgType === 'success' ? <CheckCircle size={24} /> :
                            msgType === 'error' ? <AlertCircle size={24} /> :
                                <Info size={24} />}
                        <p className="font-bold">{message}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl p-6 mb-8 border border-white/50">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Filter size={20} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Filter Listings</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="relative group">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search crops..."
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                            />
                        </div>

                        <input
                            type="number"
                            name="minPrice"
                            value={filters.minPrice}
                            onChange={handleFilterChange}
                            placeholder="Min Price (₹)"
                            className="px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                        />

                        <input
                            type="number"
                            name="maxPrice"
                            value={filters.maxPrice}
                            onChange={handleFilterChange}
                            placeholder="Max Price (₹)"
                            className="px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                        />

                        <input
                            type="text"
                            name="location"
                            value={filters.location}
                            onChange={handleFilterChange}
                            placeholder="Location..."
                            className="px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none font-medium"
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={resetFilters}
                            className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Listings Grid */}
                <div>
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Available Crops <span className="text-sm font-normal text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm ml-2">{filteredListings.length} results</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-96 bg-white rounded-[2rem] shadow-xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : filteredListings.length === 0 ? (
                        <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-300">
                            <ShoppingCart size={80} className="mx-auto text-gray-300 mb-6" />
                            <h3 className="text-2xl font-bold text-gray-700">No Listings Found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your filters to find what you're looking for.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredListings.map((listing) => (
                                <div
                                    key={listing.id}
                                    className="group bg-white rounded-[2.5rem] shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full hover:-translate-y-2"
                                >
                                    {/* Image Section */}
                                    <div className="relative h-64 overflow-hidden">
                                        {listing.image_url ? (
                                            <img
                                                src={listing.image_url}
                                                alt={listing.crop_name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-300">
                                                <Package size={64} />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold text-gray-700 shadow-sm uppercase tracking-wider">
                                            {listing.unit}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 pt-20">
                                            <h3 className="text-3xl font-extrabold text-white truncate drop-shadow-md">
                                                {listing.crop_name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-gray-200 mt-1 font-medium">
                                                <MapPin size={16} className="text-cyan-400" /> {listing.location || 'Unknown Location'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Section */}
                                    <div className="p-8 flex-grow flex flex-col">
                                        {/* Price & Quantity Row */}
                                        <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Price</p>
                                                <p className="text-3xl font-black text-gray-800">
                                                    ₹{listing.price_per_unit}
                                                    <span className="text-sm text-gray-400 font-bold ml-1">/{listing.unit}</span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Available</p>
                                                <p className="text-xl font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block">
                                                    {listing.quantity} {listing.unit}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Seller & Date Info */}
                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-start gap-3">
                                                <User size={18} className="text-gray-400 mt-1 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase">Seller</p>
                                                    <p className="font-semibold text-gray-700">{listing.profiles?.name || 'Farmer'}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-3">
                                                <Calendar size={18} className="text-gray-400 mt-1 shrink-0" />
                                                <div>
                                                    <p className="text-xs text-gray-400 font-bold uppercase">Harvest Date / Listed</p>
                                                    <p className="font-semibold text-gray-700">{new Date(listing.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>

                                            {listing.description && (
                                                <div className="bg-gray-50 p-4 rounded-xl">
                                                    <p className="text-sm text-gray-600 italic line-clamp-3">"{listing.description}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleInterest(listing)}
                                            className="mt-auto w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group-hover:from-blue-700 group-hover:to-cyan-700"
                                        >
                                            <Heart size={20} className="fill-white/20" /> Interest in Crop
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BuyCrop;
