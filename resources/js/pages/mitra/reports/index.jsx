import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import MitraLayout from '@/layouts/mitra-layout';
import { BarChart3, DollarSign, ShoppingCart, TrendingUp, FileText } from 'lucide-react';

export default function MitraReports({ orderItems, summary }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <MitraLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('mitra.dashboard') },
                { title: 'Laporan', href: route('mitra.reports') },
            ]}
        >
            <Head title="Laporan Penjualan" />

            {/* Summary Cards */}
          {/*   <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4 mt-4 mx-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.total_orders}</div>
                        <p className="text-xs text-muted-foreground">
                            Semua transaksi
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.total_revenue)}</div>
                        <p className="text-xs text-muted-foreground">
                            Dari penjualan produk
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summary.total_commission)}</div>
                        <p className="text-xs text-muted-foreground">
                            25% dari margin keuntungan
                        </p>
                    </CardContent>
                </Card>
            </div> */}

            <div className={'mx-4 mt-4'}>
                <div>
                    <div className="flex items-center gap-2 font-bold">
                        <FileText className="h-5 w-5" />
                        Laporan Penjualan Produk
                    </div>
                    <div className='text-muted-foreground text-sm'>
                        Laporan penjualan produk per item
                    </div>
                </div>
                <div>
                    {orderItems.data.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                Belum ada data penjualan
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Detail komisi akan muncul di sini ketika ada produk yang terjual
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produk</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Harga</TableHead>
                                    <TableHead className="text-right">Komisi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderItems.data.map((item, index) => (
                                    <TableRow key={item.id}>
                                        <TableCell>
                                            <div className="font-medium">{item.product_name}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(item.unit_price)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-bold text-blue-600">
                                                {formatCurrency(item.commission)}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={3} className="text-right font-semibold">
                                        Total:
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="font-bold text-blue-600">
                                            {formatCurrency(
                                                orderItems.data.reduce((sum, item) => sum + item.commission, 0)
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    )}

                    {/* Pagination */}
                    {orderItems.links && orderItems.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {orderItems.links.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 text-sm rounded-md ${link.active
                                            ? 'bg-blue-600 text-white'
                                            : link.url
                                                ? 'bg-white border text-gray-700 hover:bg-gray-50'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </MitraLayout>
    );
}