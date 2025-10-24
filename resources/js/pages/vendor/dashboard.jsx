import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import VendorLayout from '@/layouts/vendor-layout';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { route } from 'ziggy-js';

const getCurrentMonth = () => {
    const now = new Date();
    const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${monthNames[now.getMonth()]} ${now.getFullYear()}`;
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        timeZone: 'Asia/Jakarta',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export default function VendorDashboard({ statistics, recentTransactions = [], availableMonths = [], month: initialMonth = '' }) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth || getCurrentMonth());

    const handleMonthChange = (value) => {
        setSelectedMonth(value);
        router.get(route('vendor.dashboard'), { month: value }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    return (
        <VendorLayout>
            <Head title="Vendor Dashboard" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Dashboard Vendor</h1>
                    {availableMonths.length > 0 && (
                        <Select value={selectedMonth} onValueChange={handleMonthChange}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder={selectedMonth || "Pilih Bulan"} />
                            </SelectTrigger>
                            <SelectContent>
                                {availableMonths.map((monthYear) => (
                                    <SelectItem key={monthYear} value={monthYear}>
                                        {monthYear}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <p className="text-gray-600 mb-6">
                    Selamat datang di dashboard khusus untuk vendor. Di sini Anda dapat melihat statistik transaksi yang sudah selesai.
                </p>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Transaksi Selesai</h3>
                        <p className="text-3xl font-bold text-blue-600">{statistics.totalTransactions}</p>
                        <p className="text-sm text-gray-600 mt-1">Transaksi dengan status "Selesai"</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pendapatan</h3>
                        <p className="text-3xl font-bold text-green-600">
                            {formatCurrency(statistics.totalRevenue)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Dari transaksi yang selesai</p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Produk Terjual</h3>
                        <p className="text-3xl font-bold text-purple-600">{statistics.totalProductsSold}</p>
                        <p className="text-sm text-gray-600 mt-1">Jumlah produk terjual</p>
                    </div>
                </div>

                {/* Recent Transactions */}
                {recentTransactions.length > 0 && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <h2 className="text-lg font-semibold p-6 pb-4">Transaksi Terakhir</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-t">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Kode Order
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tanggal
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produk
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentTransactions.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {transaction.order_code}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(transaction.created_at)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="space-y-1">
                                                    {transaction.items.map((item, index) => (
                                                        <div key={index}>
                                                            {item.product?.name || '—'} ({item.quantity}x)
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(transaction.total_amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {recentTransactions.length === 0 && (
                    <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                        <div className="text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p>Belum ada transaksi yang selesai pada periode ini</p>
                        </div>
                    </div>
                )}
            </div>
        </VendorLayout>
    );
}
