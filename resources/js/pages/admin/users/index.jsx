import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function UserIndex({ users, role, roleName }) {
    const { flash } = usePage().props;
    const [deleting, setDeleting] = useState(null);

    const handleDelete = (user) => {
        setDeleting(user.id);
        router.delete(route('admin.users.destroy', { role: roleName, user: user.id }), {
            onFinish: () => setDeleting(null),
        });
    };

    const roleTitles = {
        Admin: 'Admin',
        Vendor: 'Vendor/Supplier',
        Mitra: 'Mitra',
        'Sales Lapangan': 'Sales Lapangan',
        Buyer: 'Buyer',
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Pengguna', href: route('admin.users.index', { role: roleName }) },
                { title: roleTitles[roleName] || roleName },
            ]}
        >
            <Head title={`Kelola ${roleTitles[roleName] || roleName}`} />

            <div className="flex-1 space-y-4 p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Kelola {roleTitles[roleName] || roleName}</h2>
                        <p className="text-muted-foreground">{role.description}</p>
                    </div>
                    <Button asChild>
                        <Link href={route('admin.users.create', { role: roleName })}>
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah {roleTitles[roleName] || roleName}
                        </Link>
                    </Button>
                </div>

                {flash?.success && <div className="rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700">{flash.success}</div>}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar {roleTitles[roleName] || roleName}</CardTitle>
                        <CardDescription>
                            Total {users.length} {roleTitles[roleName] || roleName} terdaftar
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Tanggal Dibuat</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                                                {user.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString('id-ID')}</TableCell>
                                        <TableCell className="space-x-2 text-right">
                                            <Link href={route('admin.users.edit', { role: roleName, user: user.id })}>
                                                <Button variant="outline" size="sm">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Trash2 className="text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Penghapusan data tidak bisa dibatalkan. Tindakan ini akan menghapus data secara permanen
                                                            dari server.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction asChild>
                                                            {/* <Link href={route('admin.products.destroy', product.id)} method="delete" as="button">
                                                                Lanjutkan
                                                            </Link> */}
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(user)}
                                                                disabled={deleting === user.id}
                                                            >
                                                                Lanjutkan
                                                            </Button>
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {users.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                                            Tidak ada {roleTitles[roleName] || roleName} yang terdaftar
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
