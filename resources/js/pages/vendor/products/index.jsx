import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import VendorLayout from '@/layouts/vendor-layout';
import { Head, Link } from '@inertiajs/react';
import { Package } from 'lucide-react';
import { useState } from 'react';

export default function Index({ products }) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [variationsDialogOpen, setVariationsDialogOpen] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };
    return (
        <VendorLayout
            title="Produk Saya"
            breadcrumbs={[
                {
                    title: 'Produk',
                    href: route('vendor.products.index'),
                },
            ]}
        >
            <Head title="Produk Saya" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6  ">
                    <div className="flex flex-row items-center justify-between pb-4">
                        <h2 className="text-2xl font-bold">Daftar Produk</h2>
                    </div>
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Gambar</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-right">Harga</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {(() => {
                                            // Try multiple image sources
                                            const imageUrl = product.primaryImage?.url || 
                                                           product.image_url || 
                                                           (product.images && product.images.length > 0 ? product.images[0].url : null);
                                            
                                            return imageUrl ? (
                                                <div className="h-10 w-10 overflow-hidden rounded-md border bg-gray-50">
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={product.name} 
                                                        className="h-full w-full object-cover" 
                                                        loading="lazy"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.parentElement.innerHTML = `
                                                                <div class="flex h-full w-full items-center justify-center bg-gray-200">
                                                                    <span class="text-xs font-medium text-gray-600">
                                                                        ${product.name.substring(0, 2).toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            `;
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200 border">
                                                    <span className="text-xs font-medium text-gray-600">
                                                        {product.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell className="font-medium">
    <div className="flex items-center gap-2">
        <Link
            href={route('vendor.products.show', product)}
            className="text-blue-600 hover:text-blue-800 hover:underline"
        >
            {product.name}
        </Link>
        {product.has_variations && product.skus && product.skus.length > 0 && (
            <Dialog open={variationsDialogOpen} onOpenChange={setVariationsDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setSelectedProduct(product)}
                    >
                        <Package className="h-3 w-3 mr-1" />
                        {product.skus.length} Variasi
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Variasi Produk: {selectedProduct?.name}</DialogTitle>
                        <DialogDescription>
                            Daftar variasi produk dengan harga beli dan stok
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-96 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Variasi</TableHead>
                                    <TableHead>Kode SKU</TableHead>
                                    <TableHead className="text-right">Harga</TableHead>
                                    <TableHead className="text-right">Stok</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedProduct?.skus?.map((sku) => (
                                    <TableRow key={sku.id}>
                                        <TableCell className="font-medium">
                                            {sku.variant_name || '-'}
                                        </TableCell>
                                        <TableCell className="font-mono text-sm">
                                            {sku.sku_code}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(sku.buy_price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {sku.stock.toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={sku.status === 'active' ? 'default' : 'secondary'}
                                                className={sku.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                                            >
                                                {sku.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <DialogTrigger asChild>
                            <Button variant="outline">Tutup</Button>
                        </DialogTrigger>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )}
    </div>
                </TableCell>
                                    <TableCell>{product.category?.name || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        {(() => {
                                            // Use display_buy_price calculated from backend
                                            const priceString = product.display_buy_price || '0';

                                            // Check if it's a range (contains "-") or single price
                                            if (priceString.includes(' - ')) {
                                                const [min, max] = priceString.split(' - ');
                                                return formatCurrency(parseFloat(min)) + ' - ' + formatCurrency(parseFloat(max));
                                            } else {
                                                return formatCurrency(parseFloat(priceString));
                                            }
                                        })()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(() => {
                                            const stock = product.display_stock || product.stock || 0;
                                            return stock.toLocaleString('id-ID');
                                        })()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.status}</Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <div className="mt-4 flex justify-center">
                        {products.links.map(
                            (link, index) =>
                                link.url && (
                                    <Link
                                        key={index}
                                        href={link.url}
                                        className={`mx-1 rounded px-4 py-2 ${link.active ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                        )}
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}
