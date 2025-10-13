import { Badge } from '@/components/ui/badge';
import { Link } from '@inertiajs/react';
import { AlertTriangle, ShoppingBag, Users, Package } from 'lucide-react';

export function AlertsPanel({ stats }) {
    const alerts = [];

    // Check for pending orders
    if (stats.pendingOrders > 0) {
        alerts.push({
            type: 'warning',
            icon: ShoppingBag,
            title: 'Pesanan Menunggu Pembayaran',
            description: `${stats.pendingOrders} pesanan menunggu pembayaran`,
            action: {
                text: 'Lihat Pesanan',
                href: route('admin.transaction.index', { status: 'pending' })
            },
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 border-yellow-200'
        });
    }

    // Check for pending validations
    if (stats.pendingValidations > 0) {
        alerts.push({
            type: 'info',
            icon: Users,
            title: 'Validasi Pembayaran Tertunda',
            description: `${stats.pendingValidations} pembayaran perlu divalidasi`,
            action: {
                text: 'Validasi Sekarang',
                href: route('admin.transaction.index', { status: 'validation' })
            },
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200'
        });
    }

    // Low active products alert
    const activeProductRatio = (stats.activeProducts / stats.totalProducts) * 100;
    if (activeProductRatio < 50 && stats.totalProducts > 0) {
        alerts.push({
            type: 'warning',
            icon: Package,
            title: 'Produk Aktif Rendah',
            description: `Hanya ${stats.activeProducts} dari ${stats.totalProducts} produk yang aktif`,
            action: {
                text: 'Kelola Produk',
                href: route('admin.products.index')
            },
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 border-orange-200'
        });
    }

    if (alerts.length === 0) {
        return (
            <div className="bg-white rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Notifikasi</h3>
                <div className="text-center py-8 text-green-600">
                    <div className="bg-green-100 rounded-full p-3 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <p className="font-medium">Semua Berjalan Normal</p>
                    <p className="text-sm text-gray-600 mt-1">Tidak ada notifikasi yang perlu perhatian</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Notifikasi</h3>

            <div className="space-y-4">
                {alerts.map((alert, index) => {
                    const Icon = alert.icon;
                    return (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${alert.bgColor}`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className={`mt-1 ${alert.color}`}>
                                    <Icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className={`font-medium ${alert.color}`}>
                                        {alert.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {alert.description}
                                    </p>
                                    {alert.action && (
                                        <Link
                                            href={alert.action.href}
                                            className={`inline-flex items-center text-sm font-medium ${alert.color} hover:underline mt-2`}
                                        >
                                            {alert.action.text}
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 pt-4 border-t">
                <Link
                    // href={route('admin.settings')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                >
                    Pengaturan notifikasi →
                </Link>
            </div>
        </div>
    );
}