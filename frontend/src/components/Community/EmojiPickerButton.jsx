import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';

export default function EmojiPickerButton({ onEmojiSelect }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  function handleSelect(emojiData) {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="emoji-picker-container">
      <button
        className={`emoji-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen(prev => !prev)}
        title="Add emoji"
        type="button"
      >
        😀
      </button>
      {open && (
        <div className="emoji-picker-popup">
          <EmojiPicker
            onEmojiClick={handleSelect}
            theme="light"
            searchPlaceholder="Search emoji..."
            height={350}
            width={300}
          />
        </div>
      )}
    </div>
  );
}
