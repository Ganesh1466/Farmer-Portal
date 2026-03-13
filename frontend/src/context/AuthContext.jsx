import { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── COMMUNITY CHAT ADDITION ──────────────────────────────────────────────
    const [profile, setProfile] = useState(null);
    // ────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        // Initialize Supabase Auth
        const initializeAuth = async () => {
            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error("Error getting session:", error);
                    handleLogout(); // Clean up if session is invalid
                } else if (session?.user) {
                    await handleUserSession(session.user);
                    // ── COMMUNITY CHAT ADDITION ──────────────────────────────
                    await fetchCommunityProfile(session.user.id);
                    // ────────────────────────────────────────────────────────
                } else {
                    setLoading(false);
                }

                // Listen for auth changes
                const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                    console.log("Auth event:", event);

                    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                        if (session?.user) {
                            await handleUserSession(session.user);
                            // ── COMMUNITY CHAT ADDITION ──────────────────────
                            await fetchCommunityProfile(session.user.id);
                            // ────────────────────────────────────────────────
                        }
                    } else if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
                        handleLogout();
                    }
                });

                return () => {
                    subscription?.unsubscribe();
                };
            } catch (err) {
                console.error("Auth initialization error:", err);
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const handleUserSession = async (authUser) => {
        try {
            // Check if we already have this user loaded with profile to avoid redundant fetches
            // or just always fetch to be safe.
            const storedUser = localStorage.getItem('user');
            let currentUser = authUser;

            // If we have a stored user, merge it initially to avoid flickering while fetching profile
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                if (parsed.id === authUser.id) {
                    currentUser = { ...authUser, ...parsed }; // Keep existing profile data
                }
            }

            setUser(currentUser); // Optimistic update

            // Fetch/Update Profile
            await fetchProfile(currentUser);
        } catch (e) {
            console.error("Error handling user session:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async (currentUser) => {
        if (!currentUser) return;

        try {
            const userId = currentUser.uuid || currentUser.id;
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (data) {
                const updatedUser = { ...currentUser, ...data };
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser)); // Sync manual storage
            } else if (error) {
                // If checking for single row and none found, throws PGRST116 or returns 406
                if (error.code === 'PGRST116' || status === 406) {
                    throw error; // Let catch block handle creation
                }
                console.error("Error fetching profile:", error);
            }
        } catch (error) {
            console.error("Exception fetching profile:", error);
            // Fallback: If profile missing (406), create it
            if (error.code === 'PGRST116' || error.message.includes('406')) {
                console.log("Profile missing, creating new profile...");
                await createProfile(currentUser);
            }
        }
    };

    const createProfile = async (user) => {
        try {
            // Check for pending role from Google Auth flow
            const pendingRole = localStorage.getItem('pendingRole');
            const roleToAssign = pendingRole || user.user_metadata?.role || 'farmer';

            if (pendingRole) {
                // Determine name from metadata or email
                const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0];

                // Update user metadata with the correct role so it persists
                await supabase.auth.updateUser({
                    data: { role: roleToAssign, full_name: fullName }
                });

                // Clear the pending role
                localStorage.removeItem('pendingRole');
            }

            const newProfile = {
                id: user.id || user.uuid,
                email: user.email,
                name: user.user_metadata?.full_name || user.user_metadata?.name || '',
                role: roleToAssign, // Use the resolved role
                updated_at: new Date().toISOString()
            };

            console.log("Attempting to create/update profile:", newProfile);

            // Use upsert to handle both creation and updates if it already exists
            const { data, error } = await supabase
                .from('profiles')
                .upsert(newProfile, { onConflict: 'id' })
                .select()
                .single();

            if (error) {
                console.error("Error creating/updating profile:", error);
                // Check for RLS policy violation or 400 bad request specifics
                if (error.code === '42501') {
                    console.error("RLS Policy Violation. Check if 'Enable RLS' is on and policies allow INSERT/UPDATE for authenticated users.");
                }
            } else {
                console.log("Profile created/updated successfully!", data);
                if (data) {
                    setUser({ ...user, ...data });
                    localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
                }
            }
        } catch (err) {
            console.error("Exception creating profile:", err);
        }
    };

    // Manual login helper (if needed for custom flows, otherwise Supabase handles it)
    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (userData?.id) fetchProfile(userData);
    };

    const handleLogout = () => {
        setUser(null);
        // ── COMMUNITY CHAT ADDITION 
        setProfile(null);

        localStorage.removeItem('user');
        setLoading(false);
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            handleLogout();
        }
    };

    const checkProfileCompletion = (currentUser = user) => {
        if (!currentUser) return false;
        // Check for essential fields
        const requiredFields = ['name', 'phone', 'state', 'district', 'village'];
        // You might want to adjust this list based on what constitutes a "complete" profile
        // Checking both top-level (if merged) and user_metadata/metadata just in case, but usually it's merged into top level by fetchProfile

        for (const field of requiredFields) {
            if (!currentUser[field] || currentUser[field].toString().trim() === '') {
                // Determine missing field for debugging if needed, or just return false
                // console.log(`Missing field: ${field}`);
                return false;
            }
        }
        return true;
    };

    // ── COMMUNITY CHAT ADDITIONS ─────────────────────────────────────────────

    // Fetches from the `users` table used by the community chat system
    const fetchCommunityProfile = async (authId) => {
        if (!authId) return;
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', authId)
                .single();

            if (data) {
                setProfile(data);
            } else if (error && (error.code === 'PGRST116' || error.status === 406)) {
                // Community profile doesn't exist yet — create it from existing user/metadata
                await createCommunityProfile(authId);
            } else if (!data) {
                // Unknown error or empty result — set a minimal fallback so the page
                // doesn't hang on an infinite spinner. createCommunityProfile will be
                // triggered on next load.
                console.warn('Community profile not found, using fallback.');
                await createCommunityProfile(authId);
            }
        } catch (err) {
            console.error("Error fetching community profile:", err);
            // Set a minimal fallback profile so the UI can still render
            setProfile({ id: null, name: 'Farmer', profile_image: null, location: '' });
        }
    };

    // Creates a row in the `users` table (community chat) if one doesn't exist
    const createCommunityProfile = async (authId) => {
        try {
            const { data: authData } = await supabase.auth.getUser();
            const authUser = authData?.user;
            if (!authUser) return;

            const name =
                authUser.user_metadata?.full_name ||
                authUser.user_metadata?.name ||
                authUser.email?.split('@')[0] ||
                'Farmer';

            const newCommunityUser = {
                auth_id: authId,
                name,
                location: authUser.user_metadata?.location || '',
                profile_image: null,
            };

            const { data, error } = await supabase
                .from('users')
                .upsert(newCommunityUser, { onConflict: 'auth_id' })
                .select()
                .single();

            if (error) {
                console.error("Error creating community profile:", error);
            } else if (data) {
                setProfile(data);
            }
        } catch (err) {
            console.error("Exception creating community profile:", err);
        }
    };

    // Exposed sign-up used by the community chat AuthPage
    const signUp = async ({ email, password, name, location }) => {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
            const { error: profileError } = await supabase.from('users').insert({
                auth_id: data.user.id,
                name,
                location,
                profile_image: null,
            });
            if (profileError) throw profileError;
        }
        return data;
    };

    // Exposed sign-in used by the community chat AuthPage
    const signIn = async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data;
    };

    // signOut alias so community chat components can call signOut() directly
    const signOut = async () => {
        await logout();
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <AuthContext.Provider value={{
            // ── original values ──────────────────────────────────────────────
            user,
            login,
            logout,
            loading,
            checkProfileCompletion,
            // ── community chat additions ─────────────────────────────────────
            profile,          // row from `users` table (community chat)
            signUp,           // email/password sign-up
            signIn,           // email/password sign-in
            signOut,          // alias for logout
            fetchCommunityProfile,
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);