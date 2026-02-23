import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const QuestionList = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log('Fetched questions:', data); // Debugging
            setQuestions(data || []); // Ensure it's an array
        } catch (error) {
            console.error('Error fetching questions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();

        // Optional: Real-time subscription
        const subscription = supabase
            .channel('public:questions')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'questions' }, (payload) => {
                console.log('New question received!', payload);
                setQuestions((prev) => [payload.new, ...prev]);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    }, []);

    if (loading) return <div className="text-center py-4">Loading discussions...</div>;

    if (questions.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
                <p className="text-gray-500 text-lg">No questions yet. Be the first to ask!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Recent Discussions</h2>
            {questions.map((q) => (
                <div key={q.id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition duration-300 border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-green-700">{q.title}</h3>
                        <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">{q.topic || 'General'}</span>
                    </div>
                    <p className="text-gray-600 mb-3 whitespace-pre-wrap">{q.body}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3 mt-2">
                        <span>Posted by: <span className="font-medium text-gray-700">{q.author_name || 'Anonymous'}</span></span>
                        <span>{new Date(q.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuestionList;
