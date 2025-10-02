import ProductList from '@/components/product-list';
import ScrollToTop from '@/components/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BuyerLayoutNonSearch from '@/layouts/buyer-layout-non-search';
import { Head, router } from '@inertiajs/react';
import { Package, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ProductShow({ product, relatedProducts, layout, flash, isInWishlist: initialIsInWishlist }) {
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);
    const [isInWishlist, setIsInWishlist] = useState(initialIsInWishlist || false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

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

    const handleAddToCart = () => {
        if (product.stock <= 0) return;

        setIsAddingToCart(true);
        router.post(route('buyer.cart.add'), {
            product_id: product.id,
            quantity: quantity,
        }, {
            onSuccess: () => {
                toast.success('Produk berhasil ditambahkan ke keranjang!');
                setIsAddingToCart(false);
            },
            onError: (errors) => {
                toast.error(errors?.error || 'Gagal menambahkan produk ke keranjang');
                setIsAddingToCart(false);
            },
        });
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

    return (
        <BuyerLayoutNonSearch withBottomNav={false} backLink={route('home')} title={'Detail Produk'} >
            <ScrollToTop />
            <Head title={product.name} />

            <div className="container mx-auto px-4 py-4">
                {/* Product Image - Compact for Mobile */}
                <div className="mb-4 relative">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-64 sm:h-80 md:h-96 aspect-square rounded-lg object-cover shadow-sm"
                        />
                    ) : (
                        <div className="flex h-64 sm:h-80 md:h-96 w-full items-center justify-center rounded-lg bg-gray-100">
                            <span className="text-gray-500 text-sm">Gambar Tidak Tersedia</span>
                        </div>
                    )}

                    {/* Wishlist Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
                        onClick={handleWishlistToggle}
                        disabled={isWishlistLoading}
                    >
                        <Heart
                            className={`h-5 w-5 ${isInWishlist ? 'fill-red-600 text-red-600' : 'text-gray-600'}`}
                        />
                    </Button>
                </div>

                {/* Product Info - Compact Layout */}
                <div className="space-y-4 mb-6">
                    {/* Product Name and Category */}
                    <div>
                        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span className="inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                {product.category?.name}
                            </span>
                            <span>•</span>
                            <span>Oleh: {product.vendor?.name || 'Vendor'}</span>
                        </div>
                    </div>

                    {/* Price and Stock */}
                    <div className="space-y-1">
                        <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600">{formatPrice(product.sell_price)}</p>
                        <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
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

                    {/* Product Description */}
                    <div className="pt-2">
                        <h3 className="text-lg font-semibold mb-2">Deskripsi Produk</h3>
                        <p className="text-sm leading-relaxed text-gray-700">{product.description || 'Tidak ada deskripsi produk.'}</p>
                    </div>
                </div>

                {/* Sticky Action Button for Mobile */}
                {product.stock > 0 && (
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg sm:hidden">
                        <Button
                            size="lg"
                            className="w-full py-3 hover:cursor-pointer"
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

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-8">
                        <ProductList productList={relatedProducts} />
                    </div>
                )}

                {/* Spacer for sticky button */}
                {product.stock > 0 && <div className="h-20 sm:h-0"></div>}
            </div>
        </BuyerLayoutNonSearch>
    );
}
