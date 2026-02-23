import { Link } from 'react-router-dom';
import { FaCloudSunRain, FaSeedling, FaBookReader } from 'react-icons/fa';

const HomeInfoCards = () => {
    const cards = [
        {
            title: "Seasonal Farming",
            icon: <FaCloudSunRain className="text-4xl text-blue-500 mb-4" />,
            description: "Explore crops tailored for Kharif, Rabi, and Zaid seasons. Optimize your yield by planting at the right time.",
            link: "/seasons", // Placeholder link
            bgGradient: "from-blue-50 to-blue-100",
            btnHover: "hover:bg-blue-600 hover:text-white hover:border-blue-600"
        },
        {
            title: "Crop Encyclopedia",
            icon: <FaSeedling className="text-4xl text-green-500 mb-4" />,
            description: "Detailed guides on various crops. Get access to cultivation techniques, pest management, and more.",
            link: "/crops", // Placeholder link
            bgGradient: "from-green-50 to-green-100",
            btnHover: "hover:bg-green-600 hover:text-white hover:border-green-600"
        },
        {
            title: "Knowledge Hub",
            icon: <FaBookReader className="text-4xl text-amber-500 mb-4" />,
            description: "Access famous farming books, articles, and expert resources to enhance your agricultural knowledge.",
            link: "/resources", // Placeholder link
            bgGradient: "from-amber-50 to-amber-100",
            btnHover: "hover:bg-amber-600 hover:text-white hover:border-amber-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br ${card.bgGradient} border border-gray-100 flex flex-col items-center text-center`}
                >
                    {card.icon}
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{card.title}</h3>
                    <p className="text-gray-600 mb-6">{card.description}</p>
                    <Link
                        to={card.link}
                        className={`mt-auto bg-white text-gray-800 font-semibold py-2 px-6 rounded-full border border-gray-200 transition-all duration-300 ${card.btnHover}`}
                    >
                        Explore
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default HomeInfoCards;
