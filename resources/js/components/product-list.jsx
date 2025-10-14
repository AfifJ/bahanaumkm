import { Link } from "@inertiajs/react"
import { Package } from "lucide-react"

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