import { Button } from '@/components/ui/button';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, CreditCard, Image, Upload, CheckCircle } from 'lucide-react';
import { useState, useRef } from 'react';

export default function PaymentShow({ order, qrisImage }) {
    // Debug: Log order data to verify values
    console.log('🔍 Payment Page - Order Data:', {
        order_id: order.id,
        order_code: order.order_code,
        total_amount: order.total_amount,
        shipping_cost: order.shipping_cost,
        subtotal: order.total_amount - order.shipping_cost,
        status: order.status
    });

    const { data, setData, post, processing, errors } = useForm({
        payment_proof: null,
    });

    const [preview, setPreview] = useState(null);
    const [uploaded, setUploaded] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('payment_proof', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleDivClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('payment_proof', data.payment_proof);

        router.post(route('buyer.payment.upload', order.id), formData, {
            onSuccess: () => {
                setUploaded(true);
            },
            onError: (errors) => {
                console.error('Upload failed:', errors);
            }
        });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (uploaded) {
        return (
            <BuyerLayoutWrapper withBottomNav={false} backLink={route('buyer.orders.show', order.id)} title="Pembayaran Berhasil">
                <Head title={`Pembayaran - ${order.order_code}`} />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-md mx-auto text-center">
                        <div className="mb-6">
                            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Pembayaran Berhasil Diunggah!
                        </h1>
                        <p className="text-gray-600 mb-8">
                            Bukti pembayaran Anda telah berhasil diunggah.
                            Admin akan memvalidasi pembayaran Anda dalam waktu 1x24 jam.
                        </p>

                        <div className="bg-green-50 rounded-lg p-4 mb-8">
                            <h3 className="font-semibold text-green-800 mb-2">No. Pesanan</h3>
                            <p className="text-green-700">{order.order_code}</p>
                        </div>

                        <div className="space-y-4">
                            <Button asChild className="w-full">
                                <Link href={route('buyer.orders.show', order.id)}>
                                    Lihat Detail Pesanan
                                </Link>
                            </Button>
                            <Button variant="outline" asChild className="w-full">
                                <Link href={route('buyer.orders.index')}>
                                    Lihat Semua Pesanan
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </BuyerLayoutWrapper>
        );
    }

    return (
        <BuyerLayoutWrapper withBottomNav={false} backLink={route('buyer.orders.show', order.id)} title="Pembayaran QRIS">
            <Head title={`Pembayaran - ${order.order_code}`} />

            <div className="container mx-auto px-4 py-6">
                {/* Order Info */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">
                        Pembayaran QRIS
                    </h1>
                    <div className="text-sm text-gray-600">
                        No. Pesanan: <span className="font-medium">{order.order_code}</span>
                    </div>
                </div>

                {/* QRIS Code Section */}
                <div className="bg-white rounded-lg border p-6 mb-6">
                    <div className="text-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">
                            Scan QRIS untuk Pembayaran
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Total pembayaran: <span className="font-bold text-lg text-green-600">
                                {formatPrice(order.total_amount)}
                            </span>
                        </p>
                    </div>

                    {/* QRIS Code Image */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-gray-100 p-4 rounded-lg">
                            <img
                                src={`/storage/${qrisImage}`}
                                alt="QRIS Code"
                                className="w-64 h-64 object-contain"
                                onError={(e) => {
                                    // Fallback if image doesn't exist
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00OCA0OEgxNjhWNDhINDhWNjRIODRIMTI4VjQ4SDQ4WiIgZmlsbD0iIzAwMDAwMCIvPgo8cGF0aCBkPSJNNjQgNjRIMTkyVjE5Mkg2NFY2NFpNNDggOTZIMTkyVjEyOEg0OFY5NlpNNDggMTI4SDE5MlYxNjBINDhWMTI4WiIvPgo8L3N2Zz4=';
                                }}
                            />
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">1. Scan QRIS di atas menggunakan aplikasi e-wallet</p>
                        <p className="mb-2">2. Masukkan nominal pembayaran: <span className="font-bold">{formatPrice(order.total_amount)}</span></p>
                        <p>3. Simpan bukti pembayaran dan unggah di bawah</p>
                    </div>
                </div>

                {/* Upload Payment Proof */}
                <div className="bg-white rounded-lg border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        Upload Bukti Pembayaran
                    </h2>

                    {!preview ? (
                        <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                            onClick={handleDivClick}
                        >
                            <Image className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <div className="mb-4">
                                <Button variant="outline" type="button" className="mb-2">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Pilih File Bukti Pembayaran
                                </Button>
                                <p className="text-sm text-gray-500">
                                    PNG, JPG, JPEG up to 5MB
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                id="payment_proof"
                                name="payment_proof"
                                type="file"
                                accept="image/jpeg,image/jpg,image/png"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="mb-4">
                            <img
                                src={preview}
                                alt="Payment proof preview"
                                className="w-full max-w-md mx-auto rounded-lg border"
                            />
                            <div className="text-center mt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setPreview(null);
                                        setData('payment_proof', null);
                                    }}
                                >
                                    Ganti Gambar
                                </Button>
                            </div>
                        </div>
                    )}

                    {errors.payment_proof && (
                        <p className="text-red-500 text-sm mt-2">{errors.payment_proof}</p>
                    )}

                    <Button
                        onClick={handleSubmit}
                        disabled={!data.payment_proof || processing}
                        className="w-full mt-4"
                    >
                        {processing ? 'Mengunggah...' : 'Upload Bukti Pembayaran'}
                    </Button>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Ringkasan Pesanan</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tanggal Pesan</span>
                            <span className="font-medium">{formatDate(order.created_at)}</span>
                        </div>
                        {order.mitra && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Tujuan Pengiriman</span>
                                <span className="font-medium">{order.mitra.hotel_name}</span>
                            </div>
                        )}
                        <div className="border-t pt-2 mt-2">
                            <div className="space-y-1">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal Produk</span>
                                    <span className="font-medium">{formatPrice(order.total_amount - order.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ongkos Kirim</span>
                                    <span className="font-medium">{formatPrice(order.shipping_cost)}</span>
                                </div>
                                <div className="flex justify-between font-semibold text-base border-t pt-2 mt-2">
                                    <span>Total Pembayaran</span>
                                    <span className="text-green-600">{formatPrice(order.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </BuyerLayoutWrapper>
    );
}
