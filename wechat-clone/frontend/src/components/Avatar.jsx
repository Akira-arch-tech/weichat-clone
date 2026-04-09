import React from 'react';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

function getColorFromString(str) {
  if (!str) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function Avatar({ src, name = '', size = 40, className = '' }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const bgColor = getColorFromString(name);

  const style = {
    width: size,
    height: size,
    borderRadius: 6,
    flexShrink: 0
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        style={style}
        className={`object-cover ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...style,
        backgroundColor: bgColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: size * 0.4,
        fontWeight: '600',
        userSelect: 'none'
      }}
      className={className}
    >
      {initial}
    </div>
  );
}
