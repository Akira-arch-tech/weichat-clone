import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { contactsAPI } from '../api';
import useStore from '../store';

export default function ContactDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useStore();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [addNote, setAddNote] = useState('');

  useEffect(() => {
    loadContact();
  }, [userId]);

  const loadContact = async () => {
    try {
      const res = await contactsAPI.getContact(userId);
      setContact(res.data);
    } catch (e) {
      console.error('加载联系人失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async () => {
    setAddLoading(true);
    try {
      await contactsAPI.addContact({ userId: parseInt(userId), message: addNote });
      setAddMsg('好友申请已发送');
      setShowAddForm(false);
      loadContact();
    } catch (e) {
      setAddMsg(e.response?.data?.error || '添加失败');
    } finally {
      setAddLoading(false);
    }
  };

  const isFriend = contact?.friendship?.status === 'accepted';
  const isPending = contact?.friendship?.status === 'pending';
  const isSelf = parseInt(userId) === currentUser?.id;

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-[#EDEDED]">
        <div className="navbar">
          <button onClick={() => navigate(-1)} className="navbar-left" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px' }}>
            <svg width="10" height="16" viewBox="0 0 10 16" fill="#07C160"><path d="M8 1L1 8l7 7" stroke="#07C160" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <span className="navbar-title">详细资料</span>
        </div>
        <div className="flex justify-center items-center flex-1">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]">
      {/* NavBar */}
      <div className="navbar">
        <button
          onClick={() => navigate(-1)}
          className="navbar-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, color: '#07C160' }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="#07C160">
            <path d="M8 1L1 8l7 7" stroke="#07C160" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="navbar-title">详细资料</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Top card */}
        <div className="bg-white mb-3">
          <div className="flex items-center gap-4 px-4 py-5">
            <Avatar src={contact?.avatar} name={contact?.nickname} size={64} />
            <div className="flex-1">
              <h2 style={{ fontSize: 20, fontWeight: '600', color: '#000', margin: 0 }}>
                {contact?.nickname}
              </h2>
              {contact?.wechat_id && (
                <p style={{ fontSize: 13, color: '#999', margin: '4px 0 0' }}>
                  微信号：{contact.wechat_id}
                </p>
              )}
              {contact?.region && (
                <p style={{ fontSize: 13, color: '#999', margin: '2px 0 0' }}>
                  地区：{contact.region}
                </p>
              )}
            </div>
            {/* QR code icon */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#999">
                <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zm-14 4H3v8h8v-8zm-2 6H5v-4h4v4zm4-6h2v2h-2zm2 2h2v2h-2zm2-2h2v2h-2zm-2 4h2v2h-2zm2 0h2v2h-2zm2-2h2v2h-2zm-2-4h2v2h-2zm2 0h2v2h-2z"/>
              </svg>
            </button>
          </div>

          {contact?.bio && (
            <div style={{ padding: '0 16px 16px', borderTop: '1px solid #F0F0F0' }}>
              <p style={{ fontSize: 14, color: '#666', margin: '12px 0 0' }}>
                个性签名：{contact.bio}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isSelf && (
          <div className="bg-white mb-3">
            {isFriend ? (
              <>
                <button
                  onClick={() => navigate(`/chat/${userId}`)}
                  style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #F0F0F0' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#07C160">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                  发消息
                </button>
                <button
                  style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', gap: 12 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF9500">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  设为星标好友
                </button>
              </>
            ) : isPending ? (
              <div style={{ padding: '14px 16px', color: '#999', fontSize: 14, textAlign: 'center' }}>
                已发送好友申请，等待对方确认
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', gap: 12, color: '#07C160' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#07C160">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                添加到通讯录
              </button>
            )}
          </div>
        )}

        {/* Add friend form */}
        {showAddForm && (
          <div className="bg-white mb-3 p-4">
            <p style={{ fontSize: 14, color: '#333', marginBottom: 12 }}>发送好友申请</p>
            <textarea
              value={addNote}
              onChange={(e) => setAddNote(e.target.value)}
              placeholder="我是..."
              rows={3}
              style={{
                width: '100%',
                border: '1px solid #E0E0E0',
                borderRadius: 4,
                padding: '8px 12px',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                marginBottom: 12
              }}
            />
            {addMsg && (
              <p style={{ color: addMsg.includes('发送') ? '#07C160' : '#FA5151', fontSize: 13, marginBottom: 8 }}>
                {addMsg}
              </p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAddForm(false); setAddNote(''); setAddMsg(''); }}
                style={{ flex: 1, background: '#F5F5F5', border: 'none', borderRadius: 4, padding: '10px', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                取消
              </button>
              <button
                onClick={handleAddFriend}
                disabled={addLoading}
                className="btn-green"
                style={{ flex: 1, borderRadius: 4 }}
              >
                {addLoading ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        )}

        {/* Moments entry */}
        {isFriend && (
          <div className="bg-white mb-3">
            <button
              onClick={() => navigate('/moments')}
              style={{ width: '100%', background: 'none', border: 'none', padding: '14px 16px', textAlign: 'left', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <span>朋友圈</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#999">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
