const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Submit rating for a farmer after delivery
const submitRating = async (req, res) => {
    try {
        const { contractId, farmerId, buyerId, rating, reviewText } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        // Check if contract exists and belongs to buyer
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .select('*')
            .eq('id', contractId)
            .eq('buyer_id', buyerId)
            .eq('delivery_status', 'delivered')
            .single();

        if (contractError || !contract) {
            return res.status(404).json({ message: "Contract not found or not delivered yet" });
        }

        // Check if rating already exists for this contract
        const { data: existingRating } = await supabase
            .from('ratings')
            .select('*')
            .eq('contract_id', contractId)
            .single();

        if (existingRating) {
            return res.status(400).json({ message: "Rating already submitted for this contract" });
        }

        // Insert rating
        const { data: ratingData, error: ratingError } = await supabase
            .from('ratings')
            .insert([{
                contract_id: contractId,
                farmer_id: farmerId,
                buyer_id: buyerId,
                rating: rating,
                review_text: reviewText || null
            }])
            .select()
            .single();

        if (ratingError) {
            console.error("Error inserting rating:", ratingError);
            return res.status(500).json({ message: "Failed to submit rating" });
        }

        // Update contract delivery status to 'rated'
        await supabase
            .from('contracts')
            .update({ delivery_status: 'rated' })
            .eq('id', contractId);

        // Update farmer's average rating
        const { data: allRatings } = await supabase
            .from('ratings')
            .select('rating')
            .eq('farmer_id', farmerId);

        if (allRatings && allRatings.length > 0) {
            const totalRating = allRatings.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = (totalRating / allRatings.length).toFixed(2);

            await supabase
                .from('profiles')
                .update({
                    rating: avgRating,
                    rating_count: allRatings.length
                })
                .eq('id', farmerId);
        }

        res.status(201).json({
            message: "Rating submitted successfully",
            rating: ratingData
        });

    } catch (error) {
        console.error("Submit Rating Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get farmer's rating and count
const getFarmerRating = async (req, res) => {
    try {
        const { farmerId } = req.params;

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('rating, rating_count')
            .eq('id', farmerId)
            .single();

        if (error) {
            return res.status(404).json({ message: "Farmer not found" });
        }

        res.status(200).json({
            rating: profile.rating || 0,
            ratingCount: profile.rating_count || 0
        });

    } catch (error) {
        console.error("Get Farmer Rating Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all ratings for a farmer (detailed)
const getFarmerRatings = async (req, res) => {
    try {
        const { farmerId } = req.params;

        // 1. Fetch ratings without join first
        const { data: ratings, error } = await supabase
            .from('ratings')
            .select('*')
            .eq('farmer_id', farmerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching ratings:", error);
            return res.status(500).json({ message: "Failed to fetch ratings" });
        }

        if (!ratings || ratings.length === 0) {
            return res.status(200).json({ ratings: [] });
        }

        // 2. Manually fetch buyer profiles (Robust against missing FKs)
        const buyerIds = [...new Set(ratings.map(r => r.buyer_id).filter(id => id))];

        let buyerMap = {};

        if (buyerIds.length > 0) {
            const { data: buyers, error: buyersError } = await supabase
                .from('profiles')
                .select('id, name, avatar_url')
                .in('id', buyerIds);

            if (!buyersError && buyers) {
                buyers.forEach(b => { buyerMap[b.id] = b; });
            }
        }

        // 3. Attach buyer details to ratings
        const enrichedRatings = ratings.map(r => ({
            ...r,
            buyer: buyerMap[r.buyer_id] || { name: 'Unknown User', avatar_url: null }
        }));

        res.status(200).json({ ratings: enrichedRatings });

    } catch (error) {
        console.error("Get Farmer Ratings Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    submitRating,
    getFarmerRating,
    getFarmerRatings
};
