import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, ArrowLeft } from 'lucide-react';

export default function CategoriesShow({ category }) {
    return (
        <AdminLayout>
            <Head title={`Detail Kategori - ${category.name}`} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={route('admin.categories.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Link>
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Detail Kategori</h2>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.categories.edit', category.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Link>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Kategori</CardTitle>
                        <CardDescription>
                            Detail informasi kategori produk
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Nama Kategori</h3>
                                <p className="text-lg font-semibold">{category.name}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
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
                            </div>

                            <div className="md:col-span-2">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Deskripsi</h3>
                                <p className="text-gray-900">
                                    {category.description || 'Tidak ada deskripsi'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Dibuat Pada</h3>
                                <p className="text-gray-900">
                                    {new Date(category.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Diperbarui Pada</h3>
                                <p className="text-gray-900">
                                    {new Date(category.updated_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
