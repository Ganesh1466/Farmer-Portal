import axios from 'axios';
import { supabase } from '../supabaseClient'; // ✅ adjust path if needed

const API_URL = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/chat`
    : 'http://localhost:5001/api/chat';

export const sendMessage = async (messages) => {
    try {
        // ✅ Always get a fresh token directly from Supabase — don't rely on prop drilling
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session?.access_token) {
            throw new Error('No active session. Please log in again.');
        }

        const token = session.access_token;

        const response = await axios.post(
            API_URL,
            { messages },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                timeout: 30000, // ✅ 30s timeout to avoid hanging requests
            }
        );

        return response.data;

    } catch (error) {
        // ✅ Structured error logging
        console.error('Chat API Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Response:', error.response.data);
        }
        throw error;
    }
};