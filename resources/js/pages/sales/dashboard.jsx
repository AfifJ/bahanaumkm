import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/app-header';
import MobileBottomNav from '@/components/mobile-bottom-nav';
import SalesLayout from '@/layouts/sales-layout';
import { ClipboardList, LayoutList, Plus } from 'lucide-react';

export default function SalesDashboard({ auth, borrowedProducts = [], salesStats = {} }) {
    const quickActions = [
        {
            title: 'Tambah Transaksi',
            description: 'Tambahkan transaksi baru',
            icon: <Plus />,
            link: route('sales.transactions.create'),
            color: 'bg-yellow-100 text-yellow-600'
        },
        {
            title: 'Daftar Produk',
            description: 'Update produk',
            icon: <LayoutList />,
            link: '/sales/products',
            color: 'bg-green-100 text-green-600'
        },
        {
            title: 'Laporan',
            description: 'Lihat laporan penjualan',
            icon: <ClipboardList />,
            link: '/sales/reports',
            color: 'bg-purple-100 text-purple-600'
        }
    ];

    return (
        <SalesLayout title={'Dashboard'}>
            <Head title="Dashboard Sales" />

            <div className="p-4 space-y-6 pb-20">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Menu</h2>
                    <div className="space-y-3">
                        {quickActions.map((action, index) => (
                            <Link
                                key={index}
                                href={action.link}
                                className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                            >
                                {<div className={`p-3 rounded-full ${action.color} mr-4`}>
                                    <span className="text-xl">{action.icon}</span>
                                </div>}
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                </div>
                                <div className="text-gray-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </SalesLayout>
    );
}
