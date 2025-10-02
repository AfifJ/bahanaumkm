import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { Eye } from 'lucide-react';
import { useState } from 'react';

const getStatusBadgeVariant = (status) => {
    switch (status) {
        case 'pending': return 'secondary';
        case 'paid': return 'default';
        case 'processed': return 'outline';
        case 'shipped': return 'secondary';
        case 'delivered': return 'default';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
};

const getStatusLabel = (status) => {
    const labels = {
        'pending': 'Menunggu Pembayaran',
        'paid': 'Sudah Dibayar',
        'processed': 'Diproses',
        'shipped': 'Dikirim',
        'delivered': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    return labels[status] || status;
};

const getCurrentMonth = () => {
    const now = new Date();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

export default function Transaction({ orders, availableMonths = [], month: initialMonth = '' }) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || getCurrentMonth());

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            timeZone: 'Asia/Jakarta',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        router.get(route('admin.transaction.index'), { month: value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <AdminLayout
            title="Transaksi"
            breadcrumbs={[
                {
                    title: 'Transaksi',
                    href: route('admin.transaction.index'),
                },
            ]}
        >
            <Head title="Transaksi" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 overflow-auto">
                    {availableMonths.length > 0 && <Select value={selectedMonth} onValueChange={handleMonthChange}>
                        <SelectTrigger>
                            <SelectValue placeholder={selectedMonth || "Pilih Bulan"} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableMonths.map((monthYear) => (
                                <SelectItem key={monthYear} value={monthYear}>
                                    {monthYear}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>}
                    <div className="bg-white mt-6 shadow-sm rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-semibold">Order Code</TableHead>
                                    <TableHead className="font-semibold">Tanggal</TableHead>
                                    <TableHead className="font-semibold">Status</TableHead>
                                    <TableHead className="font-semibold">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.data.map((order) =>
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">
                                            {order.order_code}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(order.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(order.status)}>
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button asChild>
                                                <Link
                                                    href={route('admin.transaction.show', order.id)}
                                                >
                                                    <Eye />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
