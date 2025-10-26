import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ProductImageGallery from '@/components/product-image-gallery';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import VendorLayout from '@/layouts/vendor-layout';
import { Head, Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import {
    ArrowLeft,
    Package,
    DollarSign,
    ShoppingCart,
    TrendingUp,
    Star,
    User,
    Calendar,
    BarChart3,
    MessageSquare,
    Plus
} from 'lucide-react';

export default function Show({ product, transactionStats, reviews, ratingStats }) {
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderStars = (rating) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-900">
                    {rating}.0
                </span>
            </div>
        );
    };

    return (
        <VendorLayout
            title={`Detail Produk - ${product.name}`}
            breadcrumbs={[
                {
                    title: 'Produk',
                    href: route('vendor.products.index'),
                },
                {
                    title: product.name,
                    href: route('vendor.products.show', product),
                },
            ]}
        >
            <Head title={`Detail Produk - ${product.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6  ">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('vendor.products.index')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Kembali ke Daftar Produk
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Detail Produk
                                </h1>
                                <p className="text-sm text-gray-600">
                                    {product.name}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Product Image Gallery */}
                                <div className="flex-shrink-0">
                                    <ProductImageGallery product={product} />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        {product.name}
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Kategori</p>
                                            <p className="font-medium">{product.category?.name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Stok</p>
                                            <p className="font-medium">{product.stock} unit</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Harga Beli</p>
                                            <p className="font-medium">{formatPrice(product.buy_price)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Harga Jual</p>
                                            <p className="font-medium text-green-600">{formatPrice(product.sell_price)}</p>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                            {product.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            {product.description && (
                                <div className="mt-6 pt-6 border-t lg:col-span-2">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Deskripsi</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Variations Section */}
                    {product.has_variations && (
                        <div className="bg-white shadow rounded-lg mb-6">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Variasi Produk
                                </h3>
                            </div>
                            <div className="p-6">
                                {product.skus && product.skus.length > 0 ? (
                                    <>
                                        {/* Mobile Card View */}
                                        <div className="md:hidden space-y-4">
                                            {product.skus.map((sku) => (
                                                <div key={sku.id} className="border border-gray-200 rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">
                                                                {sku.sku_code}
                                                            </h4>
                                                            {sku.variant_name && (
                                                                <p className="text-sm text-gray-600 mt-1">
                                                                    {sku.variant_name}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <Badge variant={sku.status === 'active' ? 'default' : 'secondary'}>
                                                            {sku.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-gray-600">Stok</p>
                                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                                                                sku.stock > 0
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-red-100 text-red-800'
                                                            }`}>
                                                                {sku.stock} unit
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600">Harga</p>
                                                            <p className="font-medium text-gray-900 mt-1">
                                                                {formatPrice(sku.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop Table View */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Kode SKU</TableHead>
                                                        <TableHead>Nama Variasi</TableHead>
                                                        <TableHead>Stok</TableHead>
                                                        <TableHead>Harga</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {product.skus.map((sku) => (
                                                        <TableRow key={sku.id}>
                                                            <TableCell className="font-medium">
                                                                {sku.sku_code}
                                                            </TableCell>
                                                            <TableCell>
                                                                {sku.variant_name || '-'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                                    sku.stock > 0
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                    {sku.stock} unit
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                {formatPrice(sku.price)}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={sku.status === 'active' ? 'default' : 'secondary'}>
                                                                    {sku.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Belum Ada Variasi
                                        </h3>
                                        <p className="text-gray-600 mb-4 max-w-md mx-auto">
                                            Produk ini ditandai memiliki variasi, tapi belum ada SKU yang terdaftar.
                                            Tambahkan variasi produk untuk mengelola stok dan harga per tipe.
                                        </p>
                                        <Button variant="outline" asChild>
                                            <Link href={route('vendor.products.skus', product)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tambah Variasi
                                            </Link>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Reviews Section */}
                    <div className="bg-white shadow rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <MessageSquare className="h-5 w-5 mr-2" />
                                        Customer Reviews
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {reviews.total} review{reviews.total !== 1 ? 's' : ''}
                                        {ratingStats.average_rating > 0 && (
                                            <span className="ml-2">
                                                • Rating: {ratingStats.average_rating.toFixed(1)} / 5.0
                                            </span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {reviews.data.length === 0 ? (
                                <div className="text-center py-12">
                                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        Belum Ada Review
                                    </h3>
                                    <p className="text-gray-600">
                                        Produk ini belum menerima review dari pelanggan.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Pelanggan</TableHead>
                                                <TableHead>Rating</TableHead>
                                                <TableHead>Review</TableHead>
                                                <TableHead>Order</TableHead>
                                                <TableHead>Tanggal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reviews.data.map((review) => (
                                                <TableRow key={review.id}>
                                                    <TableCell>
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                                                <User className="h-4 w-4 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {review.user?.name || 'Anonymous'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {renderStars(review.rating)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-xs">
                                                            <p className="text-sm text-gray-900">
                                                                {review.review || (
                                                                    <span className="text-gray-400 italic">Tidak ada komentar</span>
                                                                )}
                                                            </p>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Package className="h-3 w-3 mr-1" />
                                                            {review.order?.order_code || '-'}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Calendar className="h-3 w-3 mr-1" />
                                                            {formatDate(review.created_at)}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Pagination */}
                                    {reviews.data.length > 0 && (
                                        <div className="mt-4 flex justify-center">
                                            {reviews.links.map(
                                                (link, index) =>
                                                    link.url && (
                                                        <Link
                                                            key={index}
                                                            href={link.url}
                                                            className={`mx-1 rounded px-4 py-2 ${
                                                                link.active
                                                                    ? 'bg-blue-500 text-white'
                                                                    : 'bg-gray-200 text-gray-700'
                                                            }`}
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    )
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}