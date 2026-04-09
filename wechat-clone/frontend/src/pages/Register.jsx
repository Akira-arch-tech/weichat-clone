import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../api';
import useStore from '../store';
import { connectSocket } from '../socket';

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setToken } = useStore();
  const [form, setForm] = useState({ phone: '', nickname: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || !form.nickname || !form.password) {
      setError('请填写所有字段');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      setError('手机号格式不正确');
      return;
    }
    if (form.password.length < 6) {
      setError('密码至少6位');
      return;
    }
    if (form.password !== form.confirm) {
      setError('两次密码不一致');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authAPI.register({
        phone: form.phone,
        nickname: form.nickname,
        password: form.password
      });
      const { token, user } = res.data;
      setToken(token);
      setUser(user);
      connectSocket(token);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'phone', label: '手机号', type: 'tel', placeholder: '请输入11位手机号', maxLength: 11 },
    { key: 'nickname', label: '昵　称', type: 'text', placeholder: '请输入昵称' },
    { key: 'password', label: '密　码', type: 'password', placeholder: '请设置密码（至少6位）' },
    { key: 'confirm', label: '确认密码', type: 'password', placeholder: '请再次输入密码' }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* NavBar */}
      <div className="navbar">
        <button
          onClick={() => navigate(-1)}
          className="navbar-left"
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: '#07C160', fontSize: 16, paddingLeft: 12 }}
        >
          <svg width="10" height="16" viewBox="0 0 10 16" fill="#07C160">
            <path d="M8 1L1 8l7 7" stroke="#07C160" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          返回
        </button>
        <span className="navbar-title">注册</span>
      </div>

      <div className="flex-1 px-6 pt-8">
        <form onSubmit={handleSubmit}>
          <div style={{ background: '#F5F5F5', borderRadius: 8, overflow: 'hidden', marginBottom: 20 }}>
            {fields.map((field, i) => (
              <div
                key={field.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: i < fields.length - 1 ? '1px solid #E0E0E0' : 'none'
                }}
              >
                <span style={{ padding: '14px 16px', color: '#333', fontSize: 15, whiteSpace: 'nowrap', minWidth: 80 }}>
                  {field.label}
                </span>
                <input
                  type={field.type}
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  maxLength={field.maxLength}
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
            ))}
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
            style={{ borderRadius: 8 }}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <span style={{ color: '#999', fontSize: 14 }}>已有账号？</span>
          <Link to="/login" style={{ color: '#576B95', fontSize: 14, textDecoration: 'none' }}>
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}
