import { StatsCard } from '@/components/admin/stats-card';
import { SalesChart } from '@/components/admin/sales-chart';
import { RecentActivities } from '@/components/admin/recent-activities';
import { AlertsPanel } from '@/components/admin/alerts-panel';
import AdminLayout from '@/layouts/admin-layout';
import { Head, usePage } from '@inertiajs/react';
import { DollarSign, ShoppingCart, Package, Users } from 'lucide-react';

const breadcrumbs = [
    {
        title: 'Admin Dashboard',
        href: route('admin.dashboard'),
    },
];

export default function Dashboard() {
    const { auth, stats, orderStatuses, salesData, recentOrders, lowStockProducts, topCategories, userDistribution } = usePage().props;

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
                        <p className="text-gray-600">Selamat datang, {auth.user?.name}!</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Role:</span>
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                            {auth.user?.role || 'Admin'}
                        </span>
                    </div>
                </div>

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Total Pendapatan"
                        value={stats.totalRevenue}
                        icon={DollarSign}
                        description="dari transaksi selesai"
                    />
                    <StatsCard
                        title="Total Pesanan"
                        value={stats.totalOrders}
                        icon={ShoppingCart}
                        change={stats.pendingOrders}
                        changeType="warning"
                        description="menunggu pembayaran"
                    />
                    <StatsCard
                        title="Produk Aktif"
                        value={stats.activeProducts}
                        icon={Package}
                        description={`dari ${stats.totalProducts} total`}
                    />
                    <StatsCard
                        title="Total Pengguna"
                        value={stats.totalUsers}
                        icon={Users}
                        change={`+${stats.newUsersToday}`}
                        changeType="positive"
                        description="hari ini"
                    />
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activities */}
                    <RecentActivities
                        recentOrders={recentOrders}
                        lowStockProducts={lowStockProducts}
                    />

                    {/* Quick Stats */}
                    <div className="bg-white rounded-lg border p-6">
                        <h3 className="text-lg font-semibold mb-4">Statistik Cepat</h3>
                        <div className="space-y-4">
                            {/* Order Status Distribution */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Status Pesanan</h4>
                                <div className="space-y-2">
                                    {Object.entries(orderStatuses).map(([status, count]) => (
                                        <div key={status} className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 capitalize">{status}</span>
                                            <span className="text-sm font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Categories */}
                            {topCategories.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Kategori Terlaris</h4>
                                    <div className="space-y-2">
                                        {topCategories.map((category, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">{category.name}</span>
                                                <span className="text-sm font-medium">{category.total_sold}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* User Distribution */}
                            {Object.keys(userDistribution).length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Distribusi User</h4>
                                    <div className="space-y-2">
                                        {Object.entries(userDistribution).map(([role, count]) => (
                                            <div key={role} className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">{role}</span>
                                                <span className="text-sm font-medium">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
