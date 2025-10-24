import AdminLayout from '@/layouts/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { PaymentCard } from '@/components/admin/payment-card';
import { PaymentValidationActions } from '@/components/admin/payment-validation-actions';
import PaymentProofDialog from '@/components/admin/payment-proof-dialog';
import { Calendar, User, MapPin, Package, CreditCard, AlertCircle } from 'lucide-react';

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
        'validation': 'Menunggu Validasi',
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
        'pending': ['validation', 'cancelled'],
        'validation': ['paid', 'cancelled'],
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
    const [isProofDialogOpen, setIsProofDialogOpen] = useState(false);
    const [selectedProofPath, setSelectedProofPath] = useState(null);

    const handleStatusUpdate = () => {
        const payload = {
            status: selectedStatus,
        };

        // Set paid_at when status is changed to paid
        if (selectedStatus === 'paid' && order.status !== 'paid') {
            payload.paid_at = new Date().toISOString();
        }

        router.put(route('admin.transaction.update', order.id), payload, {
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

    const handleViewProof = (proofPath) => {
        if (!proofPath) return;
        setSelectedProofPath(proofPath);
        setIsProofDialogOpen(true);
    };

    const handleImageError = (event) => {
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
    };

    const handlePaymentAction = () => {
        router.reload();
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

            <div className="space-y-4 p-4">
                {/* Header */}
                <div>
                    <div>
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl">#{order.order_code}</h2>
                                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Dibuat pada {formatDate(order.created_at)}</span>
                                </div>
                            </div>
                            <PaymentStatusBadge status={order.status} size="lg" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Main Content */}
                    <div className="space-y-4">
                        {/* Payment Validation Actions */}
                        <Card>
                            <CardContent>
                                <div className="flex items-center gap-2 mb-3">
                                    <CreditCard className="h-4 w-4" />
                                    <h3 className="text-base font-semibold">Validasi Pembayaran</h3>
                                </div>
                                <PaymentValidationActions
                                    order={order}
                                    onSuccess={handlePaymentAction}
                                    showQuickActions={true}
                                />
                            </CardContent>
                        </Card>

                        {/* Status Management */}
                        {availableStatuses.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Kelola Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Update Status</label>
                                        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                            <SelectTrigger>
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
                                    </div>
                                    <Button
                                        onClick={handleStatusUpdate}
                                        disabled={processing || selectedStatus === order.status}
                                        className="w-full"
                                    >
                                        {processing ? 'Memproses...' : 'Update Status'}
                                    </Button>
                                    {selectedStatus === 'cancelled' && (
                                        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                            <strong>Peringatan:</strong> Membatalkan pesanan akan mengembalikan stok produk.
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Order Items */}
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Package className="h-4 w-4" />
                                    <h3 className="text-base font-semibold">Detail Produk</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Produk
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Vendor
                                                </th>
                                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Qty
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Harga
                                                </th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {order.items.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-4 text-sm">
                                                        <div className="font-medium text-gray-900">{item.product.name}</div>
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-gray-600">
                                                        {item.product.vendor?.name || '-'}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-center">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm text-right">
                                                        {formatCurrency(item.unit_price)}
                                                    </td>
                                                    <td className="px-4 py-4 text-sm font-medium text-right">
                                                        {formatCurrency(item.total_price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Informasi Pembayaran
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Metode Pembayaran</p>
                                        <p className="font-semibold uppercase">{order.payment_method || 'QRIS'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Pembayaran</p>
                                        <p className="font-semibold text-lg text-green-600">{formatCurrency(order.total_amount)}</p>
                                    </div>
                                </div>

                                {order.payment_proof && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">Bukti Pembayaran</p>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <img
                                                src={`/storage/${order.payment_proof}`}
                                                alt="Payment Proof"
                                                className="h-40 w-auto mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity border"
                                                onClick={() => handleViewProof(order.payment_proof)}
                                                onError={handleImageError}
                                            />
                                            <div className="mt-2 text-center">
                                                <Button variant="outline" size="sm" onClick={() => handleViewProof(order.payment_proof)}>
                                                    Lihat Gambar
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {order.paid_at && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 text-green-700">
                                            <AlertCircle className="h-5 w-5" />
                                            <span className="font-medium">Pembayaran Terverifikasi</span>
                                        </div>
                                        <p className="text-sm text-green-600 mt-1">
                                            Dibayar pada: {formatDate(order.paid_at)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Buyer Notes */}
                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <AlertCircle className="h-5 w-5" />
                                        Catatan dari Pembeli
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                            {order.notes}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Informasi Pembeli
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <table className="min-w-full">
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3 text-sm font-medium text-gray-600 w-1/4">Nama</td>
                                            <td className="py-3 text-sm text-gray-900">{order.buyer?.name || '-'}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 text-sm font-medium text-gray-600 w-1/4">Email</td>
                                            <td className="py-3 text-sm text-gray-900">{order.buyer?.email || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Delivery Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Informasi Pengiriman
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <table className="min-w-full">
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3 text-sm font-medium text-gray-600 w-1/4">Mitra</td>
                                            <td className="py-3 text-sm text-gray-900">{order.mitra?.hotel_name || '-'}</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 text-sm font-medium text-gray-600 w-1/4">Alamat</td>
                                            <td className="py-3 text-sm text-gray-900">{order.mitra?.address || '-'}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <table className="min-w-full">
                                    <tbody>
                                        <tr className="border-b">
                                            <td className="py-3 text-sm font-medium text-gray-600">Total Items</td>
                                            <td className="py-3 text-sm text-gray-900 text-right">{order.items?.length || 0} produk</td>
                                        </tr>
                                        <tr className="border-b">
                                            <td className="py-3 text-sm font-semibold text-gray-900">Total Pembayaran</td>
                                            <td className="py-3 text-xl font-bold text-green-600 text-right">{formatCurrency(order.total_amount)}</td>
                                        </tr>
                                        {order.partner_commission > 0 && (
                                            <tr className="border-b">
                                                <td className="py-3 text-xs text-gray-600">Komisi Mitra</td>
                                                <td className="py-3 text-xs text-gray-900 text-right">{formatCurrency(order.partner_commission)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </div>

            {/* Payment Proof Dialog */}
            <PaymentProofDialog
                isOpen={isProofDialogOpen}
                onClose={() => setIsProofDialogOpen(false)}
                proofPath={selectedProofPath}
            />
        </AdminLayout>
    );
}
