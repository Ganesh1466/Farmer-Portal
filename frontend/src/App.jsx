import { Routes, Route } from 'react-router-dom';
import Navbar from './components/shared/Navbar';
import Footer from './components/shared/Footer';
import Home from './pages/Home';
import Advisory from './pages/Advisory';
import Crops from './pages/Crops';
import CropDetail from './pages/CropDetail';
import Mandi from './pages/Mandi';
import Weather from './pages/Weather';
import Community from './pages/Community';
import NotFound from './pages/NotFound';
import Login from './components/auth-pages/Login';
import Register from './components/auth-pages/Register';
import Seasons from './pages/Seasons';
import Resources from './pages/Resources';
import Profile from './pages/Profile';
import SellCrop from './pages/SellCrop';
import BuyCrop from './pages/BuyCrop';




function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/advisory" element={<Advisory />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/crops/:id" element={<CropDetail />} />
          <Route path="/seasons" element={<Seasons />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/mandi" element={<Mandi />} />
          <Route path="/community" element={<Community />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/sell-crop" element={<SellCrop />} />
          <Route path="/buy-crop" element={<BuyCrop />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
