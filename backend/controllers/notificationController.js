const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Get notifications for a specific user
const getNotifications = async (req, res) => {
    const { userId } = req.params;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('receiver_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark a notification as read
const markAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ status: 'read' })
            .eq('id', id)
            .select();

        if (error) {
            throw error;
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a notification (Backend endpoint to bypass RLS issues)
const createNotification = async (req, res) => {
    const { sender_id, receiver_id, listing_id, contract_id, crop_name, buyer_name, buyer_contact, message, type } = req.body;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                sender_id,
                receiver_id,
                listing_id,
                contract_id: contract_id || null,
                crop_name,
                buyer_name,
                buyer_contact,
                message: message || null,
                type: type || 'crop_interest', // Default to crop_interest
                status: 'unread'
            }])
            .select();

        if (error) {
            console.error('Notification creation error:', error);
            throw error;
        }

        res.status(201).json(data[0]);
    } catch (error) {
        console.error('Create notification error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};
