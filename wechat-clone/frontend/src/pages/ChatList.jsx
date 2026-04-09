import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import SearchBar from '../components/SearchBar';
import useStore from '../store';
import { messagesAPI } from '../api';

function formatTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (msgDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (msgDate.getTime() === yesterday.getTime()) return '昨天';

  const diff = today - msgDate;
  if (diff < 7 * 86400000) {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return '周' + days[date.getDay()];
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function ChatList() {
  const navigate = useNavigate();
  const { conversations, setConversations } = useStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(res.data);
    } catch (e) {
      console.error('加载会话失败', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = conversations.filter(c =>
    !search || c.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* NavBar */}
      <div className="navbar">
        <span className="navbar-title">微信</span>
        <div className="navbar-right">
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
            title="新建聊天"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#333">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
          </button>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="搜索" />

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p style={{ color: '#999', fontSize: 14 }}>
              {search ? '未找到相关聊天' : '暂无聊天记录'}
            </p>
          </div>
        ) : (
          <div className="bg-white">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.other_user_id}`)}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'block'
                }}
              >
                <div className="list-item" style={{ paddingLeft: 12 }}>
                  <div className="relative mr-3">
                    <Avatar src={conv.avatar} name={conv.nickname} size={48} />
                    {conv.unread_count > 0 && (
                      <span
                        className="unread-badge absolute"
                        style={{ top: -4, right: -4 }}
                      >
                        {conv.unread_count > 99 ? '99+' : conv.unread_count}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span style={{ fontSize: 16, fontWeight: 400, color: '#000' }}>
                        {conv.nickname}
                      </span>
                      <span style={{ fontSize: 12, color: '#999', flexShrink: 0, marginLeft: 8 }}>
                        {formatTime(conv.last_message_time)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: 13,
                        color: '#999',
                        margin: 0,
                        marginTop: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {conv.last_message || '暂无消息'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
