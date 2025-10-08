import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Edit, Package, RotateCcw, User } from 'lucide-react';
import { useState } from 'react';

export default function SalesProductShow({ assignment, transactionHistory }) {
    const [processing, setProcessing] = useState(false);

    const handleReturn = () => {
        setProcessing(true);
        router.put(
            route('admin.sales-products.return', assignment.id),
            {},
            {
                onSuccess: () => setProcessing(false),
                onError: () => setProcessing(false),
            }
        );
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Manajemen Produk Sales', href: route('admin.sales-products.index') },
                { title: 'Detail Penugasan' },
            ]}
        >
            <Head title="Detail Penugasan Produk" />

            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Button variant="ghost" asChild className="mr-4">
                            <Link href={route('admin.sales-products.index')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Link>
                        </Button>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Detail Penugasan Produk</h2>
                            <p className="text-muted-foreground">Informasi lengkap penugasan produk ke sales</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {assignment.status === 'borrowed' && (
                            <>
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.sales-products.edit', assignment.id)}>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleReturn}
                                    disabled={processing}
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    {processing ? 'Memproses...' : 'Kembalikan'}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Assignment Details */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Sales Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Informasi Sales
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nama</label>
                                <p className="font-medium">{assignment.sales.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p>{assignment.sales.email}</p>
                            </div>
                            {assignment.sales.phone && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Telepon</label>
                                    <p>{assignment.sales.phone}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Product Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                Informasi Produk
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Nama Produk</label>
                                <p className="font-medium">{assignment.product.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Kategori</label>
                                <p>{assignment.product.category}</p>
                            </div>
                            {assignment.product.image_url && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Gambar</label>
                                    <div className="mt-2">
                                        <img
                                            src={assignment.product.image_url}
                                            alt={assignment.product.name}
                                            className="h-20 w-20 rounded object-cover"
                                        />
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Stock Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Stok</CardTitle>
                        <CardDescription>
                            Status dan jumlah produk yang ditugaskan
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{assignment.borrowed_quantity}</div>
                                <p className="text-sm text-muted-foreground">Total Dipinjam</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{assignment.sold_quantity}</div>
                                <p className="text-sm text-muted-foreground">Terjual</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{assignment.current_stock}</div>
                                <p className="text-sm text-muted-foreground">Tersedia</p>
                            </div>
                            <div className="text-center">
                                <Badge variant={assignment.status === 'borrowed' ? 'default' : 'secondary'}>
                                    {assignment.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                                </Badge>
                                <p className="text-sm text-muted-foreground mt-1">Status</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment Timeline */}
                <Card>
                    <CardHeader>
                        <CardTitle>Timeline Penugasan</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Tanggal Pinjam</p>
                                    <p className="text-sm text-muted-foreground">{assignment.borrowed_date}</p>
                                </div>
                                <Badge variant="outline">Dipinjam</Badge>
                            </div>
                            {assignment.return_date && (
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium">Tanggal Kembali</p>
                                        <p className="text-sm text-muted-foreground">{assignment.return_date}</p>
                                    </div>
                                    <Badge variant="outline">Dikembalikan</Badge>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Dibuat Pada</p>
                                    <p className="text-sm text-muted-foreground">{assignment.created_at}</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction History */}
                {transactionHistory.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Transaksi</CardTitle>
                            <CardDescription>
                                Transaksi penjualan produk ini oleh sales
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Kode Transaksi</TableHead>
                                        <TableHead className="text-center">Jumlah</TableHead>
                                        <TableHead className="text-right">Harga Satuan</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactionHistory.map((transaction) => (
                                        <TableRow key={transaction.id}>
                                            <TableCell className="font-medium">
                                                {transaction.order_code}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {transaction.quantity}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                Rp {transaction.unit_price.toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                Rp {transaction.total_price.toLocaleString('id-ID')}
                                            </TableCell>
                                            <TableCell>{transaction.date}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State for Transaction History */}
                {transactionHistory.length === 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Transaksi</CardTitle>
                            <CardDescription>
                                Transaksi penjualan produk ini oleh sales
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8 text-muted-foreground">
                                Belum ada transaksi untuk produk ini
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AdminLayout>
    );
}