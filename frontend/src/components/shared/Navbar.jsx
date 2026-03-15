import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Bell, X, Menu } from 'lucide-react';
import io from 'socket.io-client';
import BuyerDetailsModal from './BuyerDetailsModal';
import FarmerDetailsModal from './FarmerDetailsModal';
import { supabase } from '../../supabaseClient';

import logo from '../../assets/logos/logo.png';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API;
const socket = io(SOCKET_URL);

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showLoginDropdown, setShowLoginDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showBuyerModal, setShowBuyerModal] = useState(false);
    const [selectedBuyerId, setSelectedBuyerId] = useState(null);
    const [showFarmerModal, setShowFarmerModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (user) {
            // Join user private room
            socket.emit('join_room', user.id);

            // Fetch initial notifications
            fetchNotifications();

            // Listen for real-time notifications
            socket.on('notification_received', (newNotification) => {
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                // Optional: Play sound or show browser notification
            });
        }

        return () => {
            socket.off('notification_received');
        };
    }, [user]);

    const fetchNotifications = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('receiver_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        if (!error && data) {
            setNotifications(data);
            const unread = data.filter(n => n.status === 'unread').length;
            setUnreadCount(unread);
        }
    };

    const markAsRead = async () => {
        if (unreadCount === 0) return;

        // Optimistic update
        setUnreadCount(0);
        const updatedNotifications = notifications.map(n => ({ ...n, status: 'read' }));
        setNotifications(updatedNotifications);

        // Update in DB
        await supabase
            .from('notifications')
            .update({ status: 'read' })
            .eq('receiver_id', user.id)
            .eq('status', 'unread');
    };

    const toggleNotifications = () => {
        if (!showNotifications) {
            markAsRead();
        }
        setShowNotifications(!showNotifications);
        setShowProfileDropdown(false);
    };

    const handleNotificationClick = async (notification) => {
        // Set notification data
        setSelectedNotification(notification);

        // Open appropriate modal based on notification type
        if (notification.type === 'contract_generated' || notification.type === 'deal_accepted') {
            // Buyer viewing contract from farmer OR deal acceptance
            setShowFarmerModal(true);
        } else {
            // Farmer viewing buyer interest (crop_interest)
            setSelectedBuyerId(notification.sender_id);
            setShowBuyerModal(true);
        }

        // Close dropdown
        setShowNotifications(false);

        // Mark as read if not already
        if (notification.status === 'unread') {
            const updatedNotifications = notifications.map(n =>
                n.id === notification.id ? { ...n, status: 'read' } : n
            );
            setNotifications(updatedNotifications);
            setUnreadCount(prev => Math.max(0, prev - 1));

            await supabase
                .from('notifications')
                .update({ status: 'read' })
                .eq('id', notification.id);
        }
    };

    const handleLogout = () => {
        logout();
        setShowProfileDropdown(false);
        setShowNotifications(false);
        navigate('/');
    };

    // Get user's first name or full name
    const getUserDisplayName = () => {
        if (!user) return '';
        const name = user.name || user.user_metadata?.full_name || user.user_metadata?.name || 'User';
        return name.split(' ')[0]; // Get first name
    };

    // Get avatar initials
    const getInitials = () => {
        if (!user) return '';
        const name = user.name || user.user_metadata?.full_name || user.user_metadata?.name || 'U';
        const names = name.split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Get role-based colors
    const getRoleColors = () => {
        const role = user?.user_metadata?.role || user?.role;
        if (role === 'buyer') {
            return {
                bg: 'bg-blue-600',
                hover: 'hover:bg-blue-700',
                text: 'text-blue-600',
                border: 'border-blue-600'
            };
        }
        // Default to farmer (green)
        return {
            bg: 'bg-green-600',
            hover: 'hover:bg-green-700',
            text: 'text-green-600',
            border: 'border-green-600'
        };
    };

    const colors = getRoleColors();

    return (
        <nav className="bg-white shadow-lg p-4 sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Left Side: Logo */}
                <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-green-600">
                    <img src={logo} alt="Bhumi Putra Logo" className="h-10 w-10 object-contain" />
                    <span>Bhumi Putra</span>
                </Link>

                {/* Right Side: Navigation Links and Login/Profile */}
                <div className="flex items-center space-x-2 md:space-x-6">
                    <div className="hidden md:flex space-x-8">
                        <Link to="/" className="text-lg font-medium text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition-all duration-300 pb-1">Home</Link>
                        <Link to="/advisory" className="text-lg font-medium text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition-all duration-300 pb-1">Advisory</Link>
                        <Link to="/weather" className="text-lg font-medium text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition-all duration-300 pb-1">Weather</Link>
                        <Link to="/mandi" className="text-lg font-medium text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition-all duration-300 pb-1">Mandi</Link>
                        <Link to="/community" className="text-lg font-medium text-gray-600 hover:text-green-600 border-b-2 border-transparent hover:border-green-600 transition-all duration-300 pb-1">Community</Link>
                    </div>

                    {/* Conditional Rendering: Login Dropdown or Profile Dropdown */}
                    {!user ? (
                        /* Login Dropdown - Show when NOT logged in */
                        <div
                            className="relative"
                            onMouseEnter={() => setShowLoginDropdown(true)}
                            onMouseLeave={() => setShowLoginDropdown(false)}
                        >
                            <button className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition duration-300">
                                Login
                            </button>

                            {/* Dropdown Menu */}
                            {showLoginDropdown && (
                                <div className="absolute right-0 top-full pt-2 w-48 z-50">
                                    <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                                        <Link
                                            to="/login?role=farmer"
                                            className="block px-4 py-3 bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 font-medium"
                                        >
                                            🌾 Farmer Login
                                        </Link>
                                        <div className="border-t border-gray-100"></div>
                                        <Link
                                            to="/login?role=buyer"
                                            className="block px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 font-medium"
                                        >
                                            🛒 Buyer Login
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={toggleNotifications}
                                    className="p-2 relative text-gray-600 hover:text-green-600 transition-colors"
                                >
                                    <Bell size={24} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>

                                {/* Notification Dropdown */}
                                {showNotifications && (
                                    <div className="absolute right-0 top-full mt-2 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-fade-in-up">
                                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                            <h3 className="font-bold text-gray-700">Notifications</h3>
                                            <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600">
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-8 text-center text-gray-500">
                                                    <Bell size={32} className="mx-auto mb-2 opacity-20" />
                                                    <p>No notifications yet</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-gray-50">
                                                    {notifications.map((notif, index) => (
                                                        <div
                                                            key={index}
                                                            onClick={() => handleNotificationClick(notif)}
                                                            className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${notif.status === 'unread' ? 'bg-blue-50/50' : ''}`}
                                                        >
                                                            <div className="flex gap-3">
                                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                                                    <span className="text-xl">🌾</span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                                                        {notif.type === 'contract_generated' ? (
                                                                            <>
                                                                                <span className="font-bold text-gray-900">{notif.buyer_name || 'Farmer'}</span> generated a contract for <span className="font-bold text-green-700">{notif.crop_name}</span>
                                                                            </>
                                                                        ) : notif.type === 'deal_accepted' ? (
                                                                            <>
                                                                                <span className="font-bold text-gray-900">{notif.buyer_name || 'Farmer'}</span> accepted your interest in <span className="font-bold text-green-700">{notif.crop_name}</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <span className="font-bold text-gray-900">{notif.buyer_name || 'Someone'}</span> is interested in your <span className="font-bold text-green-700">{notif.crop_name}</span>
                                                                            </>
                                                                        )}
                                                                    </p>
                                                                    {notif.buyer_contact && (
                                                                        <p className="text-xs text-blue-600 font-semibold mt-1 bg-blue-50 inline-block px-2 py-1 rounded">
                                                                            📞 {notif.buyer_contact}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs text-gray-400 mt-2">
                                                                        {new Date(notif.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buyer Details Modal */}
                            <BuyerDetailsModal
                                isOpen={showBuyerModal}
                                onClose={() => setShowBuyerModal(false)}
                                buyerId={selectedBuyerId}
                                notificationData={selectedNotification}
                            />

                            {/* Farmer Details Modal (for buyers viewing contract) */}
                            <FarmerDetailsModal
                                isOpen={showFarmerModal}
                                onClose={() => setShowFarmerModal(false)}
                                notification={selectedNotification}
                            />

                            {/* Profile Dropdown - Show when logged in */}
                            <div
                                className="relative"
                                onMouseEnter={() => setShowProfileDropdown(true)}
                                onMouseLeave={() => setShowProfileDropdown(false)}
                            >
                                <button className={`flex items-center space-x-3 ${colors.bg} text-white px-4 py-2 rounded-full font-semibold ${colors.hover} transition duration-300 shadow-md`}>
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-white bg-opacity-30 flex items-center justify-center font-bold text-sm">
                                        {getInitials()}
                                    </div>
                                    {/* User Name */}
                                    <span className="hidden md:block">{getUserDisplayName()}</span>
                                    {/* Role Badge */}
                                    <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">
                                        {(user.user_metadata?.role || user.role) === 'farmer' ? '🌾' : '🛒'}
                                    </span>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {showProfileDropdown && (
                                    <div className="absolute right-0 top-full pt-2 w-56 z-50">
                                        <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                                            {/* User Info Header */}
                                            <div className={`${colors.bg} text-white px-4 py-3`}>
                                                <p className="font-semibold text-sm">{user.name || user.user_metadata?.full_name || user.user_metadata?.name || 'User'}</p>
                                                <p className="text-xs mt-1 bg-white bg-opacity-20 inline-block px-2 py-1 rounded-full">
                                                    {(user.user_metadata?.role || user.role) === 'farmer' ? '🌾 Farmer' : '🛒 Buyer'}
                                                </p>
                                            </div>

                                            {/* Menu Items */}
                                            <div className="py-1">
                                                <Link
                                                    to="/profile"
                                                    className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
                                                    onClick={() => setShowProfileDropdown(false)}
                                                >
                                                    <User size={18} className={`mr-3 ${colors.text}`} />
                                                    <span className="text-gray-700 font-medium">My Profile</span>
                                                </Link>
                                                <div className="border-t border-gray-100"></div>
                                                <button
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center px-4 py-3 hover:bg-red-50 transition-colors duration-200 text-left"
                                                >
                                                    <LogOut size={18} className="mr-3 text-red-600" />
                                                    <span className="text-red-600 font-medium">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {/* Hamburger Menu Button - Mobile Only */}
                    <button
                        className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-4 shadow-xl animate-fade-in-down">
                    <Link
                        to="/"
                        className="block text-lg font-medium text-gray-600 hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Home
                    </Link>
                    <Link
                        to="/advisory"
                        className="block text-lg font-medium text-gray-600 hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Advisory
                    </Link>
                    <Link
                        to="/weather"
                        className="block text-lg font-medium text-gray-600 hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Weather
                    </Link>
                    <Link
                        to="/mandi"
                        className="block text-lg font-medium text-gray-600 hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Mandi
                    </Link>
                    <Link
                        to="/community"
                        className="block text-lg font-medium text-gray-600 hover:text-green-600 transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Community
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
