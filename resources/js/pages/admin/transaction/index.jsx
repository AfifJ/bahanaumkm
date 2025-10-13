import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Eye, Download, Filter, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, CheckSquare, XSquare } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { PaymentCard } from '@/components/admin/payment-card';
import { PaymentValidationActions } from '@/components/admin/payment-validation-actions';

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
};

const getCurrentMonth = () => {
    const now = new Date();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

export default function Transaction({ orders, availableMonths = [], month: initialMonth = '' }) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || getCurrentMonth());
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        router.get(route('admin.transaction.index'), { month: value, status: selectedStatus }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleStatusFilter = (value) => {
        setSelectedStatus(value);
        router.get(route('admin.transaction.index'), { month: selectedMonth, status: value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleOrderSelection = (orderId, checked) => {
        const newSelected = new Set(selectedOrders);
        if (checked) {
            newSelected.add(orderId);
        } else {
            newSelected.delete(orderId);
        }
        setSelectedOrders(newSelected);
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedOrders(new Set(filteredOrders.map(order => order.id)));
        } else {
            setSelectedOrders(new Set());
        }
    };

    const handleViewProof = (proofPath) => {
        window.open(`/${proofPath}`, '_blank');
    };

    const handlePaymentAction = () => {
        // Refresh data after payment action
        router.reload();
    };

    const handleBulkApprove = () => {
        const selectedOrderIds = Array.from(selectedOrders);

        router.post(route('admin.transaction.bulk.update'), {
            order_ids: selectedOrderIds,
            action: 'approve',
            paid_at: new Date().toISOString(),
        }, {
            onSuccess: () => {
                setSelectedOrders(new Set());
                router.reload();
            },
            onError: (errors) => {
                console.error('Bulk approval failed:', errors);
            }
        });
    };

    const handleBulkReject = () => {
        const selectedOrderIds = Array.from(selectedOrders);

        router.post(route('admin.transaction.bulk.update'), {
            order_ids: selectedOrderIds,
            action: 'reject',
        }, {
            onSuccess: () => {
                setSelectedOrders(new Set());
                router.reload();
            },
            onError: (errors) => {
                console.error('Bulk rejection failed:', errors);
            }
        });
    };

    // Check if selected orders can be approved/rejected
    const canBulkApprove = useMemo(() => {
        return Array.from(selectedOrders).some(orderId => {
            const order = orders.data.find(o => o.id === orderId);
            return order && order.status === 'validation';
        });
    }, [selectedOrders, orders.data]);

    const canBulkReject = useMemo(() => {
        return Array.from(selectedOrders).some(orderId => {
            const order = orders.data.find(o => o.id === orderId);
            return order && ['pending', 'validation'].includes(order.status);
        });
    }, [selectedOrders, orders.data]);

    // Payment statistics
    const paymentStats = useMemo(() => {
        const stats = {
            total: orders.data.length,
            pending: 0,
            validation: 0,
            paid: 0,
            rejected: 0,
            totalRevenue: 0
        };

        orders.data.forEach(order => {
            switch (order.status) {
                case 'pending':
                    stats.pending++;
                    break;
                case 'validation':
                    stats.validation++;
                    break;
                case 'paid':
                    stats.paid++;
                    stats.totalRevenue += parseFloat(order.total_amount || 0);
                    break;
                case 'rejected':
                    stats.rejected++;
                    break;
            }
        });

        return stats;
    }, [orders.data]);

    // Filter orders based on status
    const filteredOrders = useMemo(() => {
        if (selectedStatus === 'all') {
            return orders.data;
        }
        return orders.data.filter(order => order.status === selectedStatus);
    }, [orders.data, selectedStatus]);

    return (
        <AdminLayout
            title="Transaksi"
            breadcrumbs={[
                {
                    title: 'Transaksi',
                    href: route('admin.transaction.index'),
                },
            ]}
        >
            <Head title="Transaksi" />

            <div className="space-y-6">
                {/* Header with Filters */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Transaksi</h1>
                        <p className="text-gray-600 mt-1">Kelola pembayaran dan status transaksi</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {availableMonths.length > 0 && (
                            <Select value={selectedMonth} onValueChange={handleMonthChange}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="Pilih Bulan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableMonths.map((monthYear) => (
                                        <SelectItem key={monthYear} value={monthYear}>
                                            {monthYear}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Filter
                        </Button>
                    </div>
                </div>

                {/* Payment Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                                    <p className="text-2xl font-bold">{paymentStats.total}</p>
                                </div>
                                <CreditCard className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Menunggu Pembayaran</p>
                                    <p className="text-2xl font-bold text-yellow-600">{paymentStats.pending}</p>
                                </div>
                                <Clock className="h-8 w-8 text-yellow-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Menunggu Validasi</p>
                                    <p className="text-2xl font-bold text-blue-600">{paymentStats.validation}</p>
                                </div>
                                <Eye className="h-8 w-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Sudah Dibayar</p>
                                    <p className="text-2xl font-bold text-green-600">{paymentStats.paid}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-bold text-green-600">{formatPrice(paymentStats.totalRevenue)}</p>
                                </div>
                                <Download className="h-8 w-8 text-green-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                {showFilters && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Filter Transaksi</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-2 block">Status Pembayaran</label>
                                <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter berdasarkan status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                                        <SelectItem value="validation">Menunggu Validasi</SelectItem>
                                        <SelectItem value="paid">Sudah Dibayar</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Bulk Actions */}
                {selectedOrders.size > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <span className="text-sm font-medium text-blue-700">
                                        {selectedOrders.size} transaksi dipilih
                                    </span>
                                    <div className="text-xs text-blue-600 mt-1">
                                        {canBulkApprove && (
                                            <span>• Ada transaksi yang bisa divalidasi</span>
                                        )}
                                        {canBulkReject && (
                                            <span>• Ada transaksi yang bisa ditolak</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {canBulkApprove && (
                                        <Button
                                            size="sm"
                                            onClick={handleBulkApprove}
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            <CheckSquare className="h-4 w-4 mr-2" />
                                            Validasi ({Array.from(selectedOrders).filter(id => {
                                                const order = orders.data.find(o => o.id === id);
                                                return order && order.status === 'validation';
                                            }).length})
                                        </Button>
                                    )}
                                    {canBulkReject && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={handleBulkReject}
                                        >
                                            <XSquare className="h-4 w-4 mr-2" />
                                            Tolak ({Array.from(selectedOrders).filter(id => {
                                                const order = orders.data.find(o => o.id === id);
                                                return order && ['pending', 'validation'].includes(order.status);
                                            }).length})
                                        </Button>
                                    )}
                                    <Button size="sm" variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Export
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Transactions List */}
                <div className="space-y-4">
                    {filteredOrders.length === 0 ? (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada transaksi</h3>
                                <p className="text-gray-500">
                                    {selectedStatus !== 'all'
                                        ? 'Tidak ada transaksi dengan status yang dipilih'
                                        : 'Belum ada transaksi pada periode ini'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <>
                            {/* Select All Checkbox */}
                            <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                                <Checkbox
                                    id="select-all"
                                    checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                    onCheckedChange={handleSelectAll}
                                />
                                <label htmlFor="select-all" className="text-sm font-medium">
                                    Pilih Semua ({filteredOrders.length} transaksi)
                                </label>
                            </div>

                            {/* Transaction Cards */}
                            {filteredOrders.map((order) => (
                                <Card key={order.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3 flex-1">
                                                <Checkbox
                                                    checked={selectedOrders.has(order.id)}
                                                    onCheckedChange={(checked) => handleOrderSelection(order.id, checked)}
                                                    className="mt-1"
                                                />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h3 className="font-semibold text-lg">#{order.order_code}</h3>
                                                            <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                                        </div>
                                                        <PaymentStatusBadge status={order.status} />
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Total Pembayaran</p>
                                                            <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Metode Pembayaran</p>
                                                            <p className="font-medium uppercase">{order.payment_method || 'QRIS'}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Pembeli</p>
                                                            <p className="font-medium">{order.buyer?.name || 'Unknown'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <PaymentValidationActions
                                                            order={order}
                                                            onSuccess={handlePaymentAction}
                                                            showQuickActions={false}
                                                        />

                                                        <div className="flex items-center space-x-2">
                                                            <Button variant="outline" size="sm" asChild>
                                                                <Link href={route('admin.transaction.show', order.id)}>
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
