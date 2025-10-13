import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Package, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Return Confirmation Modal Component
const ReturnModal = ({ isOpen, onClose, onConfirm, product }) => {
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnAll, setReturnAll] = useState(true);
    const [returnQuantity, setReturnQuantity] = useState(product?.current_stock || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await router.post(
                route('admin.sales-products.return-product', product.id),
                {
                    return_date: returnDate,
                    return_all: returnAll,
                    return_quantity: returnAll ? product.current_stock : returnQuantity,
                },
                {
                    onSuccess: () => {
                        toast.success('Produk berhasil dikembalikan ke stok');
                        onClose();
                    },
                    onError: (errors) => {
                        toast.error(errors.message || 'Gagal mengembalikan produk');
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                }
            );
        } catch (error) {
            toast.error('Gagal mengembalikan produk');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Kembalikan Produk</h3>

                <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                        <strong>Produk:</strong> {product.product.name}
                    </p>
                    <p className="text-sm text-gray-600">
                        <strong>Stok Tersedia:</strong> {product.current_stock} unit
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tanggal Pengembalian
                        </label>
                        <input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jumlah Pengembalian
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="returnType"
                                    checked={returnAll}
                                    onChange={() => setReturnAll(true)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Kembalikan Semua ({product.current_stock} unit)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="returnType"
                                    checked={!returnAll}
                                    onChange={() => setReturnAll(false)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Kembalikan Sebagian</span>
                            </label>
                        </div>

                        {!returnAll && (
                            <div className="mt-2">
                                <input
                                    type="number"
                                    min="1"
                                    max={product.current_stock}
                                    value={returnQuantity}
                                    onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 0)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Maks: {product.current_stock} unit
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function SalesProducts({ sales, borrowedProducts }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleReturnClick = (product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleConfirmReturn = () => {
        // Modal will handle the submission
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Manajemen Produk Sales', href: route('admin.sales-products.index') },
                { title: `Produk ${sales.name}` },
            ]}
        >
            <Head title={`Produk Sales - ${sales.name}`} />

            <ReturnModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmReturn}
                product={selectedProduct}
            />

            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Produk Sales</h2>
                        <p className="text-muted-foreground">
                            Daftar produk yang ditugaskan kepada {sales.name}
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href={route('admin.sales-products.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Link>
                    </Button>
                </div>

                {/* Sales Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Nama</p>
                                <p className="font-medium">{sales.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{sales.email}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Telepon</p>
                                <p className="font-medium">{sales.phone || '-'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Produk</CardTitle>
                        <CardDescription>
                            Produk yang sedang dipinjam oleh sales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-center">Dipinjam</TableHead>
                                    <TableHead className="text-center">Terjual</TableHead>
                                    <TableHead className="text-center">Tersedia</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {borrowedProducts.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                                    {product.product.image_url ? (
                                                        <img
                                                            src={product.product.image_url}
                                                            alt={product.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="font-medium">{product.product.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{product.product.category}</TableCell>
                                        <TableCell className="text-center">{product.borrowed_quantity}</TableCell>
                                        <TableCell className="text-center">{product.sold_quantity}</TableCell>
                                        <TableCell className="text-center">{product.current_stock}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.status === 'borrowed' ? 'default' : 'secondary'}>
                                                {product.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {product.status === 'borrowed' && product.current_stock > 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleReturnClick(product)}
                                                >
                                                    <RotateCcw className="h-4 w-4 mr-2" />
                                                    Kembalikan
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {borrowedProducts.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                                            Tidak ada produk yang ditugaskan kepada sales ini
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