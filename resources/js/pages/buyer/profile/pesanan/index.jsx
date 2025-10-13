// import BuyerLayoutNonSearch from "@/layouts/buyer-layout-non-search"

// const Pesanan = () => {
//     return (
//         <BuyerLayoutNonSearch backLink={route('buyer.profile.index')}>
//             <div>Pesanan</div>
//         </BuyerLayoutNonSearch>
//     )
// }
// export default Pesanan

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import BuyerLayout from '@/layouts/buyer-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, MapPin, Package, User } from 'lucide-react';
import { useState } from 'react';

export default function OrdersIndex({ orders }) {
    const { flash } = usePage().props;
    const [filter, setFilter] = useState({
        status: ""
    })

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            validation: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
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

    const handleCancelOrder = (orderId) => {
        router.put(
            route('buyer.orders.update', orderId),
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

    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title={'Pesanan Saya'}>
            <Head title="Riwayat Transaksi - Bahana UMKM" />
            <div className="container mx-auto p-4">
                {flash?.success && <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">{flash.success}</div>}
                {flash?.error && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{flash.error}</div>}
                {/* Orders List */}
                <div className="rounded-lg bg-white">
                    {orders.data.length === 0 ? (
                        <div className="py-12 text-center">
                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-medium text-gray-900">Belum ada transaksi</h3>
                            <p className="mb-6 text-gray-600">Mulai berbelanja untuk melihat riwayat transaksi Anda</p>
                            <Link
                                href={route('home')}
                                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                            >
                                Mulai Belanja
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className='pb-4 space-y-2'>
                                <div className="flex gap-2 overflow-auto">


                                    {/* <Button className={'hover:cursor-pointer'} onClick={() => {
                                        setFilter({})
                                    }} variant={'outline'}>
                                        Reset
                                        <FilterX />
                                    </Button> */}
                                    <Button
                                        variant={filter.status === '' ? 'default' : 'outline'}
                                        onClick={() => {
                                            setFilter(
                                                {
                                                    status: ""
                                                }
                                            )
                                        }}
                                        className={'hover:cursor-pointer'}
                                    >
                                        Semua
                                    </Button>
                                    <Button
                                        variant={filter.status === 'berlangsung' ? 'default' : 'outline'}
                                        onClick={() => {
                                            setFilter(
                                                {
                                                    status: "berlangsung"
                                                }
                                            )
                                        }}
                                        className={'hover:cursor-pointer'} >
                                        Berlangsung
                                    </Button>
                                    <Button
                                        variant={filter.status === 'selesai' ? 'default' : 'outline'}
                                        onClick={() => {
                                            setFilter(
                                                {
                                                    status: "selesai"
                                                }
                                            )
                                        }}
                                        className={'hover:cursor-pointer'} >
                                        Selesai
                                    </Button>
                                </div>
                                {filter.status === 'berlangsung' &&
                                    <div className="flex gap-2">
                                        <Button variant={'ghost'} className={'hover:bg-white px-1 text-black font-semibold hover:cursor-pointer'}>
                                            Pending
                                        </Button>
                                        <Button variant={'ghost'} className={'hover:bg-white px-1 text-black/60 hover:cursor-pointer'}>
                                            Dibayar
                                        </Button>
                                        <Button variant={'ghost'} className={'hover:bg-white px-1 text-black/60 hover:cursor-pointer'}>
                                            Sedang diantar
                                        </Button>
                                    </div>
                                }
                            </div>
                            <div className="space-y-4">
                                {orders.data.map((order) => (
                                    <div key={order.id} className="rounded-lg border p-3 py-2">
                                        <div className="mb-4 flex items-center justify-between">
                                            <div className="flex w-full items-center justify-between space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <Package className="h-5 w-5 text-gray-400" />
                                                    <span className="text-sm text-gray-900">#{order.order_code}</span>
                                                </div>
                                                <div>
                                                    <div
                                                        className={`rounded-full px-2 py-1 text-center text-xs font-medium ${getStatusColor(order.status)}`}
                                                    >
                                                        {order.status === 'pending' && 'Menunggu Pembayaran'}
                                                        {order.status === 'validation' && 'Menunggu Validasi'}
                                                        {order.status === 'paid' && 'Sudah Dibayar'}
                                                        {order.status === 'processing' && 'Diproses'}
                                                        {order.status === 'shipped' && 'Dikirim'}
                                                        {order.status === 'delivered' && 'Selesai'}
                                                        {order.status === 'cancelled' && 'Dibatalkan'}
                                                    </div>
                                                    {/* <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                    <span>{formatDate(order.created_at)}</span>
                                                </div>*/}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mb-4 grid grid-cols-1 gap-6 md:grid-cols-3">
                                            {/* Order Items */}
                                            <div className="md:col-span-2">
                                                <h4 className="mb-3 font-medium text-gray-900">Produk yang Dipesan</h4>
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
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-gray-900">{item.product.name}</p>
                                                                <p className="text-sm text-gray-500">
                                                                    {item.quantity} x {formatPrice(item.unit_price)}
                                                                </p>
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-900">{formatPrice(item.total_price)}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Order Summary */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between">
                                                    <span className="text-sm text-gray-600">Total Pesanan</span>
                                                    <span className="text-sm font-medium text-gray-900">{formatPrice(order.total_amount)}</span>
                                                </div>
                                                {order.mitra && (
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <User className="h-4 w-4" />
                                                        <span>Vendor: {order.mitra.name}</span>
                                                    </div>
                                                )}
                                               {/*  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                    <MapPin className="h-4 w-4" />
                                                    <span className="truncate">{order.shipping_address}</span>
                                                </div> */}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="ms-auto flex space-x-2">
                                                <Link
                                                    href={route('buyer.orders.show', order.id)}
                                                    className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                                >
                                                    Lihat Detail
                                                </Link>
                                                {order.status === 'pending' && (
                                                    <ConfirmationDialog
                                                        title="Batalkan Pesanan"
                                                        description="Apakah Anda yakin ingin membatalkan pesanan ini?"
                                                        confirmText="Batalkan"
                                                        cancelText="Batal"
                                                        variant="destructive"
                                                        onConfirm={() => handleCancelOrder(order.id)}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                                        >
                                                            Batalkan
                                                        </Button>
                                                    </ConfirmationDialog>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {orders.data.length > 0 && (
                        <div className="border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    {orders.from} - {orders.to} ({orders.total})
                                </div>
                                <div className="flex items-center space-x-1">
                                    {/* Previous Button */}
                                    <Link
                                        href={orders.links[0].url || '#'}
                                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${!orders.links[0].url ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Link>

                                    {/* Page Numbers */}
                                    <div className="flex space-x-1">
                                        {orders.links.slice(1, -1).map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${link.active ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <Link
                                        href={orders.links[orders.links.length - 1].url || '#'}
                                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${!orders.links[orders.links.length - 1].url
                                            ? 'cursor-not-allowed text-gray-400'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </BuyerLayoutNonSearch >
    );
}
