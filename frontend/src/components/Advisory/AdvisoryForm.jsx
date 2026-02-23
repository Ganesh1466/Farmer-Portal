import { useState } from 'react';
import { stateDistricts, getDistrictAveragePH } from '../../utils/stateDistricts';


const AdvisoryForm = ({ onSubmit, loading }) => {
    const [formData, setFormData] = useState({
        state: '',
        district: '',
        season: 'Kharif',
        soilType: 'Black',
        phValue: '7.0',
        nLevel: 'Medium',
        pLevel: 'Medium',
        kLevel: 'Medium'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'state') {
            // Reset district when state changes
            setFormData({ ...formData, [name]: value, district: '' });
        } else if (name === 'district') {
            // Auto-fetch pH based on selected district
            const autoPh = getDistrictAveragePH(formData.state, value);
            setFormData({ ...formData, [name]: value, phValue: autoPh });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: Ensure State, District and pH are filled
        if (!formData.state || !formData.district || !formData.phValue) {
            alert("Please fill in all required fields (State, District, and Soil pH) to get accurate recommendations.");
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
            <h2 className="text-2xl font-bold text-green-700 mb-6 border-b pb-2">Step 1: Enter Farm Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* State/Region */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">State / Region</label>
                    <select
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                    </select>
                </div>

                {/* District Selection (Dependent on State) */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">District</label>
                    <select
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        disabled={!formData.state}
                        className={`w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none ${!formData.state ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    >
                        <option value="">{formData.state ? 'Select District' : 'Select State First'}</option>
                        {formData.state && stateDistricts[formData.state]?.map((dist) => (
                            <option key={dist} value={dist}>{dist}</option>
                        ))}
                    </select>
                </div>



                {/* Season */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Season</label>
                    <select
                        name="season"
                        value={formData.season}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="Kharif">Kharif (Monsoon)</option>
                        <option value="Rabi">Rabi (Winter)</option>
                        <option value="Zaid">Zaid (Summer)</option>
                    </select>
                </div>

                {/* Soil Type */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Soil Type</label>
                    <select
                        name="soilType"
                        value={formData.soilType}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="Black">Black Soil</option>
                        <option value="Red">Red Soil</option>
                        <option value="Alluvial">Alluvial Soil</option>
                        <option value="Clay">Clay</option>
                        <option value="Loamy">Loamy</option>
                        <option value="Sandy">Sandy</option>
                        <option value="Laterite">Laterite Soil</option>
                    </select>
                </div>

                {/* pH Value */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">Soil pH (1-14)</label>
                    <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="14"
                        name="phValue"
                        value={formData.phValue}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">*Auto-detected based on selected District</p>
                </div>

                {/* NPK Levels */}
                <div className="md:col-span-2 grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Nitrogen (N)</label>
                        <select
                            name="nLevel"
                            value={formData.nLevel}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Phosphorus (P)</label>
                        <select
                            name="pLevel"
                            value={formData.pLevel}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-1">Potassium (K)</label>
                        <select
                            name="kLevel"
                            value={formData.kLevel}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded text-sm"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-50"
            >
                {loading ? 'Analyzing...' : 'Get Recommendations'}
            </button>
        </form>
    );
};

export default AdvisoryForm;
