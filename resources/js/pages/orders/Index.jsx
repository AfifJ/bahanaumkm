import { Button } from '@/components/ui/button';
import BuyerLayoutNonSearch from '@/layouts/buyer-layout-non-search';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Package, User, Calendar, ArrowRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

export default function OrdersIndex({ orders }) {
    const { flash } = usePage().props;
    const [filter, setFilter] = useState({
        status: ""
    })

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

    // Filter orders berdasarkan status
    const filteredOrders = orders.data.filter((order) => {
        if (filter.status === '') {
            return true; // Tampilkan semua
        }

        if (filter.status === 'belum_dibayar') {
            // Status belum dibayar: pending (menunggu bayar)
            return ['pending'].includes(order.status);
        }

        if (filter.status === 'berlangsung') {
            // Status yang berlangsung: paid, processing, shipped
            return ['paid', 'processing', 'shipped'].includes(order.status);
        }

        if (filter.status === 'selesai') {
            // Status yang selesai: delivered, cancelled
            return ['delivered', 'cancelled'].includes(order.status);
        }

        return true;
    });

    return (
        <BuyerLayoutNonSearch title={'Riwayat Transaksi'}>
            <Head title="Riwayat Transaksi - Bahana UMKM" />

            <div className="min-h-screen bg-gray-50">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mx-4 mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}

                {flash?.error && (
                    <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
                    <div className="flex gap-2 overflow-x-auto">
                        <Button
                            variant={filter.status === '' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter({ status: "" })}
                            className="whitespace-nowrap text-sm"
                        >
                            Semua
                        </Button>
                        <Button
                            variant={filter.status === 'belum_dibayar' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter({ status: "belum_dibayar" })}
                            className="whitespace-nowrap text-sm"
                        >
                            Belum Dibayar
                        </Button>
                        <Button
                            variant={filter.status === 'berlangsung' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter({ status: "berlangsung" })}
                            className="whitespace-nowrap text-sm"
                        >
                            Berlangsung
                        </Button>
                        <Button
                            variant={filter.status === 'selesai' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setFilter({ status: "selesai" })}
                            className="whitespace-nowrap text-sm"
                        >
                            Selesai
                        </Button>
                    </div>
                </div>

                {/* Orders List */}
                <div className="p-4">
                    {filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {orders.data.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi dengan filter ini'}
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-sm">
                                {orders.data.length === 0
                                    ? 'Mulai berbelanja untuk melihat riwayat transaksi Anda'
                                    : 'Coba ubah filter untuk melihat transaksi lainnya'
                                }
                            </p>
                            <Button asChild>
                                <Link
                                    href={route('home')}
                                >
                                    {orders.data.length === 0 ? 'Mulai Belanja' : 'Lihat Semua Transaksi'}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <Package className="h-4 w-4 text-gray-400" />
                                            <span className="text-sm font-medium text-gray-900">#{order.order_code}</span>
                                        </div>
                                        <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                            {order.status === 'pending' && 'Menunggu Bayar'}
                                            {order.status === 'paid' && 'Dibayar'}
                                            {order.status === 'processed' && 'Diproses'}
                                            {order.status === 'shipped' && 'Dikirim'}
                                            {order.status === 'delivered' && 'Selesai'}
                                            {order.status === 'cancelled' && 'Dibatalkan'}
                                        </div>
                                    </div>

                                    {/* Product Preview */}
                                    <div className="mb-3">
                                        <div className="flex items-center space-x-3">
                                            {order.items[0]?.product?.image_url && (
                                                <img
                                                    src={order.items[0].product.image_url}
                                                    alt={order.items[0].product.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {order.items[0]?.product?.name || 'Produk'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Info */}
                                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{formatDate(order.created_at)}</span>
                                            </div>
                                            {/* {order.mitra && (
                                                <div className="flex items-center space-x-1">
                                                    <User className="h-3 w-3" />
                                                    <span>{order.mitra.name}</span>
                                                </div>
                                            )} */}
                                        </div>
                                        <div className="text-sm font-semibold text-gray-900">
                                            {formatPrice(order.total_amount)}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <Link
                                            href={route('buyer.orders.show', order.id)}
                                            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            <span>Lihat Detail</span>
                                            <ArrowRight className="h-3 w-3" />
                                        </Link>
                                        {order.status === 'pending' && (
                                            <button
                                                onClick={() => {
                                                    if (confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
                                                        router.put(
                                                            route('buyer.orders.update', order.id),
                                                            { status: 'cancelled' },
                                                            {
                                                                onSuccess: () => console.log('Cancel successful'),
                                                                onError: (errors) => console.error('Cancel failed:', errors),
                                                            }
                                                        );
                                                    }
                                                }}
                                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Batalkan
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {filteredOrders.length > 0 && (
                        <div className="mt-6 border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between">
                                <div className="text-xs text-gray-500">
                                    Menampilkan {filteredOrders.length} dari {orders.total} transaksi
                                </div>
                                <div className="flex items-center space-x-1">
                                    {/* Previous Button */}
                                    <Link
                                        href={orders.links[0].url || '#'}
                                        className={`inline-flex items-center rounded-lg p-2 text-sm ${!orders.links[0].url ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>

                                    {/* Page Numbers */}
                                    <div className="flex space-x-1">
                                        {orders.links.slice(1, -1).map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${link.active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'} ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <Link
                                        href={orders.links[orders.links.length - 1].url || '#'}
                                        className={`inline-flex items-center rounded-lg p-2 text-sm ${!orders.links[orders.links.length - 1].url ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BuyerLayoutNonSearch>
    );
}
