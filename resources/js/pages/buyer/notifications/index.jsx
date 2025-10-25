import { Head, Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import { Bell, Check, X, Package, User, ShoppingCart, Clock } from 'lucide-react';

export default function NotificationIndex() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await fetch(route('buyer.notifications.index'), {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
            });
            const data = await response.json();
            setNotifications(data.notifications);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await fetch(route('buyer.notifications.mark-read', notificationId), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
            });

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, read_at: new Date().toISOString() }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            'order_out_for_delivery': <Package className="h-4 w-4 text-blue-500" />,
            'delivery_proof_uploaded': <Check className="h-4 w-4 text-green-500" />,
            'buyer_confirmed_delivery': <User className="h-4 w-4 text-purple-500" />,
            'auto_confirmed_delivery': <Clock className="h-4 w-4 text-orange-500" />,
        };
        return icons[type] || <Bell className="h-4 w-4 text-gray-500" />;
    };

    const unreadCount = notifications.filter(n => !n.read_at).length;

    return (
        <BuyerLayoutWrapper withBottomNav={false} title="Notifikasi" backLink={route('buyer.dashboard')}>
            <Head title="Notifikasi - Bahana UMKM" />

            <div className="container mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold text-gray-900 mb-2">Notifikasi</h1>

                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-600">
                            {unreadCount > 0 && `${unreadCount} notifikasi belum dibaca`}
                            {unreadCount === 0 && 'Semua notifikasi sudah dibaca'}
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500">Belum ada notifikasi</div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`bg-white rounded-lg border p-4 hover:shadow-md transition-shadow ${!notification.read_at ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0">
                                        {getNotificationIcon(notification.data.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {notification.data.title}
                                            </h3>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs text-gray-500">
                                                    {new Date(notification.created_at).toLocaleString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                                {!notification.read_at && (
                                                    <button
                                                        onClick={() => markAsRead(notification.id)}
                                                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
                                                    >
                                                        Tandai Sudah Dibaca
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {notification.data.message}
                                        </p>
                                        {notification.data.url && (
                                            <Link
                                                href={notification.data.url}
                                                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 mt-2"
                                            >
                                                Lihat Detail
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                        }
                    </div>
                )}
            </div>
        </BuyerLayoutWrapper>
    );
}
