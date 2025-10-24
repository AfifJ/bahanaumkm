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
    const [selectedSku, setSelectedSku] = useState(null);
    const [selectedVariations, setSelectedVariations] = useState({});
    const [variationError, setVariationError] = useState(false);

    // Initialize cart hook
    const { cartCount, addToCart } = useCart();

    // Initialize selected SKU when component mounts or product changes
    useEffect(() => {
        // For ALL products, default to no SKU selected
        // User must manually select a variation for products with variations
        setSelectedSku(null);
    }, [product]);

    // Get current price based on selected SKU or product price
    const getCurrentPrice = () => {
        if (selectedSku) {
            return selectedSku.price;
        }

        // For products with variations and no selected SKU, return minimum price
        if (product.has_variations && product.skus && product.skus.length > 0) {
            const availableSkus = product.skus.filter(sku => sku.stock > 0);
            if (availableSkus.length > 0) {
                const minPrice = Math.min(...availableSkus.map(sku => sku.price));
                const maxPrice = Math.max(...availableSkus.map(sku => sku.price));
                return minPrice === maxPrice ? minPrice : { min: minPrice, max: maxPrice };
            }
        }

        // For simple products or products without variations
        return product.sell_price || 0;
    };

    // Get current stock based on selected SKU or total stock
    const getCurrentStock = () => {
        if (selectedSku) {
            return selectedSku.stock;
        }

        // For products with variations and no selected SKU, return total stock across all SKUs
        if (product.has_variations && product.skus && product.skus.length > 0) {
            return product.skus.reduce((total, sku) => total + (sku.stock || 0), 0);
        }

        // For simple products or products without variations
        return product.stock || 0;
    };

    // Handle SKU selection
    const handleSkuSelect = (sku) => {
        setSelectedSku(sku);
        setQuantity(1); // Reset quantity when changing SKU
        setVariationError(false); // Clear error when user selects variation
    };

    // Handle SKU change from ProductImageGallery
    const handleSkuChange = (sku) => {
        setSelectedSku(sku);
        setQuantity(1); // Reset quantity when changing SKU
        setVariationError(false); // Clear error when SKU changes
    };

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
        // Reset variation error
        setVariationError(false);

        // Validation: Check if product has variations and no SKU selected
        if (product.has_variations && !selectedSku) {
            setVariationError(true);
            toast.error('Silakan pilih variasi terlebih dahulu');
            return;
        }

        if (getCurrentStock() <= 0) return;

        setIsAddingToCart(true);
        try {
            const result = await addToCart(product.id, quantity, selectedSku?.id);

            // Only show success toast if user is logged in and product was added successfully
            if (result.success && !result.redirect) {
                toast.success(`${product.name} berhasil ditambahkan ke keranjang!`);
            }
        } catch (error) {
            toast.error(error.message || 'Gagal menambahkan produk ke keranjang');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = () => {
        // Reset variation error
        setVariationError(false);

        // Validation: Check if product has variations and no SKU selected
        if (product.has_variations && !selectedSku) {
            setVariationError(true);
            toast.error('Silakan pilih variasi terlebih dahulu');
            return;
        }

        if (getCurrentStock() <= 0) return;

        setIsBuyingNow(true);

        // Clear any existing cart data from session storage
        sessionStorage.removeItem('checkout_data');

        // Prepare checkout parameters
        const checkoutParams = {
            product_slug: product.slug,
            quantity: quantity,
        };

        // Add SKU ID if product has variations and a SKU is selected
        if (product.has_variations && selectedSku) {
            checkoutParams.sku_id = selectedSku.id;
        }

        // Redirect ke halaman checkout dengan query parameters untuk pembelian langsung
        router.visit(
            route('buyer.orders.create', checkoutParams),
            {
                onFinish: () => {
                    setIsBuyingNow(false);
                },
            },
        );
    };

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1) return;
        if (newQuantity > getCurrentStock()) return;
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

            <div className="container mx-auto py-4">
                {/* Desktop Layout: 2 Column Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

                    {/* Left Column: Product Images - Sticky on Desktop */}
                    <div className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
                        <ProductImageGallery
                            product={product}
                            selectedSku={selectedSku}
                            onSkuChange={handleSkuChange}
                        />
                    </div>

                    {/* Right Column: All Product Details */}
                    <div className="space-y-6">
                        {/* Product Info - Compact Layout */}
                        <div className="space-y-4">
                            {/* Product Name and Category */}
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-2">
                                    <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-gray-900 flex-1">{product.name}</h1>
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
                                <p className="text-2xl sm:text-2xl md:text-4xl font-bold text-primary">
                                    {(() => {
                                        const price = getCurrentPrice();
                                        if (typeof price === 'object' && price.min && price.max) {
                                            return `${formatPrice(price.min)} - ${formatPrice(price.max)}`;
                                        }
                                        return formatPrice(price);
                                    })()}
                                </p>

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

                                <p className={`text-sm ${getCurrentStock() > 0 ? 'text-primary' : 'text-red-600'}`}>
                                    {getCurrentStock() > 0 ? (
                                        product.has_variations && !selectedSku ?
                                            `Total stok: ${getCurrentStock()} unit` :
                                            `Stok tersedia: ${getCurrentStock()}`
                                    ) : 'Stok habis'}
                                </p>

                                {/* Variations Section */}
                                {product.has_variations && product.skus && product.skus.length > 0 && (
                                    <div className={`space-y-3 pt-2 ${variationError ? 'border-2 border-red-500 rounded-lg p-2' : ''}`}>
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-700 mb-2">Variasi:</h4>
                                            {variationError && (
                                                <p className="text-red-500 text-xs mb-2">Silakan pilih salah satu variasi</p>
                                            )}
                                            <div className="flex flex-wrap gap-2">
                                                {product.skus.map((sku) => (
                                                    <Button
                                                        key={sku.id}
                                                        variant={selectedSku?.id === sku.id ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => handleSkuSelect(sku)}
                                                        className={`text-xs px-3 py-1 h-7 ${
                                                            sku.stock <= 0 
                                                                ? 'opacity-50 cursor-not-allowed' 
                                                                : 'hover:cursor-pointer'
                                                        }`}
                                                        disabled={sku.stock <= 0}
                                                    >
                                                        {sku.variant_name || sku.sku_code}
                                                        {sku.stock <= 0 && ' (Habis)'}
                                                    </Button>
                                                ))}
                                            </div>
                                            {selectedSku && (
                                                <div className="mt-2 text-xs text-gray-500">
                                                    <p>SKU: {selectedSku.sku_code}</p>
                                                    {selectedSku.weight && (
                                                        <p>Berat: {selectedSku.weight} kg</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quantity Selector - Compact */}
                            {getCurrentStock() > 0 && (
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
                                            max={getCurrentStock()}
                                        />
                                        <Button
                                            onClick={() => handleQuantityChange(quantity + 1)}
                                            disabled={quantity >= getCurrentStock()}
                                            className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 text-sm"
                                        >
                                            +
                                        </Button>
                                        <span className="text-xs text-gray-500 ml-1">Max: {getCurrentStock()}</span>
                                    </div>
                                </div>
                            )}

                            {/* Desktop Action Buttons */}
                            {getCurrentStock() > 0 && (
                                <div className="hidden sm:flex gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 py-2 hover:cursor-pointer"
                                        disabled={getCurrentStock() <= 0 || isAddingToCart}
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
                                        disabled={getCurrentStock() <= 0 || isBuyingNow}
                                        onClick={handleBuyNow}
                                    >
                                        {isBuyingNow ? (
                                            <>
                                                <Package className="mr-2 h-4 w-4 animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            (() => {
                                                const price = getCurrentPrice();
                                                if (typeof price === 'object' && price.min && price.max) {
                                                    return 'Beli Sekarang';
                                                }
                                                return `Beli Sekarang - ${formatPrice(price * quantity)}`;
                                            })()
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
                                <div className="pt-6">
                                    <h3 className="text-lg font-semibold mb-3">Tentang Penjual</h3>
                                    <VendorProfileCard vendor={product.vendor} compact={true} />
                                </div>
                            )}

                            {/* Reviews Section */}
                            <div className="pt-6">
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
                {getCurrentStock() > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white  p-4 shadow-lg sm:hidden">
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 py-3 hover:cursor-pointer"
                                disabled={getCurrentStock() <= 0 || isAddingToCart}
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
                                disabled={getCurrentStock() <= 0 || isBuyingNow}
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
                    <div className="mt-8 pt-6">
                        <h3 className="text-xl font-bold mb-4">Produk Terkait</h3>
                        <ProductList productList={relatedProducts} />
                    </div>
                )}

                {/* Spacer for sticky button */}
                {getCurrentStock() > 0 && <div className="h-20 sm:h-0"></div>}
            </div> {/* Close grid container */}
        </BuyerLayoutWrapper>
    );
}
