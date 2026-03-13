import { useRef, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import imageCompression from 'browser-image-compression';

export default function ImageUploader({ onUpload, onCancel }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  async function pickFile(e) {
    let f = e.target.files[0];
    if (!f) return;
    
    // UI Feedback: Show original preview immediately to feel fast
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);

    try {
      // Compress the image before saving to state for upload
      const options = {
        maxSizeMB: 0.8,          // Compress to ~800KB max
        maxWidthOrHeight: 1280,  // Max dimension 1280px
        useWebWorker: true,
        fileType: 'image/webp'   // Convert to WebP for best compression
      };
      
      const compressedFile = await imageCompression(f, options);
      setFile(compressedFile);
    } catch (error) {
      console.error('Compression error:', error);
      // Fallback to original if compression fails, but enforce 10MB limit
      if (f.size > 10 * 1024 * 1024) { 
        alert('Image must be under 10MB'); 
        setPreview(null);
        return; 
      }
      setFile(f);
    }
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setProgress(20);

    // Ensure we use the correct extension (likely .webp now)
    const ext = file.name.split('.').pop() || 'webp';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data: authData } = await supabase.auth.getUser();
    const path = `${authData.user.id}/${fileName}`;

    setProgress(50);
    const { error } = await supabase.storage.from('crop-images').upload(path, file, {
      cacheControl: '3600', upsert: false, contentType: file.type
    });

    if (error) { alert('Upload failed: ' + error.message); setUploading(false); return; }

    setProgress(90);
    const { data: { publicUrl } } = supabase.storage.from('crop-images').getPublicUrl(path);
    setProgress(100);
    onUpload(publicUrl);
  }

  return (
    <div className="image-uploader">
      {!preview ? (
        <div className="upload-zone" onClick={() => inputRef.current.click()}>
          <div className="upload-icon">📸</div>
          <div className="upload-text">Click to attach crop photo</div>
          <div className="upload-hint">JPG, PNG, WebP • Max 10MB</div>
          <input ref={inputRef} type="file" accept="image/*" onChange={pickFile} hidden />
        </div>
      ) : (
        <div className="upload-preview">
          <img src={preview} alt="Preview" />
          <div className="upload-actions">
            {uploading ? (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span>Uploading {progress}%</span>
              </div>
            ) : (
              <>
                <button className="btn-send-img" onClick={upload}>📤 Send Photo</button>
                <button className="btn-cancel-img" onClick={onCancel}>✕</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
