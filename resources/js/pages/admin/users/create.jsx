import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

export default function UserCreate({ role }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
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
        post(route('admin.users.store', { role: role.name }));
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Pengguna', href: route('admin.users.index', { role: role.name }) },
                { title: roleTitles[role.name] || role.name, href: route('admin.users.index', { role: role.name }) },
                { title: 'Tambah Baru' }
            ]}
        >
            <Head title={`Tambah ${roleTitles[role.name] || role.name}`} />

            <div className="flex-1 p-8 space-y-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.users.index', { role: role.name })}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">
                            Tambah {roleTitles[role.name] || role.name}
                        </h2>
                        <p className="text-muted-foreground">
                            {role.description}
                        </p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Tambah {roleTitles[role.name] || role.name}</CardTitle>
                        <CardDescription>
                            Isi form berikut untuk menambahkan {roleTitles[role.name] || role.name} baru
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
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                />
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    placeholder="Konfirmasi password"
                                    required
                                />
                                {errors.password_confirmation && <p className="text-sm text-red-500">{errors.password_confirmation}</p>}
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Menyimpan...' : 'Simpan'}
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
