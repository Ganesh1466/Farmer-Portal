import CropList from '../components/Crops/CropList';

const Crops = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8 text-center text-green-800">Crop Encyclopedia</h1>
            <CropList />
        </div>
    );
};

export default Crops;
