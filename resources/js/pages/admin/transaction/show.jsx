import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

const getStatusBadgeVariant = (status) => {
    switch (status) {
        case 'pending': return 'secondary';
        case 'paid': return 'default';
        case 'processed': return 'outline';
        case 'shipped': return 'secondary';
        case 'delivered': return 'default';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
};

const getStatusLabel = (status) => {
    const labels = {
        'pending': 'Menunggu Pembayaran',
        'paid': 'Sudah Dibayar',
        'processed': 'Diproses',
        'shipped': 'Dikirim',
        'delivered': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    return labels[status] || status;
};

const getNextAvailableStatuses = (currentStatus) => {
    const transitions = {
        'pending': ['paid', 'cancelled'],
        'paid': ['processed', 'cancelled'],
        'processed': ['shipped', 'cancelled'],
        'shipped': ['delivered'],
        'delivered': [],
        'cancelled': [],
    };
    return transitions[currentStatus] || [];
};

export default function Transaction({ order }) {
    const { data, setData, post, processing, errors } = useForm({
        status: order.status,
    });

    const [selectedStatus, setSelectedStatus] = useState(order.status);

    const handleStatusUpdate = () => {
        router.put(route('admin.transaction.update', order.id), {
            status: selectedStatus,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Status will be updated via page reload
            },
        });
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
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

    const availableStatuses = getNextAvailableStatuses(order.status);

    return (
        <AdminLayout
            title="Detail Transaksi"
            breadcrumbs={[
                {
                    title: 'Transaksi',
                    href: route('admin.transaction.index'),
                },
                {
                    title: order.order_code,
                    href: route('admin.transaction.show', order.id),
                },
            ]}
        >
            <Head title={`Transaksi - ${order.order_code}`} />
            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">
                                        {order.order_code}
                                    </h1>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Dibuat pada {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <Badge variant={getStatusBadgeVariant(order.status)}>
                                    {getStatusLabel(order.status)}
                                </Badge>
                            </div>
                        </div>

                        {/* Status Update Section */}
                        {availableStatuses.length > 0 && (
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <h3 className="text-base font-medium text-gray-900 mb-2">
                                            Update Status Pesanan
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                                <SelectTrigger className="w-64">
                                                    <SelectValue>
                                                        {selectedStatus ? getStatusLabel(selectedStatus) : "Pilih status baru"}
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableStatuses.map((status) => (
                                                        <SelectItem key={status} value={status}>
                                                            {getStatusLabel(status)}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button 
                                                onClick={handleStatusUpdate}
                                                disabled={processing || selectedStatus === order.status}
                                            >
                                                {processing ? 'Memproses...' : 'Update Status'}
                                            </Button>
                                        </div>
                                        {selectedStatus === 'cancelled' && (
                                            <p className="text-xs text-red-600 mt-2">
                                                <strong>Peringatan:</strong> Membatalkan pesanan akan mengembalikan stok produk.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Order Details */}
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Buyer Information */}
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-3">Informasi Pembeli</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Nama:</span> {order.buyer?.name || '-'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Email:</span> {order.buyer?.email || '-'}
                                        </div>
                                    </div>
                                </div>

                                {/* Mitra Information */}
                                <div>
                                    <h3 className="text-base font-medium text-gray-900 mb-3">Informasi Mitra</h3>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-medium">Nama:</span> {order.mitra?.hotel_name || '-'}
                                        </div>
                                        <div>
                                            <span className="font-medium">Alamat:</span> {order.mitra?.address || '-'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="px-6 py-4 border-t border-gray-200">
                            <h3 className="text-base font-medium text-gray-900 mb-3">Detail Produk</h3>
                            <div className="space-y-3">
                                {order.items.map((item, index) => (
                                    <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-3">
                                        <div className="flex-1">
                                            <div className="font-medium text-sm">{item.product.name}</div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                Vendor: {item.product.vendor?.name || '-'}
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                Jumlah: {item.quantity} x {formatCurrency(item.unit_price)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-sm">
                                                {formatCurrency(item.total_price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="text-base font-medium text-gray-900">
                                    Total Pesanan
                                </div>
                                <div className="text-xl font-bold text-gray-900">
                                    {formatCurrency(order.total_amount)}
                                </div>
                            </div>
                            {order.partner_commission > 0 && (
                                <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                                    <div>Komisi Mitra:</div>
                                    <div>{formatCurrency(order.partner_commission)}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
