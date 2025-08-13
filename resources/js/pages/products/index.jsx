import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { PlusIcon } from 'lucide-react';

export default function Index({ products, can }) {
    return (
        <AppLayout
            title="Products"
            breadcrumbs={[
                {
                    title: 'Products',
                    href: route('products.index'),
                },
            ]}
        >
            <Head title="Products" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex flex-row items-center justify-between pb-4">
                        <h2 className="text-2xl font-bold">Product List</h2>
                        {can.create && (
                            <Link href={route('products.create')}>
                                <Button>
                                    <PlusIcon className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </Link>
                        )}
                    </div>
                    <div>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader className="bg-gray-50">
                                    <TableRow>
                                        <TableHead>Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-right">Buy Price</TableHead>
                                        <TableHead className="text-right">Sell Price</TableHead>
                                        <TableHead className="text-right">Stock</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                {product.image_url ? (
                                                    <div className="h-10 w-10 overflow-hidden rounded-md border">
                                                        <img src={product.image_url} alt={product.name} className="h-full w-full object-contain" />
                                                    </div>
                                                ) : (
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-200">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {product.name.substring(0, 2).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                }).format(product.buy_price)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR',
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 0,
                                                }).format(product.sell_price)}
                                            </TableCell>
                                            <TableCell className="text-right">{product.stock}</TableCell>
                                            <TableCell>
                                                <Badge variant={product.status === 'active' ? 'default' : 'destructive'}>{product.status}</Badge>
                                            </TableCell>
                                            <TableCell className="space-x-2 text-right">
                                                {can.edit && (
                                                    <Link href={route('products.edit', product.id)}>
                                                        <Button variant="outline" size="sm">
                                                            Edit
                                                        </Button>
                                                    </Link>
                                                )}
                                                {can.delete && (
                                                    <Link href={route('products.destroy', product.id)} method="delete" as="button">
                                                        <Button variant="destructive" size="sm">
                                                            Delete
                                                        </Button>
                                                    </Link>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
