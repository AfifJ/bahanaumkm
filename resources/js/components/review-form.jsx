import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RatingStars } from '@/components/rating-stars';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export function ReviewForm({ productId, orderId, onSubmit, onCancel, isLoading = false }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: productId,
        order_id: orderId,
        rating: 0,
        review: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data.rating === 0) {
            alert('Silakan pilih rating terlebih dahulu');
            return;
        }

        setIsSubmitting(true);

        post(route('reviews.store'), {
            onSuccess: () => {
                setIsSubmitting(false);
                if (onSubmit) {
                    onSubmit();
                }
                // Reset form
                setData({
                    product_id: productId,
                    order_id: orderId,
                    rating: 0,
                    review: '',
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Review submission error:', errors);
            },
        });
    };

    const handleRatingChange = (rating) => {
        setData('rating', rating);
    };

    const handleReviewChange = (e) => {
        setData('review', e.target.value);
    };

    const remainingChars = 1000 - data.review.length;

    return (
        <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Beri Review Produk</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Rating Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                        <RatingStars
                            rating={data.rating}
                            onChange={handleRatingChange}
                            size="lg"
                        />
                        <span className="text-sm text-gray-600">
                            {data.rating > 0 ? `${data.rating} bintang` : 'Pilih rating'}
                        </span>
                    </div>
                    {errors.rating && (
                        <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                    )}
                </div>

                {/* Review Text */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review (Opsional)
                    </label>
                    <Textarea
                        value={data.review}
                        onChange={handleReviewChange}
                        placeholder="Bagaimana pengalaman Anda dengan produk ini? Bagikan review Anda untuk membantu pembeli lain..."
                        rows={4}
                        maxLength={1000}
                        className="resize-none"
                    />
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-500">
                            Berikan detail review yang membantu pembeli lain
                        </p>
                        <p className={`text-xs ${
                            remainingChars < 50 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                            {remainingChars} karakter tersisa
                        </p>
                    </div>
                    {errors.review && (
                        <p className="mt-1 text-sm text-red-600">{errors.review}</p>
                    )}
                </div>

                {/* Guidelines */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Panduan Review:</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                        <li>• Berikan review yang jujur dan objektif</li>
                        <li>• Fokus pada kualitas produk dan pengalaman penggunaan</li>
                        <li>• Hindari informasi pribadi atau kontak</li>
                        <li>• Gunakan bahasa yang sopan dan konstruktif</li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                    {onCancel && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onCancel}
                            disabled={processing || isSubmitting}
                        >
                            Batal
                        </Button>
                    )}
                    <Button
                        type="submit"
                        disabled={processing || isSubmitting || isLoading || data.rating === 0}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {processing || isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Mengirim...
                            </>
                        ) : (
                            'Kirim Review'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export function ReviewFormSuccess({ onClose }) {
    return (
        <div className="bg-white rounded-lg border p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Review Berhasil Ditambahkan!
            </h3>
            <p className="text-gray-600 mb-4">
                Terima kasih atas review Anda. Ini sangat membantu pembeli lain.
            </p>
            <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
                Selesai
            </Button>
        </div>
    );
}