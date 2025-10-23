import { Head, Link } from '@inertiajs/react';
import SalesLayout from '@/layouts/sales-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ProductsOld({ auth, returnedProducts = [] }) {

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <SalesLayout title={'Riwayat Produk'}>
            <Head title="Riwayat Produk" />

            <div className="p-3 space-y-3 pb-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Riwayat Produk</h1>
                        <p className="text-xs text-gray-600 mt-0.5">
                            {returnedProducts.length} produk dikembalikan
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/sales/products">
                            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                            <span className="text-xs">Kembali</span>
                        </Link>
                    </Button>
                </div>
                
                {/* Product List */}
                <div className="space-y-2">
                    {returnedProducts.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <CheckCircle2 className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                                Belum ada riwayat
                            </h3>
                            <p className="text-xs text-gray-500">
                                Belum ada produk yang dikembalikan
                            </p>
                        </div>
                    ) : (
                        returnedProducts.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-lg border border-gray-200 p-3 opacity-75"
                            >
                                <div className="flex gap-3">
                                    {/* Product Image */}
                                    <div className="flex-shrink-0 relative">
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden">
                                            {product.product?.image_url ? (
                                                <img
                                                    className="object-cover h-full w-full grayscale"
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
                                        <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5">
                                            <CheckCircle2 className="h-3 w-3 text-white" />
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
                                            <Badge className="text-xs px-1.5 py-0 bg-green-100 text-green-800">
                                                Dikembalikan
                                            </Badge>
                                        </div>

                                        {/* Stats - Horizontal Layout */}
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <div className="flex items-center gap-1 bg-gray-50 rounded px-2 py-1">
                                                <span className="text-xs text-gray-600">Dipinjam:</span>
                                                <span className="text-sm font-semibold text-gray-700">
                                                    {product.borrowed_quantity}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-green-50 rounded px-2 py-1">
                                                <span className="text-xs text-green-600">Terjual:</span>
                                                <span className="text-sm font-semibold text-green-700">
                                                    {product.sold_quantity}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Dates */}
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>
                                                Dipinjam: {new Date(product.borrowed_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </span>
                                            {product.return_date && (
                                                <span className="text-green-600 font-medium">
                                                    Kembali: {new Date(product.return_date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </span>
                                            )}
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
