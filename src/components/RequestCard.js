import React from 'react';

export default function RequestCard({ request, onAccept, onReject, onCancel, onComplete, showActions = true }) {
  const urgencyColor = {
    Low: 'bg-emerald-100 text-emerald-800',
    Medium: 'bg-amber-100 text-amber-800',
    High: 'bg-red-100 text-red-800',
    Critical: 'bg-rose-700 text-white',
  }[request.urgency] || 'bg-slate-100 text-slate-800';

  const statusBadge = {
    Sent: 'bg-sky-100 text-sky-800',
    Accepted: 'bg-violet-100 text-violet-800',
    'In Progress': 'bg-orange-100 text-orange-800',
    Completed: 'bg-emerald-100 text-emerald-800',
    Cancelled: 'bg-slate-200 text-slate-700',
    Expired: 'bg-rose-100 text-rose-800',
  }[request.status] || 'bg-slate-100 text-slate-700';

  const elapsedTime = new Date(Date.now() - new Date(request.createdAt).getTime());
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

  return (
    <div className="glass-panel rounded-[28px] border border-white/70 p-5 shadow-lg shadow-red-100/35">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`status-chip ${statusBadge}`}>
              {request.status}
            </span>
            <span className={`status-chip ${urgencyColor}`}>{request.urgency} Priority</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="font-display text-3xl font-extrabold text-slate-900">{request.bloodGroup}</span>
            <span className="text-sm font-semibold text-slate-500">{request.quantity} Units Needed</span>
          </div>
        </div>
        <div className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-700">{hours}h ago</div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Location</span>
          <div className="mt-1 font-semibold text-slate-900">{request.location}</div>
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Hospital</span>
          <div className="mt-1 font-semibold text-slate-900">{request.hospitalName || 'N/A'}</div>
        </div>
      </div>

      {showActions && (request.status === 'Sent' || request.status === 'Accepted') && (
        <div className="flex flex-wrap gap-2">
          {request.status === 'Sent' && onAccept && (
            <button
              onClick={() => onAccept(request)}
              className="flex-1 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Accept
            </button>
          )}
          {request.status === 'Sent' && onReject && (
            <button
              onClick={() => onReject(request)}
              className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Reject
            </button>
          )}
          {request.status === 'Accepted' && onComplete && (
            <button
              onClick={() => onComplete(request)}
              className="flex-1 rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Mark Complete
            </button>
          )}
          {(request.status === 'Sent' || request.status === 'Accepted') && onCancel && (
            <button
              onClick={() => onCancel(request)}
              className="flex-1 rounded-full border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
