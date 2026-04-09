import React, { useState } from 'react';
import Avatar from './Avatar';

function formatTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (msgDate.getTime() === yesterday.getTime()) {
    return '昨天 ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' }) + ' ' +
    date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function MessageBubble({ message, isMe, showTime, prevMessage }) {
  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = (e) => {
    e.preventDefault();
    setShowMenu(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).catch(() => {});
    setShowMenu(false);
  };

  return (
    <div>
      {showTime && (
        <div className="flex justify-center my-2">
          <span style={{ fontSize: 11, color: '#999', background: 'rgba(0,0,0,0.05)', borderRadius: 3, padding: '2px 6px' }}>
            {formatTime(message.created_at)}
          </span>
        </div>
      )}

      <div className={`flex items-start gap-2 px-3 py-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar
          src={message.sender_avatar}
          name={message.sender_nickname}
          size={40}
        />

        <div
          className={`max-w-[65%] relative`}
          onContextMenu={handleLongPress}
        >
          {message.type === 'image' ? (
            <div
              className={isMe ? 'bubble-me' : 'bubble-them'}
              style={{ padding: 4 }}
            >
              <img
                src={message.content}
                alt="图片"
                style={{ maxWidth: 200, maxHeight: 200, borderRadius: 4, display: 'block' }}
              />
            </div>
          ) : message.type === 'voice' ? (
            <div className={isMe ? 'bubble-me' : 'bubble-them'}>
              <div className="flex items-center gap-2" style={{ minWidth: 80 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#555">
                  <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                </svg>
                <span style={{ fontSize: 13 }}>语音消息</span>
              </div>
            </div>
          ) : (
            <div className={isMe ? 'bubble-me' : 'bubble-them'}>
              <span style={{ fontSize: 15, lineHeight: '1.5' }}>{message.content}</span>
            </div>
          )}

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div
                className="absolute z-50 bg-gray-800 rounded-lg overflow-hidden"
                style={{
                  bottom: '100%',
                  [isMe ? 'right' : 'left']: 0,
                  marginBottom: 4,
                  display: 'flex',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                }}
              >
                {[
                  { label: '复制', action: handleCopy },
                  { label: '转发', action: () => setShowMenu(false) },
                  { label: '删除', action: () => setShowMenu(false) }
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      padding: '8px 16px',
                      fontSize: 14,
                      cursor: 'pointer',
                      borderRight: i < 2 ? '1px solid rgba(255,255,255,0.2)' : 'none'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
