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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CornerUpRight, Edit, Eye, MoveUpRight, PlusIcon, Trash } from 'lucide-react';
import { useState } from 'react';

export default function Transaction({ orders, availableMonths = [], month: initialMonth = '' }) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        router.get(route('admin.transaction.index'), { month: value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const formatMonthYear = (monthYear) => {
        if (!monthYear) return 'Semua Bulan';
        const [year, month] = monthYear.split('-');
        const monthNames = [
            'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        return `${monthNames[parseInt(month) - 1]} ${year}`;
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
                    <div className="mb-4">
                        <Select value={selectedMonth} onValueChange={handleMonthChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Semua Bulan</SelectItem>
                                {availableMonths.map((monthYear) => (
                                    <SelectItem key={monthYear} value={monthYear.split('-')[1]}>
                                        {formatMonthYear(monthYear)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Table>
                        <TableHeader >
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Waktu</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Aksi</TableHead>
                                {/* <TableHead>Produk</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Mitra</TableHead>
                                <TableHead>Buyer</TableHead> */}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.map((order) =>
                                <TableRow key={order.id}>
                                    <TableCell>
                                        {order.order_code}
                                    </TableCell>
                                    <TableCell>
                                        {order.created_at}
                                    </TableCell>
                                    <TableCell>
                                        {order.status}
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
        </AdminLayout>
    );
}
