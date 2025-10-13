import { Button } from '@/components/ui/button';
import { ReviewCard, ReviewCardSkeleton } from '@/components/review-card';
import { ChevronDown, ChevronUp, Star, MessageSquare } from 'lucide-react';
import { useState } from 'react';

export function ReviewList({
    reviews,
    loading = false,
    showActions = false,
    onDeleteReview,
    showLoadMore = false,
    onLoadMore,
    isLoadingMore = false,
    showReviewForm = false,
    reviewFormProps
}) {
    const [showAll, setShowAll] = useState(false);
    const displayReviews = showAll ? reviews : reviews.slice(0, 5);
    const hasMoreReviews = reviews.length > 5;

    const formatReviewSummary = () => {
        if (reviews.length === 0) return null;

        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        const ratingBreakdown = {};

        reviews.forEach(review => {
            ratingBreakdown[review.rating] = (ratingBreakdown[review.rating] || 0) + 1;
        });

        return {
            averageRating,
            totalReviews: reviews.length,
            breakdown: ratingBreakdown
        };
    };

    const summary = formatReviewSummary();

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <ReviewCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Review Form */}
            {showReviewForm && reviewFormProps && (
                <div className="mb-6">
                    <ReviewForm {...reviewFormProps} />
                </div>
            )}

            {/* Summary Stats */}
            {summary && (
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Overall Rating */}
                        <div className="text-center md:text-left">
                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                {summary.averageRating.toFixed(1)}
                            </div>
                            <div className="flex items-center justify-center md:justify-start mb-2">
                                <div className="flex space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <div key={star} className="w-5 h-5">
                                            <svg
                                                className={`w-5 h-5 ${
                                                    star <= Math.round(summary.averageRating)
                                                        ? 'fill-yellow-400 text-yellow-400'
                                                        : 'text-gray-300'
                                                }`}
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.54 1.118l1.07 3.292a1 1 0 00.364 1.118L2.98 8.72c-.783-.57-1.838-.197-1.54 1.118l1.07 3.292c.3.921.755 1.688 1.54 1.118z" />
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                {summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Rating Breakdown */}
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count = summary.breakdown[star] || 0;
                                const percentage = summary.totalReviews > 0
                                    ? Math.round((count / summary.totalReviews) * 100)
                                    : 0;

                                return (
                                    <div key={star} className="flex items-center">
                                        <div className="flex items-center w-16 text-sm">
                                            <span className="mr-1">{star}</span>
                                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        </div>
                                        <div className="flex-1 mx-2">
                                            <div className="bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-yellow-400 h-2 rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-600 w-12 text-right">
                                            {count}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Belum Ada Review
                    </h3>
                    <p className="text-gray-600">
                        Jadilah yang pertama memberikan review untuk produk ini!
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Review Produk ({summary.totalReviews})
                        </h3>
                        {hasMoreReviews && !showAll && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAll(true)}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <ChevronDown className="w-4 h-4 mr-1" />
                                Lihat Semua
                            </Button>
                        )}
                        {showAll && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowAll(false)}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <ChevronUp className="w-4 h-4 mr-1" />
                                Tampilkan Sedikit
                            </Button>
                        )}
                    </div>

                    {displayReviews.map((review) => (
                        <ReviewCard
                            key={review.id}
                            review={review}
                            showActions={showActions}
                            onDelete={onDeleteReview}
                        />
                    ))}

                    {/* Load More Button */}
                    {showLoadMore && (
                        <div className="text-center pt-4">
                            <Button
                                variant="outline"
                                onClick={onLoadMore}
                                disabled={isLoadingMore}
                                className="w-full"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Memuat...
                                    </>
                                ) : (
                                    'Muat Lebih Banyak Review'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}