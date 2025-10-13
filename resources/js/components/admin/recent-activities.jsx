import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { ShoppingCart, Package, Users, AlertTriangle } from 'lucide-react';

export function RecentActivities({ recentOrders, lowStockProducts }) {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            validation: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Menunggu Pembayaran',
            validation: 'Menunggu Validasi',
            paid: 'Sudah Dibayar',
            processing: 'Diproses',
            shipped: 'Dikirim',
            delivered: 'Selesai',
            cancelled: 'Dibatalkan'
        };
        return labels[status] || status;
    };

    const activities = [
        // Recent Orders
        ...recentOrders.map(order => ({
            id: order.id,
            type: 'order',
            icon: ShoppingCart,
            iconColor: 'text-blue-600',
            title: `Order #${order.order_code}`,
            description: `Total: ${formatCurrency(order.total_amount)}`,
            status: (
                <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                </Badge>
            ),
            time: formatDate(order.created_at),
            link: route('admin.transaction.show', order.id)
        })),

        // Low Stock Alerts
        ...lowStockProducts.map(product => ({
            id: `stock-${product.id}`,
            type: 'alert',
            icon: AlertTriangle,
            iconColor: 'text-red-600',
            title: `Stok Menipis: ${product.name}`,
            description: `Sisa stok: ${product.stock} unit`,
            status: (
                <Badge className="bg-red-100 text-red-800">
                    Low Stock
                </Badge>
            ),
            time: 'Perlu ditindak',
            link: route('admin.products.edit', product.id)
        }))
    ].slice(0, 10);

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h3>

            {activities.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <p>Belum ada aktivitas terbaru</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activities.map((activity) => {
                        const Icon = activity.icon;
                        return (
                            <div
                                key={activity.id}
                                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <div className={`mt-1 ${activity.iconColor}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <Link
                                            href={activity.link}
                                            className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                                        >
                                            {activity.title}
                                        </Link>
                                        {activity.status}
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {activity.description}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {activities.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <Link
                        href={route('admin.transaction.index')}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                        Lihat semua aktivitas →
                    </Link>
                </div>
            )}
        </div>
    );
}