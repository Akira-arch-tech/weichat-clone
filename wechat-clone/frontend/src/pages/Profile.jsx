import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import useStore from '../store';

const menuItems = [
  {
    items: [
      { icon: '⭐', iconBg: '#FF9500', label: '收藏', route: null },
      { icon: '🌅', iconBg: '#FF6B6B', label: '朋友圈', route: '/moments' },
      { icon: '📺', iconBg: '#FF3B30', label: '视频号', route: null },
      { icon: '💳', iconBg: '#007AFF', label: '卡包', route: null },
      { icon: '😊', iconBg: '#FF9500', label: '表情', route: null }
    ]
  }
];

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useStore();

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* NavBar */}
      <div className="navbar">
        <span className="navbar-title">我</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="separator" />

        {/* Top user card */}
        <div className="bg-white mb-2">
          <button
            onClick={() => navigate(`/contacts/${user?.id}`)}
            style={{ width: '100%', background: 'none', border: 'none', padding: '20px 16px', cursor: 'pointer', textAlign: 'left' }}
          >
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatar} name={user?.nickname} size={64} />
              <div className="flex-1">
                <h2 style={{ fontSize: 20, fontWeight: '600', color: '#000', margin: 0 }}>
                  {user?.nickname}
                </h2>
                <p style={{ fontSize: 13, color: '#888', margin: '4px 0 0' }}>
                  微信号：{user?.wechat_id || '未设置'}
                </p>
                {user?.bio && (
                  <p style={{ fontSize: 12, color: '#AAA', margin: '2px 0 0' }}>
                    {user.bio}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div style={{ width: 20, height: 20 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#AAA">
                    <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zm-14 4H3v8h8v-8zm-2 6H5v-4h4v4zm4-6h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-2 4h2v2h-2zm2 0h2v2h-2zm2-2h2v2h-2zm-2-4h2v2h-2zm2 0h2v2h-2z"/>
                  </svg>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#C0C0C0">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Menu items */}
        {menuItems.map((section, sIdx) => (
          <div key={sIdx} className="bg-white mb-2">
            {section.items.map((item, iIdx) => (
              <button
                key={item.label}
                onClick={() => item.route && navigate(item.route)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px 16px',
                  cursor: item.route ? 'pointer' : 'default',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  borderBottom: iIdx < section.items.length - 1 ? '1px solid #F0F0F0' : 'none'
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: item.iconBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 18,
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </div>
                <span style={{ flex: 1, fontSize: 16, color: '#000' }}>{item.label}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#C0C0C0">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
            ))}
          </div>
        ))}

        {/* Settings entry */}
        <div className="bg-white mb-2">
          <button
            onClick={() => navigate('/settings')}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#8E8E93',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </div>
            <span style={{ flex: 1, fontSize: 16, color: '#000' }}>设置</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#C0C0C0">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </button>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
