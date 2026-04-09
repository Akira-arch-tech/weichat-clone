import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import useStore from '../store';
import { usersAPI, uploadAPI } from '../api';
import { disconnectSocket } from '../socket';

const settingsSections = [
  {
    items: [
      { label: '账号与安全', icon: '🔐', iconBg: '#FF3B30' },
      { label: '青少年模式', icon: '👦', iconBg: '#007AFF' }
    ]
  },
  {
    items: [
      { label: '消息通知', icon: '🔔', iconBg: '#FF9500' },
      { label: '勿扰模式', icon: '🌙', iconBg: '#5856D6' }
    ]
  },
  {
    items: [
      { label: '隐私', icon: '🔒', iconBg: '#34C759' },
      { label: '通用', icon: '⚙️', iconBg: '#8E8E93' },
      { label: '辅助功能', icon: '♿', iconBg: '#007AFF' }
    ]
  },
  {
    items: [
      { label: '帮助与反馈', icon: '❓', iconBg: '#5856D6' },
      { label: '关于微信', icon: 'ℹ️', iconBg: '#07C160' }
    ]
  }
];

export default function Settings() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useStore();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    nickname: user?.nickname || '',
    bio: user?.bio || '',
    region: user?.region || '',
    wechat_id: user?.wechat_id || ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleLogout = () => {
    if (window.confirm('确定要退出登录吗？')) {
      disconnectSocket();
      logout();
      navigate('/login', { replace: true });
    }
  };

  const handleSaveProfile = async () => {
    if (!profileForm.nickname.trim()) {
      setError('昵称不能为空');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await usersAPI.updateProfile(profileForm);
      setUser(res.data);
      setShowEditProfile(false);
    } catch (e) {
      setError(e.response?.data?.error || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const uploadRes = await uploadAPI.uploadAvatar(formData);
      const updateRes = await usersAPI.updateAvatar({ avatar: uploadRes.data.url });
      setUser(updateRes.data);
    } catch (e) {
      console.error('头像上传失败', e);
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

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
        <span className="navbar-title">设置</span>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="separator" />

        {/* Profile section */}
        <div className="bg-white mb-2">
          <button
            onClick={() => setShowEditProfile(true)}
            style={{ width: '100%', background: 'none', border: 'none', padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}
          >
            <div className="flex items-center gap-3">
              <div style={{ position: 'relative' }}>
                <Avatar src={user?.avatar} name={user?.nickname} size={56} />
                {avatarUploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner" style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff', width: 16, height: 16 }} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 17, fontWeight: '500', margin: 0 }}>{user?.nickname}</p>
                <p style={{ fontSize: 13, color: '#999', margin: '2px 0 0' }}>微信号: {user?.wechat_id || '未设置'}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#C0C0C0">
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
              </svg>
            </div>
          </button>
        </div>

        {/* Settings sections */}
        {settingsSections.map((section, sIdx) => (
          <div key={sIdx} className="bg-white mb-2">
            {section.items.map((item, iIdx) => (
              <button
                key={item.label}
                style={{
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  padding: '12px 16px',
                  cursor: 'pointer',
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
                    fontSize: 16,
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

        {/* Logout button */}
        <div className="bg-white mb-2">
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              padding: '14px 16px',
              cursor: 'pointer',
              textAlign: 'center',
              fontSize: 17,
              color: '#FA5151',
              fontFamily: 'inherit'
            }}
          >
            退出登录
          </button>
        </div>

        <div style={{ height: 20 }} />
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'flex-end'
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowEditProfile(false); }}
        >
          <div
            style={{
              background: '#fff',
              width: '100%',
              maxWidth: 390,
              margin: '0 auto',
              borderRadius: '16px 16px 0 0',
              padding: '16px',
              maxHeight: '80vh',
              overflowY: 'auto'
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setShowEditProfile(false)}
                style={{ background: 'none', border: 'none', color: '#999', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                取消
              </button>
              <span style={{ fontSize: 16, fontWeight: '600' }}>编辑个人信息</span>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                style={{ background: 'none', border: 'none', color: '#07C160', fontSize: 15, cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>

            {/* Avatar change */}
            <div className="flex flex-col items-center mb-6">
              <label style={{ cursor: 'pointer' }}>
                <Avatar src={user?.avatar} name={user?.nickname} size={72} />
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </label>
              <span style={{ fontSize: 12, color: '#999', marginTop: 8 }}>点击更换头像</span>
            </div>

            {/* Form fields */}
            {[
              { key: 'nickname', label: '昵称' },
              { key: 'wechat_id', label: '微信号' },
              { key: 'region', label: '地区' },
              { key: 'bio', label: '个性签名', multiline: true }
            ].map(field => (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  alignItems: field.multiline ? 'flex-start' : 'center',
                  borderBottom: '1px solid #F0F0F0',
                  paddingBottom: 12,
                  marginBottom: 12
                }}
              >
                <span style={{ minWidth: 80, fontSize: 15, color: '#333', paddingTop: field.multiline ? 4 : 0 }}>
                  {field.label}
                </span>
                {field.multiline ? (
                  <textarea
                    value={profileForm[field.key]}
                    onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                    rows={3}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      resize: 'none',
                      color: '#333'
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    value={profileForm[field.key]}
                    onChange={(e) => setProfileForm({ ...profileForm, [field.key]: e.target.value })}
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: 15,
                      fontFamily: 'inherit',
                      color: '#333'
                    }}
                  />
                )}
              </div>
            ))}

            {error && (
              <p style={{ color: '#FA5151', fontSize: 13, marginTop: 8 }}>{error}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
