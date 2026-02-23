const ImpactStats = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 py-8 border-t">
            <div className="text-center">
                <div className="text-3xl font-bold text-green-600">10k+</div>
                <div className="text-gray-600">Farmers Helped</div>
            </div>
            <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">50+</div>
                <div className="text-gray-600">Experts</div>
            </div>
            <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">100%</div>
                <div className="text-gray-600">Free Advisory</div>
            </div>
        </div>
    );
};

export default ImpactStats;
