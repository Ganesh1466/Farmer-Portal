const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Initialize Supabase Admin Client (Service Role Key)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Supabase URL or Service Role Key missing!");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const deleteAccount = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        console.log(`[AUTH] Deleting user account: ${userId}`);

        // 1. Delete user from Supabase Auth (This triggers CASCADE delete on public.profiles if configured)
        const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);

        if (error) {
            console.error("[AUTH] Error deleting user from Auth:", error);
            throw error;
        }

        console.log(`[AUTH] User ${userId} active account deleted successfully.`);

        // 2. Explicitly delete from public.profiles just in case CASCADE isn't set up
        // Note: If CASCADE is set, this might be redundant but harmless if properly handled
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) {
            console.warn("[AUTH] Warning: Profile deletion failed (might already be deleted via CASCADE):", profileError.message);
        }

        res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        console.error("[AUTH] Delete account exception:", error);
        res.status(500).json({ message: error.message || "Failed to delete account" });
    }
};

module.exports = {
    deleteAccount
};
