import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/rating-stars';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Trash2, User, Calendar } from 'lucide-react';
import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export function ReviewCard({ review, showActions = false, onDelete, canDelete = false }) {
    const { delete: destroy, processing } = useForm();
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleDelete = () => {
        setIsDeleting(true);
        destroy(route('reviews.destroy', review.id), {
            onSuccess: () => {
                setIsDeleting(false);
                if (onDelete) {
                    onDelete(review.id);
                }
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                            <div className="font-medium text-gray-900">
                                {review.user?.name || 'Anonymous'}
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(review.created_at)}
                            </div>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="mb-3">
                        <RatingStars rating={review.rating} size="sm" readOnly />
                    </div>

                    {/* Review Text */}
                    {review.review && (
                        <p className="text-sm text-gray-700 leading-relaxed">
                            {review.review}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {showActions && canDelete && (
                    <div className="ml-4">
                        <ConfirmationDialog
                            title="Hapus Review"
                            description="Apakah Anda yakin ingin menghapus review ini?"
                            confirmText="Hapus"
                            cancelText="Batal"
                            variant="destructive"
                            onConfirm={handleDelete}
                            disabled={processing || isDeleting}
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={processing || isDeleting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </ConfirmationDialog>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {isDeleting && (
                <div className="mt-2 text-xs text-gray-500">
                    Menghapus review...
                </div>
            )}
        </div>
    );
}

export function ReviewCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border p-4">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    {/* Header Skeleton */}
                    <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                        <div>
                            <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                        </div>
                    </div>

                    {/* Rating Skeleton */}
                    <div className="mb-3">
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Review Text Skeleton */}
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}