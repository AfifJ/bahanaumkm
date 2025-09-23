import BuyerLayout from '@/layouts/buyer-layout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ShoppingCart, Package, MapPin, DollarSign, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OrderCreate() {
    const { flash } = usePage().props;
    const { post, processing, errors } = useForm({
        items: [],
        shipping_address: '',
    });

    const [cartItems, setCartItems] = useState([]);
    const [totalAmount, setTotalAmount] = useState(0);

    // Load cart items from session storage or use sample data
    useEffect(() => {
        const checkoutData = sessionStorage.getItem('checkout_data');
        
        if (checkoutData) {
            try {
                const data = JSON.parse(checkoutData);
                const items = data.items.map((item, index) => ({
                    id: index + 1,
                    product_id: item.product_id,
                    name: item.product?.name || 'Produk',
                    image_url: item.product?.image_url || '/images/placeholder-product.jpg',
                    sell_price: item.product?.sell_price || 0,
                    quantity: item.quantity,
                    stock: item.product?.stock || 0
                }));
                
                setCartItems(items);
                
                // Calculate total
                const total = items.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0);
                setTotalAmount(total);
                
                // Clear session storage after loading
                sessionStorage.removeItem('checkout_data');
            } catch (error) {
                console.error('Error parsing checkout data:', error);
                // Fallback to sample data
                loadSampleData();
            }
        } else {
            // Load sample data if no checkout data
            loadSampleData();
        }
    }, []);

    const loadSampleData = () => {
        const sampleItems = [
            {
                id: 1,
                product_id: 1,
                name: 'Produk Sample 1',
                image_url: '/images/sample1.jpg',
                sell_price: 100000,
                quantity: 2,
                stock: 10
            },
            {
                id: 2,
                product_id: 2,
                name: 'Produk Sample 2',
                image_url: '/images/sample2.jpg',
                sell_price: 150000,
                quantity: 1,
                stock: 5
            }
        ];
        setCartItems(sampleItems);
        
        // Calculate total
        const total = sampleItems.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0);
        setTotalAmount(total);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const updateQuantity = (id, newQuantity) => {
        if (newQuantity < 1) return;
        
        setCartItems(prevItems => {
            const updatedItems = prevItems.map(item => 
                item.id === id 
                    ? { ...item, quantity: Math.min(newQuantity, item.stock) }
                    : item
            );
            
            // Recalculate total
            const total = updatedItems.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0);
            setTotalAmount(total);
            
            return updatedItems;
        });
    };

    const removeItem = (id) => {
        setCartItems(prevItems => {
            const updatedItems = prevItems.filter(item => item.id !== id);
            
            // Recalculate total
            const total = updatedItems.reduce((sum, item) => sum + (item.sell_price * item.quantity), 0);
            setTotalAmount(total);
            
            return updatedItems;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Prepare items for submission
        const items = cartItems.map(item => ({
            product_id: item.product_id,
            quantity: item.quantity
        }));

        post(route('buyer.orders.store'), {
            items,
            shipping_address: useForm().data.shipping_address
        });
    };

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
                                            value={useForm().data.shipping_address}
                                            onChange={e => useForm().setData('shipping_address', e.target.value)}
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

                            {/* Order Items */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Produk yang Dipesan
                                </h2>
                                
                                {cartItems.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-gray-600">Keranjang belanja Anda kosong</p>
                                        <Link
                                            href={route('home')}
                                            className="inline-block mt-4 text-blue-600 hover:text-blue-800"
                                        >
                                            Mulai Belanja
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                                {item.image_url && (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}
                                                        className="h-16 w-16 rounded-md object-cover"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        Stok tersedia: {item.stock}
                                                    </p>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {formatPrice(item.sell_price)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-50"
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                        className="p-1 rounded-full border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-gray-900">
                                                        {formatPrice(item.sell_price * item.quantity)}
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
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

                                {/* Payment Method (Placeholder) */}
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
                                <div className="mt-6">
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
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing || cartItems.length === 0}
                                    className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {processing ? 'Memproses...' : 'Buat Pesanan'}
                                </button>

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
