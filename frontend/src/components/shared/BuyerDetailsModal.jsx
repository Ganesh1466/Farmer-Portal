import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import { X, User, Phone, MapPin, Mail, Loader, MessageCircle, FileText, ChevronLeft, CheckCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://farmer-portal.onrender.com';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API;
const socket = io(SOCKET_URL);

const BuyerDetailsModal = ({ isOpen, onClose, buyerId, notificationData }) => {
    const { user } = useAuth();
    const [buyer, setBuyer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Contract & Payment States
    const [paymentMode, setPaymentMode] = useState('');
    const [contractLoading, setContractLoading] = useState(false);
    const [acceptLoading, setAcceptLoading] = useState(false);
    const [dealAccepted, setDealAccepted] = useState(false);

    useEffect(() => {
        if (isOpen && buyerId) {
            fetchBuyerDetails();
        } else {
            // Reset state when closed
            setBuyer(null);
            setLoading(false);
            setError(null);
        }
    }, [isOpen, buyerId]);

    const fetchBuyerDetails = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', buyerId)
                .maybeSingle();

            if (error) {
                console.error("Supabase error fetching buyer:", error);
            }

            setBuyer(data);
        } catch (err) {
            console.error("Error/Exception fetching buyer details:", err);
            setBuyer(null);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateContract = async () => {
        if (!paymentMode) {
            alert("Please select a Payment Mode first.");
            return;
        }

        try {
            setContractLoading(true);
            // Replace with your actual backend URL from env if possible
            const response = await fetch(`${API}/api/contracts/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    listingId: notificationData?.listing_id,
                    buyerId: buyerId,
                    farmerId: user?.id || notificationData?.receiver_id, // Current user (Farmer)
                    paymentMode
                })
            });

            if (!response.ok) throw new Error('Failed to generate contract');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Contract_${notificationData?.crop_name || 'Crop'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error(err);
            alert("Error generating contract");
        } finally {
            setContractLoading(false);
        }
    };

    const handleAccept = async () => {
        if (!user) {
            alert('User not logged in');
            return;
        }

        try {
            setAcceptLoading(true);

            // Get current farmer's name
            const { data: farmerProfile } = await supabase
                .from('profiles')
                .select('name')
                .eq('id', user.id)
                .single();

            const farmerName = farmerProfile?.name || user.name || 'Farmer';

            // Call backend API to accept deal and create contract
            const response = await fetch(`${API}/api/contracts/accept`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    listingId: notificationData?.listing_id,
                    farmerId: user.id, // Current user is the Farmer
                    buyerId: buyerId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to accept deal');
            }

            const data = await response.json();

            // Emit socket event for real-time notification (using data from backend response)
            if (data.notification) {
                socket.emit('send_interest', {
                    receiverId: buyerId,
                    cropName: notificationData?.crop_name || 'crop',
                    buyerName: farmerName,
                    ...data.notification
                });
            }

            setDealAccepted(true);
            console.log('Deal accepted notification sent to buyer');

        } catch (err) {
            console.error('Error accepting deal:', err);
            alert('Failed to accept deal: ' + err.message);
        } finally {
            setAcceptLoading(false);
        }
    };

    if (!isOpen) return null;

    // Determine data to display: Prefer Buyer Profile, fallback to Notification Data
    const displayPhone = buyer?.phone || notificationData?.buyer_contact;
    const displayName = buyer?.name || notificationData?.buyer_name || 'Interested Buyer';
    const displayEmail = buyer?.email || 'N/A';

    // Construct WhatsApp Link
    const whatsAppNumber = displayPhone ? displayPhone.replace(/\D/g, '') : '';
    // Assume country code if missing (e.g., India +91) - nice to have, but for now just use raw
    const whatsAppLink = whatsAppNumber
        ? `https://wa.me/${whatsAppNumber.length === 10 ? '91' + whatsAppNumber : whatsAppNumber}?text=Hello ${displayName}, I saw your interest in my crop${notificationData?.crop_name ? ': ' + notificationData.crop_name : '.'}`
        : null;

    // Check if we have ANY data to show
    const hasData = buyer || notificationData;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in relative custom-scrollbar">

                {/* Header Actions - High Z-Index to ensure visibility */}
                <div className="absolute top-4 left-4 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 bg-white rounded-full text-gray-700 shadow-md hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>

                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={handleGenerateContract}
                        disabled={contractLoading || !paymentMode}
                        className={`p-2 rounded-full transition-colors flex items-center gap-2 shadow-md ${!paymentMode
                            ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                            : 'bg-white hover:bg-gray-50 text-blue-600'
                            }`}
                        title="Generate Contract (Select Payment Mode First)"
                    >
                        {contractLoading ? <Loader size={20} className="animate-spin" /> : <FileText size={20} />}
                        <span className="text-sm font-bold hidden sm:inline">Contract</span>
                    </button>
                </div>

                {/* Header / Banner */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 h-40 relative z-0">
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl relative">
                            {buyer?.avatar_url ? (
                                <img
                                    src={buyer.avatar_url}
                                    alt={displayName}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                    <User size={40} />
                                </div>
                            )}
                            {/* Verified Badge if needed */}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 pb-8 px-8 text-center">
                    {/* Show Loader ONLY if we have absolutely NO data yet */}
                    {!hasData && loading ? (
                        <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                            <Loader size={32} className="animate-spin mb-2 text-blue-500" />
                            <p>Loading buyer info...</p>
                        </div>
                    ) : error && !hasData ? (
                        <div className="py-8 text-red-500 bg-red-50 rounded-xl">
                            <p>{error}</p>
                        </div>
                    ) : (hasData) ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {displayName}
                                </h2>
                                <p className="text-blue-600 font-medium bg-blue-50 inline-block px-3 py-1 rounded-full text-sm mt-1">
                                    Interested Buyer
                                    {loading && <span className="text-xs text-gray-400 ml-2">(Updating...)</span>}
                                </p>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-1 gap-4 text-left">
                                {/* Phone Section */}
                                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                        <Phone size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                                        <p className="font-semibold text-gray-800">
                                            {displayPhone || 'N/A'}
                                        </p>
                                    </div>
                                    {whatsAppLink && (
                                        <a
                                            href={whatsAppLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-md"
                                            title="Chat on WhatsApp"
                                        >
                                            <MessageCircle size={20} fill="white" />
                                        </a>
                                    )}
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <Mail size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                                        <p className="font-semibold text-gray-800 truncate max-w-[200px]">
                                            {displayEmail}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <MapPin size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                                        <p className="font-semibold text-gray-800">
                                            {buyer ?
                                                [buyer.village, buyer.district, buyer.state].filter(Boolean).join(', ') || 'Location not provided'
                                                : 'Location pending...'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Specific Interest Context */}
                            {notificationData && (
                                <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-xl text-left">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-bold text-blue-800">Interest in:</span> {notificationData.crop_name}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Received: {new Date(notificationData.created_at).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {/* Payment Mode Selection */}
                            <div className="bg-gray-50 p-4 rounded-xl text-left">
                                <label className="text-xs text-gray-400 font-bold uppercase block mb-2">Select Payment Mode</label>
                                <select
                                    value={paymentMode}
                                    onChange={(e) => setPaymentMode(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">-- Choose Method --</option>
                                    <option value="Cash">Cash on Delivery</option>
                                    <option value="UPI">UPI / Online</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                {dealAccepted ? (
                                    <button
                                        disabled
                                        className="flex-1 py-3 bg-green-100 text-green-700 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-200"
                                    >
                                        <CheckCircle size={20} />
                                        Deal Accepted
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAccept}
                                        disabled={acceptLoading || !paymentMode}
                                        className={`flex-1 py-3 rounded-xl font-bold transition-all shadow-md ${!paymentMode
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg transform active:scale-95'
                                            }`}
                                    >
                                        {acceptLoading ? 'Processing...' : 'Accept Deal'}
                                    </button>
                                )}

                                {whatsAppLink && (
                                    <a
                                        href={whatsAppLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-3 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle size={20} />
                                        WhatsApp
                                    </a>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-500">Buyer information not available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BuyerDetailsModal;
