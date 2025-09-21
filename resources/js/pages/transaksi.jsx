import GuestLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';
import { Construction } from 'lucide-react';

export default function Transaksi() {
    return (
        <GuestLayout>
            <Head title="Transaksi - Bahana UMKM" />
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <Construction size={64} className="text-gray-400 mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Fitur Transaksi</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Fitur transaksi akan segera hadir! Kami sedang mengembangkan sistem pembayaran 
                        yang aman dan mudah untuk Anda.
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md">
                        <h2 className="text-lg font-semibold text-blue-800 mb-2">Apa yang akan tersedia?</h2>
                        <ul className="text-left text-blue-700 space-y-2">
                            <li>• Pembayaran dengan berbagai metode</li>
                            <li>• Riwayat transaksi lengkap</li>
                            <li>• Notifikasi status pembayaran</li>
                            <li>• Sistem keamanan terjamin</li>
                        </ul>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
