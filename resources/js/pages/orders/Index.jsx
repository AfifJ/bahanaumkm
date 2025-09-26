import BuyerLayout from '@/layouts/buyer-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Package, Calendar, DollarSign, MapPin, User } from 'lucide-react';

export default function OrdersIndex({ orders }) {
    const { flash } = usePage().props;

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            paid: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
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

    return (
        <BuyerLayout>
            <Head title="Riwayat Transaksi - Bahana UMKM" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Riwayat Transaksi</h1>
                    <p className="text-gray-600">Kelola dan pantau semua pesanan Anda di satu tempat</p>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                        {flash.error}
                    </div>
                )}

                {/* Orders List */}
                <div className="bg-white rounded-lg shadow-sm border">
                    {orders.data.length === 0 ? (
                        <div className="text-center py-12">
                            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada transaksi</h3>
                            <p className="text-gray-600 mb-6">Mulai berbelanja untuk melihat riwayat transaksi Anda</p>
                            <Link
                                href={route('home')}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Mulai Belanja
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {orders.data.map((order) => (
                                <div key={order.id} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <Package className="h-5 w-5 text-gray-400" />
                                                <span className="font-medium text-gray-900">
                                                    #{order.order_code}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                {order.status === 'pending' && 'Menunggu Pembayaran'}
                                                {order.status === 'paid' && 'Sudah Dibayar'}
                                                {order.status === 'processing' && 'Diproses'}
                                                {order.status === 'shipped' && 'Dikirim'}
                                                {order.status === 'delivered' && 'Selesai'}
                                                {order.status === 'cancelled' && 'Dibatalkan'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDate(order.created_at)}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                        {/* Order Items */}
                                        <div className="md:col-span-2">
                                            <h4 className="font-medium text-gray-900 mb-3">Produk yang Dipesan</h4>
                                            <div className="space-y-3">
                                                {order.items.map((item) => (
                                                    <div key={item.id} className="flex items-center space-x-3">
                                                        {item.product.image_url && (
                                                            <img
                                                                src={item.product.image_url}
                                                                alt={item.product.name}
                                                                className="h-12 w-12 rounded-md object-cover"
                                                            />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                                {item.product.name}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {item.quantity} x {formatPrice(item.unit_price)}
                                                            </p>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {formatPrice(item.total_price)}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Order Summary */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Total Pesanan</span>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatPrice(order.total_amount)}
                                                </span>
                                            </div>
                                            {order.mitra && (
                                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <User className="h-4 w-4" />
                                                    <span>Vendor: {order.mitra.name}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <span className="truncate">{order.shipping_address}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <DollarSign className="h-4 w-4" />
                                            <span>Komisi Vendor: {formatPrice(order.partner_commission)}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <Link
                                                href={route('buyer.orders.show', order.id)}
                                                className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Lihat Detail
                                            </Link>
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
                                                            router.put(route('buyer.orders.update', order.id), {
                                                                status: 'cancelled'
                                                            }, {
                                                                onSuccess: () => {
                                                                    console.log('Cancel successful');
                                                                },
                                                                onError: (errors) => {
                                                                    console.error('Cancel failed:', errors);
                                                                },
                                                                onFinish: () => {
                                                                    console.log('Request cancel finished');
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    className="px-4 py-2 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50"
                                                >
                                                    Batalkan
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {orders.data.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {orders.from} sampai {orders.to} dari {orders.total} transaksi
                                </div>
                                <div className="flex space-x-2">
                                    {orders.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-2 rounded-md text-sm ${link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BuyerLayout>
    );
}
