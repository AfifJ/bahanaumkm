import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MitraLayout from '@/layouts/mitra-layout';
import { User, Building, MapPin, Phone, Mail, Save, ArrowLeft } from 'lucide-react';

export default function MitraProfile({ user, mitraProfile }) {
    const { url } = usePage();
    const { data, setData, processing, errors, wasSuccessful } = useForm({
        hotel_name: mitraProfile.hotel_name || '',
        address: mitraProfile.address || '',
        city: mitraProfile.city || '',
        phone: user.phone || mitraProfile.phone || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(route('mitra.profile.update'));
    };

    return (
        <MitraLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('mitra.dashboard') },
                { title: 'Profil', href: route('mitra.profile') },
            ]}
        >
            <Head title="Profil Mitra" />

            <div className="max-w-2xl mx-auto">
                {/* Back Button */}
                <div className="mb-6">
                    <Link href={route('mitra.dashboard')} className="inline-flex items-center text-gray-600 hover:text-gray-900">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Dashboard
                    </Link>
                </div>

                {/* Profile Info Card */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Informasi Akun
                        </CardTitle>
                        <CardDescription>
                            Data akun Anda yang sudah terverifikasi
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Nama</Label>
                                <div className="mt-1 text-sm text-gray-900">{user.name}</div>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-700">Email</Label>
                                <div className="mt-1 text-sm text-gray-900">{user.email}</div>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-700">Kode Mitra</Label>
                            <div className="mt-1">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                    {mitraProfile.unique_code}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Profile Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building className="h-5 w-5" />
                            Informasi Hotel
                        </CardTitle>
                        <CardDescription>
                            Perbarui informasi hotel dan kontak Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {wasSuccessful && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex">
                                    <div className="text-sm text-green-800">
                                        Profile berhasil diperbarui!
                                    </div>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="hotel_name">Nama Hotel *</Label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="hotel_name"
                                        type="text"
                                        value={data.hotel_name}
                                        onChange={(e) => setData('hotel_name', e.target.value)}
                                        placeholder="Masukkan nama hotel"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {errors.hotel_name && (
                                    <p className="text-sm text-red-600">{errors.hotel_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat Lengkap *</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <textarea
                                        id="address"
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Masukkan alamat lengkap hotel"
                                        rows={3}
                                        className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                {errors.address && (
                                    <p className="text-sm text-red-600">{errors.address}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">Kota *</Label>
                                <Input
                                    id="city"
                                    type="text"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Masukkan kota"
                                    required
                                />
                                {errors.city && (
                                    <p className="text-sm text-red-600">{errors.city}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">Nomor Telepon *</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Masukkan nomor telepon"
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-sm text-red-600">{errors.phone}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div className="text-sm text-gray-500">
                                    <span className="text-red-500">*</span> Wajib diisi
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-6">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Perubahan Email
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Untuk mengubah alamat email, silakan hubungi administrator sistem.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </MitraLayout>
    );
}