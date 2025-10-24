import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { parseDistance, formatDistanceInMeters, formatDistanceForInput } from '@/lib/utils';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export default function UserEdit({ user, role, mitraProfile }) {
    const [hasChanges, setHasChanges] = useState(false);
    
    const { data, setData, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        status: user.status,
        hotel_name: mitraProfile?.hotel_name || '',
        address: mitraProfile?.address || '',
        distance_from_warehouse: formatDistanceForInput(mitraProfile?.distance_from_warehouse || 0),
        // city: mitraProfile?.city || '',
        phone: mitraProfile?.phone || '',
        // partner_tier: mitraProfile?.partner_tier || '',
        // commission_rate: mitraProfile?.commission_rate || '',
    });

    // Check for changes whenever data changes
    useEffect(() => {
        const originalData = {
            name: user.name,
            email: user.email,
            status: user.status,
            hotel_name: mitraProfile?.hotel_name || '',
            address: mitraProfile?.address || '',
            distance_from_warehouse: formatDistanceForInput(mitraProfile?.distance_from_warehouse || 0),
            phone: mitraProfile?.phone || '',
        };

        const changes = Object.keys(data).some(key => {
            if (key === 'distance_from_warehouse') {
                return parseFloat(data[key]) !== parseFloat(originalData[key]);
            }
            return data[key] !== originalData[key];
        });

        setHasChanges(changes);
    }, [data, user, mitraProfile]);

    const roleTitles = {
        Admin: 'Admin',
        Vendor: 'Vendor/Supplier',
        Mitra: 'Mitra',
        'Sales Lapangan': 'Sales Lapangan',
        Buyer: 'Buyer',
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (!hasChanges) {
            toast.error('Tidak ada perubahan data untuk disimpan.');
            return;
        }
        
        // Convert distance from km to meters before submitting
        const formData = {
            ...data,
            distance_from_warehouse: parseDistance(data.distance_from_warehouse)
        };
        
        router.put(route('admin.users.update', { role: role.name, user: user.id }), formData, {
            onSuccess: () => {
                toast.success('Data Mitra berhasil diperbarui!');
            },
            onError: (errors) => {
                toast.error('Terjadi kesalahan saat memperbarui data.');
                console.error('Update errors:', errors);
            }
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Pengguna', href: route('admin.users.index', { role: role.name }) },
                { title: roleTitles[role.name] || role.name, href: route('admin.users.index', { role: role.name }) },
                { title: 'Edit' },
            ]}
        >
            <Head title={`Edit ${roleTitles[role.name] || role.name}`} />

            <div className="flex-1 space-y-4 p-8">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.users.index', { role: role.name })}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Edit {roleTitles[role.name] || role.name}</h2>
                        <p className="text-muted-foreground">{role.description}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Edit {roleTitles[role.name] || role.name}</CardTitle>
                        <CardDescription>Perbarui informasi {roleTitles[role.name] || role.name}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                    required
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="Masukkan alamat email"
                                    required
                                />
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Aktif</SelectItem>
                                        <SelectItem value="inactive">Nonaktif</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
                            </div>

                            {/* Form tambahan untuk data mitra */}
                            {role.name === 'Mitra' && (
                                <>
                                    <div className="mt-6 border-t pt-6">
                                        <h3 className="mb-4 text-lg font-semibold">Data Mitra</h3>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="hotel_name">Nama Hotel/Usaha</Label>
                                                <Input
                                                    id="hotel_name"
                                                    value={data.hotel_name}
                                                    onChange={(e) => setData('hotel_name', e.target.value)}
                                                    placeholder="Masukkan nama hotel/usaha"
                                                    required
                                                />
                                                {errors.hotel_name && <p className="text-sm text-red-500">{errors.hotel_name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="address">Alamat</Label>
                                                <Textarea
                                                    id="address"
                                                    value={data.address}
                                                    onChange={(e) => setData('address', e.target.value)}
                                                    placeholder="Masukkan alamat lengkap"
                                                    required
                                                />
                                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                                            </div>
                                            {/* 
                                            <div className="space-y-2">
                                                <Label htmlFor="city">Kota</Label>
                                                <Input
                                                    id="city"
                                                    value={data.city}
                                                    onChange={(e) => setData('city', e.target.value)}
                                                    placeholder="Masukkan kota"
                                                    required
                                                />
                                                {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
                                            </div> */}

                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Telepon</Label>
                                                <Input
                                                    id="phone"
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value)}
                                                    placeholder="Masukkan nomor telepon"
                                                />
                                                {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="distance_from_warehouse">
                                                    Jarak dari Gudang
                                                </Label>
                                                <Input
                                                    id="distance_from_warehouse"
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={data.distance_from_warehouse}
                                                    onChange={(e) => setData('distance_from_warehouse', e.target.value)}
                                                    placeholder="Masukkan jarak dalam kilometer"
                                                    required
                                                />
                                                {errors.distance_from_warehouse && (
                                                    <p className="text-sm text-red-500">{errors.distance_from_warehouse}</p>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    Masukkan jarak dari gudang ke hotel mitra dalam kilometer (km).
                                                    {data.distance_from_warehouse > 0 && (
                                                        <span> {data.distance_from_warehouse} km = {formatDistanceInMeters(parseDistance(data.distance_from_warehouse))} meter</span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* <div className="space-y-2">
                                                <Label htmlFor="partner_tier">Tier Mitra</Label>
                                                <Select value={data.partner_tier} onValueChange={(value) => setData('partner_tier', value)} required>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih tier mitra" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="premium">Premium</SelectItem>
                                                        <SelectItem value="standard">Standard</SelectItem>
                                                        <SelectItem value="basic">Basic</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors.partner_tier && <p className="text-sm text-red-500">{errors.partner_tier}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="commission_rate">Komisi (%)</Label>
                                                <Input
                                                    id="commission_rate"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    step="0.1"
                                                    value={data.commission_rate}
                                                    onChange={(e) => setData('commission_rate', e.target.value)}
                                                    placeholder="Masukkan persentase komisi"
                                                    required
                                                />
                                                {errors.commission_rate && <p className="text-sm text-red-500">{errors.commission_rate}</p>}
                                            </div>*/}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={processing || !hasChanges}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.users.index', { role: role.name })}>Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
