import { Button } from '@/components/ui/button';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Package, MapPin, DollarSign, Plus, Minus, X, Clipboard, Wallet } from 'lucide-react';
import { useState, useEffect } from 'react';
import { MitraSelector } from '@/components/mitra-selector';
import { useLocationStorage } from '@/hooks/use-location-storage';

export default function OrderCreate({ flash, product, quantity, sku, cartItems, fromCart, subtotal, mitra, shippingSetting }) {
    const { data, setData, processing, errors } = useForm({
        product_id: product?.id || '',
        quantity: quantity || 1,
        sku_id: sku?.id || null,
        mitra_id: '',
        notes: '',
    });

    const [currentQuantity, setCurrentQuantity] = useState(Number(quantity) || 1);
    const [totalAmount, setTotalAmount] = useState(0);
    const [shippingCost, setShippingCost] = useState(0);
    const [selectedMitra, setSelectedMitra] = useState(null);
    const [submitError, setSubmitError] = useState('');
    const [selectedSku, setSelectedSku] = useState(sku || null);
    const { selectedLocation } = useLocationStorage();

    // Handle cart checkout vs single product
    const isCartCheckout = fromCart && cartItems && cartItems.length > 0;

    const handleMitraSelect = (selectedMitra) => {
        setData('mitra_id', selectedMitra.id);
        setSelectedMitra(selectedMitra);

        // Calculate shipping cost when mitra is selected
        if (selectedMitra && selectedMitra.distance_from_warehouse > 0) {
            const pricePerKm = shippingSetting?.price_per_km || 5000;
            const distanceInKm = selectedMitra.distance_from_warehouse / 1000;
            const calculatedShippingCost = distanceInKm * pricePerKm;
            setShippingCost(calculatedShippingCost);
        } else {
            setShippingCost(0);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    useEffect(() => {
        if (isCartCheckout) {
            // Cart checkout: use subtotal from backend
            setTotalAmount(subtotal || 0);
        } else if (product) {
            // Single product checkout
            setData('product_id', product.id);
            setData('quantity', quantity || 1);
            setData('sku_id', sku?.id || null);

            // Use SKU price if available, otherwise use product price
            const unitPrice = selectedSku ? selectedSku.price : product.sell_price;
            setTotalAmount(unitPrice * (quantity || 1));
        }
    }, [isCartCheckout, product, quantity, sku, selectedSku, subtotal]);

    useEffect(() => {
        // Update total when quantity changes (only for single product)
        if (!isCartCheckout && product) {
            // Use SKU price if available, otherwise use product price
            const unitPrice = selectedSku ? selectedSku.price : product.sell_price;
            setTotalAmount(unitPrice * currentQuantity);
            setData('quantity', currentQuantity);
        }
    }, [currentQuantity, product, selectedSku, isCartCheckout]);

    // Auto-select mitra based on saved location
    useEffect(() => {
        if (selectedLocation && mitra && mitra.length > 0) {
            const savedMitra = mitra.find(item => item.id === selectedLocation.id);
            if (savedMitra) {
                handleMitraSelect(savedMitra);
            }
        }
    }, [selectedLocation, mitra]);

    const updateQuantity = (newQuantity) => {
        if (newQuantity < 1) return;

        // Use SKU stock if available, otherwise use product stock
        const availableStock = selectedSku ? selectedSku.stock : product.stock;
        if (newQuantity > availableStock) return;

        setCurrentQuantity(newQuantity);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitError('');

        // Validate based on checkout type
        if (isCartCheckout) {
            // Cart checkout validation
            if (!cartItems || cartItems.length === 0) {
                setSubmitError('Keranjang Anda kosong.');
                return;
            }

            const payload = {
                items: cartItems.map(item => ({
                    product_id: item.product.id,
                    sku_id: item.sku?.id || null,
                    quantity: item.quantity,
                })),
                mitra_id: data.mitra_id,
                notes: data.notes,
            };

            console.log('🛒 Mengirim pesanan dari keranjang:', payload);

            router.post(route('buyer.orders.store'), payload, {
                onSuccess: () => {
                    console.log('✅ Order created successfully from cart');
                },
                onError: (errorResponse) => {
                    console.error('❌ Error creating order:', errorResponse);
                    const errorMessages = errorResponse?.errors || {};
                    if (Object.keys(errorMessages).length > 0) {
                        const firstError = Object.values(errorMessages)[0];
                        setSubmitError(Array.isArray(firstError) ? firstError[0] : firstError);
                    } else {
                        setSubmitError('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
                    }
                }
            });
        } else {
            // Single product checkout validation
            if (!product) {
                setSubmitError('Produk tidak ditemukan. Silakan pilih produk terlebih dahulu.');
                return;
            }

            if (currentQuantity < 1) {
                setSubmitError('Jumlah produk harus minimal 1.');
                return;
            }

            // Use SKU stock if available, otherwise use product stock
            const availableStock = selectedSku ? selectedSku.stock : product.stock;
            if (currentQuantity > availableStock) {
                setSubmitError(`Stok produk hanya tersedia ${availableStock} item.`);
                return;
            }

            const payload = {
                items: [
                    {
                        product_id: data.product_id,
                        sku_id: data.sku_id,
                        quantity: currentQuantity,
                    },
                ],
                mitra_id: data.mitra_id,
                notes: data.notes,
            };

            console.log('📦 Mengirim pesanan produk tunggal:', payload);

            router.post(route('buyer.orders.store'), payload, {
                onSuccess: () => {
                    console.log('✅ Order created successfully');
                },
                onError: (errorResponse) => {
                    console.error('❌ Error creating order:', errorResponse);
                    const errorMessages = errorResponse?.errors || {};
                    if (errorMessages['items.0.product_id']) {
                        setSubmitError('Terjadi kesalahan dengan produk: ' + errorMessages['items.0.product_id'][0]);
                    } else if (errorMessages['items.0.quantity']) {
                        setSubmitError('Terjadi kesalahan dengan jumlah produk: ' + errorMessages['items.0.quantity'][0]);
                    } else {
                        setSubmitError('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
                    }
                }
            });
        }
    };

    // Jika produk tidak ditemukan (hanya untuk single product checkout)
    if (!isCartCheckout && !product) {
        return (
            <BuyerLayoutWrapper>
                <Head title="Produk Tidak Ditemukan - Bahana UMKM" />
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center py-12">
                        <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Produk Tidak Ditemukan</h1>
                        <p className="text-gray-600 mb-6">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
                        <Link
                            href={route('home')}
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Kembali ke Beranda
                        </Link>
                    </div>
                </div>
            </BuyerLayoutWrapper>
        );
    }

    return (
        <BuyerLayoutWrapper 
            withBottomNav={false} 
            backLink={isCartCheckout ? route('buyer.cart.index') : route('product.show', product)} 
            title={isCartCheckout ? 'Checkout Keranjang' : 'Checkout Pesanan'}
        >
            <Head title="Checkout - Bahana UMKM" />
            <form onSubmit={handleSubmit}>
                <div className="container mx-auto py-2 *:px-4 *:py-4 divide-y-4">
                    {flash?.error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                            {flash.error}
                        </div>
                    )}

                    {/* Submit Error */}
                    {submitError && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700 border border-red-200">
                            {submitError}
                        </div>
                    )}

                    {/* Success Message */}
                    {flash?.success && (
                        <div className="mb-6 rounded-lg bg-primary/10 p-4 text-primary border border-primary/20">
                            {flash.success}
                        </div>
                    )}

                    <div className="">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <MapPin className="h-5 w-5 mr-2" />
                            Pilih Hotel Alamat Pengiriman
                        </h2>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hotel Tujuan *
                            </label>
                            <MitraSelector
                                mitra={mitra || []}
                                onSelect={handleMitraSelect}
                                selectedMitra={selectedMitra}
                            />
                            {errors.mitra_id && (
                                <p className="mt-1 text-sm text-red-600">{errors.mitra_id}</p>
                            )}
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Package className="h-5 w-5 mr-2" />
                            Detail Produk
                        </h2>

                        {isCartCheckout ? (
                            // Multiple products from cart
                            <div className="space-y-3">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex items-start space-x-3 pb-3 border-b last:border-b-0">
                                        <img
                                            src={item.product.primary_image?.url || item.product.image_url || '/placeholder.png'}
                                            alt={item.product.name}
                                            className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-medium text-gray-900">{item.product.name}</h3>

                                            {/* SKU Information */}
                                            {item.sku && (
                                                <div className="mt-1">
                                                    <p className="text-sm text-gray-600">
                                                        Variasi: <span className="font-medium">{item.sku.variant_name}</span>
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        SKU: {item.sku.sku_code}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-2 flex items-center justify-between">
                                                <p className="text-base font-semibold text-gray-900">
                                                    {formatPrice(item.price)}
                                                    <X className='inline-block h-4 w-4 mx-1' />
                                                    {item.quantity}
                                                </p>
                                                <p className="text-sm font-medium text-gray-700">
                                                    = {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Single product
                            <div className="flex items-start space-x-3">
                                <img
                                    src={product.primary_image?.url}
                                    alt={product.name}
                                    className="h-16 w-16 rounded-md object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg text-gray-900">{product.name}</h3>

                                    {/* SKU Information */}
                                    {selectedSku && (
                                        <div className="mt-1">
                                            <p className="text-sm text-gray-600">
                                                Variasi: <span className="font-medium">{selectedSku.variant_name}</span>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                SKU: {selectedSku.sku_code}
                                            </p>
                                            {selectedSku.weight && (
                                                <p className="text-xs text-gray-500">
                                                    Berat: {selectedSku.weight} kg
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="mt-2 flex items-center justify-between">
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatPrice(selectedSku ? selectedSku.price : product.sell_price)}
                                            <X className='inline-block h-4 w-4 mx-1' />
                                            {currentQuantity}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Stok: {selectedSku ? selectedSku.stock : product.stock}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notes Section */}
                    <div className="">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Clipboard className="h-5 w-5 mr-2" />
                            Catatan untuk Penjual (Opsional)
                        </h2>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tulis catatan atau permintaan khusus untuk penjual
                                </label>
                                <textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Contoh: Mohon dikemas dengan hati-hati, atau pesan khusus lainnya..."
                                    rows={4}
                                    maxLength={500}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">
                                        Berikan informasi yang penting untuk penjual
                                    </p>
                                    <p className={`text-xs ${500 - data.notes.length < 50 ? 'text-orange-500' : 'text-gray-500'
                                        }`}>
                                        {500 - data.notes.length} karakter tersisa
                                    </p>
                                </div>
                                {errors.notes && (
                                    <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <div className="">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <Clipboard className="h-5 w-5 mr-2" />
                                Ringkasan Pesanan
                            </h2>

                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-medium">{formatPrice(totalAmount)}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ongkos kirim</span>
                                    <span className="font-medium">
                                        {shippingCost > 0 ? formatPrice(shippingCost) : 'Gratis'}
                                    </span>
                                </div>

                                {selectedMitra && (
                                    <div className="text-sm text-gray-500">
                                        Jarak: {selectedMitra.distance_from_warehouse} meter ({selectedMitra.distance_from_warehouse / 1000} KM)
                                    </div>
                                )}

                                <div className="border-t pt-3">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span>{formatPrice(totalAmount + shippingCost)}</span>
                                    </div>
                                </div>
                            </div>


                            {/* Terms and Conditions */}
                            {/* <div className="mt-6">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="terms"
                                            required
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <label htmlFor="terms" className="text-sm text-gray-700">
                                            Saya menyetujui{' '}
                                            <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                                                syarat dan ketentuan
                                            </Link>
                                        </label>
                                    </div>
                                </div> */}

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={processing || (!isCartCheckout && !product)}
                                className="w-full mt-6 bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {processing ? 'Memproses...' : 'Bayar dengan QRIS'}
                            </Button>

                            {/* Continue Shopping */}
                            <Link
                                href={route('home')}
                                className="w-full mt-3 inline-block text-center text-blue-600 hover:text-blue-800 py-2 border border-blue-600 rounded-md"
                            >
                                Lanjutkan Belanja
                            </Link>
                        </div>

                        {/* Payment Notice */}
                        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                            <h3 className="font-medium text-blue-800 mb-2">Metode Pembayaran</h3>
                            <p className="text-sm text-blue-700">
                                Pembayaran menggunakan QRIS. Setelah membuat pesanan, Anda akan diarahkan ke halaman pembayaran untuk scan QR code.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </BuyerLayoutWrapper >
    );
}
