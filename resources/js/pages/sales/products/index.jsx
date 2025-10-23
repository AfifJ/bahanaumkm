import { Head, Link } from '@inertiajs/react';
import SalesLayout from '@/layouts/sales-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, History } from 'lucide-react';

export default function ProductsIndex({ auth, borrowedProducts = [] }) {

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

    const getCurrentStock = (product) => {
        return Math.max(0, product.borrowed_quantity - product.sold_quantity);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <SalesLayout title={'Produk'}>
            <Head title="Produk yang Dipinjam" />

            <div className="p-3 space-y-3 pb-20">
                {/* Header dengan tombol riwayat */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Produk Saya</h1>
                        <p className="text-xs text-gray-600 mt-0.5">
                            {borrowedProducts.length} produk dipinjam
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/sales/products/old">
                            <History className="h-3.5 w-3.5 mr-1.5" />
                            <span className="text-xs">Riwayat</span>
                        </Link>
                    </Button>
                </div>

                {/* Product List */}
                <div className="space-y-2">
                    {borrowedProducts.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <Package className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                                Belum ada produk
                            </h3>
                            <p className="text-xs text-gray-500">
                                Anda belum memiliki produk yang dipinjam
                            </p>
                        </div>
                    ) : (
                        borrowedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-md transition-shadow"
                            >
                                <div className="flex gap-3">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0">
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                                            {product.product?.image_url ? (
                                                <img
                                                    className="object-cover h-full w-full"
                                                    src={product.product.image_url}
                                                    alt={product.product.name}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.parentElement.innerHTML = `
                                                            <div class="h-full w-full flex items-center justify-center bg-gray-100">
                                                                <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                                </svg>
                                                            </div>
                                                        `;
                                                    }}
                                                />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center bg-gray-100">
                                                    <Package className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-1 min-w-0">
                                        {/* Product Name */}
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                                            {product.product?.name}
                                        </h3>
                                        
                                        {/* Category and Variant */}
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                                {product.product?.category}
                                            </Badge>
                                            {product.sku && (
                                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                                    {product.sku.variant_name}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Stats - Horizontal Layout */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="flex items-center gap-1 bg-blue-50 rounded px-2 py-1">
                                                <span className="text-xs text-blue-600 font-medium">Stok:</span>
                                                <span className="text-sm font-bold text-blue-700">
                                                    {product.current_stock}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-green-50 rounded px-2 py-1">
                                                <span className="text-xs text-green-600 font-medium">Terjual:</span>
                                                <span className="text-sm font-bold text-green-700">
                                                    {product.sold_quantity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Price and Date */}
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-semibold text-gray-900">
                                                {formatPrice(product.sku?.price || product.product?.sell_price || 0)}
                                            </span>
                                            <span className="text-gray-500">
                                                {new Date(product.borrowed_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </SalesLayout>
    );
}
