import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, Calendar, CheckCircle, ChevronDown, ChevronUp, MapPin, Package, User, XCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { ReviewForm } from '@/components/review-form';
import { ReviewCard } from '@/components/review-card';
import { RatingDisplay } from '@/components/rating-stars';
import { toast } from 'sonner';

export default function OrderShow({ order, canReviewProducts }) {
    const { flash } = usePage().props;
    const { put, processed } = useForm();
    const [showTimeline, setShowTimeline] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [reviewForms, setReviewForms] = useState({});
    const [submittingReviews, setSubmittingReviews] = useState({});

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            validation: 'bg-blue-100 text-blue-800 border-blue-200',
            paid: 'bg-green-100 text-green-800 border-green-200',
            processed: 'bg-purple-100 text-purple-800 border-purple-200',
            shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
            delivered: 'bg-green-100 text-green-800 border-green-200',
            cancelled: 'bg-red-100 text-red-800 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getStatusIcon = (status) => {
        const icons = {
            delivered: CheckCircle,
            cancelled: XCircle,
            default: Package,
        };
        return icons[status] || icons.default;
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

    const handleCancelOrder = () => {
        router.put(
            route('buyer.orders.update', order.id),
            {
                status: 'cancelled',
            },
            {
                onSuccess: () => {
                    console.log('Cancel successful');
                },
                onError: (errors) => {
                    console.error('Cancel failed:', errors);
                },
                onFinish: () => {
                    console.log('Request cancel finished');
                },
            },
        );
    };

    const handleBayarSekarang = () => {
        router.put(
            route('buyer.orders.update', order.id),
            {
                status: 'paid',
            },
            {
                onSuccess: () => {
                    console.log('Payment successful');
                },
                onError: (errors) => {
                    console.error('Payment failed:', errors);
                },
                onFinish: () => {
                    console.log('Request finished');
                },
            },
        );
    };

    // Review management functions
    const toggleReviewForm = (productId) => {
        setReviewForms(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    const handleReviewSubmit = (productId) => {
        setSubmittingReviews(prev => ({
            ...prev,
            [productId]: true
        }));
    };

    const handleReviewSuccess = (productId) => {
        // Hide the review form
        setReviewForms(prev => ({
            ...prev,
            [productId]: false
        }));

        setSubmittingReviews(prev => ({
            ...prev,
            [productId]: false
        }));

        // Show success message
        toast.success('Review berhasil ditambahkan!');

        // Reload the page to show the updated review
        router.reload();
    };

    const StatusIcon = getStatusIcon(order.status);

    return (
        <BuyerLayoutWrapper withBottomNav={false} title={'Order Detail'} backLink={route('buyer.orders.index')}>
            <Head title={`Detail Pesanan #${order.order_code} - Bahana UMKM`} />

            <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
                <div className="mb-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h1 className="mb-1 text-lg font-bold text-gray-900 sm:text-xl">#{order.order_code}</h1>
                            <div className={`inline-flex items-center space-x-1 rounded-full border px-3 py-1 text-xs ${getStatusColor(order.status)}`}>
                                <StatusIcon className="h-3 w-3" />
                                <span className="font-medium">
                                    {order.status === 'pending' && 'Menunggu Pembayaran'}
                                    {order.status === 'validation' && 'Menunggu Validasi'}
                                    {order.status === 'paid' && 'Sudah Dibayar'}
                                    {order.status === 'processed' && 'Diproses'}
                                    {order.status === 'shipped' && 'Dikirim'}
                                    {order.status === 'delivered' && 'Selesai'}
                                    {order.status === 'cancelled' && 'Dibatalkan'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{flash.success}</div>}
                {flash?.error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{flash.error}</div>}

                {/* Products Section */}
                <div className="mb-4 py-4">
                    <h2 className="mb-3 text-base font-semibold text-gray-900">Produk Dipesan</h2>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="border rounded-lg p-3 bg-gray-50">
                                <div className="flex items-start space-x-3">
                                    {item.product.image_url && (
                                        <img
                                            src={item.product.image_url}
                                            alt={item.product.name}
                                            className="h-14 w-14 flex-shrink-0 rounded-md object-cover"
                                        />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{item.product.name}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                            <span>Qty: {item.quantity}</span>
                                            <span>•</span>
                                            <span>{formatPrice(item.unit_price)}</span>
                                        </div>

                                        {/* Product Rating Display */}
                                        <div className="mt-2">
                                            <RatingDisplay
                                                rating={item.product.average_rating || 0}
                                                size="sm"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">{formatPrice(item.total_price)}</p>
                                    </div>
                                </div>

                                {/* Review Section for Delivered Orders */}
                                {order.status === 'delivered' && (
                                    <div className="mt-3 pt-3 border-t border-gray-200">
                                        {item.existing_review ? (
                                            // Show existing review
                                            <div className="space-y-2">
                                                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                                                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                                                    Review Anda
                                                </h4>
                                                <ReviewCard
                                                    review={item.existing_review}
                                                    showActions={false}
                                                />
                                            </div>
                                        ) : item.can_review ? (
                                            // Show review button or form
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-medium text-gray-900">Beri Review Produk</h4>
                                                    {!reviewForms[item.product.id] && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => toggleReviewForm(item.product.id)}
                                                            className="text-xs"
                                                        >
                                                            <Star className="h-3 w-3 mr-1" />
                                                            Beri Review
                                                        </Button>
                                                    )}
                                                </div>

                                                {reviewForms[item.product.id] && (
                                                    <ReviewForm
                                                        productId={item.product.id}
                                                        orderId={order.id}
                                                        onSubmit={() => handleReviewSuccess(item.product.id)}
                                                        onCancel={() => toggleReviewForm(item.product.id)}
                                                        isLoading={submittingReviews[item.product.id]}
                                                    />
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Combined Summary & Info Card */}
                <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-semibold text-gray-900">Ringkasan Pesanan</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDetails(!showDetails)}
                            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
                        >
                            <span>Detail</span>
                            {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>

                    <div className="mt-3 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Subtotal</span>
                            <span className="text-sm font-medium">{formatPrice(order.total_amount)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Ongkos kirim</span>
                            <span className="text-sm font-medium">Gratis</span>
                        </div>
                        <div className="border-t pt-2">
                            <div className="flex justify-between">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-semibold text-gray-900">{formatPrice(order.total_amount)}</span>
                            </div>
                        </div>
                    </div>

                    {showDetails && (
                        <div className="mt-4 border-t pt-4">
                            <h3 className="mb-2 text-sm font-medium text-gray-900">Informasi Pengiriman</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                {order.mitra && (
                                    <div className="flex items-center space-x-2">
                                        <User className="h-3 w-3" />
                                        <span>Tujuan: {order.mitra.hotel_name}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>Dipesan: {formatDate(order.created_at)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Timeline Section - Collapsible */}
                <div className="mb-4 rounded-lg border bg-white p-4 shadow-sm">
                    <Button
                        variant="ghost"
                        onClick={() => setShowTimeline(!showTimeline)}
                        className="flex w-full items-center justify-between text-left h-auto p-0"
                    >
                        <h2 className="text-base font-semibold text-gray-900">Status Pesanan</h2>
                        {showTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>

                    {showTimeline && (
                        <div className="mt-3 space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="h-2 w-2 rounded-full bg-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Pesanan dibuat</p>
                                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                </div>
                            </div>

                            {['validation', 'paid', 'processed', 'shipped', 'delivered'].includes(order.status) && (
                                <div className="flex items-center space-x-3">
                                    <div className={`h-2 w-2 rounded-full ${['paid', 'processed', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-blue-500'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {order.status === 'validation' ? 'Menunggu Validasi' : 'Pembayaran diterima'}
                                        </p>
                                        <p className="text-xs text-gray-500">{order.paid_at ? formatDate(order.paid_at) : '-'}</p>
                                    </div>
                                </div>
                            )}

                            {['processed', 'shipped', 'delivered'].includes(order.status) && (
                                <div className="flex items-center space-x-3">
                                    <div className={`h-2 w-2 rounded-full ${['processed', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Pesanan diproses</p>
                                        <p className="text-xs text-gray-500">{order.processed_at ? formatDate(order.processed_at) : '-'}</p>
                                    </div>
                                </div>
                            )}

                            {['shipped', 'delivered'].includes(order.status) && (
                                <div className="flex items-center space-x-3">
                                    <div className={`h-2 w-2 rounded-full ${['shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Pesanan dikirim</p>
                                        <p className="text-xs text-gray-500">{order.shipped_at ? formatDate(order.shipped_at) : '-'}</p>
                                    </div>
                                </div>
                            )}

                            {order.status === 'delivered' && (
                                <div className="flex items-center space-x-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Pesanan selesai</p>
                                        <p className="text-xs text-gray-500">{order.delivered_at ? formatDate(order.delivered_at) : '-'}</p>
                                    </div>
                                </div>
                            )}

                            {order.status === 'cancelled' && (
                                <div className="flex items-center space-x-3">
                                    <div className="h-2 w-2 rounded-full bg-red-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Pesanan dibatalkan</p>
                                        <p className="text-xs text-gray-500">-</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Buttons - Sticky on Mobile */}
                <div className="sticky bottom-4 z-10 mt-6">
                    {order.status === 'pending' && (
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <h3 className="mb-2 text-sm font-medium text-yellow-800">Tindakan</h3>
                            <p className="mb-3 text-xs text-yellow-700">
                                Pesanan Anda menunggu pembayaran QRIS. Silakan scan QR code di halaman pembayaran.
                            </p>
                            <div className="space-y-2">
                                <Button asChild className="w-full rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                                    <Link href={route('buyer.payment.show', order.id)}>
                                        Bayar dengan QRIS
                                    </Link>
                                </Button>
                                <ConfirmationDialog
                                    title="Batalkan Pesanan"
                                    description="Apakah Anda yakin ingin membatalkan pesanan ini?"
                                    confirmText="Batalkan"
                                    cancelText="Batal"
                                    variant="destructive"
                                    onConfirm={handleCancelOrder}
                                    disabled={processed}
                                >
                                    <Button
                                        disabled={processed}
                                        className="w-full rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {processed ? 'Membatalkan...' : 'Batalkan Pesanan'}
                                    </Button>
                                </ConfirmationDialog>
                            </div>
                        </div>
                    )}

                    {order.status === 'validation' && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                            <h3 className="mb-2 text-sm font-medium text-blue-800">Menunggu Validasi</h3>
                            <p className="mb-3 text-xs text-blue-700">
                                Bukti pembayaran Anda sedang divalidasi oleh admin. Proses ini biasanya memakan waktu 1x24 jam.
                            </p>
                            {order.payment_proof && (
                                <div className="mb-3">
                                    <span className="text-xs text-blue-700">Bukti Pembayaran: </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(`/storage/${order.payment_proof}`, '_blank')}
                                        className="text-xs text-blue-600 hover:underline ml-1 p-0 h-auto"
                                    >
                                        Lihat Bukti
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {order.status === 'delivered' && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <h3 className="mb-2 text-sm font-medium text-green-800">Pesanan Selesai</h3>
                            <p className="text-xs text-green-700 mb-3">Terima kasih telah berbelanja di Bahana UMKM!</p>
                            {canReviewProducts && order.items.some(item => item.can_review) && (
                                <div className="bg-white bg-opacity-50 rounded-md p-2">
                                    <p className="text-xs text-green-700 font-medium">
                                        💡 Beri review untuk produk yang Anda beli dan bantu pembeli lain!
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {order.status === 'cancelled' && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h3 className="mb-2 text-sm font-medium text-red-800">Pesanan Dibatalkan</h3>
                            <p className="text-xs text-red-700">Pesanan ini telah dibatalkan.</p>
                        </div>
                    )}
                </div>
            </div>
        </BuyerLayoutWrapper>
    );
}
