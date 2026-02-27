import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import heroOverlay from '../../assets/images/hero-overlay.png';

const HeroSection = () => {
    const { user } = useAuth();

    // Determine button text and link based on user role
    const getPrimaryButton = () => {
        if (!user) {
            return {
                text: 'Get Advisory',
                link: '/advisory',
                className: 'bg-green-600 hover:bg-green-700'
            };
        }

        const role = user.user_metadata?.role || user.role;

        if (role === 'farmer') {
            return {
                text: '🌱 Sell Crop',
                link: '/sell-crop',
                className: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
            };
        }

        if (role === 'buyer') {
            return {
                text: '🛒 Buy Crop',
                link: '/buy-crop',
                className: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
            };
        }

        // Default fallback
        return {
            text: 'Get Advisory',
            link: '/advisory',
            className: 'bg-green-600 hover:bg-green-700'
        };
    };

    const primaryButton = getPrimaryButton();

    return (
        <div className="relative h-[500px] w-full overflow-hidden rounded-xl shadow-2xl">
            {/* Video Background */}
            <div className="absolute inset-0">
                <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline

                >
                    <source src="/images/crops/video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white p-4">
                <img
                    src={heroOverlay}
                    alt="Farmer Icon"
                    className="w-40 h-40 rounded-full border-4 border-green-500 shadow-lg mb-6 object-cover animate-fade-in-down"
                />
                <h1 className="text-3xl md:text-4xl font-bold mb-4 animate-fade-in-down">
                    Cultivating Prosperity: Technology for the Modern Farmer
                </h1>
                <p className="text-lg md:text-xl mb-8 max-w-2xl animate-fade-in-up">
                    Get real-time insights, expert advice, and market trends to revolutionize your farming.
                </p>
                <div className="flex space-x-4">
                    <Link
                        to={primaryButton.link}
                        className={`${primaryButton.className} text-white font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 shadow-lg`}
                    >
                        {primaryButton.text}
                    </Link>
                    <Link
                        to="/community"
                        className="bg-white hover:bg-gray-100 text-green-800 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105"
                    >
                        Join Community
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;

