import React from 'react';
import useStore from '../store';

const tabs = [
  {
    id: 'chats',
    label: '微信',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#07C160' : '#999'}>
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
      </svg>
    )
  },
  {
    id: 'contacts',
    label: '通讯录',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#07C160' : '#999'}>
        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
      </svg>
    )
  },
  {
    id: 'discover',
    label: '发现',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#07C160' : '#999'}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
      </svg>
    )
  },
  {
    id: 'profile',
    label: '我',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#07C160' : '#999'}>
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>
    )
  }
];

export default function TabBar({ activeTab, onTabChange }) {
  const unreadTotal = useStore(s => s.unreadTotal);

  return (
    <div className="tab-bar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 flex flex-col items-center justify-center h-full relative"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div className="relative">
              {tab.icon(isActive)}
              {tab.id === 'chats' && unreadTotal > 0 && (
                <span
                  className="unread-badge absolute"
                  style={{ top: -4, right: -6, fontSize: 10, minWidth: 14, height: 14 }}
                >
                  {unreadTotal > 99 ? '99+' : unreadTotal}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: 10,
                marginTop: 2,
                color: isActive ? '#07C160' : '#999',
                fontWeight: isActive ? '500' : 'normal'
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
