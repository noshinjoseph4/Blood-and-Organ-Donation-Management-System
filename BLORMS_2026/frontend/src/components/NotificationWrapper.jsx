import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationToast from './NotificationToast';

const NotificationWrapper = ({ children }) => {
    const { user } = useAuth();
    const [notification, setNotification] = useState(null);
    const [socket, setSocket] = useState(null);

    const connectWebSocket = useCallback(() => {
        if (!user) return;

        const token = localStorage.getItem('token');
        // Note: Django Channels usually needs session auth or custom token auth for WebSockets.
        // For simplicity here, we assume the server can identify the user or we handle it via a custom protocol.
        // Actually, many implement token auth by sending it in the subprotocol or as a query param.

        const wsUrl = `ws://127.0.0.1:8000/ws/notifications/`;
        const newSocket = new WebSocket(wsUrl);

        newSocket.onopen = () => {
            console.log('WebSocket connected');
        };

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Notification received:', data);
            setNotification(data);
        };

        newSocket.onclose = () => {
            console.log('WebSocket disconnected. Retrying in 5s...');
            setTimeout(connectWebSocket, 5000);
        };

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [user]);

    useEffect(() => {
        const cleanup = connectWebSocket();
        return cleanup;
    }, [connectWebSocket]);

    return (
        <>
            {children}
            <NotificationToast
                notification={notification}
                onClose={() => setNotification(null)}
            />
        </>
    );
};

export default NotificationWrapper;
