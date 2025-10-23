import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, Plus, Minus, ShoppingBag, Trash2, CreditCard, Package, X } from 'lucide-react';
import { useState } from 'react';

export default function CartIndex({ cartItems, subtotal, formatted_subtotal, itemCount }) {
    const { flash, auth } = usePage().props;
    const [updatingItems, setUpdatingItems] = useState(new Set());

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const getImageUrl = (product) => {
        if (product.primaryImage?.url) {
            return product.primaryImage.url;
        }
        return null;
    };

    const handleUpdateQuantity = async (cartId, newQuantity) => {
        if (newQuantity < 1) return;

        setUpdatingItems(prev => new Set(prev).add(cartId));

        try {
            const response = await router.patch(route('buyer.cart.update', cartId), {
                quantity: newQuantity
            });

            // Cart data will be refreshed automatically via Inertia
        } catch (error) {
            console.error('Failed to update quantity:', error);
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(cartId);
                return newSet;
            });
        }
    };

    const handleRemoveItem = async (cartId) => {
        try {
            await router.delete(route('buyer.cart.destroy', cartId));
        } catch (error) {
            console.error('Failed to remove item:', error);
        }
    };

    const handleClearCart = async () => {
        try {
            await router.delete(route('buyer.cart.clear'));
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    };

    const handleCheckout = () => {
        console.log('🛒 Checkout clicked');
        console.log('Route:', route('buyer.cart.checkout'));
        
        router.get(route('buyer.cart.checkout'), {}, {
            onSuccess: () => {
                console.log('✅ Checkout redirect successful');
            },
            onError: (errors) => {
                console.error('❌ Checkout error:', errors);
            }
        });
    };

    const getStockStatus = (item) => {
        // Use SKU stock if available, otherwise use product stock
        const stock = item.sku?.stock ?? item.product.stock;
        
        if (stock <= 0) return 'out_of_stock';
        if (stock < 5) return 'low_stock';
        return 'in_stock';
    };

    const getStockStatusColor = (status) => {
        switch (status) {
            case 'out_of_stock': return 'text-red-600 bg-red-50';
            case 'low_stock': return 'text-yellow-600 bg-yellow-50';
            default: return 'text-green-600 bg-green-50';
        }
    };

    const getStockStatusText = (status) => {
        switch (status) {
            case 'out_of_stock': return 'Habis';
            case 'low_stock': return 'Tersisa Sedikit';
            default: return 'Tersedia';
        }
    };

    // Determine layout based on user role
    const Layout = auth?.user?.role_id === 5 ? BuyerLayoutWrapper : GuestLayout;

    return (
        <Layout title={'Keranjang Belanja'} backLink={route('home')}>
            <Head title="Keranjang Belanja - Bahana UMKM" />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    {cartItems.length > 0 && (
                        <div className="flex items-center space-x-3">
                            <ConfirmationDialog
                                title="Kosongkan Keranjang"
                                description="Apakah Anda yakin ingin mengosongkan keranjang Anda?"
                                confirmText="Kosongkan"
                                cancelText="Batal"
                                variant="destructive"
                                onConfirm={handleClearCart}
                            >
                                <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Kosongkan
                                </Button>
                            </ConfirmationDialog>
                        </div>
                    )}
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {flash.error}
                    </div>
                )}

                {cartItems.length === 0 ? (
                    <div className="text-center py-16">
                        <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-6" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Keranjang Anda Kosong
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Belum ada produk yang ditambahkan ke keranjang belanja Anda.
                        </p>
                        <Button asChild>
                            <Link href="/">
                                <Package className="h-4 w-4 mr-2" />
                                Mulai Belanja
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Cart Items */}
                        <div className="space-y-4">
                            {cartItems.map((item) => {
                                const stockStatus = getStockStatus(item);
                                const imageUrl = getImageUrl(item.product);

                                return (
                                    <div key={item.id} className="bg-white rounded-lg shadow p-4">
                                        <div className="flex items-start space-x-4">
                                            {/* Product Image */}
                                            <div className="flex-shrink-0">
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={item.product.name}
                                                        className="h-24 w-24 object-cover rounded-md border"
                                                    />
                                                ) : (
                                                    <div className="h-24 w-24 bg-gray-200 rounded-md border flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={route('product.show', item.product.slug || item.product.id)}
                                                            className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
                                                        >
                                                            {item.product.name}
                                                        </Link>
                                                        
                                                        {/* Variation Info */}
                                                        {item.sku && (
                                                            <div className="mt-1 flex items-center gap-2">
                                                                <Badge variant="outline" className="text-xs">
                                                                    {item.sku.variant_name || item.variation_summary}
                                                                </Badge>
                                                                {item.sku.sku_code && (
                                                                    <span className="text-xs text-gray-500">
                                                                        SKU: {item.sku.sku_code}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                        
                                                        <div className="mt-2">
                                                            <p className="text-lg font-bold text-gray-900">
                                                                {formatPrice(item.sku?.price || item.product.sell_price)}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                Per item
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="text-right ml-4">
                                                        <div className="text-lg font-bold text-gray-900">
                                                            {formatPrice(item.subtotal)}
                                                        </div>
                                                        <p className="text-sm text-gray-500">
                                                            Subtotal
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Stock Status */}
                                                <div className="mt-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={getStockStatusColor(stockStatus)}
                                                    >
                                                        {getStockStatusText(stockStatus)} ({item.sku?.stock || item.product.stock})
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-sm text-gray-600">Jumlah:</span>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const value = parseInt(e.target.value) || 1;
                                                            handleUpdateQuantity(item.id, value);
                                                        }}
                                                        className="w-16 text-center"
                                                        min="1"
                                                        max={item.sku?.stock || item.product.stock}
                                                        disabled={updatingItems.has(item.id)}
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= (item.sku?.stock || item.product.stock) || updatingItems.has(item.id)}
                                                        className="w-8 h-8 p-0"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <ConfirmationDialog
                                                title="Hapus Item"
                                                description="Apakah Anda yakin ingin menghapus produk ini dari keranjang?"
                                                confirmText="Hapus"
                                                cancelText="Batal"
                                                variant="destructive"
                                                onConfirm={() => handleRemoveItem(item.id)}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Hapus
                                                </Button>
                                            </ConfirmationDialog>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Summary */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-lg font-medium text-gray-900">Subtotal:</span>
                                <span className="text-lg font-bold text-gray-900">
                                    {formatted_subtotal}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-4">
                                Subtotal ini belum termasuk biaya pengiriman dan lainnya.
                            </p>
                            <div className="flex space-x-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.get('/')}
                                >
                                    Lanjut Belanja
                                </Button>
                                <Button
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={handleCheckout}
                                >
                                    <CreditCard className="h-4 w-4 mr-2" />
                                    Checkout
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}