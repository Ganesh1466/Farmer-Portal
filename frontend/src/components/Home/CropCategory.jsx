const CropCategory = () => {
    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Explore Crops</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Wheat', 'Rice', 'Sugarcane', 'Cotton'].map((crop) => (
                    <div key={crop} className="bg-gray-100 p-4 rounded text-center cursor-pointer hover:bg-gray-200">
                        {crop}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CropCategory;
