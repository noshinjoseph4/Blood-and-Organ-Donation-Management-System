import { useState, useEffect } from 'react';
import { X, Bell, AlertTriangle } from 'lucide-react';

const NotificationToast = ({ notification, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setVisible(true);
            const timer = setTimeout(() => {
                handleClose();
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleClose = () => {
        setVisible(false);
        setTimeout(onClose, 300); // Wait for fade out
    };

    if (!notification) return null;

    return (
        <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className={`max-w-md bg-white border-l-4 ${notification.is_urgent ? 'border-red-600' : 'border-blue-500'} shadow-xl rounded-lg overflow-hidden flex items-start p-4`}>
                <div className="flex-shrink-0">
                    {notification.is_urgent ? (
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                    ) : (
                        <Bell className="h-6 w-6 text-blue-500" />
                    )}
                </div>
                <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900">
                        {notification.is_urgent ? 'Urgent Request!' : 'New Request Notification'}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                        {notification.text}
                    </p>
                    <div className="mt-3 flex space-x-3">
                        <button
                            onClick={handleClose}
                            className="text-xs font-semibold text-gray-400 hover:text-gray-600 uppercase tracking-wider"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    <button onClick={handleClose} className="rounded-md inline-flex text-gray-400 hover:text-gray-500">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationToast;
