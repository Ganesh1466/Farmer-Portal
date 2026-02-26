import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { sendMessage } from '../../Api/chatApi';
import { supabase } from '../../supabaseClient';
import './FloatingChatWidget.css';

const FloatingChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'Hello! 👋 I\'m your Crop Assistant. How can I help you with your farming today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastApiUsed, setLastApiUsed] = useState(null);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const { user } = useAuth();

    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleToggle = () => {
        setIsOpen(!isOpen);
        setError(null);
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = {
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // Add user message to chat
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);
        setError(null);

        try {
            // Prepare conversation history for API
            const conversationHistory = [
                {
                    role: 'system',
                    content: `You are a highly intelligent AI assistant integrated into a real-time crop advisory system. 
Follow these rules strictly:

1. Be friendly, clear, and concise.
2. Answer user queries with actionable steps when possible.
3. Provide crop-specific advice on farming, pest control, soil health, weather impacts, market trends, and best practices.
4. If the user asks for code, examples, or explanations, provide them.
5. Adapt tone based on the question: professional for technical, casual for general queries.
6. Always handle errors gracefully: if unsure, respond with "I am unable to answer that fully, please try again."

Focus areas:
- Crop cultivation and seasonal guidance
- Pest and disease identification and treatment
- Soil management and fertilizer recommendations
- Weather impact and irrigation advice
- Market prices and contract farming
- Government schemes and subsidies for farmers`
                },
                ...messages
                    .filter(msg => msg.role !== 'system')
                    .map(msg => ({
                        role: msg.role,
                        content: msg.content
                    })),
                {
                    role: 'user',
                    content: userMessage.content
                }
            ];

            // Get user token from Supabase session
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || '';

            // Call API
            const response = await sendMessage(conversationHistory, token);

            // Add assistant's response to chat
            const assistantMessage = {
                role: 'assistant',
                content: response.reply,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            setMessages(prev => [...prev, assistantMessage]);
            setLastApiUsed(response.apiUsed);

        } catch (err) {
            console.error('Chat error:', err);

            let errorMessage = 'I am unable to answer that fully, please try again.';

            if (err.response) {
                // Server responded with error
                errorMessage = err.response.data?.error || errorMessage;
            } else if (err.request) {
                // Network error
                errorMessage = 'Unable to connect to the server. Please check your connection.';
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="floating-chat-widget">
            {!isOpen && (
                <button
                    className="chat-toggle-button"
                    onClick={handleToggle}
                    aria-label="Open chat"
                >
                    <span>🌾</span>
                </button>
            )}

            {isOpen && (
                <div className="chat-window">
                    {/* Header */}
                    <div className="chat-header">
                        <div className="chat-header-title">
                            <div className="chat-status-indicator" />
                            <span>Crop Assistant</span>
                        </div>
                        <button
                            className="chat-close-button"
                            onClick={handleToggle}
                            aria-label="Close chat"
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="chat-messages">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`message-bubble ${message.role}`}
                            >
                                <div className="message-content">{message.content}</div>
                                <div className="message-timestamp">{message.timestamp}</div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isLoading && (
                            <div className="typing-indicator">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        )}

                        {/* Error message */}
                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* API Indicator */}
                    {lastApiUsed && (
                        <div className={`api-indicator ${lastApiUsed}`}>
                            Powered by {lastApiUsed === 'gemini' ? 'Google Gemini' : 'OpenAI'}
                        </div>
                    )}

                    {/* Input */}
                    <div className="chat-input-area">
                        <input
                            ref={inputRef}
                            type="text"
                            className="chat-input"
                            placeholder="Ask about crops, pests, weather..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={isLoading}
                        />
                        <button
                            className="chat-send-button"
                            onClick={handleSendMessage}
                            disabled={isLoading || !inputValue.trim()}
                            aria-label="Send message"
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FloatingChatWidget;
