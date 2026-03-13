import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';

export default function ChatWindow({ chat, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [onlineCount, setOnlineCount] = useState(1);
  const messagesEndRef = useRef(null);
  const channelRef = useRef(null);
  const { profile } = useAuth();

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
    });
  }, []);

  // Fetch messages with sender info and reply data
  const fetchMessages = useCallback(async () => {
    if (!chat) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!sender_id(id, name, location, profile_image),
        reply_data:messages!reply_to(
          id, message, image_url,
          sender:users!sender_id(id, name)
        )
      `)
      .eq('chat_id', chat.id)
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Error fetching messages:', error);
    } else if (data) {
      setMessages(data);
    }
    setLoading(false);
    scrollToBottom(false);
  }, [chat, scrollToBottom]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Realtime subscription
  useEffect(() => {
    if (!chat) return;

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(`room-${chat.id}`, {
      config: { presence: { key: profile?.id ?? 'anon' } },
    });

    // Listen for new messages
    channel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chat.id}` },
      async (payload) => {
        // Fetch the full message row with relations
        const { data, error } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id(id, name, location, profile_image),
            reply_data:messages!reply_to(
              id, message, image_url,
              sender:users!sender_id(id, name)
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          setMessages((prev) => {
            if (prev.find((m) => m.id === data.id)) return prev; // deduplicate
            return [...prev, data];
          });
          scrollToBottom();
        }
      }
    );

    // Listen for message deletions
    channel.on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'messages', filter: `chat_id=eq.${chat.id}` },
      (payload) => {
        setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
      }
    );

    // Track online presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      setOnlineCount(Math.max(1, Object.keys(state).length));
    });

    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED' && profile?.id) {
        await channel.track({ user_id: profile.id, online_at: new Date().toISOString() });
      }
    });

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [chat, profile, scrollToBottom]);

  async function sendMessage({ message, imageUrl }) {
    if (!profile || !chat) return;
    if (!message && !imageUrl) return;

    // 1. Create Optimistic UI Message
    const tempId = crypto.randomUUID(); 
    const optimisticMsg = {
      id: tempId,
      chat_id: chat.id,
      sender_id: profile.id,
      message: message || null,
      image_url: imageUrl || null,
      reply_to: replyTo?.id || null,
      created_at: new Date().toISOString(),
      sender: { id: profile.id, name: profile.name || 'You', profile_image: profile.profile_image || null, location: profile.location || '' },
      reply_data: replyTo ? [{ ...replyTo }] : [], 
      isSending: true
    };

    // 2. Instantly show it on screen
    setMessages((prev) => [...prev, optimisticMsg]);
    setReplyTo(null);
    scrollToBottom();

    // 3. Prepare real DB payload
    const newMsg = {
      chat_id: chat.id,
      sender_id: profile.id,
      message: message || null,
      image_url: imageUrl || null,
      reply_to: replyTo?.id || null,
    };

    // 4. Send to Supabase
    const { data: insertedData, error } = await supabase
      .from('messages')
      .insert(newMsg)
      .select('id, created_at') // Get the actual DB ID
      .single();

    if (error) {
      console.error('Send error:', error);
      // Remove optimistic message if send failed
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      alert('Failed to send: ' + error.message);
    } else {
      // 5. Replace temp ID with real DB ID so future deletes/replies work
      setMessages((prev) => prev.map((msg) => 
        msg.id === tempId ? { ...msg, id: insertedData.id, created_at: insertedData.created_at, isSending: false } : msg
      ));
    }
  }

  async function handleDeleteMessage(msgId) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    // Find message to check for image
    const msgToDelete = messages.find(m => m.id === msgId);
    if (!msgToDelete) return;

    // 1. Optimistically remove from UI immediately
    setMessages(prev => prev.filter(m => m.id !== msgId));

    try {
      // 2. Delete image from storage if it exists
      if (msgToDelete.image_url) {
        const urlParts = msgToDelete.image_url.split('/crop-images/');
        if (urlParts.length === 2) {
          const filePath = urlParts[1];
          const { error: storageError } = await supabase.storage.from('crop-images').remove([filePath]);
          if (storageError) console.error("Error deleting image from storage:", storageError);
        }
      }

      // 3. Delete message from database
      const { data, error: dbError } = await supabase.from('messages').delete().eq('id', msgId).select();
      if (dbError) throw dbError;

      // Verification: ensure the deletion actually took place
      if (!data || data.length === 0) {
        throw new Error("Supabase RLS policy is preventing deletion or the message was already deleted.");
      }
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message:\n" + err.message);
      // ROLLBACK: add it back to UI if deletion failed
      setMessages(prev => [...prev, msgToDelete].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)));
    }
  }

  function needsDateSeparator(idx) {
    if (idx === 0) return true;
    const prev = new Date(messages[idx - 1].created_at).toDateString();
    const curr = new Date(messages[idx].created_at).toDateString();
    return prev !== curr;
  }

  if (!chat) {
    return (
      <div className="chat-empty">
        <div className="empty-icon">🌾</div>
        <h2>Welcome to FarmTalk</h2>
        <p>Select a community channel to start chatting with farmers</p>
        <div className="empty-hints">
          <div>💬 Share crop problems</div>
          <div>📸 Upload disease photos</div>
          <div>🤝 Get help from farmers</div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-window-header">
        <div className="chat-window-info">
          {onBack && (
            <button className="back-btn" onClick={onBack} title="Back to communities">
              ←
            </button>
          )}
          <div className="chat-window-icon">{chat.icon}</div>
          <div>
            <div className="chat-window-name">{chat.name}</div>
            <div className="chat-window-status">
              <span className="online-dot" /> {onlineCount} farmer{onlineCount !== 1 ? 's' : ''} online
            </div>
          </div>
        </div>
        <div className="chat-window-actions">
          <span className="expire-note">⏳ Messages expire in 8 days</span>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-area">
        {loading && (
          <div className="messages-loading">
            <div className="loading-spinner" />
            <span>Loading messages…</span>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="no-messages">
            <div>🌱</div>
            <p>No messages yet. Be the first to post!</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.sender_id === profile?.id}
            onReply={setReplyTo}
            onDelete={handleDeleteMessage}
            showDateSeparator={needsDateSeparator(idx)}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={sendMessage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
}
