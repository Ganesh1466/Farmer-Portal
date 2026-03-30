import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
    Leaf,
    Plus,
    Edit2,
    Trash2,
    Package,
    IndianRupee,
    MapPin,
    Calendar,
    Upload,
    Image
} from 'lucide-react';
import { compressImage } from '../utils/imageUtils';

// Common crops list for dropdown
const COMMON_CROPS = [
    'Wheat', 'Rice', 'Corn (Maize)', 'Barley', 'Sugarcane',
    'Cotton', 'Jute', 'Tea', 'Coffee', 'Rubber',
    'Potato', 'Tomato', 'Onion', 'Garlic', 'Cabbage',
    'Cauliflower', 'Carrot', 'Brinjal (Eggplant)', 'Lady Finger (Okra)', 'Pumpkin',
    'Mango', 'Banana', 'Apple', 'Orange', 'Grapes',
    'Papaya', 'Guava', 'Pomegranate', 'Watermelon', 'Lemon',
    'Groundnut (Peanut)', 'Soybean', 'Mustard', 'Sunflower', 'Sesame',
    'Chickpea (Chana)', 'Pigeon Pea (Arhar)', 'Green Gram (Moong)', 'Black Gram (Urad)', 'Lentil (Masoor)',
    'Other'
];

const SellCrop = () => {
    const { user, checkProfileCompletion } = useAuth();
    const navigate = useNavigate();

    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const hasFetchedListings = useRef(false);

    const [formData, setFormData] = useState({
        crop_name: '',
        custom_crop_name: '',
        quantity: '',
        unit: 'kg',
        price_per_unit: '',
        location: '',
        description: '',
        image_url: ''
    });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Role check removed to allow all users
        /*
        const role = user.user_metadata?.role || user.role;
        if (role !== 'farmer') {
            setMessage('Only farmers can access this page');
            return;
        }
        */

        if (!hasFetchedListings.current) {
            hasFetchedListings.current = true;
            fetchListings();
        }
    }, [user, navigate]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('crop_listings')
                .select('*')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data || []);
        } catch (error) {
            console.error('Error fetching listings:', error);
            setMessage(`Error fetching listings: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setMessage('User not authenticated');
            return;
        }

        if (!formData.crop_name) {
            setMessage('Please select crop type');
            return;
        }

        if (!formData.quantity || isNaN(formData.quantity)) {
            setMessage('Valid quantity required');
            return;
        }

        if (!formData.price_per_unit || isNaN(formData.price_per_unit)) {
            setMessage('Valid price required');
            return;
        }

        try {
            setLoading(true);

            const userId = user.id;

            const finalCropName =
                formData.crop_name === 'Other'
                    ? formData.custom_crop_name
                    : formData.crop_name;

            const listingData = {
                crop_name: finalCropName,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                price_per_unit: parseFloat(formData.price_per_unit),
                location: formData.location,
                description: formData.description,
                image_url: formData.image_url,
                seller_id: userId,
                status: 'available'
            };

            if (editingId) {
                const { error } = await supabase
                    .from('crop_listings')
                    .update(listingData)
                    .eq('id', editingId);

                if (error) throw error;

                setMessage('Listing updated successfully!');
            } else {
                const { error } = await supabase
                    .from('crop_listings')
                    .insert([listingData]);

                if (error) throw error;

                setMessage('Listing created successfully!');
            }

            resetForm();
            fetchListings();
            setTimeout(() => setMessage(''), 3000);

        } catch (error) {
            console.error('Error saving listing:', error);
            setMessage(`Error: ${error.message || JSON.stringify(error)}`);
        } finally {
            setLoading(false);
        }
    };
    const uploadImage = async (event) => {
        try {
            setUploading(true);
            setMessage('Compressing and uploading image...');

            if (!event.target.files || event.target.files.length === 0) {
                return;
            }

            const file = event.target.files[0];

            // Compress image before upload
            // Max width 1200px, 0.8 quality
            const compressedFile = await compressImage(file, 1200, 0.8);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `crop-images/${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('crop-images')
                .upload(filePath, compressedFile); // Upload compressed file

            if (uploadError) {
                throw uploadError;
            }

            const {
                data: { publicUrl }
            } = supabase.storage
                .from('crop-images')
                .getPublicUrl(filePath);

            setFormData({ ...formData, image_url: publicUrl });
            setImagePreview(publicUrl);
            setMessage('Image uploaded successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error uploading image:', error);
            setMessage(`Error uploading image: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (listing) => {
        const isOtherCrop =
            !COMMON_CROPS.slice(0, -1).includes(listing.crop_name);

        setFormData({
            crop_name: isOtherCrop ? 'Other' : listing.crop_name,
            custom_crop_name: isOtherCrop ? listing.crop_name : '',
            quantity: listing.quantity.toString(),
            unit: listing.unit,
            price_per_unit: listing.price_per_unit.toString(),
            location: listing.location || '',
            description: listing.description || '',
            image_url: listing.image_url || ''
        });

        setImagePreview(listing.image_url);
        setEditingId(listing.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm("Deleting this crop will also remove all contracts and notifications. Continue?")) return;

        try {
            setLoading(true);

            const { error } = await supabase
                .from('crop_listings')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMessage('Listing deleted successfully!');
            fetchListings();

        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };
    const resetForm = () => {
        setFormData({
            crop_name: '',
            custom_crop_name: '',
            quantity: '',
            unit: 'kg',
            price_per_unit: '',
            location: '',
            description: '',
            image_url: ''
        });

        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <p className="text-red-600 text-lg font-semibold">
                        Please log in to access this page
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-lime-50 py-8 px-4 font-sans relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-20 w-64 h-64 bg-lime-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-emerald-600 tracking-tight">
                            Marketplace Listings
                        </h1>
                        <p className="text-green-800/70 mt-2 text-lg font-medium">Manage your crop sales and reach buyers directly.</p>
                    </div>
                    <button
                        onClick={() => {
                            if (!checkProfileCompletion()) {
                                setMessage('Please complete your profile (Phone, Address) before listing a crop!');
                                setTimeout(() => {
                                    navigate('/profile');
                                }, 2000);
                                return;
                            }
                            resetForm();
                            setShowForm(!showForm);
                        }}
                        className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl shadow-xl shadow-green-600/20 hover:shadow-2xl hover:shadow-green-600/30 hover:-translate-y-1 transition-all duration-300 font-bold text-lg"
                    >
                        {showForm ? 'Close Form' : 'Add New Listing'}
                        <span className="bg-white/20 p-1.5 rounded-full group-hover:rotate-90 transition-transform duration-300">
                            {showForm ? <Leaf size={20} /> : <Plus size={20} />}
                        </span>
                    </button>
                </div>

                {/* Status Message Toast */}
                {message && (
                    <div className="fixed top-24 right-5 z-50 bg-white border-l-4 border-emerald-500 shadow-2xl rounded-r-xl p-4 flex items-center gap-3 animate-slide-in-right max-w-sm">
                        <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                            <Leaf size={20} />
                        </div>
                        <p className="text-gray-800 font-medium">{message}</p>
                        <button onClick={() => setMessage('')} className="ml-auto text-gray-400 hover:text-gray-600">
                            &times;
                        </button>
                    </div>
                )}

                {/* Form Section */}
                {showForm && (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 md:p-10 mb-12 border border-white/50 animate-fade-in-up">
                        <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl text-emerald-600 shadow-inner">
                                {editingId ? <Edit2 size={28} /> : <Plus size={28} />}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800">
                                {editingId ? 'Edit Listing' : 'List New Crop'}
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Left Column - Crop Details */}
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        <Leaf size={16} className="text-emerald-500" /> Crop Type
                                    </label>
                                    <select
                                        name="crop_name"
                                        value={formData.crop_name}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none appearance-none font-semibold text-gray-700 hover:bg-white text-lg"
                                        required
                                    >
                                        <option value="">Select a crop</option>
                                        {COMMON_CROPS.map((crop) => (
                                            <option key={crop} value={crop}>{crop}</option>
                                        ))}
                                    </select>
                                    {formData.crop_name === 'Other' && (
                                        <input
                                            type="text"
                                            name="custom_crop_name"
                                            placeholder="Enter custom crop name"
                                            value={formData.custom_crop_name}
                                            onChange={handleChange}
                                            className="w-full mt-4 px-5 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none font-semibold"
                                            required
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                            <Package size={16} className="text-emerald-500" /> Quantity
                                        </label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            placeholder="0.00"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none font-semibold text-lg"
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Unit</label>
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none font-semibold text-gray-700 text-lg"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="quintal">quintal</option>
                                            <option value="ton">ton</option>
                                            <option value="box">box</option>
                                            <option value="dozen">dozen</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        <IndianRupee size={16} className="text-emerald-500" /> Price per {formData.unit}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">₹</span>
                                        <input
                                            type="number"
                                            name="price_per_unit"
                                            placeholder="0.00"
                                            value={formData.price_per_unit}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none font-semibold text-lg"
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        <MapPin size={16} className="text-emerald-500" /> Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        placeholder="City, District, State"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none font-semibold"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Right Column - Image & Description */}
                            <div className="space-y-6 flex flex-col h-full">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        <Image size={16} className="text-emerald-500" /> Crop Image
                                    </label>
                                    <div className="relative group w-full h-64 border-3 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-green-50 hover:border-green-400 transition-all overflow-hidden cursor-pointer shadow-sm hover:shadow-md">
                                        {imagePreview ? (
                                            <div className="relative w-full h-full">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover rounded-3xl"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-white font-bold text-lg flex items-center gap-3 bg-white/20 px-6 py-3 rounded-xl border border-white/40 hover:bg-white/30 transition-colors"><Upload size={24} /> Change Photo</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center p-6 transition-transform group-hover:scale-105">
                                                <div className="bg-white p-4 rounded-2xl shadow-md inline-block mb-4">
                                                    <div className="bg-green-100 p-3 rounded-xl text-green-600">
                                                        <Upload size={32} />
                                                    </div>
                                                </div>
                                                <p className="text-lg font-bold text-gray-700">Click to upload image</p>
                                                <p className="text-sm text-gray-400 mt-2 font-medium">PEG, PNG up to 5MB</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={uploadImage}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            disabled={uploading}
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 bg-white/90 flex items-center justify-center backdrop-blur-md z-10 text-center">
                                                <div>
                                                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-200 border-t-green-600 mx-auto mb-3"></div>
                                                    <p className="font-bold text-green-800">Uploading...</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-3 flex-grow">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        placeholder="Describe quality, harvest date, variety details..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full h-full min-h-[140px] px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-green-500/10 focus:border-green-500 transition-all outline-none resize-none font-medium text-gray-600"
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="flex-1 py-4 px-6 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-300 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || uploading}
                                        className="flex-[2] py-4 px-6 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg shadow-xl shadow-green-500/30 hover:shadow-2xl hover:shadow-green-500/40 hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {loading ? 'Saving Listing...' : (editingId ? 'Update Listing' : 'Publish Listing')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                {/* Listings Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {loading && !listings.length ? (
                        // Skeleton Loaders
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[2rem] p-4 shadow-xl h-96 animate-pulse">
                                <div className="bg-gray-100 h-56 rounded-3xl mb-6"></div>
                                <div className="h-8 bg-gray-100 rounded-lg w-3/4 mb-4"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-100 rounded w-full"></div>
                                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))
                    ) : listings.length > 0 ? (
                        listings.map((listing) => (
                            <div key={listing.id} className="group bg-white/60 backdrop-blur-md rounded-[2rem] shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 border border-white/60 overflow-hidden flex flex-col hover:-translate-y-2">
                                <div className="relative h-64 overflow-hidden rounded-t-[2rem]">
                                    {listing.image_url ? (
                                        <img
                                            src={listing.image_url}
                                            alt={listing.crop_name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-emerald-200">
                                            <Leaf size={80} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                        <button
                                            onClick={() => handleEdit(listing)}
                                            className="p-3 bg-white/90 backdrop-blur shadow-lg rounded-full text-blue-600 hover:bg-blue-50 transition-colors hover:scale-110"
                                            title="Edit"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(listing.id)}
                                            className="p-3 bg-white/90 backdrop-blur shadow-lg rounded-full text-red-600 hover:bg-red-50 transition-colors hover:scale-110"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md border ${listing.status === 'sold' ? 'bg-gray-800/80 text-white border-gray-600' : 'bg-white/90 text-emerald-800 border-white'}`}>
                                            {listing.status || 'Available'}
                                        </span>
                                    </div>

                                    <div className="absolute bottom-4 left-6 right-6 text-white">
                                        <h3 className="text-3xl font-extrabold truncate drop-shadow-md">{listing.crop_name}</h3>
                                        <p className="text-emerald-100 font-medium flex items-center gap-1 drop-shadow-sm">
                                            <MapPin size={14} /> {listing.location || 'Unknown Location'}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-7 flex-grow flex flex-col">
                                    <div className="flex justify-between items-end mb-6 border-b border-gray-100 pb-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Asking Price</p>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-gray-800">₹{listing.price_per_unit}</span>
                                                <span className="text-sm text-gray-500 font-bold">/ {listing.unit}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center justify-between p-3 bg-green-50/50 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <Package size={18} className="text-emerald-500" />
                                                <span>Quantity Available</span>
                                            </div>
                                            <span className="font-bold text-emerald-700">{listing.quantity} {listing.unit}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-700 font-medium">
                                                <Calendar size={18} className="text-emerald-500" />
                                                <span>Listed On</span>
                                            </div>
                                            <span className="font-bold text-gray-600">{new Date(listing.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {listing.description && (
                                        <div className="mt-auto">
                                            <p className="text-sm text-gray-500 line-clamp-2 px-3 pl-4 border-l-2 border-emerald-200 italic">
                                                "{listing.description}"
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white/50 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-gray-300">
                            <div className="w-32 h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Leaf size={64} className="text-green-200" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-800 mb-3">No crops listed yet</h3>
                            <p className="text-gray-500 max-w-md mx-auto text-lg mb-8">Start your journey by adding your first crop listing. Reach buyers directly and get the best price.</p>
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-green-100 text-green-700 rounded-2xl font-bold hover:bg-green-50 hover:border-green-200 transition-all shadow-sm hover:shadow-md"
                            >
                                <Plus size={20} /> Add your first crop
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SellCrop;
