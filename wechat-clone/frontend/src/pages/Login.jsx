import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import useStore from '../store';
import { connectSocket } from '../socket';

export default function Login() {
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.password) {
      setError('请填写手机号和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(form);
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      connectSocket(token);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-8">
        {/* Logo */}
        <div
          className="flex items-center justify-center mb-8"
          style={{ width: 80, height: 80, borderRadius: 20, background: '#07C160' }}
        >
          <svg width="50" height="50" viewBox="0 0 100 100" fill="white">
            <ellipse cx="35" cy="40" rx="28" ry="22" fill="white"/>
            <circle cx="27" cy="40" r="4" fill="#07C160"/>
            <circle cx="43" cy="40" r="4" fill="#07C160"/>
            <ellipse cx="68" cy="30" rx="22" ry="17" fill="rgba(255,255,255,0.7)"/>
            <circle cx="62" cy="30" r="3" fill="#07C160"/>
            <circle cx="74" cy="30" r="3" fill="#07C160"/>
          </svg>
        </div>

        <h1 style={{ fontSize: 26, fontWeight: '600', color: '#333', marginBottom: 32 }}>
          微信
        </h1>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ background: '#F5F5F5', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
              <span style={{ padding: '14px 16px', color: '#333', fontSize: 15, whiteSpace: 'nowrap' }}>手机号</span>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="请输入手机号"
                maxLength={11}
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  padding: '14px 16px 14px 0',
                  fontSize: 15,
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ padding: '14px 16px', color: '#333', fontSize: 15, whiteSpace: 'nowrap' }}>密&nbsp;&nbsp;&nbsp;码</span>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="请输入密码"
                style={{
                  flex: 1,
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  padding: '14px 16px 14px 0',
                  fontSize: 15,
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>

          {error && (
            <p style={{ color: '#FA5151', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-green"
            style={{ marginTop: 8, borderRadius: 8 }}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div style={{ marginTop: 24, display: 'flex', gap: 32 }}>
          <Link to="/register" style={{ color: '#576B95', fontSize: 14, textDecoration: 'none' }}>
            注册账号
          </Link>
          <span style={{ color: '#576B95', fontSize: 14, cursor: 'pointer' }}>
            忘记密码
          </span>
        </div>

        <div style={{ marginTop: 32, padding: '12px 16px', background: '#F5F5F5', borderRadius: 8, width: '100%' }}>
          <p style={{ fontSize: 12, color: '#999', margin: 0, textAlign: 'center' }}>
            演示账号：13800000001 ~ 13800000005
          </p>
          <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0', textAlign: 'center' }}>
            统一密码：123456
          </p>
          <p style={{ fontSize: 12, color: '#FA5151', margin: '8px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
            安全提示：仅用于公开演示，请勿输入任何真实账号密码
          </p>
        </div>
      </div>
    </div>
  );
}
