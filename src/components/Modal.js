import React from 'react';

export default function Modal({ open, title, children, onClose, size = 'md' }) {
  if (!open) return null;

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/58 p-4 backdrop-blur-sm">
      <div className={`glass-panel w-full max-h-[90vh] overflow-y-auto rounded-[28px] ${sizeClass}`}>
        <div className="flex items-center justify-between border-b border-red-100/80 px-6 py-5">
          <h2 className="font-display text-xl font-extrabold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl font-light leading-none text-slate-500 transition hover:text-red-700"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
