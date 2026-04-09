import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import MomentCard from '../components/MomentCard';
import useStore from '../store';
import { momentsAPI } from '../api';

export default function Moments() {
  const navigate = useNavigate();
  const { user, moments, setMoments, updateMoment } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadMoments();
  }, []);

  const loadMoments = async () => {
    try {
      const res = await momentsAPI.getFeed();
      setMoments(res.data);
    } catch (e) {
      console.error('加载朋友圈失败', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMomentUpdate = async (momentId) => {
    try {
      // Reload the entire feed to get fresh data
      const res = await momentsAPI.getFeed();
      setMoments(res.data);
    } catch (e) {
      console.error('更新动态失败', e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#EDEDED]">
      {/* NavBar */}
      <div
        className="navbar"
        style={{ position: 'relative', zIndex: 10 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="navbar-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 4, color: '#07C160' }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="#07C160">
            <path d="M8 1L1 8l7 7" stroke="#07C160" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="navbar-title">朋友圈</span>
        <button
          onClick={() => navigate('/moments/create')}
          className="navbar-right"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px', color: '#07C160', fontSize: 14 }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#07C160">
            <path d="M21 6.5l-4-4-8.5 8.5L7 15l4.5-1.5L21 6.5zm-14.5 7L9 16l-3 1 .5-3zm1-1l8-8 2.5 2.5-8 8L7.5 12.5z"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {/* Cover & Profile */}
        <div style={{ position: 'relative', marginBottom: 48 }}>
          {/* Cover photo */}
          <div
            style={{
              height: 200,
              background: user?.cover_photo
                ? `url(${user.cover_photo}) center/cover`
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              width: '100%'
            }}
          />
          {/* Profile avatar */}
          <div
            style={{
              position: 'absolute',
              right: 16,
              bottom: -40,
              border: '3px solid #fff',
              borderRadius: 8
            }}
          >
            <Avatar src={user?.avatar} name={user?.nickname} size={64} />
          </div>
          {/* Nickname */}
          <div
            style={{
              position: 'absolute',
              right: 92,
              bottom: -28,
              color: '#fff',
              fontSize: 17,
              fontWeight: '600',
              textShadow: '0 1px 4px rgba(0,0,0,0.5)'
            }}
          >
            {user?.nickname}
          </div>
        </div>

        <div style={{ borderTop: '1px solid #E0E0E0', background: '#EDEDED' }} />

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="spinner" />
          </div>
        ) : moments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p style={{ color: '#999', fontSize: 14 }}>还没有朋友圈内容</p>
            <button
              onClick={() => navigate('/moments/create')}
              style={{
                marginTop: 12,
                background: '#07C160',
                color: '#fff',
                border: 'none',
                borderRadius: 20,
                padding: '8px 20px',
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'inherit'
              }}
            >
              发表朋友圈
            </button>
          </div>
        ) : (
          <div>
            {moments.map(moment => (
              <MomentCard
                key={moment.id}
                moment={moment}
                onUpdate={handleMomentUpdate}
              />
            ))}
          </div>
        )}

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
