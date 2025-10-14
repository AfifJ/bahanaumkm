import BuyerLayoutWrapper from "@/layouts/buyer-layout-wrapper"
import { Heart, Package } from "lucide-react"
import { Head, Link, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect } from "react"
import { route } from 'ziggy-js'

const Wishlist = ({ wishlists, flash }) => {
    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const getImageUrl = (product) => {
        // Try primary_image first (new system)
        if (product.primary_image?.image_path) {
            return '/storage/' + product.primary_image.image_path;
        }

        // Try images array (new system)
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            const firstImage = product.images.find(img => img && img.image_path);
            if (firstImage) {
                return '/storage/' + firstImage.image_path;
            }
        }

        // Fallback: legacy image_url field (old system)
        if (product.image_url) {
            return product.image_url;
        }

        return null;
    };
    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleRemoveFromWishlist = (productId) => {
        router.delete(route('buyer.wishlist.destroy', { product: productId }), {
            onSuccess: () => {
                toast.success('Produk berhasil dihapus dari wishlist');
            },
            onError: (errors) => {
                toast.error(errors?.error || 'Gagal menghapus produk dari wishlist');
            },
        });
    };

  
    if (wishlists.length === 0) {
        return (
            <BuyerLayoutWrapper backLink={route('buyer.profile.index')} title="Wishlist">
                <Head title="Wishlist" />
                <div className="flex justify-center flex-col items-center my-20">
                    <Heart className="h-20 text-red-600 w-20 my-8" />
                    <span className="text-xl mb-4">
                        Wishlist Anda kosong
                    </span>
                    <p className="text-gray-600 text-center mb-8">
                        Tambahkan produk favorit Anda ke wishlist untuk menyimpannya di sini.
                    </p>
                    <Button onClick={() => router.visit(route('home'))}>
                        Jelajahi Produk
                    </Button>
                </div>
            </BuyerLayoutWrapper>
        )
    }

    return (
        <BuyerLayoutWrapper backLink={route('buyer.profile.index')} title="Wishlist">
            <Head title="Wishlist" />
            <div className="container mx-auto px-3 py-4">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {wishlists.map((wishlist) => {
                        const imageUrl = getImageUrl(wishlist.product);

                        return (
                        <div key={wishlist.id} className="relative group">
                            <Link href={route('product.show', wishlist.product)} preserveScroll>
                                <div className="p-0 gap-1 group overflow-hidden rounded">
                                    <div className="p-0 rounded overflow-hidden relative bg-gray-100">
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={wishlist.product.name}
                                                className="aspect-square w-full object-contain"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.parentElement.innerHTML = `
                                                        <div class="flex aspect-square w-full items-center justify-center bg-gray-100">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400">
                                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                                <polyline points="3.27 6.96 12 13.44 20.73 6.96"></polyline>
                                                                <line x1="12" y1="2" x2="12" y2="22"></line>
                                                            </svg>
                                                        </div>
                                                    `;
                                                }}
                                            />
                                        ) : (
                                            <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400">
                                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                    <polyline points="3.27 6.96 12 13.44 20.73 6.96"></polyline>
                                                    <line x1="12" y1="2" x2="12" y2="22"></line>
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="py-3">
                                        <h3 className="line-clamp-2 h-5 text-sm font-medium text-gray-900">
                                            {wishlist.product.name}
                                        </h3>
                                        <p className="mt-2 text-lg font-bold text-primary">{formatPrice(wishlist.product.sell_price)}</p>
                                        <p className="text-xs text-gray-500 truncate">oleh {wishlist.product.vendor}</p>
                                        <p className={`text-xs mt-1 ${wishlist.product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            Stok: {wishlist.product.stock ?? 'Stok habis'}
                                        </p>
                                    </div>
                                </div>
                            </Link>

                            {/* Love Button - Top Right Corner */}
                            <div className="absolute top-2 right-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 bg-white/90 backdrop-blur-sm"
                                    onClick={() => handleRemoveFromWishlist(wishlist.product.id)}
                                >
                                    <Heart className="h-4 w-4 fill-current" />
                                </Button>
                            </div>
                        </div>
                        );
                    })}
                </div>
            </div>
        </BuyerLayoutWrapper>
    )
}

export default Wishlist
