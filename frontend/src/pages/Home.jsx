import HeroSection from '../components/home/HeroSection';
import HomeInfoCards from '../components/home/HomeInfoCards';
import HomePhilosophy from '../components/home/HomePhilosophy';

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
