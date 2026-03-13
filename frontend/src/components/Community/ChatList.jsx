import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import Avatar from './Avatar';

export default function ChatList({ selectedChat, onSelectChat }) {
  const [chats, setChats] = useState([]);
  const [unread, setUnread] = useState({});
  const { profile } = useAuth();

  useEffect(() => {
    supabase
      .from('chats')
      .select('*')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) console.error('Error loading chats:', error);
        if (data) setChats(data);
      });
  }, []);

  // Track unread counts for non-selected chats
  useEffect(() => {
    const channel = supabase
      .channel('chat-list-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const chatId = payload.new.chat_id;
        if (chatId !== selectedChat?.id) {
          setUnread((prev) => ({ ...prev, [chatId]: (prev[chatId] || 0) + 1 }));
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [selectedChat]);

  function selectChat(chat) {
    setUnread((prev) => ({ ...prev, [chat.id]: 0 }));
    onSelectChat(chat);
  }

  return (
    <aside className="chat-list">
      {/* Header with user info */}
      <div className="chat-list-header">
        <div className="user-info">
          <Avatar src={profile?.profile_image} name={profile?.name || 'Farmer'} size="sm" />
          <div>
            <div className="user-label">YOU</div>
            <div className="user-name">{profile?.name || 'Farmer'}</div>
            <div className="user-loc">📍 {profile?.location || 'Farmer'}</div>
          </div>
        </div>
      </div>

      <div className="chat-list-title">
        <span>🌾 Communities</span>
      </div>

      <div className="chat-list-items">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item ${selectedChat?.id === chat.id ? 'active' : ''}`}
            onClick={() => selectChat(chat)}
          >
            <div className="chat-icon">{chat.icon}</div>
            <div className="chat-info">
              <div className="chat-name">{chat.name}</div>
              <div className="chat-desc">{chat.description}</div>
            </div>
            {unread[chat.id] > 0 && (
              <div className="unread-badge">{unread[chat.id] > 99 ? '99+' : unread[chat.id]}</div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}
