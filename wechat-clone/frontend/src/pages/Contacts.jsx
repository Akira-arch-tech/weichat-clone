import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import SearchBar from '../components/SearchBar';
import useStore from '../store';
import { contactsAPI } from '../api';

function groupContactsByLetter(contacts) {
  const groups = {};
  contacts.forEach(c => {
    // Use first character; for Chinese, map to # since we can't easily get pinyin
    let letter = c.nickname.charAt(0).toUpperCase();
    if (!/[A-Z]/.test(letter)) letter = '#';
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(c);
  });

  const sorted = Object.keys(groups).sort((a, b) => {
    if (a === '#') return 1;
    if (b === '#') return -1;
    return a.localeCompare(b);
  });

  return sorted.map(letter => ({ letter, contacts: groups[letter] }));
}

export default function Contacts() {
  const navigate = useNavigate();
  const { contacts, setContacts, friendRequests, setFriendRequests } = useStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, requestsRes] = await Promise.all([
        contactsAPI.getContacts(),
        contactsAPI.getRequests()
      ]);
      setContacts(contactsRes.data);
      setFriendRequests(requestsRes.data);
    } catch (e) {
      console.error('加载联系人失败', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = contacts.filter(c =>
    !search || c.nickname.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const groups = groupContactsByLetter(filtered);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* NavBar */}
      <div className="navbar">
        <span className="navbar-title">通讯录</span>
        <div className="navbar-right">
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#333">
              <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
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
        ) : (
          <>
            {/* Special items */}
            <div className="bg-white mb-2">
              {/* New friends */}
              <button
                onClick={() => {}}
                style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <div className="list-item">
                  <div
                    style={{ width: 48, height: 48, borderRadius: 6, background: '#FF6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span style={{ fontSize: 16 }}>新的朋友</span>
                    {friendRequests.length > 0 && (
                      <span className="unread-badge">{friendRequests.length}</span>
                    )}
                  </div>
                </div>
              </button>

              {/* Group chat */}
              <button
                style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <div className="list-item">
                  <div
                    style={{ width: 48, height: 48, borderRadius: 6, background: '#07C160', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 16 }}>群聊</span>
                </div>
              </button>

              {/* Tags */}
              <button
                style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <div className="list-item">
                  <div
                    style={{ width: 48, height: 48, borderRadius: 6, background: '#FF9500', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 16 }}>标签</span>
                </div>
              </button>

              {/* Official accounts */}
              <button
                style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
              >
                <div className="list-item" style={{ borderBottom: 'none' }}>
                  <div
                    style={{ width: 48, height: 48, borderRadius: 6, background: '#5856D6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12, flexShrink: 0 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 16 }}>公众号</span>
                </div>
              </button>
            </div>

            {/* Friend requests banner */}
            {friendRequests.length > 0 && (
              <div style={{ background: '#fff', marginBottom: 2, padding: '8px 16px' }}>
                <p style={{ fontSize: 12, color: '#999', margin: 0 }}>有 {friendRequests.length} 个好友申请待处理</p>
              </div>
            )}

            {/* Contacts list */}
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p style={{ color: '#999', fontSize: 14 }}>
                  {search ? '未找到联系人' : '还没有联系人'}
                </p>
              </div>
            ) : (
              groups.map(({ letter, contacts: groupContacts }) => (
                <div key={letter}>
                  <div className="section-header">{letter}</div>
                  <div className="bg-white">
                    {groupContacts.map((contact, i) => (
                      <button
                        key={contact.id}
                        onClick={() => navigate(`/contacts/${contact.id}`)}
                        style={{ width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                      >
                        <div className="list-item" style={{ paddingLeft: 12 }}>
                          <Avatar src={contact.avatar} name={contact.nickname} size={44} />
                          <span style={{ fontSize: 16, marginLeft: 12 }}>{contact.nickname}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
