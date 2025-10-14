import ProductList from '@/components/product-list';
import ProductImageGallery from '@/components/product-image-gallery';
import ScrollToTop from '@/components/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import { Head, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, Heart, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { VendorProfileCard } from '@/components/vendor-profile-card';
import { RatingDisplay } from '@/components/rating-stars';
import { ReviewList } from '@/components/review-list';
import { useCart } from '@/hooks/use-cart';
import { ReviewForm } from '@/components/review-form';

export default function ProductShow({ product, relatedProducts, layout, flash, isInWishlist: initialIsInWishlist, reviews, canReview, userOrder }) {
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist || false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState(false);
    const [hasError, setHasError] = useState(false);

    // Initialize cart hook
    const { cartCount, addToCart } = useCart();


    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);


    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleAddToCart = async () => {
        if (product.stock <= 0) return;

        setIsAddingToCart(true);
        try {
            await addToCart(product.id, quantity);
            toast.success('Produk berhasil ditambahkan ke keranjang!');
        } catch (error) {
            toast.error(error.message || 'Gagal menambahkan produk ke keranjang');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        if (product.stock <= 0) return;

        setIsBuyingNow(true);

        // Clear any existing cart data from session storage
        sessionStorage.removeItem('checkout_data');

        // Redirect ke halaman checkout dengan query parameters untuk pembelian langsung
        router.visit(
            route('buyer.orders.create', {
                product_id: product.id,
                quantity: quantity,
            }),
            {
                onFinish: () => {
                    setIsBuyingNow(false);
                },
            },
        );
    };

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        if (newQuantity > product.stock) return;
        setQuantity(newQuantity);
    };

    // Update wishlist status when initialIsInWishlist prop changes
    useEffect(() => {
        setIsInWishlist(initialIsInWishlist || false);
    }, [initialIsInWishlist]);

    const handleWishlistToggle = async () => {
        if (isWishlistLoading) return;

        setIsWishlistLoading(true);

        try {
            if (isInWishlist) {
                await router.delete(route('buyer.wishlist.destroy', { product: product.id }));
                setIsInWishlist(false);
                toast.success("Berhasil menghapus produk dari wishlist");
            } else {
                await router.post(route('buyer.wishlist.store'), {
                    product_id: product.id,
                });
                toast.success("Berhasil menambahkan produk ke wishlist");
                setIsInWishlist(true);
            }
        } catch (errors) {
            if (isInWishlist) {
                toast.error('Gagal menghapus produk dari wishlist');
            } else {
                toast.error('Gagal menambahkan produk ke wishlist');
            }
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const handleReviewSuccess = () => {
        setReviewSuccess(true);
        setShowReviewForm(false);
        // Reload page to show new review
        router.reload();
    };


    return (
        <BuyerLayoutWrapper withBottomNav={false} backLink={route('home')} title={'Detail Produk'} >
            <ScrollToTop />
            <Head title={product.name || 'Detail Produk'} />

            <div className="container mx-auto px-4 py-4">
                {/* Desktop Layout: 2 Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* Left Column: Product Images - Sticky on Desktop */}
                    <div className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
                        <ProductImageGallery product={product} />
                    </div>

                    {/* Right Column: All Product Details */}
                    <div className="space-y-6">
                        {/* Product Info - Compact Layout */}
                        <div className="space-y-4">
                            {/* Product Name and Category */}
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex-1">{product.name}</h1>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-shrink-0 px-3 py-2 hover:cursor-pointer"
                                        disabled={isWishlistLoading}
                                        onClick={handleWishlistToggle}
                                    >
                                        {isWishlistLoading ? (
                                            <>
                                                <Heart className="h-4 w-4 animate-spin" />
                                            </>
                                        ) : (
                                            <>
                                                <Heart
                                                    className={`h-4 w-4 ${isInWishlist ? 'fill-red-600 text-red-600' : 'text-gray-600'}`}
                                                />
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                        {product.category?.name}
                                    </span>
                                    <span>•</span>
                                    <span>Oleh: {product.vendor?.name || 'Vendor'}</span>
                                </div>
                            </div>

                            {/* Price and Stock */}
                            <div className="space-y-2">
                                <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">{formatPrice(product.sell_price)}</p>

                                {/* Rating Display */}
                                <div className="flex items-center">
                                    <RatingDisplay
                                        rating={product.average_rating || 0}
                                        showText
                                        size="sm"
                                    />
                                    {product.total_reviews > 0 && (
                                        <span className="text-sm text-gray-500 ml-2">
                                            ({product.total_reviews} review{product.total_reviews !== 1 ? 's' : ''})
                                        </span>
                                    )}
                                </div>

                                <p className={`text-sm ${product.stock > 0 ? 'text-primary' : 'text-red-600'}`}>
                                    {product.stock > 0 ? `Stok tersedia: ${product.stock}` : 'Stok habis'}
                                </p>
                            </div>

                            {/* Quantity Selector - Compact */}
                            {product.stock > 0 && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Jumlah:</label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={() => handleQuantityChange(quantity - 1)}
                                            disabled={quantity <= 1}
                                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
                                        >
                                            -
                                        </Button>
                                        <Input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => handleQuantityChange(Number(e.target.value))}
                                            className="w-12 border-0 text-center shadow-none text-sm"
                                            min="1"
                                            max={product.stock}
                                        />
                                        <Button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            disabled={quantity >= product.stock}
                                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
                                        >
                                            +
                                        </Button>
                                        <span className="text-xs text-gray-500 ml-1">Max: {product.stock}</span>
                                    </div>
                                </div>
                            )}

                            {/* Desktop Action Buttons */}
                            {product.stock > 0 && (
                                <div className="hidden sm:flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 py-2 hover:cursor-pointer"
                                        disabled={product.stock <= 0 || isAddingToCart}
                                        onClick={handleAddToCart}
                                    >
                                        {isAddingToCart ? (
                                            <>
                                                <Package className="mr-2 h-4 w-4 animate-spin" />
                                                Menambahkan...
                                            </>
                                        ) : (
                                            <>
                                                <Package className="mr-2 h-4 w-4" />
                                                Tambah ke Keranjang
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        className="flex-1 py-2 hover:cursor-pointer"
                                        disabled={product.stock <= 0 || isBuyingNow}
                                        onClick={handleBuyNow}
                                    >
                                        {isBuyingNow ? (
                                            <>
                                                <Package className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            `Beli Sekarang - ${formatPrice(product.sell_price * quantity)}`
                                        )}
                                    </Button>
                                </div>
                            )}

                            {/* Product Description */}
                            <div className="pt-2">
                                <h3 className="text-lg font-semibold mb-2">Deskripsi Produk</h3>
                                <p className="text-sm leading-relaxed text-gray-700">{product.description || 'Tidak ada deskripsi produk.'}</p>
                            </div>
                            {/* Vendor Profile */}
                            {product.vendor && (
                                <div className="pt-6 border-t">
                                    <h3 className="text-lg font-semibold mb-3">Tentang Penjual</h3>
                                    <VendorProfileCard vendor={product.vendor} compact={true} />
                                </div>
                            )}

                            {/* Reviews Section */}
                            <div className="pt-6 border-t">
                                <ReviewList
                                    reviews={reviews?.data || []}
                                    loading={false}
                                    showReviewForm={canReview && !showReviewForm}
                                    reviewFormProps={
                                        canReview && userOrder ? {
                                            productId: product.id,
                                            orderId: userOrder.id,
                                            onSubmit: handleReviewSuccess,
                                            onCancel: () => setShowReviewForm(false)
                                        } : undefined
                                    }
                                />

                                {/* Review Form (shown when button is clicked) */}
                                {canReview && showReviewForm && userOrder && (
                                    <div className="mt-6">
                                        <ReviewForm
                                            productId={product.id}
                                            orderId={userOrder.id}
                                            onSubmit={handleReviewSuccess}
                                            onCancel={() => setShowReviewForm(false)}
                                        />
                                    </div>
                                )}

                                {/* Show Review Button for eligible users */}
                                {canReview && !showReviewForm && userOrder && (
                                    <div className="mt-6 text-center">
                                        <Button
                                            onClick={() => setShowReviewForm(true)}
                                            variant="outline"
                                            className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                        >
                                            <Star className="h-4 w-4 mr-2" />
                                            Beri Review Produk
                                        </Button>
                                        <p className="text-sm text-gray-600 mt-2">
                                            Anda bisa memberikan review untuk produk ini
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>



                </div> {/* Close Right Column */}

                {/* Sticky Action Buttons for Mobile */}
                {product.stock > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 p-4 shadow-lg sm:hidden">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 py-3 hover:cursor-pointer"
                                disabled={product.stock <= 0 || isAddingToCart}
                                onClick={handleAddToCart}
                            >
                                {isAddingToCart ? (
                                    <>
                                        <Package className="mr-2 h-4 w-4 animate-spin" />
                                        Menambahkan...
                                    </>
                                ) : (
                                    <>
                                        <Package className="mr-2 h-4 w-4" />
                                        Keranjang
                                    </>
                                )}
                            </Button>
                            <Button
                                className="flex-1 py-3 hover:cursor-pointer"
                                disabled={product.stock <= 0 || isBuyingNow}
                                onClick={handleBuyNow}
                            >
                                {isBuyingNow ? (
                                    <>
                                        <Package className="mr-2 h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    `Beli Sekarang`
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Related Products - Full Width Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-8 pt-8 border-t">
                        <h3 className="text-xl font-bold mb-4">Produk Terkait</h3>
                        <ProductList productList={relatedProducts} />
                    </div>
                )}

                {/* Spacer for sticky button */}
                {product.stock > 0 && <div className="h-20 sm:h-0"></div>}
            </div> {/* Close grid container */}
        </BuyerLayoutWrapper>
    );
}
