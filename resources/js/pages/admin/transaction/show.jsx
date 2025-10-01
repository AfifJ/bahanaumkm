import AdminLayout from '@/layouts/admin-layout';
import { Head } from '@inertiajs/react';

export default function Transaction({ order }) {
    return (
        <AdminLayout
            title="Products"
            breadcrumbs={[
                {
                    title: 'Transaksi',
                    href: route('admin.transaction.index'),
                },
            ]}
        >
            <Head title="Transaksi" />
            <div className="py-12">
                <div className="mx-auto space-y-6 max-w-7xl sm:px-6 lg:px-8 overflow-auto">
                    <h1>
                        {order.order_code}
                    </h1>
                    <div>
                        <div>Waktu Order: {order.created_at}</div>
                        <div>Alamat Pengiriman: {order.mitra_id}</div>
                        <div>Status Pesanan: {order.status}</div>
                        <div>Produk: {order.items.map((item => (
                            <div className='ms-5'>
                                Nama: {item.product.name} <br />
                                Jumlah: {item.quantity} <br />
                                Harga Satuan: Rp {item.product.sell_price} <br />
                                Harga Jumlah: Rp {item.product.sell_price * item.quantity} <br />
                                Vendor :  {item.product.vendor.name} <br />
                            </div>
                        )))}
                        </div>
                        <div>
                            Total Harga: {order.total_amount}
                        </div>
                        <div>
                            Mitra: {order.mitra ?? '-'}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout >
    );
}
