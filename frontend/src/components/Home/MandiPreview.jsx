const MandiPreview = () => {
    return (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-4">Market Rates</h2>
            <ul className="bg-white rounded shadow divide-y">
                <li className="p-3 flex justify-between">
                    <span>Wheat</span>
                    <span className="font-bold text-green-600">₹2100/quintal</span>
                </li>
                <li className="p-3 flex justify-between">
                    <span>Rice</span>
                    <span className="font-bold text-green-600">₹3200/quintal</span>
                </li>
            </ul>
        </div>
    );
};

export default MandiPreview;
