import { Star } from 'lucide-react';

export function RatingStars({ rating, size = 'sm', readOnly = false, onChange }) {
    const sizes = {
        xs: 'w-3 h-3',
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleRatingClick = (selectedRating) => {
        if (!readOnly && onChange) {
            onChange(selectedRating);
        }
    };

    const renderStar = (position) => {
        const filled = position <= rating;
        const isHalfStar = position === Math.ceil(rating) && rating % 1 !== 0;

        return (
            <button
                type="button"
                onClick={() => handleRatingClick(position)}
                disabled={readOnly}
                className={`${sizes[size]} ${!readOnly ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} ${position > 1 ? 'ml-1' : ''}`}
                aria-label={`Rate ${position} star${position === 1 ? '' : 's'}`}
            >
                <Star
                    className={`${sizes[size]} ${
                        filled
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                    }`}
                />
            </button>
        );
    };

    return (
        <div className="flex items-center" title={`${rating} star${rating === 1 ? '' : 's'}`}>
            {[1, 2, 3, 4, 5].map((position) => (
                <div key={position}>
                    {renderStar(position)}
                </div>
            ))}
        </div>
    );
}

export function RatingDisplay({ rating, showText = true, size = 'sm' }) {
    const formatRating = (rating) => {
        const numRating = parseFloat(rating);
        if (isNaN(numRating) || numRating === 0) return '0.0';
        return numRating.toFixed(1);
    };

    const numRating = parseFloat(rating);
    if (isNaN(numRating) || numRating === 0) {
        return (
            <div className="flex items-center">
                <RatingStars rating={0} size={size} readOnly />
                {showText && (
                    <span className="ml-2 text-sm text-gray-500">Belum ada rating</span>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center">
            <RatingStars rating={numRating} size={size} readOnly />
            {showText && (
                <span className="ml-2 text-sm font-medium text-gray-900">
                    {formatRating(numRating)}
                </span>
            )}
        </div>
    );
}

export function RatingSummary({ rating, totalReviews, breakdown = {}, size = 'sm' }) {
    const getPercentage = (count) => {
        if (totalReviews === 0) return 0;
        return Math.round((count / totalReviews) * 100);
    };

    if (totalReviews === 0) {
        return (
            <div className="text-center text-gray-500 py-4">
                <p className="text-sm">Belum ada review</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Overall Rating */}
            <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-900">
                    {rating.toFixed(1)}
                </div>
                <div className="ml-2">
                    <RatingStars rating={rating} size="md" readOnly />
                    <p className="text-sm text-gray-500 mt-1">
                        {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = breakdown[star] || 0;
                    const percentage = getPercentage(count);

                    return (
                        <div key={star} className="flex items-center">
                            <div className="flex items-center w-20">
                                <RatingStars rating={star} size="xs" readOnly />
                                <span className="ml-1 text-xs text-gray-600">{star}</span>
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
    );
}