import { Link } from "@inertiajs/react"

const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);
};

const ProductList = ({ productList }) => {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {productList.map((product) => (
                <Link key={product.id} preserveScroll href={route('product.show', product.slug)}>
                    <div className="p-0 gap-1 group overflow-hidden rounded">
                        <div className="p-0 rounded overflow-hidden">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="aspect-square w-full object-cover"
                                />
                            ) : (
                                <div className="flex aspect-square w-full items-center justify-center bg-gray-100">
                                    <span className="text-gray-400">📦</span>
                                </div>
                            )}
                        </div>
                        <div className="py-3">
                            <h3 className="line-clamp-2 h-5 text-sm font-medium text-gray-900 group-hover:text-primary">
                                {product.name}
                            </h3>
                            <p className="mt-2 text-lg font-bold">{formatPrice(product.sell_price)}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>

    )
}
export default ProductList