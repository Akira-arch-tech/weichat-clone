import React from 'react';
import { useNavigate } from 'react-router-dom';

const discoverItems = [
  {
    group: [
      {
        id: 'moments',
        icon: '🌅',
        iconBg: '#FF6B6B',
        label: '朋友圈',
        route: '/moments'
      }
    ]
  },
  {
    group: [
      {
        id: 'channels',
        icon: '📺',
        iconBg: '#FF3B30',
        label: '视频号',
        route: null
      },
      {
        id: 'live',
        icon: '🔴',
        iconBg: '#FF9500',
        label: '直播',
        route: null
      }
    ]
  },
  {
    group: [
      {
        id: 'scan',
        icon: '📷',
        iconBg: '#5856D6',
        label: '扫一扫',
        route: null
      },
      {
        id: 'shake',
        icon: '📱',
        iconBg: '#5856D6',
        label: '摇一摇',
        route: null
      }
    ]
  },
  {
    group: [
      {
        id: 'nearby',
        icon: '📍',
        iconBg: '#4CD964',
        label: '附近的人',
        route: null
      }
    ]
  },
  {
    group: [
      {
        id: 'shop',
        icon: '🛍️',
        iconBg: '#FF9500',
        label: '购物',
        route: null
      },
      {
        id: 'games',
        icon: '🎮',
        iconBg: '#007AFF',
        label: '游戏',
        route: null
      }
    ]
  }
];

export default function Discover() {
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (item.route) {
      navigate(item.route);
    }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* NavBar */}
      <div className="navbar">
        <span className="navbar-title">发现</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="separator" />

        {discoverItems.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="bg-white mb-2">
              {section.group.map((item, iIdx) => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: iIdx < section.group.length - 1 ? '1px solid #F0F0F0' : 'none'
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
                        marginRight: 16,
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
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
