import { Head, Link } from '@inertiajs/react';
import SalesLayout from '@/layouts/sales-layout';
import { Button } from '@/components/ui/button';

export default function ProductsOld({ auth, returnedProducts = [] }) {

    const getStatusBadge = (status) => {
        const statusConfig = {
            borrowed: { label: 'Dipinjam', color: 'bg-yellow-100 text-yellow-800' },
            returned: { label: 'Dikembalikan', color: 'bg-green-100 text-green-800' },
        };
        const config = statusConfig[status] || { label: status, color: 'bg-gray-100 text-gray-800' };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        );
    };

    return (
        <SalesLayout title={'Riwayat Produk'}>
            <Head title="Riwayat Produk" />

            <div className="p-4 space-y-6 pb-20">
                <Button asChild>
                    <Link href="/sales/products">
                        Produk yang Sedang Dipinjam
                    </Link>
                </Button>
                
                <div className="bg-white rounded-lg border border-gray-200">
                    {returnedProducts.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">Belum ada riwayat produk yang dikembalikan</p>
                            <Button asChild>
                                <Link href="/sales/products">
                                    Lihat Produk yang Sedang Dipinjam
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {returnedProducts.map((product) => (
                                <div key={product.id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-shrink-0 h-14 w-14 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                                            <img
                                                className="object-cover h-full w-full"
                                                src={product.product?.image_url}
                                                alt=""
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 ml-4">
                                            {/* Product Name */}
                                            <div className="flex items-center gap-2 mb-2 justify-between">
                                                <h3 className="font-semibold text-gray-900 text-base truncate">
                                                    {product.product?.name}
                                                </h3>
                                                {getStatusBadge(product.status)}
                                            </div>

                                            {/* Compact Stats */}
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>Dipinjam: {product.borrowed_quantity}</span>
                                                <span>Terjual: {product.sold_quantity}</span>
                                            </div>

                                            {/* Dates */}
                                            <div className="mt-2 text-xs text-gray-500">
                                                <span>Dipinjam: {new Date(product.borrowed_date).toLocaleDateString('id-ID')}</span>
                                                {product.return_date && (
                                                    <span className="ml-4">
                                                        Dikembalikan: {new Date(product.return_date).toLocaleDateString('id-ID')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </SalesLayout>
    );
}
