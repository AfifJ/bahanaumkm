import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit } from 'lucide-react';

export default function CategoriesShow({ category }) {
    return (
        <AdminLayout>
            <Head title={`Detail Kategori - ${category.name}`} />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight">Detail Kategori</h2>
                    <div className='flex space-x-2'>

                        <Button variant="outline" asChild>
                            <Link href={route('admin.categories.edit', category)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('admin.categories.index')}>
                                Kembali
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div>
                            <h3 className="mb-1 text-sm font-medium text-gray-500">Nama Kategori</h3>
                            <p className="text-lg font-semibold">{category.name}</p>
                        </div>

                        <div className="md:col-span-2">
                            <h3 className="mb-1 text-sm font-medium text-gray-500">Deskripsi</h3>
                            <p className="text-gray-900">{category.description || 'Tidak ada deskripsi'}</p>
                        </div>

                        <div>
                            <h3 className="mb-1 text-sm font-medium text-gray-500">Dibuat Pada</h3>
                            <p className="text-gray-900">
                                {new Date(category.created_at).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>

                        <div>
                            <h3 className="mb-1 text-sm font-medium text-gray-500">Diperbarui Pada</h3>
                            <p className="text-gray-900">
                                {new Date(category.updated_at).toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
