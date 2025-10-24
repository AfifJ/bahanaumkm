import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Eye, Download, Filter, CreditCard, Clock, CheckCircle, XCircle, AlertCircle, CheckSquare, XSquare, ChevronLeft, ChevronRight, Search, ChevronDown } from 'lucide-react';
import { useState, useMemo } from 'react';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { PaymentCard } from '@/components/admin/payment-card';
import { PaymentValidationActions } from '@/components/admin/payment-validation-actions';
import { StatusDropdown } from '@/components/admin/status-dropdown';

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

export default function Transaction({ orders, availableMonths = [], month: initialMonth = '', search: initialSearch = '' }) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || getCurrentMonth());
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedOrders, setSelectedOrders] = useState(new Set());
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

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
        setSearchQuery(''); // Clear search when changing month
        router.get(route('admin.transaction.index'), {
            month: value,
            status: selectedStatus,
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleStatusFilter = (value) => {
        setSelectedStatus(value);
        router.get(route('admin.transaction.index'), {
            month: searchQuery ? undefined : selectedMonth, // Don't use month filter when searching
            status: value,
            search: searchQuery
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // When searching, don't filter by month
        router.get(route('admin.transaction.index'), {
            status: selectedStatus,
            search: searchQuery
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        router.get(route('admin.transaction.index'), {
            month: selectedMonth,
            status: selectedStatus,
        }, {
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
            processed: 0,
            shipped: 0,
            delivered: 0,
            rejected: 0,
            cancelled: 0,
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
                    break;
                case 'processed':
                    stats.processed++;
                    break;
                case 'shipped':
                    stats.shipped++;
                    break;
                case 'delivered':
                    stats.delivered++;
                    stats.totalRevenue += parseFloat(order.total_amount || 0);
                    break;
                case 'rejected':
                    stats.rejected++;
                    break;
                case 'cancelled':
                    stats.cancelled++;
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

            <div className="py-6 sm:px-6 px-4">
                <div className="mx-auto max-w-7xl ">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Cari berdasarkan kode order..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit">
                            Cari
                        </Button>
                        {searchQuery && (
                            <Button type="button" variant="outline" onClick={handleClearSearch}>
                                Reset
                            </Button>
                        )}
                    </form>

                    {/* Header with Filters */}
                    <div className="flex mb-4 flex-row items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Manajemen Transaksi</h2>
                            <p className="text-gray-600 mt-1">
                                {searchQuery ? (
                                    <span className="text-primary font-medium">
                                        Hasil pencarian "{searchQuery}" di semua periode
                                    </span>
                                ) : (
                                    `Kelola pembayaran dan status transaksi`
                                )}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {availableMonths.length > 0 && (
                                <Select
                                    value={selectedMonth}
                                    onValueChange={handleMonthChange}
                                    disabled={!!searchQuery}
                                >
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

                    {/*  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                </div> */}

                    {/* Filters */}
                    {showFilters && (
                        <div>
                            <div >
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-gray-700">Filter Status</h4>
                                    <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                                        <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Filter status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Status</SelectItem>
                                            <SelectItem value="pending">Menunggu Pembayaran</SelectItem>
                                            <SelectItem value="validation">Menunggu Validasi</SelectItem>
                                            <SelectItem value="paid">Sudah Dibayar</SelectItem>
                                            <SelectItem value="processed">Diproses</SelectItem>
                                            <SelectItem value="shipped">Dikirim</SelectItem>
                                            <SelectItem value="delivered">Diterima</SelectItem>
                                            <SelectItem value="rejected">Ditolak</SelectItem>
                                            <SelectItem value="cancelled">Dibatalkan</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bulk Actions */}
                    {selectedOrders.size > 0 && (
                        <Card className={'mt-3'}>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
                                <CardContent className="text-center">
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
                                <div className="flex items-center space-x-2 mt-3 p-3 bg-gray-50 rounded-lg">
                                    <Checkbox
                                        id="select-all"
                                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                        onCheckedChange={handleSelectAll}
                                    />
                                    <label htmlFor="select-all" className="text-sm font-medium">
                                        Pilih Semua ({filteredOrders.length} transaksi)
                                    </label>
                                </div>

                                {/* Transaction Table */}
                                <div className="rounded-md border overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-12">
                                                    <Checkbox
                                                        checked={selectedOrders.size === filteredOrders.length && filteredOrders.length > 0}
                                                        onCheckedChange={handleSelectAll}
                                                    />
                                                </TableHead>
                                                <TableHead className="min-w-[120px]">Order</TableHead>
                                                <TableHead className="min-w-[120px]">Pembeli</TableHead>
                                                <TableHead className="text-right min-w-[100px]">Total</TableHead>
                                                <TableHead className="min-w-[80px]">Metode</TableHead>
                                                <TableHead className="min-w-[150px]">Status</TableHead>
                                                <TableHead className="text-right min-w-[150px]">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredOrders.map((order) => (
                                                <TableRow key={order.id} className="hover:bg-gray-50">
                                                    <TableCell>
                                                        <Checkbox
                                                            checked={selectedOrders.has(order.id)}
                                                            onCheckedChange={(checked) => handleOrderSelection(order.id, checked)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div>
                                                            <div className="font-medium text-sm md:text-base">#{order.order_code}</div>
                                                            <div className="text-xs md:text-sm text-gray-500 hidden sm:block">{formatDate(order.created_at)}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-sm md:text-base truncate max-w-[100px] sm:max-w-none">{order.buyer?.name || 'Unknown'}</div>
                                                        <div className="text-xs text-gray-500 sm:hidden">{formatDate(order.created_at)}</div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="font-medium text-sm md:text-base">{formatPrice(order.total_amount)}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-medium uppercase text-xs md:text-sm">
                                                            {order.payment_method || 'QRIS'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusDropdown
                                                            order={order}
                                                            onSuccess={handlePaymentAction}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                                                            <Button variant="outline" size="sm" asChild className="h-8 px-2 sm:px-3">
                                                                <Link href={route('admin.transaction.show', order.id)}>
                                                                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                                                                    <span className="hidden sm:inline">Detail</span>
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {orders.links && orders.links.length > 3 && (
                                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
                                        <div className="text-sm text-gray-700">
                                            Menampilkan {orders.from} sampai {orders.to} dari {orders.total} transaksi
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            {orders.links.map((link, index) => {
                                                const isFirst = index === 0;
                                                const isLast = index === orders.links.length - 1;

                                                return (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`inline-flex items-center justify-center h-9 ${isFirst || isLast
                                                            ? 'w-9'
                                                            : 'min-w-[2.25rem] px-2'
                                                            } text-sm border rounded-md font-medium transition-colors ${link.active
                                                                ? 'bg-primary text-white border-primary'
                                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        preserveScroll
                                                    >
                                                        {isFirst ? (
                                                            <ChevronLeft className="h-4 w-4" />
                                                        ) : isLast ? (
                                                            <ChevronRight className="h-4 w-4" />
                                                        ) : (
                                                            link.label
                                                        )}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
