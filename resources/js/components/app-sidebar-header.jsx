import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useState, useEffect, useRef } from 'react';
import { Bell, Package, Check, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { route } from 'ziggy-js';

export function AppSidebarHeader({ breadcrumbs = [] }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationRef = useRef(null);

    useEffect(() => {
        fetchNotifications();
        // Poll untuk real-time update setiap 30 detik
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Click outside handler untuk menutup notification dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(route('admin.notifications.index'));
            const data = await response.json();
            setNotifications(data.notifications);
            setUnreadCount(data.notifications.filter(n => !n.read_at).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(route('admin.notifications.mark-read', notificationId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                },
            });
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'order_out_for_delivery':
                return <Package className="h-4 w-4 text-blue-500" />;
            case 'delivery_proof_uploaded':
                return <Check className="h-4 w-4 text-green-500" />;
            case 'buyer_confirmed_delivery':
                return <User className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    return (<header className="flex h-16 shrink-0 items-center gap-2 justify-between border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1"/>
                <Breadcrumbs breadcrumbs={breadcrumbs}/>
            </div>
            
            {/* Notification Bell */}
            <div className="relative">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </button>
                
                {/* Notification Dropdown */}
                {showNotifications && (
                    <div ref={notificationRef} className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                        <div className="p-4 border-b">
                            <h3 className="font-semibold">Notifikasi</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-gray-500">
                                    Tidak ada notifikasi
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${!notification.read_at ? 'bg-blue-50' : ''}`}
                                        onClick={() => {
                                            if (!notification.read_at) {
                                                markAsRead(notification.id);
                                            }
                                            window.location.href = notification.data.url;
                                        }}
                                    >
                                        <div className="flex items-start gap-3">
                                            {/* Notification Icon */}
                                            <div className="mt-1">
                                                {getNotificationIcon(notification.data.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-sm">{notification.data.title}</p>
                                                <p className="text-xs text-gray-600 mt-1">{notification.data.message}</p>
                                                <p className="text-xs text-gray-400 mt-2">
                                                    {new Date(notification.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>);
}
