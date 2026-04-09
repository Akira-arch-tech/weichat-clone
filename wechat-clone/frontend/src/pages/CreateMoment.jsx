import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import useStore from '../store';
import { momentsAPI, uploadAPI } from '../api';

export default function CreateMoment() {
  const navigate = useNavigate();
  const { user, addMoment } = useStore();
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleImageSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 9) {
      setError('最多只能上传9张图片');
      return;
    }
    setUploading(true);
    setError('');

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await uploadAPI.uploadImage(formData);
        uploadedUrls.push(res.data.url);
      }
      setImages(prev => [...prev, ...uploadedUrls]);
    } catch (e) {
      setError('上传图片失败，请重试');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      setError('请输入内容或选择图片');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await momentsAPI.createMoment({
        content: content.trim(),
        images
      });
      addMoment(res.data);
      navigate('/moments', { replace: true });
    } catch (e) {
      setError(e.response?.data?.error || '发布失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* NavBar */}
      <div className="navbar">
        <button
          onClick={() => navigate(-1)}
          className="navbar-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', fontSize: 16, color: '#333' }}
        >
          取消
        </button>
        <span className="navbar-title">发表朋友圈</span>
        <button
          onClick={handleSubmit}
          disabled={submitting || uploading || (!content.trim() && images.length === 0)}
          className="navbar-right"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0 12px',
            fontSize: 16,
            color: (submitting || uploading || (!content.trim() && images.length === 0)) ? '#B2E6C8' : '#07C160',
            fontWeight: '500'
          }}
        >
          {submitting ? '发布中...' : '发布'}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-4">
        {/* User info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar src={user?.avatar} name={user?.nickname} size={44} />
          <span style={{ fontSize: 15, fontWeight: '500' }}>{user?.nickname}</span>
        </div>

        {/* Text input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="这一刻的想法..."
          rows={4}
          autoFocus
          style={{
            width: '100%',
            border: 'none',
            outline: 'none',
            fontSize: 16,
            lineHeight: '1.6',
            fontFamily: 'inherit',
            resize: 'none',
            color: '#333'
          }}
        />

        {/* Image grid */}
        {(images.length > 0 || uploading) && (
          <div
            className="grid gap-2 mt-4"
            style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}
          >
            {images.map((url, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1' }}>
                <img
                  src={url}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                />
                <button
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 20,
                    height: 20,
                    background: 'rgba(0,0,0,0.6)',
                    border: 'none',
                    borderRadius: '50%',
                    color: '#fff',
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    padding: 0
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {uploading && (
              <div style={{ aspectRatio: '1', background: '#F5F5F5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
              </div>
            )}

            {images.length < 9 && !uploading && (
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  aspectRatio: '1',
                  background: '#F5F5F5',
                  border: '1px dashed #CCC',
                  borderRadius: 4,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                  color: '#CCC'
                }}
              >
                +
              </button>
            )}
          </div>
        )}

        {images.length === 0 && !uploading && (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              marginTop: 16,
              width: 80,
              height: 80,
              background: '#F5F5F5',
              border: '1px dashed #CCC',
              borderRadius: 4,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 28,
              color: '#CCC'
            }}
          >
            +
          </button>
        )}

        {error && (
          <p style={{ color: '#FA5151', fontSize: 13, marginTop: 12 }}>{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleImageSelect}
        />
      </div>

      {/* Bottom options */}
      <div style={{ borderTop: '1px solid #F0F0F0', background: '#fff' }}>
        <div className="flex px-4 py-3 gap-6">
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 14 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#666">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            所有人可见
          </button>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#666', fontSize: 14 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#666">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            所在位置
          </button>
        </div>
      </div>
    </div>
  );
}
