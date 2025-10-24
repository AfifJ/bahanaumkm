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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminLayout from '@/layouts/admin-layout';
import ProductSearch from '@/components/product-search';
import Pagination from '@/components/pagination';
import { Head, Link, router } from '@inertiajs/react';
import { CornerUpRight, Edit, MoveUpRight, PlusIcon, Star, Trash, MessageSquare, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Index({ products, can, filters = {}, filterOptions = {} }) {
    const [currentFilters, setCurrentFilters] = useState(filters);
    console.log(products.data);

    useEffect(() => {
        setCurrentFilters(filters);
    }, [filters]);

    const handleFilterChange = (key, value) => {
        let newFilters;

        if (key === 'clear') {
            // Clear all filters - start with empty object
            newFilters = {};
        } else {
            newFilters = { ...currentFilters };

            if (value === '' || value === null || value === undefined) {
                delete newFilters[key];
            } else {
                newFilters[key] = value;
            }
        }

        setCurrentFilters(newFilters);

        // Update URL with new filters
        router.get(
            route('admin.products.index'),
            newFilters,
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handlePageChange = (page) => {
        router.get(
            route('admin.products.index'),
            { ...currentFilters, page },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };
    const renderRating = (avgRating, reviewsCount) => {
        if (!avgRating || reviewsCount === 0) {
            return (
                <div className="flex items-center text-xs text-gray-500">
                    <Star className="h-3 w-3 mr-1" />
                    Belum ada review
                </div>
            );
        }

        return (
            <div className="flex items-center">
                <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium">
                        {parseFloat(avgRating).toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                        ({reviewsCount})
                    </span>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout
            title="Produk"
            breadcrumbs={[
                {
                    title: 'Produk',
                    href: route('admin.products.index'),
                },
            ]}
        >
            <Head title="Produk" />

            <div className="py-6">
                <div className="px-4 sm:px-6">
                    <div className="flex flex-row items-center justify-between pb-4">
                        <h2 className="text-2xl font-bold">Daftar Produk</h2>
                        {can.create && route('admin.products.create') && (
                            <Button asChild>
                                <Link href={route('admin.products.create')}>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Tambah Produk
                                </Link>
                            </Button>
                        )}
                    </div>

                    {/* Search and Filters */}
                    <ProductSearch
                        filters={currentFilters}
                        filterOptions={filterOptions}
                        onFilterChange={handleFilterChange}
                    />
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Gambar</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead className="text-right">Harga Beli</TableHead>
                                <TableHead className="text-right">Harga Jual</TableHead>
                                <TableHead className="text-center">Rating</TableHead>
                                <TableHead className="text-right">Stok</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.data.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        {(() => {
                                            const imageUrl = product.primary_image?.url;
                                            return imageUrl ? (
                                                <div className="h-10 w-10 overflow-hidden rounded-md border">
                                                    <img src={imageUrl} alt={product.name} className="h-full w-full object-contain" loading="lazy" />
                                                </div>
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200">
                                                    <span className="text-sm font-medium text-gray-600">
                                                        {product.name.substring(0, 2).toUpperCase()}
                                                    </span>
                                                </div>
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell className="font-medium text-blue-600 max-w-xs whitespace-nowrap overflow-hidden text-ellipsis" title={product.name}>
                                        <div className="flex items-center gap-2">
                                            {can.edit && (
                                                <Link href={route('admin.products.edit', product)}>
                                                    {product.name}  <MoveUpRight className='inline h-4 w-4' />
                                                </Link>
                                            )}
                                            {product.has_variations && (
                                                <Badge variant="secondary" className="text-xs">
                                                    <Layers className="h-3 w-3 mr-1" />
                                                    {product.skus_count || 0} Variasi
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{product.vendor?.name || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        {product.has_variations ? (
                                            <div className="text-right">
                                                {product.buy_price_min !== product.buy_price_max ? (
                                                    <div className="text-xs">
                                                        <div>{new Intl.NumberFormat('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        }).format(product.buy_price_min)}</div>

                                                        <div className="text-gray-500">s/d</div>

                                                        <div>{new Intl.NumberFormat('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        }).format(product.buy_price_max)}</div>
                                                    </div>
                                                ) : (
                                                    new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    }).format(product.buy_price_display)
                                                )}
                                            </div>
                                        ) : (
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(product.buy_price)
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {product.has_variations ? (
                                            <div className="text-right">
                                                {product.sell_price_min !== product.sell_price_max ? (
                                                    <div className="text-xs">
                                                        <div>{new Intl.NumberFormat('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        }).format(product.sell_price_min)}</div>
                                                        <div className="text-gray-500">s/d</div>
                                                        <div>{new Intl.NumberFormat('id-ID', {
                                                            style: 'currency',
                                                            currency: 'IDR',
                                                            minimumFractionDigits: 0,
                                                            maximumFractionDigits: 0,
                                                        }).format(product.sell_price_max)}</div>
                                                    </div>
                                                ) : (
                                                    new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0,
                                                        maximumFractionDigits: 0,
                                                    }).format(product.sell_price_display)
                                                )}
                                            </div>
                                        ) : (
                                            new Intl.NumberFormat('id-ID', {
                                                style: 'currency',
                                                currency: 'IDR',
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 0,
                                            }).format(product.sell_price)
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {renderRating(product.reviews_avg_rating, product.reviews_count)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {product.has_variations ? (
                                            <div className="text-right">
                                                {product.stock_min !== product.stock_max ? (
                                                    <div className="text-xs">
                                                        <div>{product.stock_min}</div>
                                                        <div className="text-gray-500">-</div>
                                                        <div>{product.stock_max}</div>
                                                    </div>
                                                ) : (
                                                    product.stock_min
                                                )}
                                            </div>
                                        ) : (
                                            product.stock
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{product.status}</Badge>
                                    </TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        {product.reviews_count > 0 && (
                                            <Button asChild variant="outline" size="sm" title="Manage Reviews">
                                                <Link href={route('admin.products.reviews', product)}>
                                                    <MessageSquare className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        )}
                                        {can.edit && (
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={route('admin.products.edit', product)}>
                                                    <Edit />
                                                </Link>
                                            </Button>
                                        )}
                                        {can.delete && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild className='hover:cursor-pointer'>
                                                    <Button variant="outline" size="sm">
                                                        <Trash className="text-red-500" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Penghapusan data tidak bisa dibatalkan. Tindakan ini akan menghapus data secara permanen
                                                            dari server.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction asChild>
                                                            <Link href={route('admin.products.destroy', product)} method="delete" as="button">
                                                                Lanjutkan
                                                            </Link>
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Custom Pagination */}
                    <Pagination
                        data={products}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
