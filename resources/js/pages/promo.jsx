import GuestLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';
import { Megaphone } from 'lucide-react';

export default function Promo() {
    return (
        <GuestLayout>
            <Head title="Promo - Bahana UMKM" />
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <Megaphone size={64} className="text-orange-400 mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Promo & Diskon</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Halaman promo sedang dalam pengembangan! Segera akan ada berbagai penawaran 
                        menarik dan diskon spesial untuk Anda.
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md">
                        <h2 className="text-lg font-semibold text-orange-800 mb-2">Yang akan datang:</h2>
                        <ul className="text-left text-orange-700 space-y-2">
                            <li>• Diskon harian & mingguan</li>
                            <li>• Flash sale dengan harga spesial</li>
                            <li>• Promo bundle produk UMKM</li>
                            <li>• Program loyalitas pelanggan</li>
                            <li>• Voucher cashback menarik</li>
                        </ul>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
