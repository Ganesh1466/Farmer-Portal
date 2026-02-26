import HeroSection from '../components/Home/HeroSection';
import HomeInfoCards from '../components/Home/HomeInfoCards';
import HomePhilosophy from '../components/Home/HomePhilosophy';

const Home = () => {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <HeroSection />
            <HomeInfoCards />
            <HomePhilosophy />
        </div>
    );
};

export default Home;
