import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function SalesProductEdit({ assignment }) {
    const { data, setData, put, processing, errors } = useForm({
        borrowed_quantity: assignment.borrowed_quantity.toString(),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.sales-products.update', assignment.id));
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Manajemen Produk Sales', href: route('admin.sales-products.index') },
                { title: 'Detail Penugasan', href: route('admin.sales-products.show', assignment.id) },
                { title: 'Edit Penugasan' },
            ]}
        >
            <Head title="Edit Penugasan Produk" />

            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center">
                    <Button variant="ghost" asChild className="mr-4">
                        <Link href={route('admin.sales-products.show', assignment.id)}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Edit Penugasan Produk</h2>
                        <p className="text-muted-foreground">Perbarui jumlah produk yang ditugaskan</p>
                    </div>
                </div>

                {/* Current Assignment Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Penugasan Saat Ini</CardTitle>
                        <CardDescription>
                            Detail penugasan produk yang sedang diedit
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Sales</label>
                                <p className="font-medium">{assignment.sales.name}</p>
                                <p className="text-sm text-muted-foreground">{assignment.sales.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Produk</label>
                                <p className="font-medium">{assignment.product.name}</p>
                                <p className="text-sm text-muted-foreground">
                                    Stok tersedia: {assignment.product.stock}
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3 mt-4 pt-4 border-t">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{assignment.borrowed_quantity}</div>
                                <p className="text-sm text-muted-foreground">Total Dipinjam</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{assignment.sold_quantity}</div>
                                <p className="text-sm text-muted-foreground">Sudah Terjual</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{assignment.current_stock}</div>
                                <p className="text-sm text-muted-foreground">Tersedia</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Perbarui Jumlah Pinjam</CardTitle>
                        <CardDescription>
                            Ubah jumlah produk yang dipinjam oleh sales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="borrowed_quantity">Jumlah Pinjam *</Label>
                                <Input
                                    id="borrowed_quantity"
                                    type="number"
                                    min={assignment.sold_quantity}
                                    placeholder="Masukkan jumlah pinjam"
                                    value={data.borrowed_quantity}
                                    onChange={(e) => setData('borrowed_quantity', e.target.value)}
                                />
                                {errors.borrowed_quantity && (
                                    <p className="text-sm text-red-600">{errors.borrowed_quantity}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Minimal jumlah adalah {assignment.sold_quantity} (sudah terjual)
                                </p>
                            </div>

                            {/* Warning */}
                            {parseInt(data.borrowed_quantity) < assignment.borrowed_quantity && (
                                <div className="rounded-md bg-yellow-50 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800">
                                                Perhatian
                                            </h3>
                                            <div className="mt-2 text-sm text-yellow-700">
                                                <p>
                                                    Anda mengurangi jumlah pinjam dari {assignment.borrowed_quantity} menjadi {data.borrowed_quantity}.
                                                    Selisih ({assignment.borrowed_quantity - parseInt(data.borrowed_quantity)} unit) akan dikembalikan ke stok utama.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {parseInt(data.borrowed_quantity) > assignment.borrowed_quantity && (
                                <div className="rounded-md bg-blue-50 p-4">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-blue-800">
                                                Informasi
                                            </h3>
                                            <div className="mt-2 text-sm text-blue-700">
                                                <p>
                                                    Anda menambah jumlah pinjam dari {assignment.borrowed_quantity} menjadi {data.borrowed_quantity}.
                                                    Tambahan ({parseInt(data.borrowed_quantity) - assignment.borrowed_quantity} unit) akan diambil dari stok utama.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}