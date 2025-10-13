import { Head, useForm, router, usePage } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export default function ShippingSettingsIndex() {
    const { shippingSetting } = usePage().props;

    const { data, setData, processing, errors } = useForm({
        price_per_km: shippingSetting?.price_per_km || 0,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(route('admin.shipping-settings.update'));
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AdminLayout>
            <Head title="Pengaturan Ongkos Kirim" />
            
            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <Truck className="h-8 w-8 mr-3" />
                        Pengaturan Ongkos Kirim
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Kelola harga per kilometer untuk perhitungan ongkos kirim
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Harga Per Kilometer</CardTitle>
                        <CardDescription>
                            Atur harga per kilometer yang akan digunakan untuk menghitung ongkos kirim dari gudang ke hotel mitra
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="price_per_km" className="text-base">
                                        Harga per KM (IDR)
                                    </Label>
                                    <Input
                                        id="price_per_km"
                                        type="number"
                                        step="100"
                                        min="0"
                                        value={data.price_per_km}
                                        onChange={(e) => setData('price_per_km', parseFloat(e.target.value) || 0)}
                                        className="mt-1"
                                        placeholder="Masukkan harga per kilometer"
                                    />
                                    {errors.price_per_km && (
                                        <p className="mt-1 text-sm text-red-600">{errors.price_per_km}</p>
                                    )}
                                    <p className="mt-2 text-sm text-gray-500">
                                        Harga saat ini: {formatPrice(data.price_per_km)} per kilometer
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-medium text-blue-800 mb-2">Cara Perhitungan Ongkir</h3>
                                    <p className="text-sm text-blue-700">
                                        Ongkos kirim = (Jarak dalam meter ÷ 1000) × Harga per KM
                                    </p>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Contoh: Jarak 5000 meter × {formatPrice(data.price_per_km)}/KM = {formatPrice((5000 / 1000) * data.price_per_km)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Informasi Sistem</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 text-sm text-gray-600">
                            <p>• Admin dapat mengatur jarak dari gudang ke setiap hotel mitra melalui halaman edit mitra</p>
                            <p>• Jarak disimpan dalam satuan meter</p>
                            <p>• Sistem akan otomatis mengkonversi meter ke kilometer (dibagi 1000)</p>
                            <p>• Ongkos kirim akan ditampilkan di halaman checkout sebelum pembayaran</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
