import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Trash2, User, Calendar, Star, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductReviews({ product, reviews, canDeleteReviews }) {
    const handleDeleteReview = (reviewId) => {
        router.delete(route('reviews.destroy', reviewId), {
            onSuccess: () => {
                toast.success('Review berhasil dihapus!');
            },
            onError: () => {
                toast.error('Gagal menghapus review.');
            }
        });
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
        <AdminLayout
            title={`Product Reviews - ${product.name}`}
            breadcrumbs={[
                { title: 'Products', href: route('admin.products.index') },
                { title: product.name, href: route('admin.products.show', product) },
                { title: 'Reviews', href: route('admin.products.reviews', product) },
            ]}
        >
            <Head title={`Reviews - ${product.name}`} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 px-4 ">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={route('admin.products.index')}>
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Back to Products
                                    </Link>
                                </Button>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">
                                        Product Reviews
                                    </h1>
                                    <p className="text-sm text-gray-600">
                                        {product.name} • {reviews.total} review{reviews.total !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Product Summary */}
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-4">
                                {product.primaryImage?.url && (
                                    <img
                                        src={product.primaryImage.url}
                                        alt={product.name}
                                        className="h-12 w-12 rounded-md object-cover"
                                    />
                                )}
                                <div>
                                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                                    <p className="text-sm text-gray-600">
                                        Vendor: {product.vendor?.name || 'Unknown'} •
                                        Category: {product.category?.name || 'Uncategorized'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reviews Table */}
                    <div className="bg-white shadow rounded-lg">
                        {reviews.data.length === 0 ? (
                            <div className="text-center py-12">
                                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Reviews Yet
                                </h3>
                                <p className="text-gray-600">
                                    This product hasn't received any customer reviews yet.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Rating</TableHead>
                                        <TableHead>Review</TableHead>
                                        <TableHead>Order</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
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
                                                            <span className="text-gray-400 italic">No comment</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Package className="h-3 w-3 mr-1" />
                                                    <Link
                                                        href={route('admin.transaction.show', review.order?.id)}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline"
                                                    >
                                                        {review.order?.order_code || 'Unknown'}
                                                    </Link>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm text-gray-600">
                                                    <Calendar className="h-3 w-3 mr-1" />
                                                    {formatDate(review.created_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {canDeleteReviews && (
                                                    <ConfirmationDialog
                                                        title="Hapus Review"
                                                        description="Apakah Anda yakin ingin menghapus review ini?"
                                                        confirmText="Hapus"
                                                        cancelText="Batal"
                                                        variant="destructive"
                                                        onConfirm={() => handleDeleteReview(review.id)}
                                                    >
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </ConfirmationDialog>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

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
                </div>
            </div>
        </AdminLayout>
    );
}