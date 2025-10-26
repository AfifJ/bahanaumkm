import { Head, Link, usePage } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
            case 'validation':
                return 'bg-blue-100 text-blue-800';
            case 'paid':
                return 'bg-indigo-100 text-indigo-800';
            case 'processed':
                return 'bg-purple-100 text-purple-800';
            case 'out_for_delivery':
                return 'bg-orange-100 text-orange-800';
            case 'delivered':
                return 'bg-teal-100 text-teal-800';
            case 'payment_rejected':
                return 'bg-red-100 text-red-800';
            case 'failed_delivery':
                return 'bg-red-200 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            case 'returned':
                return 'bg-amber-100 text-amber-800';
            case 'refunded':
                return 'bg-slate-100 text-slate-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredTransactions = transactions.data.filter((transaction) =>
        transaction.order_code.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="px-4 pt-4 pb-4 space-y-4">
                <div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Riwayat Transaksi
                    </div>
                </div>
                <div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Cari berdasarkan kode order..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Summary Stats */}
       {/*      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
                <Card>
                    <CardContent>
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
            </div> */}

            {/* Transactions List */}
            <div className={'m-4'}>
                <div className='mb-2'>
                    <h2 className='font-bold'>Daftar Transaksi</h2>
                    <div className='text-sm text-muted-foreground'>
                        Menampilkan {filteredTransactions.length} dari {transactions.total} transaksi
                    </div>
                </div>
                <div>
                    {filteredTransactions.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">
                                {searchTerm ? 'Tidak ada transaksi yang ditemukan' : 'Belum ada transaksi'}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500">
                                {searchTerm
                                    ? 'Coba ubah kata kunci pencarian'
                                    : 'Transaksi akan muncul di sini ketika ada customer yang memesan'}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Kode Order</TableHead>
                                    <TableHead className="text-center">Items</TableHead>
                                    <TableHead className="text-right">Komisi</TableHead>
                                    <TableHead className="text-right">Tanggal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTransactions.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="font-medium">
                                            {transaction.order_code}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {transaction.items_count}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="font-medium">
                                                {formatCurrency(transaction.commission)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {formatDateTime(transaction.created_at)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                </div>
            </div>
        </MitraLayout>
    );
}