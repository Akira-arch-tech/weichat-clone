import React, { useState } from 'react';
import Avatar from './Avatar';
import useStore from '../store';
import { momentsAPI } from '../api';

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
  if (diff < 2592000000) return `${Math.floor(diff / 86400000)}天前`;
  return date.toLocaleDateString('zh-CN');
}

export default function MomentCard({ moment, onUpdate }) {
  const { user } = useStore();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const images = Array.isArray(moment.images) ? moment.images : [];
  const isLiked = moment.liked_by_me;

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await momentsAPI.toggleLike(moment.id);
      if (onUpdate) onUpdate(moment.id);
    } catch (e) {
      console.error('点赞失败', e);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await momentsAPI.addComment(moment.id, {
        content: commentText.trim(),
        replyToId: replyTo?.id
      });
      setCommentText('');
      setReplyTo(null);
      setShowCommentInput(false);
      if (onUpdate) onUpdate(moment.id);
    } catch (e) {
      console.error('评论失败', e);
    }
  };

  return (
    <div className="bg-white mb-2">
      <div className="flex gap-3 px-4 pt-4 pb-2">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <Avatar src={moment.avatar} name={moment.nickname} size={44} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm" style={{ color: '#576B95', marginBottom: 4 }}>
            {moment.nickname}
          </div>

          {moment.content && (
            <p className="text-sm leading-relaxed text-gray-800 mb-2">
              {moment.content}
            </p>
          )}

          {/* Images grid */}
          {images.length > 0 && (
            <div
              className="grid gap-1 mb-2"
              style={{
                gridTemplateColumns: images.length === 1 ? '1fr' : images.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                maxWidth: images.length === 1 ? 200 : '100%'
              }}
            >
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                />
              ))}
            </div>
          )}

          {/* Time and actions row */}
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 12, color: '#999' }}>{timeAgo(moment.created_at)}</span>

            <button
              onClick={() => setShowActions(!showActions)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
            >
              <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: '#999' }} />
                ))}
              </div>
            </button>
          </div>

          {/* Like/comment action panel */}
          {showActions && (
            <div
              className="flex gap-0 mt-1 rounded"
              style={{ background: '#555', overflow: 'hidden', display: 'inline-flex' }}
            >
              <button
                onClick={() => { handleLike(); setShowActions(false); }}
                className="flex items-center gap-1 px-3 py-1.5"
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer', borderRight: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span>👍</span>
                <span>赞</span>
              </button>
              <button
                onClick={() => { setShowCommentInput(true); setShowActions(false); }}
                className="flex items-center gap-1 px-3 py-1.5"
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: 13, cursor: 'pointer' }}
              >
                <span>💬</span>
                <span>评论</span>
              </button>
            </div>
          )}

          {/* Likes */}
          {moment.likes && moment.likes.length > 0 && (
            <div
              className="mt-2 px-2 py-1 rounded"
              style={{ background: '#F5F5F5', fontSize: 13 }}
            >
              <span style={{ color: '#576B95' }}>
                👍 {moment.likes.map(l => l.nickname).join('、')}
              </span>
            </div>
          )}

          {/* Comments */}
          {moment.comments && moment.comments.length > 0 && (
            <div
              className="mt-1 px-2 py-1 rounded"
              style={{ background: '#F5F5F5' }}
            >
              {moment.comments.map((comment) => (
                <div key={comment.id} className="py-0.5">
                  <button
                    onClick={() => {
                      setReplyTo(comment);
                      setShowCommentInput(true);
                    }}
                    style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
                  >
                    <span style={{ color: '#576B95', fontSize: 13, fontWeight: 500 }}>
                      {comment.nickname}
                    </span>
                    {comment.reply_to_nickname && (
                      <span style={{ color: '#999', fontSize: 13 }}>
                        {' '}回复{' '}
                        <span style={{ color: '#576B95' }}>{comment.reply_to_nickname}</span>
                      </span>
                    )}
                    <span style={{ color: '#555', fontSize: 13 }}>：{comment.content}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          {showCommentInput && (
            <div className="mt-2 flex gap-2 items-center">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyTo ? `回复 ${replyTo.nickname}...` : '写评论...'}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleComment();
                  if (e.key === 'Escape') {
                    setShowCommentInput(false);
                    setReplyTo(null);
                    setCommentText('');
                  }
                }}
                style={{
                  flex: 1,
                  border: '1px solid #E0E0E0',
                  borderRadius: 4,
                  padding: '6px 10px',
                  fontSize: 14,
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim()}
                style={{
                  background: commentText.trim() ? '#07C160' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 4,
                  padding: '6px 12px',
                  fontSize: 13,
                  cursor: commentText.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit'
                }}
              >
                发送
              </button>
            </div>
          )}
        </div>
      </div>
      <div style={{ height: 1, background: '#F0F0F0', marginLeft: 60 }} />
    </div>
  );
}
