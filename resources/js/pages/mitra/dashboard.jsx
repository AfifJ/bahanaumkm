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
            case 'validation':
                return 'bg-blue-100 text-blue-800';
            case 'paid':
                return 'bg-indigo-100 text-indigo-800';
            case 'processed':
                return 'bg-purple-100 text-purple-800';
            case 'out_for_delivery':
                return 'bg-orange-100 text-orange-800';
            case 'delivered':
                return 'bg-teal-100 text-teal-800';
            case 'payment_rejected':
                return 'bg-red-100 text-red-800';
            case 'failed_delivery':
                return 'bg-red-200 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            case 'returned':
                return 'bg-amber-100 text-amber-800';
            case 'refunded':
                return 'bg-slate-100 text-slate-800';
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
           {/*  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mx-4">
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
            </div> */}
        </MitraLayout>
    );
}