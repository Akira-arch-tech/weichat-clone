import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import MessageBubble from '../components/MessageBubble';
import useStore from '../store';
import { messagesAPI, contactsAPI, uploadAPI } from '../api';
import { getSocket } from '../socket';

export default function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user, messages: allMessages, setMessages, addMessage, clearUnread, conversations } = useStore();
  const [otherUser, setOtherUser] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  // Keep refs to current values for socket callbacks
  const userIdRef = useRef(userId);
  const userRef = useRef(user);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { userRef.current = user; }, [user]);

  const messages = allMessages[userId] || [];

  useEffect(() => {
    loadData();

    const socket = getSocket();
    if (socket) {
      const handleReceive = ({ message, from }) => {
        const currentUserId = userIdRef.current;
        if (String(from) === String(currentUserId) || String(message.sender_id) === String(currentUserId)) {
          addMessage(currentUserId, message);
        }
      };

      const handleSent = ({ message }) => {
        const currentUser = userRef.current;
        const currentUserId = userIdRef.current;
        if (message && currentUser && message.sender_id === currentUser.id) {
          addMessage(currentUserId, message);
        }
      };

      const handleTyping = ({ fromUserId }) => {
        if (String(fromUserId) === String(userIdRef.current)) {
          setIsTyping(true);
        }
      };

      const handleStopTyping = ({ fromUserId }) => {
        if (String(fromUserId) === String(userIdRef.current)) {
          setIsTyping(false);
        }
      };

      socket.on('receive_message', handleReceive);
      socket.on('message_sent', handleSent);
      socket.on('user_typing', handleTyping);
      socket.on('user_stop_typing', handleStopTyping);

      return () => {
        socket.off('receive_message', handleReceive);
        socket.off('message_sent', handleSent);
        socket.off('user_typing', handleTyping);
        socket.off('user_stop_typing', handleStopTyping);
      };
    }
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const conv = conversations.find(c => c.other_user_id === parseInt(userId));
    if (conv) {
      clearUnread(conv.id);
      messagesAPI.markRead(userId).catch(() => {});
    }
  }, [userId]);

  const loadData = async () => {
    try {
      const [userRes, msgRes] = await Promise.all([
        contactsAPI.getContact(userId),
        messagesAPI.getMessages(userId)
      ]);
      setOtherUser(userRes.data);
      setMessages(userId, msgRes.data);
    } catch (e) {
      console.error('加载聊天失败', e);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    const content = inputText.trim();
    setInputText('');
    setSending(true);

    const socket = getSocket();

    // Optimistic message for immediate display
    const optimisticMsg = {
      id: 'temp_' + Date.now(),
      conversation_id: null,
      sender_id: user?.id,
      content,
      type: 'text',
      is_read: 0,
      created_at: new Date().toISOString(),
      sender_nickname: user?.nickname,
      sender_avatar: user?.avatar
    };
    addMessage(userId, optimisticMsg);

    if (socket && socket.connected) {
      socket.emit('send_message', {
        toUserId: parseInt(userId),
        content,
        type: 'text'
      });
      setSending(false);
    } else {
      try {
        const res = await messagesAPI.sendMessage(userId, { content, type: 'text' });
        // Replace optimistic message by reloading
        const msgRes = await messagesAPI.getMessages(userId);
        setMessages(userId, msgRes.data);
      } catch (e) {
        console.error('发送失败', e);
        setInputText(content);
      } finally {
        setSending(false);
      }
    }
  };

  const handleTyping = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();
    if (socket) {
      socket.emit('typing', { toUserId: parseInt(userId) });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { toUserId: parseInt(userId) });
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await uploadAPI.uploadImage(formData);
      const imageUrl = res.data.url;

      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('send_message', {
          toUserId: parseInt(userId),
          content: imageUrl,
          type: 'image'
        });
      } else {
        await messagesAPI.sendMessage(userId, { content: imageUrl, type: 'image' });
        const msgRes = await messagesAPI.getMessages(userId);
        setMessages(userId, msgRes.data);
      }
    } catch (e) {
      console.error('上传图片失败', e);
    }
    e.target.value = '';
  };

  const shouldShowTime = (msg, prev) => {
    if (!prev) return true;
    const diff = new Date(msg.created_at) - new Date(prev.created_at);
    return diff > 5 * 60 * 1000;
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
        <div className="navbar-title flex flex-col items-center">
          <span>{otherUser?.nickname || '聊天'}</span>
          {isTyping && (
            <span style={{ fontSize: 11, color: '#999', fontWeight: 'normal' }}>对方正在输入...</span>
          )}
        </div>
        <button
          onClick={() => navigate(`/contacts/${userId}`)}
          className="navbar-right"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 12px' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#333">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-2">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="spinner" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center py-8">
            <span style={{ fontSize: 13, color: '#999' }}>开始聊天吧</span>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isMe={msg.sender_id === user?.id}
              showTime={shouldShowTime(msg, messages[idx - 1])}
              prevMessage={messages[idx - 1]}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div style={{ background: '#F5F5F5', borderTop: '1px solid #E0E0E0' }}>
        <div className="flex items-end gap-2 px-3 py-2">
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#555">
              <path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.41 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
            </svg>
          </button>

          <textarea
            value={inputText}
            onChange={handleTyping}
            onKeyDown={handleKeyDown}
            placeholder="发送消息"
            rows={1}
            className="chat-input"
            style={{
              flex: 1,
              resize: 'none',
              maxHeight: 100,
              lineHeight: '1.5',
              overflowY: 'auto'
            }}
          />

          {inputText.trim() ? (
            <button
              onClick={handleSend}
              disabled={sending}
              style={{
                background: '#07C160',
                color: '#fff',
                border: 'none',
                borderRadius: 4,
                padding: '8px 14px',
                fontSize: 15,
                cursor: 'pointer',
                flexShrink: 0,
                fontFamily: 'inherit'
              }}
            >
              发送
            </button>
          ) : (
            <button
              onClick={() => setShowExtra(!showExtra)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, flexShrink: 0 }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#555">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </button>
          )}
        </div>

        {showExtra && (
          <div className="px-4 py-3 grid grid-cols-4 gap-4">
            {[
              { icon: '🖼️', label: '图片', action: () => fileInputRef.current?.click() },
              { icon: '📷', label: '拍照', action: () => {} },
              { icon: '📍', label: '位置', action: () => {} },
              { icon: '🎁', label: '红包', action: () => {} }
            ].map((item, i) => (
              <button
                key={i}
                onClick={item.action}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
              >
                <div style={{ width: 56, height: 56, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
                  {item.icon}
                </div>
                <span style={{ fontSize: 11, color: '#666' }}>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
      </div>
    </div>
  );
}
