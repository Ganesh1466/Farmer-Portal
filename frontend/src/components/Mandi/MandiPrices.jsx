const MandiPrices = () => {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border">Crop</th>
                        <th className="py-2 px-4 border">Market</th>
                        <th className="py-2 px-4 border">Price (per quintal)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="py-2 px-4 border">Wheat</td>
                        <td className="py-2 px-4 border">Azadpur</td>
                        <td className="py-2 px-4 border text-green-600 font-bold">₹2150</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default MandiPrices;
