import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatList from '../components/Community/ChatList';
import ChatWindow from '../components/Community/ChatWindow';
import '../components/Community/Community.css';

const Community = () => {
    const { user, profile } = useAuth();
    const [selectedChat, setSelectedChat] = useState(null);
    const [mobileView, setMobileView] = useState('list'); // 'list' | 'chat'
    const [profileTimedOut, setProfileTimedOut] = useState(false);

    // If `profile` doesn't arrive within 4 seconds, stop blocking
    useEffect(() => {
        if (user && !profile) {
            const timer = setTimeout(() => setProfileTimedOut(true), 4000);
            return () => clearTimeout(timer);
        }
    }, [user, profile]);

    // Not logged in → redirect to main app login
    if (!user) return <Navigate to="/login" replace />;

    // Profile still loading – show spinner (max 4 seconds)
    if (!profile && !profileTimedOut) {
        return (
            <div className="flex h-screen items-center justify-center bg-emerald-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
                    <p className="text-emerald-700 font-medium">Loading your profile…</p>
                </div>
            </div>
        );
    }

    function handleSelectChat(chat) {
        setSelectedChat(chat);
        setMobileView('chat');
    }

    return (
        <div className="community-layout">
            <div className={`panel-left ${mobileView === 'chat' ? 'hidden-mobile' : ''}`}>
                <ChatList selectedChat={selectedChat} onSelectChat={handleSelectChat} />
            </div>
            <div className={`panel-right ${mobileView === 'list' ? 'hidden-mobile' : ''}`}>
                <ChatWindow chat={selectedChat} onBack={() => setMobileView('list')} />
            </div>
        </div>
    );
};

export default Community;
