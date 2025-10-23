import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, Package, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Return Dialog Content Component
const ReturnDialogContent = ({ product, onClose }) => {
    const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
    const [returnAll, setReturnAll] = useState(true);
    const [returnQuantity, setReturnQuantity] = useState(product?.current_stock || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await router.post(
                route('admin.sales-products.return-product', product.id),
                {
                    return_date: returnDate,
                    return_all: returnAll,
                    return_quantity: returnAll ? product.current_stock : returnQuantity,
                },
                {
                    onSuccess: (page) => {
                        // Show flash message from backend if available
                        if (page.props.flash?.success) {
                            toast.success(page.props.flash.success);
                        } else {
                            toast.success('Produk berhasil dikembalikan ke stok');
                        }
                        onClose();
                    },
                    onError: (errors) => {
                        // Show flash message from backend if available
                        if (errors.flash?.error) {
                            toast.error(errors.flash.error);
                        } else {
                            toast.error('Gagal mengembalikan produk');
                        }
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

    if (!product) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="return_date" className="text-sm font-medium">
                    Tanggal Pengembalian
                </Label>
                <Input
                    id="return_date"
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-3">
                <Label className="text-sm font-medium">Jumlah Pengembalian</Label>
                <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="returnType"
                            checked={returnAll}
                            onChange={() => setReturnAll(true)}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Kembalikan Semua ({product.current_stock} unit)</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="radio"
                            name="returnType"
                            checked={!returnAll}
                            onChange={() => setReturnAll(false)}
                            className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Kembalikan Sebagian</span>
                    </label>
                </div>

                {!returnAll && (
                    <div className="space-y-2">
                        <Label htmlFor="return_quantity" className="text-sm">
                            Jumlah
                        </Label>
                        <Input
                            id="return_quantity"
                            type="number"
                            min="1"
                            max={product.current_stock}
                            value={returnQuantity}
                            onChange={(e) => setReturnQuantity(parseInt(e.target.value) || 0)}
                            required
                        />
                        <p className="text-xs text-gray-500">
                            Maks: {product.current_stock} unit
                        </p>
                    </div>
                )}
            </div>

            <AlertDialogFooter>
                <AlertDialogCancel type="button" disabled={isSubmitting}>
                    Batal
                </AlertDialogCancel>
                <AlertDialogAction type="submit" disabled={isSubmitting} onClick={handleSubmit}>
                    {isSubmitting ? 'Memproses...' : 'Konfirmasi'}
                </AlertDialogAction>
            </AlertDialogFooter>
        </form>
    );
};

export default function SalesProducts({ sales, borrowedProducts }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleReturnClick = (product) => {
        setSelectedProduct(product);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
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

            <AlertDialog open={isDialogOpen} onOpenChange={handleDialogClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Kembalikan Produk</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <strong className="text-sm">Produk:</strong>
                                    <span className="text-sm font-medium">{selectedProduct?.product.name}</span>
                                    {selectedProduct?.product.has_variations && (
                                        <Badge variant="secondary" className="text-xs">
                                            SKU
                                        </Badge>
                                    )}
                                </div>

                                {selectedProduct?.sku ? (
                                    <div className="space-y-1">
                                        <strong className="text-sm">Variasi:</strong>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-blue-600">
                                                {selectedProduct.sku.variant_name || selectedProduct.sku.sku_code}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                (Kode: {selectedProduct.sku.sku_code})
                                            </span>
                                        </div>
                                    </div>
                                ) : selectedProduct?.product.has_variations ? (
                                    <div className="text-sm text-amber-600">
                                        ⚠️ Variasi produk tidak teridentifikasi
                                    </div>
                                ) : null}

                                <div className="flex items-center gap-2">
                                    <strong className="text-sm">Stok Tersedia:</strong>
                                    <span className="text-sm font-medium">{selectedProduct?.current_stock} unit</span>
                                </div>
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <ReturnDialogContent product={selectedProduct} onClose={handleDialogClose} />
                </AlertDialogContent>
            </AlertDialog>

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
                                            <div className="flex items-start space-x-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0 mt-1">
                                                    {product.product.primaryImage?.url ? (
                                                        <img
                                                            src={product.product.primaryImage.url}
                                                            alt={product.product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="h-4 w-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-900 truncate">
                                                            {product.product.name}
                                                        </span>
                                                        {product.product.has_variations && (
                                                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                                                                SKU
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {product.sku ? (
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-blue-600">
                                                                    {product.sku.variant_name || product.sku.sku_code}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    (Kode: {product.sku.sku_code})
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ) : product.product.has_variations ? (
                                                        <div className="text-sm text-amber-600">
                                                            Variasi produk tidak teridentifikasi
                                                        </div>
                                                    ) : null}
                                                </div>
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