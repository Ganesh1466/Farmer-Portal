import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Leaf, Tractor, Wheat, Sun, CloudRain, ShoppingCart, TrendingUp, Package, Truck, Wallet, Mail } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'farmer'; // Default to farmer if no role specified

    const GoogleLogo = () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: role
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Update formData when role changes
    useEffect(() => {
        setFormData(prev => ({ ...prev, role: role }));
    }, [role]);

    // Theme colors based on role
    const theme = role === 'farmer'
        ? {
            primary: 'green',
            pageBg: 'bg-gradient-to-br from-green-500 via-emerald-400 to-lime-500', // Rich Farmer Gradient
            cardBg: 'bg-white/95 backdrop-blur-sm',
            textColor: 'text-green-800',
            borderColor: 'border-green-200',
            focusRing: 'focus:ring-green-500',
            buttonBg: 'bg-green-600',
            buttonHover: 'hover:bg-green-700',
            linkColor: 'text-green-700',
            linkHover: 'hover:text-green-800',
            icons: [Leaf, Tractor, Wheat, Sun, CloudRain]
        }
        : {
            primary: 'blue',
            pageBg: 'bg-gradient-to-br from-blue-600 via-cyan-500 to-sky-400', // Professional Buyer Gradient
            cardBg: 'bg-white/95 backdrop-blur-sm',
            textColor: 'text-blue-800',
            borderColor: 'border-blue-200',
            focusRing: 'focus:ring-blue-500',
            buttonBg: 'bg-blue-600',
            buttonHover: 'hover:bg-blue-700',
            linkColor: 'text-blue-700',
            linkHover: 'hover:text-blue-800',
            icons: [ShoppingCart, TrendingUp, Package, Truck, Wallet]
        };

    const FloatingIcons = () => {
        const Icon1 = theme.icons[0];
        const Icon2 = theme.icons[1];
        const Icon3 = theme.icons[2];
        const Icon4 = theme.icons[3];
        const Icon5 = theme.icons[4];

        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <Icon1 className="absolute top-10 left-10 text-white opacity-20 w-16 h-16 animate-float" />
                <Icon2 className="absolute bottom-20 right-10 text-white opacity-20 w-20 h-20 animate-float-slow" />
                <Icon3 className="absolute top-1/3 right-20 text-white opacity-20 w-12 h-12 animate-float-fast" />
                <Icon4 className="absolute bottom-1/4 left-20 text-white opacity-20 w-14 h-14 animate-float" />
                <Icon5 className="absolute top-1/2 left-1/2 text-white opacity-10 w-24 h-24 animate-float-slow" />
            </div>
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            setLoading(false);
            return;
        }

        try {
            // 2️⃣ Supabase Signup
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        role: formData.role, // farmer / buyer
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                setSuccessMsg("Registration successful! Redirecting to login...");
                // Redirect after short delay
                setTimeout(() => {
                    navigate(`/login?role=${role}`);
                }, 2000);
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            // Save the selected role before redirecting
            localStorage.setItem('pendingRole', role);

            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.hostname === 'localhost' ? window.location.origin : "https://farmer-portal-xi.vercel.app",
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Google Login Error:", error);
            setError(error.message);
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${theme.pageBg} relative overflow-hidden`}>
            {/* Animated Floating Background Icons */}
            <FloatingIcons />

            <div className={`max-w-md w-full p-8 border ${theme.borderColor} rounded-2xl shadow-2xl ${theme.cardBg} relative z-10 animate-fade-in-up`}>
                <div className="text-center mb-8">
                    <h2 className={`text-3xl font-bold ${theme.textColor} mb-2`}>
                        {role === 'farmer' ? '🌾 Farmer Registration' : '🛒 Buyer Registration'}
                    </h2>
                    <p className="text-gray-600">Join Bhumi Putra</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center border border-red-200">
                        {error}
                    </div>
                )}

                {/* Toast Notification */}
                {successMsg && (
                    <div className="fixed top-5 right-5 z-50 animate-fade-in-up">
                        <div className="bg-white border-l-4 border-green-500 rounded-xl shadow-2xl p-6 flex items-center gap-4 max-w-md transform transition-all hover:scale-105">
                            <div className="bg-green-100 p-3 rounded-full text-green-600 shadow-sm">
                                <Mail size={28} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">Registration Successful!</h3>
                                <p className="text-gray-600 font-medium">Please check your email to confirm your account.</p>
                                <p className="text-xs text-gray-400 mt-1">Redirecting to login...</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className={`block ${theme.textColor} font-semibold mb-2`}>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full border-2 ${theme.borderColor} p-3 rounded-lg ${theme.focusRing} focus:outline-none focus:border-transparent transition-all`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block ${theme.textColor} font-semibold mb-2`}>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full border-2 ${theme.borderColor} p-3 rounded-lg ${theme.focusRing} focus:outline-none focus:border-transparent transition-all`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block ${theme.textColor} font-semibold mb-2`}>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full border-2 ${theme.borderColor} p-3 rounded-lg ${theme.focusRing} focus:outline-none focus:border-transparent transition-all`}
                            required
                        />
                    </div>
                    <div>
                        <label className={`block ${theme.textColor} font-semibold mb-2`}>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`w-full border-2 ${theme.borderColor} p-3 rounded-lg ${theme.focusRing} focus:outline-none focus:border-transparent transition-all`}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`w-full ${theme.buttonBg} text-white p-3 rounded-lg ${theme.buttonHover} transition-all font-semibold shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className={`px-2 bg-white ${theme.textColor}`}>Or continue with</span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="mt-4 w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg p-3 text-gray-700 font-medium hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <GoogleLogo />
                        Sign up with Google
                    </button>
                </div>

                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{' '}
                    <Link to={`/login?role=${role}`} className={`${theme.linkColor} ${theme.linkHover} hover:underline font-semibold`}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
