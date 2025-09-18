import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function UserEdit({ user, role }) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        status: user.status,
    });

    const roleTitles = {
        'Admin': 'Admin',
        'Vendor': 'Vendor/Supplier',
        'Mitra': 'Mitra',
        'Sales Lapangan': 'Sales Lapangan',
        'Buyer': 'Buyer'
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', { role: role.name, user: user.id }));
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Pengguna', href: route('admin.users.index', { role: role.name }) },
                { title: roleTitles[role.name] || role.name, href: route('admin.users.index', { role: role.name }) },
                { title: 'Edit' }
            ]}
        >
            <Head title={`Edit ${roleTitles[role.name] || role.name}`} />

            <div className="flex-1 p-8 space-y-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.users.index', { role: role.name })}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Edit {roleTitles[role.name] || role.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {role.description}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Edit {roleTitles[role.name] || role.name}</CardTitle>
                        <CardDescription>
                            Perbarui informasi {roleTitles[role.name] || role.name}
                        </CardDescription>
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
                                <Select
                                    value={data.status}
                                    onValueChange={(value) => setData('status', value)}
                                >
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

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.users.index', { role: role.name })}>
                                        Batal
                                    </Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
