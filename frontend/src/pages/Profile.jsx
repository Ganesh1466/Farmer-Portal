import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { stateDistricts } from '../utils/stateDistricts';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Calendar, MapPin, Save, Upload, Mail, Leaf, Tractor, Sprout, ShoppingCart, TrendingUp, Package, Trash2, Star } from 'lucide-react';

const Profile = () => {
    const { user, login } = useAuth();
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        dob: '',
        state: '',
        district: '',
        taluka: '',
        village: '',
        rating: 0,
        rating_count: 0
    });
    const [reviews, setReviews] = useState([]);
    const [message, setMessage] = useState('');
    const hasFetchedProfile = useRef(false);

    // Determine role safely
    const effectiveRole = user?.user_metadata?.role || user?.role;

    // Enhanced Role-based theming with premium aesthetics
    const theme = effectiveRole === 'buyer'
        ? {
            // Buyer Theme - Professional Blue Marketplace
            gradient: 'from-blue-600 via-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 via-cyan-50 to-blue-100',
            primary: 'bg-gradient-to-r from-blue-600 to-cyan-600',
            primarySolid: 'bg-blue-600',
            primaryHover: 'hover:from-blue-700 hover:to-cyan-700',
            ring: 'ring-blue-500',
            border: 'border-blue-300',
            text: 'text-blue-700',
            textDark: 'text-blue-900',
            bgLight: 'bg-blue-50',
            bgCard: 'bg-gradient-to-br from-white to-blue-50',
            icon: '🛒',
            roleText: 'Buyer Profile',
            decorIcons: [ShoppingCart, TrendingUp, Package],
            accentColor: '#3b82f6',
            pattern: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%233b82f6" fill-opacity="0.08"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'
        }
        : {
            // Farmer Theme - Rich Agricultural Green
            gradient: 'from-emerald-600 via-green-600 to-lime-600',
            bgGradient: 'from-green-50 via-emerald-50 to-lime-50',
            primary: 'bg-gradient-to-r from-emerald-600 to-green-600',
            primarySolid: 'bg-green-600',
            primaryHover: 'hover:from-emerald-700 hover:to-green-700',
            ring: 'ring-green-500',
            border: 'border-green-300',
            text: 'text-green-700',
            textDark: 'text-green-900',
            bgLight: 'bg-green-50',
            bgCard: 'bg-gradient-to-br from-white to-green-50',
            icon: '🌾',
            roleText: 'Farmer Profile',
            decorIcons: [Leaf, Tractor, Sprout],
            accentColor: '#10b981',
            pattern: 'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2310b981" fill-opacity="0.08"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'
        };

    useEffect(() => {
        if (user && !hasFetchedProfile.current) {
            hasFetchedProfile.current = true;
            getProfile();
            if (effectiveRole === 'farmer') {
                fetchReviews();
            }
        } else if (!user) {
            setLoading(false);
        }
    }, [user]);

    const getProfile = async () => {
        try {
            setLoading(true);
            const userId = user.uuid || user.id;

            setFormData(prev => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
            }));

            let { data, error, status } = await supabase
                .from('profiles')
                .select(`name, email, phone, dob, state, district, taluka, village, avatar_url, rating, rating_count`)
                .eq('id', userId)
                .single();

            if (error && status !== 406) {
                if (error.code !== 'PGRST116') {
                    console.error('Error loading profile:', error);
                }
            }

            if (data) {
                setFormData({
                    name: data.name || user.name || '',
                    email: data.email || user.email || '',
                    phone: data.phone || '',
                    dob: data.dob || '',
                    state: data.state || '',
                    district: data.district || '',
                    taluka: data.taluka || '',
                    village: data.village || '',
                    rating: data.rating || 0,
                    rating_count: data.rating_count || 0
                });
                if (data.avatar_url) setAvatarUrl(data.avatar_url);
            }
        } catch (error) {
            console.error('Error loading user data!', error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const userId = user.uuid || user.id;
            const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${API}/api/ratings/farmer/${userId}/details`);
            if (response.ok) {
                const data = await response.json();
                setReviews(data.ratings || []);
            }
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();

        try {
            if (!user) throw new Error("No user logged in");
            setLoading(true);

            const userId = user.uuid || user.id;

            const updates = {
                id: userId,
                ...formData,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            let { error } = await supabase.from('profiles').upsert(updates);

            if (error) {
                throw error;
            }

            if (login) {
                login({ ...user, ...formData });
            }

            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        if (!user) return;

        try {
            setLoading(true);
            const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
            const response = await fetch(`${API}/api/auth/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: user.uuid || user.id })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete account");
            }

            alert("Account deleted successfully.");
            // Force redirect to login
            window.location.href = '/login';

        } catch (error) {
            console.error("Delete account error:", error);
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (event) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            let { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

            setAvatarUrl(publicUrl);
            setMessage('Image uploaded successfully! Click Save Profile to persist.');
            setTimeout(() => setMessage(''), 3000);

        } catch (error) {
            setMessage(`Error uploading image: ${error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStateChange = (e) => {
        setFormData({ ...formData, state: e.target.value, district: '' });
    };

    const getInitials = () => {
        if (!user || !user.name) return 'U';
        const names = user.name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return user.name.substring(0, 2).toUpperCase();
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
                <div className="bg-white p-8 rounded-xl shadow-2xl text-center">
                    <p className="text-red-600 text-lg font-semibold">Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    const DecorIcon1 = theme.decorIcons[0];
    const DecorIcon2 = theme.decorIcons[1];
    const DecorIcon3 = theme.decorIcons[2];

    return (
        <div className={`min-h-screen bg-gradient-to-br ${theme.bgGradient} py-8 px-4`}>
            {/* Animated Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
                <div className={`absolute top-20 left-10 ${theme.text} animate-bounce`} style={{ animationDuration: '3s' }}>
                    <DecorIcon1 size={60} />
                </div>
                <div className={`absolute bottom-32 right-20 ${theme.text} animate-bounce`} style={{ animationDelay: '1s', animationDuration: '4s' }}>
                    <DecorIcon2 size={80} />
                </div>
                <div className={`absolute top-1/3 right-10 ${theme.text} animate-bounce`} style={{ animationDelay: '2s', animationDuration: '3.5s' }}>
                    <DecorIcon3 size={70} />
                </div>
            </div>

            <div className="container mx-auto max-w-4xl relative z-10">
                {/* Enhanced Header Card with Glassmorphism */}
                <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden mb-6 transform transition-all duration-300 hover:shadow-3xl border border-white border-opacity-30">
                    {/* Gradient Header with Pattern */}
                    <div className={`bg-gradient-to-r ${theme.gradient} h-40 relative overflow-hidden`}>
                        {/* Pattern Overlay */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{ backgroundImage: `url("${theme.pattern}")` }}
                        ></div>

                        {/* Animated Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent animate-pulse"></div>

                        {/* Decorative Icons in Header */}
                        <div className="absolute top-4 right-4 flex gap-4 text-white opacity-30">
                            <DecorIcon1 size={40} className="animate-pulse" />
                            <DecorIcon2 size={40} className="animate-pulse" style={{ animationDelay: '0.5s' }} />
                            <DecorIcon3 size={40} className="animate-pulse" style={{ animationDelay: '1s' }} />
                        </div>
                    </div>

                    <div className="relative px-8 pb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 md:-mt-16">
                            {/* Enhanced Avatar with Glow Effect */}
                            <div className="relative group">
                                {avatarUrl ? (
                                    <div className="relative">
                                        <img
                                            src={avatarUrl}
                                            alt="Profile"
                                            className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-opacity-50 transition-all duration-300 group-hover:scale-105"
                                            style={{ ringColor: theme.accentColor }}
                                        />
                                        {/* Glow effect */}
                                        <div
                                            className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
                                            style={{ background: theme.accentColor }}
                                        ></div>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <div
                                            className={`w-36 h-36 rounded-full ${theme.primary} flex items-center justify-center text-white text-5xl font-bold border-4 border-white shadow-2xl ring-4 ring-opacity-50 transition-all duration-300 group-hover:scale-105`}
                                            style={{ ringColor: theme.accentColor }}
                                        >
                                            {getInitials()}
                                        </div>
                                        {/* Glow effect */}
                                        <div
                                            className="absolute inset-0 rounded-full blur-xl opacity-30 group-hover:opacity-50 transition-opacity"
                                            style={{ background: theme.accentColor }}
                                        ></div>
                                    </div>
                                )}
                                <label className={`absolute bottom-2 right-2 ${theme.primary} text-white p-3 rounded-full cursor-pointer ${theme.primaryHover} transition-all shadow-lg hover:scale-110 transform`}>
                                    <Upload size={20} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={uploadAvatar}
                                        disabled={uploading}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Enhanced User Info */}
                            <div className="md:ml-8 mt-6 md:mt-0 text-center md:text-left flex-1">
                                <h1 className={`text-4xl font-extrabold ${theme.textDark} mb-2 tracking-tight`}>
                                    {user.name || 'User'}
                                </h1>
                                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-3">
                                    <Mail size={18} className={theme.text} />
                                    <span className="font-medium">{user.email}</span>
                                </p>
                                <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full ${theme.primary} text-white font-bold text-lg shadow-lg transform transition-all hover:scale-105`}>
                                    <span className="text-2xl">{theme.icon}</span>
                                    {theme.roleText}
                                </div>
                                {effectiveRole === 'farmer' && (
                                    <div className="inline-flex items-center gap-2 px-6 py-2 ml-3 rounded-full bg-yellow-100 text-yellow-700 font-bold text-lg shadow-lg border border-yellow-200 transform transition-all hover:scale-105">
                                        <Star size={20} className="fill-yellow-500 text-yellow-500" />
                                        <span>{Number(formData.rating || 0).toFixed(1)}</span>
                                        <span className="text-sm font-normal text-yellow-600">({formData.rating_count || 0})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Success/Error Message */}
                {message && (
                    <div className={`mb-6 p-5 rounded-2xl shadow-lg transform transition-all duration-500 ${message.includes('Error')
                        ? 'bg-gradient-to-r from-red-100 to-pink-100 border-2 border-red-300 text-red-800'
                        : `bg-gradient-to-r ${theme.bgCard} border-2 ${theme.border} ${theme.text}`
                        } animate-bounce`} style={{ animationIterationCount: 1 }}>
                        <p className="font-bold text-center flex items-center justify-center gap-2">
                            <span className="text-2xl">{message.includes('Error') ? '⚠️' : '✅'}</span>
                            {message}
                        </p>
                    </div>
                )}

                {/* Enhanced Profile Form Card */}
                <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-30 transform transition-all duration-300 hover:shadow-3xl">
                    <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-gray-200">
                        <div className={`p-3 rounded-xl ${theme.primary} text-white shadow-lg`}>
                            <User size={28} />
                        </div>
                        <h2 className={`text-3xl font-extrabold ${theme.textDark}`}>Personal Information</h2>
                    </div>

                    <form onSubmit={updateProfile} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className={`flex items-center gap-2 ${theme.textDark} font-bold mb-3 transition-all group-hover:gap-3`}>
                                    <User size={20} className={theme.text} />
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full border-2 ${theme.border} p-4 rounded-xl focus:${theme.ring} focus:ring-2 focus:outline-none transition-all duration-300 hover:shadow-lg bg-white`}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="group">
                                <label className={`flex items-center gap-2 ${theme.textDark} font-bold mb-3 transition-all group-hover:gap-3`}>
                                    <Mail size={20} className={theme.text} />
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full border-2 border-gray-300 p-4 rounded-xl bg-gray-100 cursor-not-allowed opacity-75"
                                />
                            </div>
                            <div className="group">
                                <label className={`flex items-center gap-2 ${theme.textDark} font-bold mb-3 transition-all group-hover:gap-3`}>
                                    <Phone size={20} className={theme.text} />
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full border-2 ${theme.border} p-4 rounded-xl focus:${theme.ring} focus:ring-2 focus:outline-none transition-all duration-300 hover:shadow-lg bg-white`}
                                    placeholder="+91 XXXXX XXXXX"
                                />
                            </div>
                            <div className="group">
                                <label className={`flex items-center gap-2 ${theme.textDark} font-bold mb-3 transition-all group-hover:gap-3`}>
                                    <Calendar size={20} className={theme.text} />
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className={`w-full border-2 ${theme.border} p-4 rounded-xl focus:${theme.ring} focus:ring-2 focus:outline-none transition-all duration-300 hover:shadow-lg bg-white`}
                                />
                            </div>
                        </div>

                        {/* Enhanced Location Info Section */}
                        <div className={`pt-8 border-t-2 ${theme.border} mt-8`}>
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-3 rounded-xl ${theme.primary} text-white shadow-lg`}>
                                    <MapPin size={24} />
                                </div>
                                <h3 className={`text-2xl font-extrabold ${theme.textDark}`}>Location Details</h3>
                            </div>



                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className={`${theme.textDark} font-bold mb-3 block transition-all`}>State</label>
                                    <select
                                        name="state"
                                        value={formData.state}
                                        onChange={handleStateChange}
                                        className={`w-full border-2 ${theme.border} p-4 rounded-xl focus:${theme.ring} focus:ring-2 focus:outline-none transition-all duration-300 hover:shadow-lg bg-white cursor-pointer`}
                                    >
                                        <option value="">Select State</option>
                                        {Object.keys(stateDistricts).map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="group">
                                    <label className={`${theme.textDark} font-bold mb-3 block transition-all`}>District</label>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        disabled={!formData.state}
                                        className={`w-full border-2 ${theme.border} p-4 rounded-xl focus:${theme.ring} focus:ring-2 focus:outline-none transition-all duration-300 bg-white ${!formData.state ? 'opacity-50 cursor-not-allowed hover:shadow-none' : 'cursor-pointer hover:shadow-lg'}`}
                                    >
                                        <option value="">{formData.state ? 'Select District' : 'Select State First'}</option>
                                        {formData.state && stateDistricts[formData.state]?.map((dist) => (
                                            <option key={dist} value={dist}>{dist}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="group">
                                    <label className={`${theme.textDark} font-bold mb-3 block transition-all`}>Taluka</label>
                                    <input
                                        type="text"
                                        name="taluka"
                                        value={formData.taluka}
                                        onChange={handleChange}
                                        className={`w-full border-2 ${theme.border} p-4 rounded-xl focus:${theme.ring} focus:ring-2 focus:outline-none transition-all duration-300 hover:shadow-lg bg-white`}
                                        placeholder="Enter Taluka"
                                    />
                                </div>
                                <div className="group">
                                    <label className={`${theme.textDark} font-bold mb-3 block transition-all`}>Village</label>
                                    <input
                                        type="text"
                                        name="village"
                                        value={formData.village}
                                        onChange={handleChange}
                                        className={`w-full border-2 ${theme.border} p-4 rounded-xl focus:${theme.ring} focus:ring-2 focus:outline-none transition-all duration-300 hover:shadow-lg bg-white`}
                                        placeholder="Enter Village"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${theme.primary} ${theme.primaryHover} text-white font-bold py-5 rounded-2xl transition-all duration-300 shadow-2xl flex items-center justify-center gap-3 text-lg ${loading
                                ? 'opacity-70 cursor-not-allowed'
                                : 'hover:shadow-3xl transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]'
                                }`}
                        >
                            <Save size={24} className={loading ? 'animate-spin' : ''} />
                            {loading ? 'Saving Your Profile...' : 'Save Profile'}

                        </button>
                    </form>
                </div>

                {/* Reviews Section for Farmers */}
                {effectiveRole === 'farmer' && (
                    <div className="bg-white bg-opacity-80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white border-opacity-30 mt-8 transform transition-all duration-300 hover:shadow-3xl">
                        <div className="flex items-center gap-3 mb-8 pb-4 border-b-2 border-gray-200">
                            <div className={`p-3 rounded-xl bg-yellow-100 text-yellow-600 shadow-lg`}>
                                <Star size={28} className="fill-yellow-600" />
                            </div>
                            <h2 className={`text-3xl font-extrabold ${theme.textDark}`}>Reviews & Reputation</h2>
                        </div>

                        {reviews.length > 0 ? (
                            <div className="grid grid-cols-1 gap-6">
                                {reviews.map((review) => (
                                    <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    {review.buyer?.avatar_url ? (
                                                        <img src={review.buyer.avatar_url} alt={review.buyer.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                                            {review.buyer?.name?.charAt(0) || 'B'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800">{review.buyer?.name || 'Buyer'}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                                <Star size={14} className="fill-yellow-500 text-yellow-500" />
                                                <span className="font-bold text-yellow-700">{review.rating}</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 italic">"{review.review_text || 'No comment provided.'}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                <Star size={40} className="mx-auto text-gray-300 mb-3" />
                                <p className="text-gray-500 font-medium">No reviews yet.</p>
                                <p className="text-sm text-gray-400">Complete contracts to earn ratings from buyers!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Danger Zone */}
                <div className="mt-12 bg-red-50 rounded-3xl p-8 border border-red-200">
                    <h3 className="text-2xl font-bold text-red-800 mb-4">Danger Zone</h3>
                    <p className="text-red-600 mb-6">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                        onClick={handleDeleteAccount}
                        className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg flex items-center gap-2"
                    >
                        <Trash2 size={20} />
                        Delete My Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Profile;
