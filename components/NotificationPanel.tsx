import React from 'react';
import { AppNotification } from '../types';
import { XMarkIcon, BellIcon, CheckCircleIcon, TrendingDownIcon } from './Icons';

interface NotificationPanelProps {
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onClose, onMarkAsRead, onClearAll }) => {
  return (
    <div className="absolute top-16 right-4 md:right-20 w-80 md:w-96 bg-white rounded-2xl shadow-2xl shadow-slate-300 border border-slate-100 overflow-hidden z-50 animate-in slide-in-from-top-2 fade-in">
      <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
        <h3 className="font-bold flex items-center gap-2">
          <BellIcon className="w-5 h-5" /> Notifications
        </h3>
        <div className="flex gap-2">
          {notifications.length > 0 && (
            <button 
              onClick={onClearAll}
              className="text-[10px] uppercase font-bold text-slate-400 hover:text-white transition-colors"
            >
              Clear All
            </button>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
               <BellIcon className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm font-medium">No new notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map(notif => (
              <div 
                key={notif.id} 
                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${notif.read ? 'opacity-60' : 'bg-blue-50/30'}`}
                onClick={() => onMarkAsRead(notif.id)}
              >
                <div className="flex gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.type === 'success' ? 'bg-green-500' : notif.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                  <div>
                    <p className="text-sm text-slate-800 font-medium leading-snug">{notif.message}</p>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;