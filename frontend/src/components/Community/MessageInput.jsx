import { useState, useRef, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import EmojiPickerButton from './EmojiPickerButton';

export default function MessageInput({ onSend, replyTo, onCancelReply, disabled }) {
  const [text, setText] = useState('');
  const [showUploader, setShowUploader] = useState(false);
  const [pendingImage, setPendingImage] = useState(null);
  const textareaRef = useRef();

  // Auto-focus when replying
  useEffect(() => {
    if (replyTo && textareaRef.current) textareaRef.current.focus();
  }, [replyTo]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [text]);

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function send() {
    const msg = text.trim();
    if (!msg && !pendingImage) return;
    onSend({ message: msg || null, imageUrl: pendingImage || null });
    setText('');
    setPendingImage(null);
    setShowUploader(false);
  }

  function handleImageUploaded(url) {
    setPendingImage(url);
    setShowUploader(false);
  }

  function handleEmojiSelect(emoji) {
    const el = textareaRef.current;
    if (!el) {
      setText((prev) => prev + emoji);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newText = text.slice(0, start) + emoji + text.slice(end);
    setText(newText);
    setTimeout(() => {
      el.setSelectionRange(start + emoji.length, start + emoji.length);
      el.focus();
    }, 0);
  }

  return (
    <div className="message-input-area">
      {/* Reply Preview Bar */}
      {replyTo && (
        <div className="reply-bar">
          <div className="reply-bar-content">
            <div className="reply-bar-name">↩ Replying to {replyTo.sender?.name || 'someone'}</div>
            <div className="reply-bar-text">
              {replyTo.image_url ? '📷 Photo' : replyTo.message?.slice(0, 60)}
            </div>
          </div>
          <button className="reply-bar-cancel" onClick={onCancelReply} type="button" aria-label="Cancel reply">
            ✕
          </button>
        </div>
      )}

      {/* Pending image preview */}
      {pendingImage && (
        <div className="pending-image">
          <img src={pendingImage} alt="Ready to send" />
          <button
            className="pending-image-remove"
            onClick={() => setPendingImage(null)}
            type="button"
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* Image uploader panel */}
      {showUploader && (
        <ImageUploader
          onUpload={handleImageUploaded}
          onCancel={() => setShowUploader(false)}
        />
      )}

      {/* Input row: Emoji | Attach | Text | Send */}
      <div className="input-row">
        <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />

        <button
          className={`attach-btn ${showUploader ? 'active' : ''}`}
          onClick={() => setShowUploader((s) => !s)}
          disabled={disabled}
          title="Attach crop photo"
          type="button"
        >
          📷
        </button>

        <textarea
          ref={textareaRef}
          className="message-textarea"
          placeholder="Share a farming tip or crop issue…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          disabled={disabled}
          rows={1}
        />

        <button
          className="send-btn"
          onClick={send}
          disabled={disabled || (!text.trim() && !pendingImage)}
          type="button"
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
