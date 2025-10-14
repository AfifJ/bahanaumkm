import { NavbarNonSearch } from '@/components/ui/navbar-04/non-search';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import GuestLayout from '@/layouts/guest-layout';
import { Head } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Megaphone } from 'lucide-react';

export default function Promo() {
    return (
        <BuyerLayoutWrapper navbar={false} backLink={route('home')} title={'Promo & Diskon'}>
            <Head title="Promo - Bahana UMKM" />
            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <Megaphone size={64} className="text-orange-400 mb-6" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Promo & Diskon</h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Halaman promo sedang dalam pengembangan! Segera akan ada berbagai penawaran
                        menarik dan diskon spesial untuk Anda.
                    </p>
                </div>
            </div>
        </BuyerLayoutWrapper>
    );
}
