import { Head } from '@inertiajs/react';
import VendorLayout from '@/layouts/vendor-layout';

export default function VendorDashboard() {
    return (
        <VendorLayout>
            <Head title="Vendor Dashboard" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">Dashboard Vendor</h1>
                <p className="mt-4">Selamat datang di dashboard khusus untuk vendor.</p>
                <p>Di sini Anda dapat melihat dan membuat laporan produk yang disetor dan terjual.</p>
            </div>
        </VendorLayout>
    );
}
