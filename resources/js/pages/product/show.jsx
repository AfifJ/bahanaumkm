import { Breadcrumbs } from '@/components/breadcrumbs';
import ProductList from '@/components/product-list';
import ScrollToTop from '@/components/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import BuyerLayoutNonSearch from '@/layouts/buyer-layout-non-search';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { useState } from 'react';

export default function ProductShow({ product, relatedProducts, layout }) {
    const LayoutComponent = GuestLayout;
    const [quantity, setQuantity] = useState(1);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isBuyingNow, setIsBuyingNow] = useState(false);

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
            const response = await fetch(route('buyer.cart.add'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    product_id: product.id,
                    quantity: quantity,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // Show success message
                alert('Produk berhasil ditambahkan ke keranjang!');
            } else {
                alert(result.error || 'Gagal menambahkan produk ke keranjang');
            }
        } catch (error) {
            alert('Terjadi kesalahan saat menambahkan ke keranjang');
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

    return (
        <BuyerLayoutNonSearch backLink={route('home')} title={'Detail Produk'} >
            <ScrollToTop />
            <Head title={product.name} />

            <div className="container mx-auto px-4 py-8">
                {/* Breadcrumb */}
                {/*  <div className="mb-6">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: 'Home', href: route('home') },
                            { title: 'Kategori', href: route('category.index') },
                            {
                                title: product.category?.name || 'Kategori',
                                href: product.category ? route('category.show', product.category.slug) : '#',
                            },
                            { title: product.name },
                        ]}
                    />
                </div> */}

                <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Product Image */}
                    <div>
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-96 aspect-square rounded-lg object-cover shadow-md" />
                        ) : (
                            <div className="flex h-96 w-full items-center justify-center rounded-lg bg-gray-200 shadow-md">
                                <span className="text-gray-500">Gambar Tidak Tersedia</span>
                            </div>
                        )}
                    </div>

                    {/* Product Details */}
                    <div>
                        <h1 className="mb-4 text-3xl font-bold text-gray-900">{product.name}</h1>

                        <div className="mb-6">
                            <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                                {product.category?.name}
                            </span>
                            <p className="text-sm text-gray-600">Oleh: {product.vendor?.name || 'Vendor'}</p>
                        </div>

                        <div className="mb-6">
                            <p className="mb-2 text-4xl font-bold text-green-600">{formatPrice(product.sell_price)}</p>
                            <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {product.stock > 0 ? `Stok tersedia: ${product.stock}` : 'Stok habis'}
                            </p>
                        </div>

                        <div className="mb-6">
                            <h3 className="mb-2 text-lg font-semibold">Varian</h3>
                            <p className="leading-relaxed text-gray-700">Varian a b c</p>
                        </div>

                        {/* Quantity Selector */}
                        {product.stock > 0 && (
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Jumlah:</label>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={quantity <= 1}
                                        className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        -
                                    </Button>
                                    <Input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => handleQuantityChange(Number(e.target.value))}
                                        className="w-16 border-0 text-center shadow-none"
                                        min="1"
                                        max={product.stock}
                                    />
                                    <Button
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={quantity >= product.stock}
                                        className="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        +
                                    </Button>
                                    <span className="ml-2 text-sm text-gray-500">Max: {product.stock}</span>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-4 sm:flex-row">
                            {/* <Button size="lg" className="flex-1 py-3" disabled={product.stock <= 0 || isAddingToCart} onClick={handleAddToCart}>
                                {isAddingToCart ? (
                                    <>
                                        <Package className="mr-2 h-4 w-4 animate-spin" />
                                        Menambahkan...
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        {product.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
                                    </>
                                )}
                            </Button>*/}
                            <Button
                                size="lg"
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
                                    'Beli Sekarang'
                                )}
                            </Button>
                        </div>

                    </div>

                    <div className="mb-6">
                        <h3 className="mb-2 text-lg font-semibold">Deskripsi Produk | Ulasan</h3>
                        <p className="leading-relaxed text-gray-700">{product.description || 'Tidak ada deskripsi produk.'}</p>
                    </div>
                </div>

                {relatedProducts.length > 0 && (
                    <ProductList productList={relatedProducts} />
                )}
            </div>
        </BuyerLayoutNonSearch>
    );
}
