import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import MitraLayout from '@/layouts/mitra-layout';
import { TrendingUp, Users, DollarSign, ShoppingCart, Calendar } from 'lucide-react';

export default function MitraDashboard({ mitraProfile, stats, recentTransactions, salesChart }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <MitraLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('mitra.dashboard') },
            ]}
        >
            <Head title="Dashboard Mitra" />

            {/* Welcome Section */}
            <div className="mb-8 m-4">
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Selamat datang, {mitraProfile.hotel_name}!
                    </h2>
                    <p className="text-gray-600">
                        Kode Mitra: <span className="font-mono font-semibold">{mitraProfile.unique_code}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {mitraProfile.address}, {mitraProfile.city}
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mx-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Penjualan Hari Ini</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.today_sales)}</div>
                        <p className="text-xs text-muted-foreground">
                            Komisi: {formatCurrency(stats.today_commission)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Penjualan Bulan Ini</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.month_sales)}</div>
                        <p className="text-xs text-muted-foreground">
                            Komisi: {formatCurrency(stats.month_commission)}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.total_commission)}</div>
                        <p className="text-xs text-muted-foreground">
                            Dari {stats.total_orders} transaksi
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_orders}</div>
                        <p className="text-xs text-muted-foreground">
                            Semua waktu
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mx-4">
                {/* Sales Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Grafik Penjualan 7 Hari Terakhir</CardTitle>
                        <CardDescription>
                            Penjualan dan komisi harian
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {salesChart.map((day, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-sm font-medium w-20">
                                            {formatDate(day.date)}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <div className="text-sm font-medium">
                                                {formatCurrency(day.sales)}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                +{formatCurrency(day.commission)}
                                            </div>
                                        </div>
                                        <div className="w-16 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((day.sales / Math.max(...salesChart.map(d => d.sales))) * 100, 100)}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Transaksi Terakhir</CardTitle>
                        <CardDescription>
                            5 transaksi terbaru
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentTransactions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    Belum ada transaksi
                                </p>
                            ) : (
                                recentTransactions.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-sm">
                                                        {transaction.order_code}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {transaction.customer_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {formatDateTime(transaction.created_at)}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-sm">
                                                        {formatCurrency(transaction.total_amount)}
                                                    </div>
                                                    <div className="text-xs text-green-600">
                                                        +{formatCurrency(transaction.commission)}
                                                    </div>
                                                    <Badge className={`text-xs mt-1 ${getStatusColor(transaction.status)}`}>
                                                        {transaction.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        {recentTransactions.length > 0 && (
                            <div className="mt-4">
                                <a
                                    href={route('mitra.transactions')}
                                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    Lihat semua transaksi →
                                </a>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </MitraLayout>
    );
}