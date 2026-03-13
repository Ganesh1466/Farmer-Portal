import { useState } from 'react';
import Avatar from './Avatar';
import UserProfileCard from './UserProfileCard';

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function MessageBubble({ message, isOwn, onReply, onDelete, showDateSeparator }) {
  const [imgOpen, setImgOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);

  // sender may be an array (Supabase join) or an object
  const sender = Array.isArray(message.sender) ? message.sender[0] : message.sender;

  // reply_data may be an array too
  const replyData = Array.isArray(message.reply_data) ? message.reply_data[0] : message.reply_data;
  const replyDataSender = replyData
    ? Array.isArray(replyData.sender) ? replyData.sender[0] : replyData.sender
    : null;

  return (
    <>
      {/* Date separator */}
      {showDateSeparator && (
        <div className="date-separator">
          <span>{formatDate(message.created_at)}</span>
        </div>
      )}

      {/* Message row */}
      <div className={`bubble-wrapper ${isOwn ? 'own' : 'other'}`}>

        {/* Avatar for others – left side */}
        {!isOwn && (
          <Avatar
            src={sender?.profile_image}
            name={sender?.name}
            size="sm"
            className="bubble-avatar"
            onClick={() => setProfileUserId(sender?.id)}
          />
        )}

        <div 
          className={`bubble ${isOwn ? 'bubble-own' : 'bubble-other'}`}
          style={{ opacity: message.isSending ? 0.6 : 1 }}
        >
          {/* Sender name (others only) */}
          {!isOwn && (
            <div
              className="bubble-sender"
              onClick={() => setProfileUserId(sender?.id)}
              style={{ cursor: 'pointer' }}
            >
              {sender?.name || 'Farmer'}
            </div>
          )}

          {/* Reply preview */}
          {replyData && (
            <div className="reply-preview">
              <div className="reply-preview-name">{replyDataSender?.name || 'Someone'}</div>
              {replyData.image_url && (
                <div className="reply-preview-img">📷 Photo</div>
              )}
              {replyData.message && (
                <div className="reply-preview-text">
                  {replyData.message.slice(0, 80)}
                  {replyData.message.length > 80 ? '…' : ''}
                </div>
              )}
            </div>
          )}

          {/* Image message */}
          {message.image_url && (
            <div className="bubble-image-wrap">
              <img
                src={message.image_url}
                alt="Crop photo"
                className="bubble-image"
                onClick={() => setImgOpen(true)}
              />
              {imgOpen && (
                <div className="img-lightbox" onClick={() => setImgOpen(false)}>
                  <img src={message.image_url} alt="Full size" />
                  <button className="lightbox-close" onClick={() => setImgOpen(false)}>✕</button>
                </div>
              )}
            </div>
          )}

          {/* Text */}
          {message.message && (
            <div className="bubble-text">{message.message}</div>
          )}

          {/* Footer: time + checks + delete + reply */}
          <div className="bubble-footer">
            <div className="bubble-meta">
              <span className="bubble-time">{formatTime(message.created_at)}</span>
              {isOwn && !message.isSending && <span className="bubble-check">✓✓</span>}
              {isOwn && message.isSending && <span style={{fontSize: '10px', color: '#999'}}>⌚</span>}
            </div>
            
            <div className="bubble-actions">
              {isOwn && (
                <button
                  className="delete-btn"
                  onClick={() => onDelete(message.id)}
                  title="Delete message"
                  type="button"
                >
                  🗑️
                </button>
              )}
              <button
                className="reply-btn"
                onClick={() => onReply(message)}
                title="Reply"
                type="button"
              >
                ↩
              </button>
            </div>
          </div>
        </div>

        {/* Avatar for own messages – right side */}
        {isOwn && (
          <Avatar
            src={sender?.profile_image}
            name={sender?.name || 'You'}
            size="sm"
            className="bubble-avatar bubble-avatar-own"
          />
        )}
      </div>

      {/* Profile card modal */}
      {profileUserId && (
        <UserProfileCard
          userId={profileUserId}
          onClose={() => setProfileUserId(null)}
        />
      )}
    </>
  );
}
