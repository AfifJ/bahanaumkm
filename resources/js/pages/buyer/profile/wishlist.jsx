import BuyerLayoutNonSearch from "@/layouts/buyer-layout-non-search"
import { Heart } from "lucide-react"
import { Head, Link, router } from "@inertiajs/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useEffect } from "react"

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

    const handleProductClick = (productSlug) => {
        router.visit(route('products.show', productSlug));
    };

    if (wishlists.length === 0) {
        return (
            <BuyerLayoutNonSearch title="Wishlist">
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
            </BuyerLayoutNonSearch>
        )
    }

    return (
        <BuyerLayoutNonSearch title="Wishlist">
            <Head title="Wishlist" />
            <div className="container mx-auto px-3 py-4">
                <div className="space-y-3">
                    {wishlists.map((wishlist) => (
                        <Link href={route('product.show', wishlist.product)} key={wishlist.id} className="bg-white rounded-lg overflow-hidden">
                            <div className="flex items-center">
                                {/* Product Image - Aspect Square */}
                                <div
                                    className="w-20 h-20 bg-gray-100 cursor-pointer flex-shrink-0"
                                    onClick={() => handleProductClick(wishlist.product.slug)}
                                >
                                    {wishlist.product.image_url ? (
                                        <img
                                            src={wishlist.product.image_url}
                                            alt={wishlist.product.name}
                                            className="w-full h-full rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <span className="text-gray-500 text-xs">No Image</span>
                                        </div>
                                    )}
                                </div>

                                {/* Product Info - Compact */}
                                <div className="flex-1 p-3">
                                    <div
                                        className="cursor-pointer mb-1"
                                        onClick={() => handleProductClick(wishlist.product.slug)}
                                    >
                                        <h3 className="font-medium text-gray-900 line-clamp-2 text-sm leading-tight hover:text-blue-600">
                                            {wishlist.product.name}
                                        </h3>
                                    </div>

                                    <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                        {/* <span className="inline-block rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-800">
                                            {wishlist.product.category}
                                        </span> */}
                                        <span className="text-gray-400">•</span>
                                        <span className="truncate">Oleh: {wishlist.product.vendor}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <p className="text-base font-bold text-green-600">
                                            {formatPrice(wishlist.product.sell_price)}
                                        </p>
                                        <p className={`text-xs ${wishlist.product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            Stok: {wishlist.product.stock ?? 'Stok habis'}
                                        </p>
                                    </div>
                                </div>

                                {/* Love Button - Right Side */}
                                <div className="pr-3">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                                        onClick={() => handleRemoveFromWishlist(wishlist.product.id)}
                                    >
                                        <Heart className="h-4 w-4 fill-current" />
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </BuyerLayoutNonSearch>
    )
}

export default Wishlist
