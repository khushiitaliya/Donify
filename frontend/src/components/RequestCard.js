import React from 'react';

export default function RequestCard({ request, onAccept, onReject, onCancel, onComplete, showActions = true }) {
  const urgencyColor = {
    Low: 'bg-green-100 text-green-800 border-l-4 border-green-500',
    Medium: 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500',
    High: 'bg-red-100 text-red-800 border-l-4 border-red-500',
  }[request.urgency] || 'bg-gray-100 text-gray-800';

  const statusBadge = {
    'Sent': 'bg-blue-500',
    'Accepted': 'bg-purple-500',
    'In Progress': 'bg-orange-500',
    'Completed': 'bg-green-500',
    'Cancelled': 'bg-gray-500',
    'Expired': 'bg-red-500',
  }[request.status] || 'bg-gray-500';

  const elapsedTime = new Date(Date.now() - new Date(request.createdAt).getTime());
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60));

  return (
    <div className={`p-4 rounded-lg shadow-sm ${urgencyColor}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${statusBadge}`}>
              {request.status}
            </span>
            <span className="font-bold text-lg">{request.bloodGroup}</span>
            <span className="text-sm opacity-75">• {request.quantity} Units</span>
          </div>
        </div>
        <div className="text-xs opacity-75">{hours}h ago</div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <span className="opacity-75">Location:</span>
          <div className="font-semibold">{request.location}</div>
        </div>
        <div>
          <span className="opacity-75">Hospital:</span>
          <div className="font-semibold">{request.hospitalName || 'N/A'}</div>
        </div>
      </div>

      {showActions && (request.status === 'Sent' || request.status === 'Accepted') && (
        <div className="flex space-x-2">
          {request.status === 'Sent' && onAccept && (
            <button
              onClick={() => onAccept(request)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            >
              Accept
            </button>
          )}
          {request.status === 'Sent' && onReject && (
            <button
              onClick={() => onReject(request)}
              className="flex-1 px-3 py-2 border-2 border-current rounded text-sm font-medium hover:opacity-75"
            >
              Reject
            </button>
          )}
          {request.status === 'Accepted' && onComplete && (
            <button
              onClick={() => onComplete(request)}
              className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700"
            >
              Mark Complete
            </button>
          )}
          {(request.status === 'Sent' || request.status === 'Accepted') && onCancel && (
            <button
              onClick={() => onCancel(request)}
              className="flex-1 px-3 py-2 border-2 border-current rounded text-sm font-medium hover:opacity-75"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
