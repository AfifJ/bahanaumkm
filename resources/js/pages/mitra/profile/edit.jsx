import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MitraLayout from '@/layouts/mitra-layout';
import { User, Building, MapPin, Phone, Mail, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export default function MitraProfile({ user, mitraProfile }) {
    const { url } = usePage();
    const [hasChanges, setHasChanges] = useState(false);

    // Store original values for comparison
    const originalData = {
        hotel_name: mitraProfile?.hotel_name || '',
        address: mitraProfile?.address || '',
        phone: user?.phone || mitraProfile?.phone || '',
    };

    const { data, setData, put, processing, errors } = useForm(originalData);

    // Check if form has changes
    const checkForChanges = (currentData) => {
        const changed = (
            currentData.hotel_name !== originalData.hotel_name ||
            currentData.address !== originalData.address ||
            currentData.phone !== originalData.phone
        );
        setHasChanges(changed);
    };

    // Update hasChanges whenever form data changes
    useEffect(() => {
        checkForChanges(data);
    }, [data]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if there are any changes
        if (!hasChanges) {
            toast.info('Tidak ada perubahan yang tersimpan');
            return;
        }

        put(route('mitra.profile.update'), {
            onSuccess: () => {
                toast.success('Profil mitra berhasil diperbarui!');
                // Update original data after successful save
                Object.assign(originalData, data);
                setHasChanges(false);
            },
            onError: (errors) => {
                toast.error('Gagal memperbarui profil. Silakan coba lagi.');
            },
        });
    };

    return (
        <MitraLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('mitra.dashboard') },
                { title: 'Profil', href: route('mitra.profile') },
            ]}
        >
            <Head title="Profil Mitra" />

            <div className="m-4 space-y-4">
                {/* Profile Info Card */}
                <Card>
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
                        
                        <form onSubmit={handleSubmit} className="space-y-2">
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

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    <span className="text-red-500">*</span> Wajib diisi
                                </div>
                                <Button
                                    type="submit"
                                    disabled={processing || !hasChanges}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Cardf */}
                <Card>
                    <CardContent>
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-2">
                                <Mail className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Perubahan Email
                                </h3>
                                <p className="text-sm text-gray-500">
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