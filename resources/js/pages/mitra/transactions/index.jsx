import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import MitraLayout from '@/layouts/mitra-layout';
import { Search, FileText, Calendar, TrendingUp, Filter } from 'lucide-react';
import { useState } from 'react';

export default function MitraTransactions({ transactions }) {
    const [searchTerm, setSearchTerm] = useState('');
    const { url } = usePage();

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredTransactions = transactions.data.filter((transaction) =>
        transaction.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <MitraLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('mitra.dashboard') },
                { title: 'Transaksi', href: route('mitra.transactions') },
            ]}
        >
            <Head title="Riwayat Transaksi Mitra" />

            {/* Search and Filter */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Riwayat Transaksi
                    </CardTitle>
                    <CardDescription>
                        Semua transaksi yang terjadi di mitra Anda
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari berdasarkan kode order atau customer..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <Calendar className="h-8 w-8 text-blue-600" />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold">Total Transaksi</h3>
                                <p className="text-2xl font-bold">{transactions.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold">Total Penjualan</h3>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        transactions.data.reduce((sum, t) => sum + t.total_amount, 0)
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center">
                            <FileText className="h-8 w-8 text-purple-600" />
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold">Total Komisi</h3>
                                <p className="text-2xl font-bold">
                                    {formatCurrency(
                                        transactions.data.reduce((sum, t) => sum + t.commission, 0)
                                    )}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transactions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Transaksi</CardTitle>
                    <CardDescription>
                        Menampilkan {filteredTransactions.length} dari {transactions.total} transaksi
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                {searchTerm ? 'Tidak ada transaksi yang ditemukan' : 'Belum ada transaksi'}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {searchTerm
                                    ? 'Coba ubah kata kunci pencarian'
                                    : 'Transaksi akan muncul di sini ketika ada customer yang memesan'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredTransactions.map((transaction) => (
                                <div
                                    key={transaction.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-lg">
                                                    {transaction.order_code}
                                                </h3>
                                                <Badge className={getStatusColor(transaction.status)}>
                                                    {transaction.status}
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500">Customer</p>
                                                    <p className="font-medium">{transaction.customer_name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Jumlah Item</p>
                                                    <p className="font-medium">{transaction.items_count} item</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Tanggal</p>
                                                    <p className="font-medium">{formatDateTime(transaction.created_at)}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-lg font-semibold">
                                                {formatCurrency(transaction.total_amount)}
                                            </div>
                                            <div className="text-sm text-green-600 font-medium">
                                                +{formatCurrency(transaction.commission)} komisi
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {transactions.links && transactions.links.length > 3 && (
                        <div className="mt-6 flex justify-center">
                            <div className="flex gap-2">
                                {transactions.links.map((link, index) => (
                                    <Link
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