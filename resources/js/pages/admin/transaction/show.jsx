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
                                <div className="space-y-3">
                                    {order.items.map((item, index) => (
                                        <div key={item.id} className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-b-0">
                                            <div className="flex-1">
                                                <div className="font-medium text-sm">{item.product.name}</div>
                                                <div className="text-xs text-gray-600 mt-1">
                                                    Vendor: {item.product.vendor?.name || '-'}
                                                </div>
                                                <div className="text-xs text-gray-600">
                                                    {item.quantity} × {formatCurrency(item.unit_price)}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-sm">
                                                    {formatCurrency(item.total_price)}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
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
                                                    Lihat Gambar Asli
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
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Nama</p>
                                    <p className="font-medium">{order.buyer?.name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Email</p>
                                    <p className="text-sm text-gray-900">{order.buyer?.email || '-'}</p>
                                </div>
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
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Mitra</p>
                                    <p className="font-medium">{order.mitra?.hotel_name || '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Alamat</p>
                                    <p className="text-sm text-gray-900">{order.mitra?.address || '-'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Items</span>
                                    <span className="font-medium">{order.items?.length || 0} produk</span>
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold">Total Pembayaran</span>
                                        <span className="text-xl font-bold text-green-600">{formatCurrency(order.total_amount)}</span>
                                    </div>
                                </div>
                                {order.partner_commission > 0 && (
                                    <div className="text-xs text-gray-600 pt-2 border-t">
                                        <div className="flex justify-between">
                                            <span>Komisi Mitra:</span>
                                            <span>{formatCurrency(order.partner_commission)}</span>
                                        </div>
                                    </div>
                                )}
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
