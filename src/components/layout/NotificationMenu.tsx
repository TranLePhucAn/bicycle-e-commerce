import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    getNotifications,
    markNotificationsRead,
    type CustomerNotification,
} from '../../services/customerService';

export default function NotificationMenu() {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user) {
            setNotifications([]);
            return;
        }
        const refresh = () => setNotifications(getNotifications(user.id));
        refresh();
        const intervalId = window.setInterval(refresh, 10000);
        const handleStorage = (event: StorageEvent) => {
            if (event.key === 'bike_notifications') refresh();
        };
        const handleNotificationChange = (event: Event) => {
            const changedUserId = (event as CustomEvent<{ userId: string }>).detail?.userId;
            if (changedUserId === user.id) refresh();
        };
        window.addEventListener('storage', handleStorage);
        window.addEventListener('bike-notifications-changed', handleNotificationChange);
        return () => {
            window.clearInterval(intervalId);
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('bike-notifications-changed', handleNotificationChange);
        };
    }, [user]);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: PointerEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    if (!user) return null;

    const unreadCount = notifications.filter((notification) => !notification.read).length;
    const handleMarkAllRead = () => {
        markNotificationsRead(user.id);
        setNotifications(getNotifications(user.id));
    };
    const handleToggleMenu = () => {
        if (!open) handleMarkAllRead();
        setOpen((current) => !current);
    };

    return (
        <div className="dropdown" ref={menuRef}>
            <button
                type="button"
                className={`btn rounded-3 ${open ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                onClick={handleToggleMenu}
                aria-expanded={open}
                title="Hộp thông báo"
            >
                <i className="fa-regular fa-bell"></i>
                {unreadCount > 0 && (
                    <span className="badge bg-danger rounded-pill ms-1">{unreadCount}</span>
                )}
            </button>
            {open && (
                <div className="dropdown-menu dropdown-menu-end show p-0 shadow" style={{ width: 'min(360px, calc(100vw - 2rem))' }}>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                        <strong>Thông báo</strong>
                    </div>
                    <div style={{ maxHeight: '360px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <p className="text-muted text-center small mb-0 p-4">Chưa có thông báo.</p>
                        ) : notifications.map((notification) => (
                            <div key={notification.id} className={`p-3 border-bottom ${notification.read ? '' : 'bg-light'}`}>
                                <div className="d-flex gap-2">
                                    <i className={`fa-solid mt-1 ${
                                        notification.type === 'return'
                                            ? 'fa-arrow-right-arrow-left text-warning'
                                            : notification.type === 'review'
                                                ? 'fa-star text-warning'
                                                : 'fa-bag-shopping text-primary'
                                    }`}></i>
                                    <div>
                                        <div className="fw-semibold small">{notification.title}</div>
                                        <div className="small text-muted">{notification.message}</div>
                                        <div className="small text-secondary mt-1">
                                            {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
