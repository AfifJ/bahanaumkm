import { Button } from '@/components/ui/button';
import BuyerLayout from '@/layouts/buyer-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, CheckCircle, MapPin, Package, User, XCircle } from 'lucide-react';

export default function OrderShow({ order }) {
    const { flash } = usePage().props;
    const { put, processing } = useForm();

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            paid: 'bg-blue-100 text-blue-800 border-blue-200',
            processing: 'bg-purple-100 text-purple-800 border-purple-200',
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
        if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
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
        }
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

    const StatusIcon = getStatusIcon(order.status);

    return (
        <BuyerLayout>
            <Head title={`Detail Pesanan #${order.order_code} - Bahana UMKM`} />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6">
                    <Link href={route('buyer.orders.index')} className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Riwayat Transaksi
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="mb-2 text-xl font-bold text-gray-900">#{order.order_code}</h1>
                        </div>
                    </div>
                    <div className={`my-2 flex items-center space-x-2 rounded-full border px-4 py-2 ${getStatusColor(order.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">
                            {order.status === 'pending' && 'Menunggu Pembayaran'}
                            {order.status === 'paid' && 'Sudah Dibayar'}
                            {order.status === 'processing' && 'Diproses'}
                            {order.status === 'shipped' && 'Dikirim'}
                            {order.status === 'delivered' && 'Selesai'}
                            {order.status === 'cancelled' && 'Dibatalkan'}
                        </span>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{flash.success}</div>}

                {flash?.error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{flash.error}</div>}

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Order Details */}
                    <div className="space-y-6 lg:col-span-2">
                        {/* Order Items */}
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Produk yang Dipesan</h2>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-4 rounded-lg bg-gray-50 p-3">
                                        {item.product.image_url && (
                                            <img src={item.product.image_url} alt={item.product.name} className="h-16 w-16 rounded-md object-cover" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                                            <p className="text-sm text-gray-500">Kuantitas: {item.quantity}</p>
                                            <p className="text-sm text-gray-500">Harga satuan: {formatPrice(item.unit_price)}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium text-gray-900">{formatPrice(item.total_price)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Status Pesanan</h2>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div
                                        className={`h-3 w-3 rounded-full ${
                                            ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].includes(order.status)
                                                ? 'bg-green-500'
                                                : 'bg-gray-300'
                                        }`}
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">Pesanan dibuat</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>

                                {order.status !== 'pending' && order.status !== 'cancelled' && (
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`h-3 w-3 rounded-full ${
                                                ['paid', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">Pembayaran diterima</p>
                                            <p className="text-sm text-gray-500">-</p>
                                        </div>
                                    </div>
                                )}

                                {['processing', 'shipped', 'delivered'].includes(order.status) && (
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`h-3 w-3 rounded-full ${
                                                ['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">Pesanan diproses</p>
                                            <p className="text-sm text-gray-500">-</p>
                                        </div>
                                    </div>
                                )}

                                {['shipped', 'delivered'].includes(order.status) && (
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className={`h-3 w-3 rounded-full ${
                                                ['shipped', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-300'
                                            }`}
                                        />
                                        <div>
                                            <p className="font-medium text-gray-900">Pesanan dikirim</p>
                                            <p className="text-sm text-gray-500">-</p>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'delivered' && (
                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 rounded-full bg-green-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">Pesanan selesai</p>
                                            <p className="text-sm text-gray-500">-</p>
                                        </div>
                                    </div>
                                )}

                                {order.status === 'cancelled' && (
                                    <div className="flex items-center space-x-3">
                                        <div className="h-3 w-3 rounded-full bg-red-500" />
                                        <div>
                                            <p className="font-medium text-gray-900">Pesanan dibatalkan</p>
                                            <p className="text-sm text-gray-500">-</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Ringkasan Pesanan</h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatPrice(order.total_amount)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ongkos kirim</span>
                                    <span className="font-medium">Gratis</span>
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>{formatPrice(order.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-white p-6 shadow-sm">
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">Informasi Pengiriman</h2>

                            <div className="space-y-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="h-4 w-4" />
                                    <span className="break-words">{order.shipping_address}</span>
                                </div>

                                {order.mitra && (
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <User className="h-4 w-4" />
                                        <span>Vendor: {order.mitra.name}</span>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Calendar className="h-4 w-4" />
                                    <span>Dipesan: {formatDate(order.created_at)}</span>
                                </div>

                                {/* <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <DollarSign className="h-4 w-4" />
                                    <span>Komisi Vendor: {formatPrice(order.partner_commission)}</span>
                                </div> */}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {order.status === 'pending' && (
                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                                <h3 className="mb-2 font-medium text-yellow-800">Tindakan</h3>
                                <p className="mb-3 text-sm text-yellow-700">
                                    Pesanan Anda menunggu pembayaran. Silakan selesaikan pembayaran atau batalkan pesanan.
                                </p>
                                <div className="space-y-2">
                                    <Button
                                        onClick={handleBayarSekarang}
                                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                                    >
                                        Bayar Sekarang
                                    </Button>
                                    <Button
                                        onClick={handleCancelOrder}
                                        disabled={processing}
                                        className="w-full rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {processing ? 'Membatalkan...' : 'Batalkan Pesanan'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {order.status === 'delivered' && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                                <h3 className="mb-2 font-medium text-green-800">Pesanan Selesai</h3>
                                <p className="text-sm text-green-700">Terima kasih telah berbelanja di Bahana UMKM!</p>
                            </div>
                        )}

                        {order.status === 'cancelled' && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                <h3 className="mb-2 font-medium text-red-800">Pesanan Dibatalkan</h3>
                                <p className="text-sm text-red-700">Pesanan ini telah dibatalkan.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BuyerLayout>
    );
}
