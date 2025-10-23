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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

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
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Kategori
                            </Link>
                        </Button>
                    )}
                </div>

                <div>
                    <div>Kelola semua kategori produk yang tersedia</div>
                </div>
                <div>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Gambar</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Dibuat</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.data.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        {category.image ? (
                                            <img
                                                src={`/storage/${category.image}`}
                                                alt={category.name}
                                                className="h-12 w-12 object-cover rounded"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                                <span className="text-gray-400 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{category.name}</TableCell>
                                    <TableCell>
                                        {category.description ? (
                                            <span className="line-clamp-2 text-sm text-gray-600">{category.description}</span>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(category.created_at).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Link href={route('admin.categories.edit', category)}>
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
                                                        <Link href={route('admin.categories.destroy', category)} method="delete" as="button">
                                                            Lanjutkan
                                                        </Link>
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {categories.data.length === 0 && (
                        <div className="py-8 text-center">
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
                                                className={`rounded-md px-3 py-1 text-sm ${link.active ? 'bg-primary text-primary-foreground' : 'text-gray-500 hover:text-gray-700'
                                                    } ${!link.url ? 'pointer-events-none opacity-50' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
