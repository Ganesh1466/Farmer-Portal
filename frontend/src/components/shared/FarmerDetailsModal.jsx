import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, User, Phone, MapPin, Mail, Loader, Star, Download, CheckCircle, Package } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'https://farmer-portal.onrender.com';

const FarmerDetailsModal = ({ isOpen, onClose, notification }) => {
    const [contract, setContract] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloadLoading, setDownloadLoading] = useState(false);
    const [deliveryLoading, setDeliveryLoading] = useState(false);
    const [ratingValue, setRatingValue] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [ratingLoading, setRatingLoading] = useState(false);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    const [notArrivedLoading, setNotArrivedLoading] = useState(false);

    useEffect(() => {
        if (isOpen && notification?.contract_id) {
            fetchContractDetails();
        } else {
            resetState();
        }
    }, [isOpen, notification]);

    const resetState = () => {
        setContract(null);
        setLoading(false);
        setError(null);
        setRatingValue(0);
        setReviewText('');
        setRatingSubmitted(false);
    };

    const fetchContractDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API}/api/contracts/${notification.contract_id}`, { credentials: 'include' });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Server Error Details:", errorData);
                throw new Error(errorData.message || 'Failed to fetch contract details');
            }

            const data = await response.json();
            setContract(data.contract);
        } catch (err) {
            console.error("Error fetching contract details:", err);
            setError("Failed to load contract details");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadContract = async () => {
        if (!contract) return;

        try {
            setDownloadLoading(true);
            const response = await fetch(`${API}/api/contracts/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    listingId: contract.listing_id,
                    buyerId: contract.buyer_id,
                    farmerId: contract.farmer_id,
                    paymentMode: contract.payment_mode
                })
            });

            if (!response.ok) throw new Error('Failed to download contract');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Contract_${contract.listing?.crop_name || 'Crop'}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (err) {
            console.error(err);
            alert("Error downloading contract");
        } finally {
            setDownloadLoading(false);
        }
    };

    const handleMarkAsDelivered = async () => {
        if (!contract) return;

        try {
            setDeliveryLoading(true);
            const response = await fetch(`${API}/api/contracts/${contract.id}/delivery`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ deliveryStatus: 'delivered' })
            });

            if (!response.ok) throw new Error('Failed to update delivery status');

            const data = await response.json();
            setContract({ ...contract, delivery_status: 'delivered' });
        } catch (err) {
            console.error(err);
            alert("Error updating delivery status");
        } finally {
            setDeliveryLoading(false);
        }
    };

    const handleNotArrived = async () => {
        if (!contract) return;

        try {
            setNotArrivedLoading(true);
            const response = await fetch(`${API}/api/contracts/${contract.id}/delivery`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ deliveryStatus: 'not_arrived' })
            });

            if (!response.ok) throw new Error('Failed to update delivery status');

            setContract({ ...contract, delivery_status: 'not_arrived' });
            // Maybe show a message to contact support or the farmer?
            alert("Status updated to 'Not Arrived'. Please contact the farmer.");
        } catch (err) {
            console.error(err);
            alert("Error updating status");
        } finally {
            setNotArrivedLoading(false);
        }
    };

    const handleSubmitRating = async () => {
        if (!contract || ratingValue === 0) {
            alert("Please select a rating");
            return;
        }

        try {
            setRatingLoading(true);
            const response = await fetch(`${API}/api/ratings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    contractId: contract.id,
                    farmerId: contract.farmer_id,
                    buyerId: contract.buyer_id,
                    rating: ratingValue,
                    reviewText: reviewText || null
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to submit rating');
            }

            setRatingSubmitted(true);
            setContract({ ...contract, delivery_status: 'rated' });

            // Show success message
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            console.error(err);
            alert(err.message || "Error submitting rating");
        } finally {
            setRatingLoading(false);
        }
    };

    if (!isOpen) return null;

    const farmer = contract?.farmer;
    const listing = contract?.listing;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in relative custom-scrollbar">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 bg-white rounded-full text-gray-700 shadow-md hover:bg-gray-100 transition-colors"
                >
                    <X size={24} />
                </button>

                {/* Header Banner */}
                {/* Header Banner */}
                <div className="h-48 relative">
                    {listing?.image_url ? (
                        <img
                            src={listing.image_url}
                            alt={listing.crop_name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                            <Package size={64} className="text-white/30" />
                        </div>
                    )}
                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                        <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
                            <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center text-green-600 overflow-hidden">
                                {farmer?.avatar_url ? (
                                    <img
                                        src={farmer.avatar_url}
                                        alt={farmer.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={40} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="pt-16 pb-8 px-8">
                    {loading ? (
                        <div className="py-8 flex flex-col items-center justify-center text-gray-500">
                            <Loader size={32} className="animate-spin mb-2 text-green-500" />
                            <p>Loading contract details...</p>
                        </div>
                    ) : error ? (
                        <div className="py-8 text-red-500 bg-red-50 rounded-xl text-center">
                            <p>{error}</p>
                        </div>
                    ) : contract ? (
                        <div className="space-y-6">
                            {/* Farmer Name */}
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {farmer?.name || 'Farmer'}
                                </h2>
                                <div className="flex items-center justify-center gap-2 mt-2">
                                    <span className="text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full text-sm">
                                        Farmer
                                    </span>
                                    {/* Display Rating */}
                                    {farmer && (farmer.rating > 0 || farmer.rating_count > 0) && (
                                        <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                            <span className="text-sm font-bold text-gray-800">
                                                {Number(farmer.rating).toFixed(1)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({farmer.rating_count} reviews)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contract Info Card */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Package size={20} className="text-green-600" />
                                    Contract Details
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Crop:</span>
                                        <span className="font-bold text-gray-800">{listing?.crop_name || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Price:</span>
                                        <span className="font-bold text-green-700">₹{listing?.price || 'N/A'} / {listing?.unit || 'quintal'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Quantity:</span>
                                        <span className="font-bold text-gray-800">{listing?.quantity || 'N/A'} {listing?.unit || 'quintal'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Payment Mode:</span>
                                        <span className="font-bold text-blue-700">{contract.payment_mode || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Contract Date:</span>
                                        <span className="font-semibold text-gray-700">
                                            {new Date(contract.contract_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`font-bold ${contract.delivery_status === 'delivered' ? 'text-blue-600' :
                                            contract.delivery_status === 'rated' ? 'text-green-600' :
                                                'text-orange-600'
                                            }`}>
                                            {contract.delivery_status === 'delivered' ? 'Delivered ✓' :
                                                contract.delivery_status === 'rated' ? 'Rated ⭐' :
                                                    contract.delivery_status === 'not_arrived' ? 'Not Arrived ❌' :
                                                        'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Farmer Contact Info */}
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                        <Phone size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Phone</p>
                                        <p className="font-semibold text-gray-800">{farmer?.phone || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <Mail size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Email</p>
                                        <p className="font-semibold text-gray-800 truncate">{farmer?.email || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                        <MapPin size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Location</p>
                                        <p className="font-semibold text-gray-800">
                                            {farmer ? [farmer.village, farmer.district, farmer.state].filter(Boolean).join(', ') || 'N/A' : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Download Contract Button */}
                            <button
                                onClick={handleDownloadContract}
                                disabled={downloadLoading}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-2"
                            >
                                {downloadLoading ? (
                                    <Loader size={20} className="animate-spin" />
                                ) : (
                                    <Download size={20} />
                                )}
                                {downloadLoading ? 'Downloading...' : 'Download Contract PDF'}
                            </button>

                            {/* Mark as Delivered / Not Arrived Buttons */}
                            {contract.delivery_status === 'pending' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleMarkAsDelivered}
                                        disabled={deliveryLoading || notArrivedLoading}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md flex items-center justify-center gap-2"
                                    >
                                        {deliveryLoading ? (
                                            <Loader size={20} className="animate-spin" />
                                        ) : (
                                            <CheckCircle size={20} />
                                        )}
                                        {deliveryLoading ? 'Updating...' : 'Arrived'}
                                    </button>

                                    <button
                                        onClick={handleNotArrived}
                                        disabled={deliveryLoading || notArrivedLoading}
                                        className="flex-1 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all shadow-md flex items-center justify-center gap-2 border border-red-200"
                                    >
                                        {notArrivedLoading ? (
                                            <Loader size={20} className="animate-spin" />
                                        ) : (
                                            <X size={20} />
                                        )}
                                        {notArrivedLoading ? 'Updating...' : 'Not Arrived'}
                                    </button>
                                </div>
                            )}

                            {contract.delivery_status === 'delivered' && !ratingSubmitted && (
                                <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-200">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4">Rate Your Experience</h3>

                                    {/* Star Rating */}
                                    <div className="flex justify-center gap-2 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRatingValue(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={40}
                                                    className={`${star <= (hoverRating || ratingValue)
                                                        ? 'text-yellow-500 fill-yellow-500'
                                                        : 'text-gray-300'
                                                        }`}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    {/* Review Text */}
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Share your experience (optional)"
                                        className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                        rows="3"
                                    />

                                    {/* Submit Rating Button */}
                                    <button
                                        onClick={handleSubmitRating}
                                        disabled={ratingLoading || ratingValue === 0}
                                        className={`w-full mt-4 py-3 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${ratingValue === 0
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                            }`}
                                    >
                                        {ratingLoading ? (
                                            <Loader size={20} className="animate-spin" />
                                        ) : (
                                            <Star size={20} />
                                        )}
                                        {ratingLoading ? 'Submitting...' : 'Submit Rating'}
                                    </button>
                                </div>
                            )}

                            {(contract.delivery_status === 'rated' || ratingSubmitted) && (
                                <div className="bg-green-50 p-6 rounded-2xl border border-green-200 text-center">
                                    <CheckCircle size={48} className="mx-auto text-green-600 mb-2" />
                                    <h3 className="text-lg font-bold text-green-800">Thank You!</h3>
                                    <p className="text-gray-600">Your rating has been submitted successfully.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center">Contract information not available.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FarmerDetailsModal;
