import React from 'react';

export default function SearchBar({ value, onChange, placeholder = '搜索', onFocus, onBlur }) {
  return (
    <div className="px-3 py-2 bg-[#EDEDED]">
      <div
        className="flex items-center rounded-md px-3 py-1.5 gap-2"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#999">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: 14,
            color: '#333',
            width: '100%',
            fontFamily: 'inherit'
          }}
        />
        {value && (
          <button
            onClick={() => onChange('')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#999">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
