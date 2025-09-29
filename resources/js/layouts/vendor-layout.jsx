import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { ArrowLeftRight, LayoutGrid, Newspaper, Package } from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/vendor/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Produk',
        href: '/vendor/products',
        icon: Package,
    },
    {
        title: 'Transaksi',
        href: '/vendor/transaction',
        icon: ArrowLeftRight,
    },
    {
        title: 'Laporan',
        // href: route('vendor.report.index'),
        href: '/vendor/report',
        icon: Newspaper,
    },
];

const homeUrl = route('vendor.dashboard');

export default ({ children, breadcrumbs, ...props }) => (
    <AppLayoutTemplate profileLink={route('profile.edit')} homeUrl={homeUrl} mainNavItems={mainNavItems} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
