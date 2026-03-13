/**
 * UserProfileCard – modal showing a user's community profile.
 * Opens centered on screen when clicking an avatar in the chat.
 *
 * Props:
 *   userId  – id from the `users` table
 *   onClose – callback to close the modal
 */
import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import Avatar from './Avatar';

function formatJoined(ts) {
  if (!ts) return 'Unknown';
  return new Date(ts).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function UserProfileCard({ userId, onClose }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (data) setUser(data);
        else if (error) console.error('Error fetching user profile:', error);
        setLoading(false);
      });
  }, [userId]);

  // Close on Escape key
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        {loading ? (
          <div className="modal-loading">
            <div className="loading-spinner" />
            <span>Loading profile…</span>
          </div>
        ) : !user ? (
          <div className="modal-empty">User not found</div>
        ) : (
          <>
            {/* Header with gradient */}
            <div className="profile-modal-header">
              <Avatar
                src={user.profile_image}
                name={user.name}
                size="lg"
                className="profile-modal-avatar"
              />
              <h2 className="profile-modal-name">{user.name}</h2>
              {user.location && (
                <p className="profile-modal-location">📍 {user.location}</p>
              )}
            </div>

            {/* Body */}
            <div className="profile-modal-body">
              <div className="profile-modal-row">
                <span className="profile-modal-label">🗓 Joined</span>
                <span className="profile-modal-value">{formatJoined(user.created_at)}</span>
              </div>
              {user.crop_specialization && (
                <div className="profile-modal-row">
                  <span className="profile-modal-label">🌾 Specializes in</span>
                  <span className="profile-modal-value">{user.crop_specialization}</span>
                </div>
              )}
              {user.location && (
                <div className="profile-modal-row">
                  <span className="profile-modal-label">📍 Location</span>
                  <span className="profile-modal-value">{user.location}</span>
                </div>
              )}
              {user.phone && (
                <div className="profile-modal-row">
                  <span className="profile-modal-label">📞 Contact</span>
                  <span className="profile-modal-value">{user.phone}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
