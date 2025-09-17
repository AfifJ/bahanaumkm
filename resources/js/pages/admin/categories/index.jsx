import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus } from 'lucide-react';

export default function CategoriesIndex() {
    const { categories, can } = usePage().props;

    return (
        <AdminLayout>
            <Head title="Kelola Kategori" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Kelola Kategori</h2>
                    {can.create && (
                        <Button asChild>
                            <Link href={route('admin.categories.create')}>
                                <Plus className="h-4 w-4 mr-2" />
                                Tambah Kategori
                            </Link>
                        </Button>
                    )}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Kategori</CardTitle>
                        <CardDescription>
                            Kelola semua kategori produk yang tersedia
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Deskripsi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Dibuat</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell className="font-medium">{category.name}</TableCell>
                                        <TableCell>
                                            {category.description ? (
                                                <span className="text-sm text-gray-600 line-clamp-2">
                                                    {category.description}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={category.status === 'active' ? 'default' : 'secondary'}
                                                className={
                                                    category.status === 'active'
                                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                                }
                                            >
                                                {category.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(category.created_at).toLocaleDateString('id-ID')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2">
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={route('admin.categories.show', category.id)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                {can.edit && (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={route('admin.categories.edit', category.id)}>
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                                {can.delete && (
                                                    <Button variant="destructive" size="sm" asChild>
                                                        <Link
                                                            href={route('admin.categories.destroy', category.id)}
                                                            method="delete"
                                                            as="button"
                                                            onBefore={() => {
                                                                return confirm('Apakah Anda yakin ingin menghapus kategori ini?');
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {categories.data.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">Belum ada kategori yang dibuat.</p>
                            </div>
                        )}

                        {categories.links && categories.links.length > 3 && (
                            <div className="mt-6">
                                <nav className="flex justify-center">
                                    <ul className="flex space-x-2">
                                        {categories.links.map((link, index) => (
                                            <li key={index}>
                                                <Link
                                                    href={link.url || '#'}
                                                    className={`px-3 py-1 rounded-md text-sm ${
                                                        link.active
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'text-gray-500 hover:text-gray-700'
                                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
