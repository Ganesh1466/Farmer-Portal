import { supabase } from '../supabaseClient';

/**
 * Fetch suitable crops based on farmer's soil and seasonal inputs.
 * 
 * Logic:
 * 1. Find crops suitable for the given Season.
 * 2. Filter crops that match the Soil Type and pH range.
 * 3. Filter crops that match the NPK levels (optional, mostly for prioritizing).
 */
export const getRecommendedCrops = async ({ season, soilType, phValue, nLevel, pLevel, kLevel }) => {
    try {
        // Step 1: Get base crops for the season (or 'All Season')
        let query = supabase
            .from('crop_agri_records')
            .select(`
                id,
                crop_name,
                season,
                duration_days,
                soil_crop_suitability!inner (
                    soil_type,
                    min_ph,
                    max_ph
                )
            `)
            .in('season', [season, 'All Season'])
            .eq('soil_crop_suitability.soil_type', soilType);

        // Execute query
        const { data, error } = await query;

        if (error) throw error;

        // Step 2: Client-side filtering for pH (Supabase filtering on joined tables can be complex for ranges)
        // We filter crops where the farmer's pH is within the suitable range.
        const filteredCrops = data.filter(crop => {
            const suitability = crop.soil_crop_suitability;
            // Check if ANY of the suitability records for this crop match the pH
            // Since we used !inner on soil_type, `suitability` will be a single object or array matching that soil type.
            // Supabase returns an array for one-to-many, but !inner might flatten it or return matches.
            // Let's assume it returns an array of matches.

            const pH = parseFloat(phValue);
            // If suitability is an array (standard join response)
            if (Array.isArray(suitability)) {
                return suitability.some(s => pH >= s.min_ph && pH <= s.max_ph);
            }
            // If single object
            return pH >= suitability.min_ph && pH <= suitability.max_ph;
        });

        return filteredCrops;

    } catch (error) {
        console.error('Error fetching recommended crops:', error);
        return [];
    }
};

/**
 * Fetch detailed advisory (fertilizers/pesticides) for a specific crop.
 */
export const getInputAdvisory = async (cropId) => {
    try {
        const { data, error } = await supabase
            .from('crop_input_advisory')
            .select('*')
            .eq('crop_id', cropId);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching advisory:', error);
        return [];
    }
};

/**
 * Save user inputs for analytics.
 */
export const saveFarmerInput = async (inputs) => {
    try {
        const { error } = await supabase
            .from('farmer_soil_inputs')
            .insert([inputs]);

        if (error) throw error;
    } catch (error) {
        console.error('Error saving inputs:', error);
    }
};
