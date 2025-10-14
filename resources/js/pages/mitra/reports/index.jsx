import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

    const formatDateTime = (dateTimeString) => {
        return new Date(dateTimeString).toLocaleString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <MitraLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('mitra.dashboard') },
                { title: 'Laporan', href: route('mitra.reports') },
            ]}
        >
            <Head title="Laporan Keuangan Mitra" />

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 m-4">
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
            </div>

            {/* Commission Formula Explanation */}
            <Card className="mb-6 m-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Formula Komisi
                    </CardTitle>
                    <CardDescription>
                        Cara perhitungan komisi untuk setiap produk
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                                i
                            </div>
                            <h3 className="font-semibold text-blue-900">Rumus Komisi</h3>
                        </div>
                        <div className="space-y-2 text-blue-800">
                            <p className="font-mono text-sm">
                                Komisi = (Harga Jual - Harga Beli) × 25% × Jumlah
                            </p>
                            <p className="text-sm">
                                Contoh: (Rp50.000 - Rp30.000) × 25% × 2 pcs = Rp10.000
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Commission Breakdown */}
            <Card className={'m-4'}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Detail Komisi Per Item
                    </CardTitle>
                    <CardDescription>
                        Rincian komisi dari setiap item yang terjual
                    </CardDescription>
                </CardHeader>
                <CardContent>
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
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Order</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Produk</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-900">Qty</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-900">Harga Jual</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-900">Harga Beli</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-900">Margin</th>
                                        <th className="text-right py-3 px-4 font-medium text-gray-900">Komisi</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-900">Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems.data.map((item, index) => (
                                        <tr key={item.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                            <td className="py-3 px-4">
                                                <div className="font-mono text-sm">{item.order_code}</div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="font-medium">{item.product_name}</div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {item.quantity}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                {formatCurrency(item.unit_price)}
                                            </td>
                                            <td className="py-3 px-4 text-right text-gray-600">
                                                {formatCurrency(item.buy_price)}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="font-medium text-green-600">
                                                    {formatCurrency(item.margin)}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="font-bold text-blue-600">
                                                    {formatCurrency(item.commission)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    25% × {item.quantity}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="text-sm text-gray-600">
                                                    {formatDateTime(item.created_at)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-100 font-semibold">
                                        <td colSpan="6" className="py-3 px-4 text-right">
                                            Total:
                                        </td>
                                        <td className="py-3 px-4 text-right text-blue-600">
                                            {formatCurrency(
                                                orderItems.data.reduce((sum, item) => sum + item.commission, 0)
                                            )}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
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
                </CardContent>
            </Card>
        </MitraLayout>
    );
}