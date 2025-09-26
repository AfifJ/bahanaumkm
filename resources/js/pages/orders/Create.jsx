import { Button } from '@/components/ui/button';
import BuyerLayout from '@/layouts/buyer-layout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { Package, MapPin, DollarSign, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OrderCreate() {
    const { flash, product, quantity } = usePage().props;
    const { data, setData, processing, errors } = useForm({
        product_id: product?.id || '',
        quantity: quantity || 1,
        shipping_address: '',
    });

    const [currentQuantity, setCurrentQuantity] = useState(Number(quantity) || 1);
    const [totalAmount, setTotalAmount] = useState(0);
    const [submitError, setSubmitError] = useState('');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    useEffect(() => {
        // Set initial data from props
        if (product) {
            setData('product_id', product.id);
            setData('quantity', quantity || 1);
            setTotalAmount(product.sell_price * (quantity || 1));
        }
    }, [product, quantity]);

    useEffect(() => {
        // Update total when quantity changes
        if (product) {
            setTotalAmount(product.sell_price * currentQuantity);
            setData('quantity', currentQuantity);
        }
    }, [currentQuantity, product]);

    const updateQuantity = (newQuantity) => {
        if (newQuantity < 1) return;
        if (newQuantity > product.stock) return;

        setCurrentQuantity(newQuantity);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitError('');

        // Validate product exists
        if (!product) {
            setSubmitError('Produk tidak ditemukan. Silakan pilih produk terlebih dahulu.');
            return;
        }

        // Validate shipping address
        if (!data.shipping_address.trim()) {
            setSubmitError('Alamat pengiriman harus diisi.');
            return;
        }

        // Validate quantity
        if (currentQuantity < 1) {
            setSubmitError('Jumlah produk harus minimal 1.');
            return;
        }
        if (currentQuantity > product.stock) {
            setSubmitError(`Stok produk hanya tersedia ${product.stock} item.`);
            return;
        }

        const payload = {
            items: [
                {
                    product_id: data.product_id,
                    quantity: currentQuantity,
                },
            ],
            shipping_address: data.shipping_address,
        };

        // Validate payload before sending
        if (!payload.items || payload.items.length < 1) {
            setSubmitError('Harap tambahkan setidaknya satu item ke pesanan.');
            return;
        }

        if (!payload.shipping_address || payload.shipping_address.trim().length < 10) {
            setSubmitError('Alamat pengiriman harus minimal 10 karakter.');
            return;
        }

        console.log('mengirim produk', payload);

        router.post(route('buyer.orders.store'),
            payload, {
            onSuccess: () => {
                console.log('Order created successfully');
            },
            onError: (errorResponse) => {
                console.error('Error creating order:', errorResponse);

                const errorMessages = errorResponse?.errors || {};
                if (errorMessages['items.0.product_id']) {
                    setSubmitError('Terjadi kesalahan dengan produk: ' + errorMessages['items.0.product_id'][0]);
                } else if (errorMessages['items.0.quantity']) {
                    setSubmitError('Terjadi kesalahan dengan jumlah produk: ' + errorMessages['items.0.quantity'][0]);
                } else if (errorMessages.shipping_address) {
                    setSubmitError('Terjadi kesalahan dengan alamat pengiriman: ' + errorMessages.shipping_address[0]);
                } else {
                    setSubmitError('Terjadi kesalahan saat membuat pesanan. Silakan coba lagi.');
                }
            }
        });
    };

    // Jika produk tidak ditemukan
    if (!product) {
        return (
            <BuyerLayout>
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
            </BuyerLayout>
        );
    }

    return (
        <BuyerLayout>
            <Head title="Checkout - Bahana UMKM" />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                    <p className="text-gray-600">Lengkapi informasi untuk menyelesaikan pesanan Anda</p>
                </div>

                {/* Flash Messages */}
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
                    <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
                        {flash.success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Order Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Alamat Pengiriman
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700 mb-2">
                                            Alamat Lengkap *
                                        </label>
                                        <textarea
                                            id="shipping_address"
                                            name="shipping_address"
                                            rows={4}
                                            value={data.shipping_address}
                                            onChange={e => setData('shipping_address', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Masukkan alamat lengkap pengiriman termasuk nama penerima, nomor telepon, dan detail alamat"
                                            required
                                        />
                                        {errors.shipping_address && (
                                            <p className="mt-1 text-sm text-red-600">{errors.shipping_address}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Detail Produk
                                </h2>

                                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                    {product.image_url && (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-20 w-20 rounded-md object-cover"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Stok tersedia: {product.stock}
                                        </p>
                                        <p className="text-lg font-semibold text-gray-900 mt-2">
                                            {formatPrice(product.sell_price)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(currentQuantity - 1)}
                                            disabled={currentQuantity <= 1}
                                            className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-8 text-center font-medium text-lg">{currentQuantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(currentQuantity + 1)}
                                            disabled={currentQuantity >= product.stock}
                                            className="p-2 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <DollarSign className="h-5 w-5 mr-2" />
                                    Ringkasan Pesanan
                                </h2>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">{formatPrice(totalAmount)}</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Ongkos kirim</span>
                                        <span className="font-medium">Gratis</span>
                                    </div>

                                    <div className="border-t pt-3">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Total</span>
                                            <span>{formatPrice(totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="mt-6">
                                    <h3 className="font-medium text-gray-900 mb-3">Metode Pembayaran</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="transfer"
                                                name="payment_method"
                                                value="transfer"
                                                defaultChecked
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="transfer" className="text-sm text-gray-700">
                                                Transfer Bank
                                            </label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="cod"
                                                name="payment_method"
                                                value="cod"
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <label htmlFor="cod" className="text-sm text-gray-700">
                                                Bayar di Tempat (COD)
                                            </label>
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
                                    disabled={processing || !product}
                                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {processing ? 'Memproses...' : 'Buat Pesanan'}
                                </Button>

                                {/* Continue Shopping */}
                                <Link
                                    href={route('home')}
                                    className="w-full mt-3 inline-block text-center text-blue-600 hover:text-blue-800 py-2 border border-blue-600 rounded-md"
                                >
                                    Lanjutkan Belanja
                                </Link>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                                <h3 className="font-medium text-green-800 mb-2">Pembayaran Aman</h3>
                                <p className="text-sm text-green-700">
                                    Transaksi Anda dilindungi dengan sistem keamanan terbaik.
                                    Data pribadi dan pembayaran Anda aman bersama kami.
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </BuyerLayout>
    );
}