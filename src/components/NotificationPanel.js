import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function NotificationPanel({ notifications, onClear }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 10,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'border-l-4 border-emerald-400 bg-emerald-500/12';
      case 'error': return 'border-l-4 border-rose-400 bg-rose-500/12';
      case 'warning': return 'border-l-4 border-amber-400 bg-amber-500/12';
      default: return 'border-l-4 border-sky-400 bg-sky-500/12';
    }
  };

  const getTypeTextColor = (type) => {
    switch (type) {
      case 'success': return 'text-emerald-100';
      case 'error': return 'text-rose-100';
      case 'warning': return 'text-amber-100';
      default: return 'text-sky-100';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  const panel = open && createPortal(
    <div
      ref={panelRef}
      style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 9999 }}
      className="w-80 overflow-hidden rounded-[24px] border border-white/20 bg-slate-950/95 text-white shadow-2xl shadow-slate-950/40 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <h3 className="font-display text-lg font-extrabold">Notifications</h3>
        {notifications.length > 0 && (
          <button
            onClick={() => { onClear(); setOpen(false); }}
            className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-300 hover:text-orange-200"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-white/55">
            <div className="mb-2 text-4xl">🔔</div>
            <p>No notifications</p>
          </div>
        ) : (
          notifications.slice(0, 10).map((notif) => (
            <div key={notif.id} className={`border-b border-white/10 p-3 last:border-b-0 ${getTypeColor(notif.type)}`}>
              <div className="flex items-start space-x-3">
                <span className={`mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/12 text-sm font-bold ${getTypeTextColor(notif.type)}`}>
                  {getTypeIcon(notif.type)}
                </span>
                <p className={`text-sm font-medium leading-6 ${getTypeTextColor(notif.type)}`}>{notif.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>,
    document.body
  );

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="relative rounded-full border border-white/10 bg-white/8 p-3 text-white transition hover:bg-white/14"
        title="Notifications"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
            {Math.min(notifications.length, 9)}
          </span>
        )}
      </button>
      {panel}
    </div>
  );
}
