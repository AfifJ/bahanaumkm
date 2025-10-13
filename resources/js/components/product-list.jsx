import { Link } from "@inertiajs/react"

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
};

const ProductList = ({ productList }) => {
    const getImageUrl = (product) => {
        // Try primaryImage first (new system)
        if (product.primaryImage?.url) {
            return product.primaryImage.url;
        }

        // Fallback to legacy image_url
        if (product.image_url) {
            return product.image_url;
        }

        return null;
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {productList.map((product) => {
                const imageUrl = getImageUrl(product);

                return (
                    <Link className="w-full" key={product.id} preserveScroll href={route('product.show', product.slug)}>
                        <div className="p-0 gap-1 group overflow-hidden rounded">
                            <div className="p-0 rounded overflow-hidden relative bg-gray-100">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="aspect-square w-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                                        <span className="text-gray-400">📦</span>
                                    </div>
                                )}
                            </div>
                            <div className="py-3">
                                <h3 className="line-clamp-2 h-5 text-sm font-medium text-gray-900">
                                    {product.name}
                                </h3>
                                <p className="mt-2 text-lg font-bold text-primary">{formatPrice(product.sell_price)}</p>
                                <p className="text-xs text-gray-500 truncate">oleh {product.vendor?.name || 'Vendor'}</p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    )
}
export default ProductList