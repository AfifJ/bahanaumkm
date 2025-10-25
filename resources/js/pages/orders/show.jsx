import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PaymentProofDialog from '@/components/admin/payment-proof-dialog';
import { ReviewForm, ReviewFormSuccess } from '@/components/review-form';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, ChevronDown, ChevronUp, MapPin, Package, User, XCircle, Eye, Truck, AlertTriangle, ArrowLeft as ReturnIcon, RefreshCw, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

export default function OrderShow({ order, canReviewProducts }) {
    const { flash } = usePage().props;
    const [showDetails, setShowDetails] = useState(true)
    const [showDeliveryProofDialog, setShowDeliveryProofDialog] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [showReviewDialog, setShowReviewDialog] = useState(false)
    const [reviewSuccess, setReviewSuccess] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)
    const { put, processing } = useForm({
        status: order.status,
    });

    const handleConfirmDelivery = () => {
        router.post(route('buyer.orders.confirm-delivery', order.id), {}, {
            onSuccess: () => {
                toast.success('Pesanan berhasil dikonfirmasi sudah sampai!');
                setShowConfirmDialog(false);
                router.reload();
            },
            onError: (errors) => {
                toast.error('Gagal mengkonfirmasi pesanan');
            },
        });
    };

    const handleReviewClick = (item) => {
        setSelectedProduct(item);
        setShowReviewDialog(true);
        setReviewSuccess(false);
    };

    const handleReviewSuccess = () => {
        setReviewSuccess(true);
        setTimeout(() => {
            setShowReviewDialog(false);
            router.reload();
        }, 2000);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            validation: 'bg-blue-100 text-blue-800 border-blue-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            processed: 'bg-purple-100 text-purple-800 border-purple-200',
            out_for_delivery: 'bg-cyan-100 text-cyan-800 border-cyan-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            payment_rejected: 'bg-red-100 text-red-800 border-red-200',
            failed_delivery: 'bg-orange-100 text-orange-800 border-orange-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
            returned: 'bg-gray-100 text-gray-800 border-gray-200',
            refunded: 'bg-slate-100 text-slate-800 border-slate-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: Package,
            validation: Package,
            paid: CheckCircle,
            processed: Package,
            out_for_delivery: Truck,
            delivered: CheckCircle,
            completed: CheckCircle,
            payment_rejected: XCircle,
            failed_delivery: AlertTriangle,
            cancelled: XCircle,
            returned: ReturnIcon,
            refunded: RefreshCw,
            default: Package,
        };
        return icons[status] || icons.default;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'Menunggu Pembayaran',
            validation: 'Menunggu Validasi',
            paid: 'Sudah Dibayar',
            processed: 'Diproses',
            out_for_delivery: 'Sedang Diantar Kurir',
            delivered: 'Telah Sampai',
            completed: 'Selesai',
            payment_rejected: 'Pembayaran Ditolak',
            failed_delivery: 'Pengiriman Gagal',
            cancelled: 'Dibatalkan',
            returned: 'Dikembalikan',
            refunded: 'Direfund',
        };
        return labels[status] || status;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const StatusIcon = getStatusIcon(order.status);

    return (
        <BuyerLayoutWrapper withBottomNav={false} title={'Order Detail'} backLink={route('buyer.orders.index')}>
            <Head title={`Detail Pesanan #${order.order_code} - Bahana UMKM`} />

            <div className="container mx-auto px-3 py-4 space-y-4">
                <div className="mb-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">#{order.order_code}</h1>
                            <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                <StatusIcon className="h-3 w-3 mr-2" />
                                {getStatusLabel(order.status)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{flash.success}</div>}
                {flash?.error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{flash.error}</div>}

                {/* Products Section */}
                <div className="mb-4">
                    <h2 className="text-base font-semibold text-gray-900 mb-2">Produk Dipesan</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="border rounded-lg p-3">
                                <div className="flex items-start space-x-3">
                                    {item.product.primaryImage?.url && (
                                        <img
                                            src={item.product.primaryImage.url}
                                            alt={item.product.name}
                                            className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</h3>
                                        <div className="mt-1 flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span>Qty: {item.quantity}</span>
                                            <span>•</span>
                                            <span>{formatPrice(item.unit_price)}</span>
                                        </div>
                                        {/* Review Status for Completed Orders */}
                                        {order.status === 'completed' && (
                                            <div className="mt-2 pt-2 border-t border-gray-100">
                                                {item.existing_review ? (
                                                    <div className="flex items-center space-x-2 text-xs">
                                                        <div className="flex items-center">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-3 w-3 ${i < item.existing_review.rating
                                                                        ? 'text-yellow-400 fill-current'
                                                                        : 'text-gray-300'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-green-600 font-medium">Sudah direview</span>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleReviewClick(item)}
                                                        className={'font-light'}
                                                    >
                                                        Beri Review
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.total_price)}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className='flex space-x-2'>
                    {/* Lanjutkan Pembayaran Button - Only for pending orders */}
                    {order.status === 'pending' && (
                        <Button asChild className={'w-full'}>
                            <Link href={route('buyer.payment.show', order.id)}>
                                Lanjutkan Pembayaran
                            </Link>
                        </Button>
                    )}
                    {/* View Delivery Proof - Only for delivered or completed orders */}
                    {(order.status === 'delivered' || order.status === 'completed') && order.delivery_proof && (
                        <Button
                            variant="outline"
                            onClick={() => setShowDeliveryProofDialog(true)}
                            className="flex items-center gap-1 w-full"
                        >
                            <Eye className="h-3 w-3" />
                            Lihat Bukti Pengiriman
                        </Button>
                    )}
                    {/* Confirm Delivery Button - Show when delivered but not yet confirmed */}
                    {order.status === 'delivered' && order.delivery_proof && (
                        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                            <DialogTrigger asChild>
                                <Button className="w-full" disabled={processing}>
                                    Konfirmasi Penerimaan
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Konfirmasi Pesanan</DialogTitle>
                                    <DialogDescription>
                                        Admin telah mengupload bukti pengiriman. Apakah Anda yakin barang sudah diterima sesuai dengan bukti yang ada?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowConfirmDialog(false)}
                                    >
                                        Belum, Saya Periksa Dulu
                                    </Button>
                                    <Button
                                        onClick={handleConfirmDelivery}
                                        disabled={processing}
                                    >
                                        Ya, Barang Sudah Sampai
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                {/* Status-Specific UI Components */}

                {/* Payment Rejected */}
                {order.status === 'payment_rejected' && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <h3 className="text-base font-semibold text-red-800 mb-2 flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
                            Pembayaran Ditolak
                        </h3>
                        <div className="text-sm text-red-700 mb-3">
                            <p className="mb-2">Pembayaran Anda tidak dapat divalidasi dengan alasan:</p>
                            <div className="bg-white rounded p-3 border border-red-200">
                                <p className="text-red-800">{order.reject_reason || 'Tidak ada alasan spesifik'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('buyer.payment.show', order.id)}>
                                <Button className="flex-1">
                                    Upload Ulang Bukti Pembayaran
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Failed Delivery */}
                {order.status === 'failed_delivery' && (
                    <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
                        <h3 className="text-base font-semibold text-orange-800 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            Pengiriman Gagal
                        </h3>
                        <div className="text-sm text-orange-700 mb-3">
                            <p className="mb-2">Pengiriman pesanan Anda mengalami kendala:</p>
                            <div className="bg-white rounded p-3 border border-orange-200">
                                <p className="text-orange-800">{order.delivery_notes || 'Terjadi kendala saat pengiriman. Admin akan segera menghubungi Anda.'}</p>
                            </div>
                        </div>
                        <div className="bg-orange-100 rounded p-3 border border-orange-200 mb-3">
                            <p className="text-sm text-orange-700">
                                <strong>Solusi:</strong> Admin akan mencoba mengirim ulang pesanan Anda atau menghubungi Anda untuk konfirmasi lebih lanjut.
                            </p>
                        </div>
                    </div>
                )}

                {/* Returned */}
                {order.status === 'returned' && (
                    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h3 className="text-base font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <ReturnIcon className="h-5 w-5 text-gray-600" />
                            Pesanan Dikembalikan
                        </h3>
                        <div className="text-sm text-gray-700 mb-3">
                            <p className="mb-2">Pesanan Anda telah dikembalikan dengan alasan:</p>
                            <div className="bg-white rounded p-3 border border-gray-200">
                                <p className="text-gray-800">{order.delivery_notes || 'Permintaan pengembalian telah diproses.'}</p>
                            </div>
                        </div>
                        <div className="bg-gray-100 rounded p-3 border border-gray-200 mb-3">
                            <p className="text-sm text-gray-700">
                                <strong>Proses Refund:</strong> Dana akan dikembalikan ke metode pembayaran yang sama dalam 3-5 hari kerja.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('home')}>
                                <Button className="flex-1">
                                    Belanja Lagi
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Refunded */}
                {order.status === 'refunded' && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <h3 className="text-base font-semibold text-slate-800 mb-2 flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-slate-600" />
                            Refund Diproses
                        </h3>
                        <div className="text-sm text-slate-700 mb-3">
                            <p className="mb-2">Refund untuk pesanan ini telah diproses:</p>
                            <div className="bg-white rounded p-3 border border-slate-200">
                                <p className="font-medium text-slate-800 mb-1">Nominal: {formatPrice(order.total_amount)}</p>
                                <p className="text-slate-600">Metode: QRIS (akan dikembalikan ke akun yang sama)</p>
                            </div>
                        </div>
                        <div className="bg-slate-100 rounded p-3 border border-slate-200 mb-3">
                            <p className="text-sm text-slate-700">
                                <strong>Estimasi dana masuk:</strong> 3-5 hari kerja
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Link href={route('home')}>
                                <Button className="flex-1">
                                    Belanja Lagi
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}

                {/* Order Summary & Info */}
                <div className="mb-4 rounded-lg border p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="w-full flex justify-between"
                        >
                            <h2 className="text-base font-semibold">Ringkasan Pesanan</h2>
                            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {showDetails && (
                            <div className="space-y-3 border-t pt-3 mt-3">
                                {/* Informasi Pesanan */}
                                <div className="flex justify-between items-center text-sm text-gray-600">
                                    <span>Status Pesanan</span>
                                    <div className="flex space-x-2 items-center">
                                        <span className="font-medium text-indigo-600">
                                            {getStatusLabel(order.status)}
                                        </span>
                                        {(order.status === 'delivered' || order.status === 'completed') && order.delivery_proof && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setShowDeliveryProofDialog(true)}
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                Bukti Pengiriman
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Informasi Pengiriman */}
                                <div className="border-t pt-3 mt-3">
                                    <h4 className="font-medium text-gray-900 mb-2">Informasi Pengiriman</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Alamat Tujuan</span>
                                            <span className="font-medium">{order.mitra?.hotel_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Alamat Lengkap</span>
                                            <span className="font-medium text-right">{order.mitra?.address || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Catatan */}
                                {order.notes && (
                                    <div className="border-t pt-3 mt-3">
                                        <h4 className="font-medium text-gray-900 mb-2">Catatan Pesanan</h4>
                                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                                            {order.notes}
                                        </p>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">{formatPrice(order.total_amount)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>Ongkos kirim</span>
                                    <span className="font-medium">{formatPrice(order.shipping_cost || 0)}</span>
                                </div>
                                <div className="border-t pt-2">
                                    <div className="flex justify-between text-sm text-gray-900">
                                        <span>Total</span>
                                        <span className="font-semibold text-lg text-green-600">{formatPrice((parseFloat(order.total_amount || 0)))}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                </div>




                {/* Order Cancelled */}
                {order.status === 'cancelled' && (
                    <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
                        <h3 className="text-base font-semibold text-red-800 mb-2">Pesanan Dibatalkan</h3>
                        <div className="text-sm text-red-700">
                            Pesanan ini telah dibatalkan dan stok produk telah dikembalikan.
                        </div>
                    </div>
                )}

                {/* Order Completed */}
                {order.status === 'completed' && (
                    <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                        <h3 className="text-base font-semibold text-emerald-800 mb-2">Pesanan Selesai</h3>
                        <div className="text-sm text-emerald-700 mb-3">
                            Terima kasih telah berbelanja di Bahana UMKM! Pesanan Anda telah selesai.
                        </div>
                    </div>
                )}

                {/* Delivery Proof Dialog */}
                <PaymentProofDialog
                    isOpen={showDeliveryProofDialog}
                    onClose={() => setShowDeliveryProofDialog(false)}
                    proofPath={order.delivery_proof}
                />

                {/* Review Dialog */}
                {selectedProduct && (
                    <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                        <DialogContent className="sm:max-w-md">
                            {!reviewSuccess ? (
                                <>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <Star className="h-5 w-5 text-yellow-500" />
                                            Review Produk
                                        </DialogTitle>
                                        <DialogDescription>
                                            Beri rating dan review untuk <strong>{selectedProduct.product.name}</strong>
                                        </DialogDescription>
                                    </DialogHeader>
                                    <ReviewForm
                                        productId={selectedProduct.product.id}
                                        orderId={order.id}
                                        onSubmit={handleReviewSuccess}
                                        onCancel={() => setShowReviewDialog(false)}
                                    />
                                </>
                            ) : (
                                <ReviewFormSuccess onClose={() => setShowReviewDialog(false)} />
                            )}
                        </DialogContent>
                    </Dialog>
                )}

            </div>
        </BuyerLayoutWrapper>
    );
}
