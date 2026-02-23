import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';

const AskQuestion = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [topic, setTopic] = useState('General');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const { data, error } = await supabase
                .from('questions')
                .insert([
                    { title, body, topic, author_name: 'Anonymous Farmer' } // Replace with actual user name if auth is ready
                ]);

            if (error) throw error;

            setMessage('Question submitted successfully!');
            setTitle('');
            setBody('');
            setTopic('General');
        } catch (error) {
            console.error('Error submitting question:', error);
            setMessage('Failed to submit question. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-4">Ask a Question</h2>
            {message && <p className={`mb-4 p-2 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="title">
                        Question Title
                    </label>
                    <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="title"
                        type="text"
                        placeholder="e.g., Best fertilizer for tomatoes?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="topic">
                        Topic
                    </label>
                    <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    >
                        <option value="General">General</option>
                        <option value="Crops">Crops</option>
                        <option value="Pests">Pests</option>
                        <option value="Weather">Weather</option>
                        <option value="Market">Market Prices</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2" htmlFor="body">
                        Description
                    </label>
                    <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-32"
                        id="body"
                        placeholder="Describe your question in detail..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        required
                    ></textarea>
                </div>
                <button
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Post Question'}
                </button>
            </form>
        </div>
    );
};

export default AskQuestion;
