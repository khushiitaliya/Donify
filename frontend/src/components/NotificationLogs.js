import React, { useState, useEffect } from 'react';

export default function NotificationLogs() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load logs from localStorage
    const storedLogs = JSON.parse(localStorage.getItem('donify_notification_logs') || '[]');
    setLogs(storedLogs);
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'simulated':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sms':
        return '📱';
      case 'whatsapp':
        return '💬';
      case 'email':
        return '📧';
      default:
        return '📬';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Logs</h2>
        <p className="text-gray-600">View all sent notifications and their status</p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({logs.length})
        </button>
        <button
          onClick={() => setFilter('sent')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'sent'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sent ({logs.filter((l) => l.status === 'sent' || l.status === 'success').length})
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'failed'
              ? 'bg-red-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Failed ({logs.filter((l) => l.status === 'failed').length})
        </button>
        <button
          onClick={() => setFilter('simulated')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'simulated'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Simulated ({logs.filter((l) => l.status === 'simulated').length})
        </button>
      </div>

      {/* Logs Table */}
      {filteredLogs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-4xl mb-2">📭</p>
          <p className="text-gray-600">
            {logs.length === 0
              ? 'No notifications sent yet'
              : 'No logs match the selected filter'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Recipient</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Message</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <span className="text-lg">{getTypeIcon(log.type)}</span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {log.recipient}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="max-w-xs truncate">{log.message}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-500 text-xs">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Note:</strong> This log shows all notification send attempts. Check individual donor notification logs
          in their profiles to see received notifications.
        </p>
      </div>
    </div>
  );
}
