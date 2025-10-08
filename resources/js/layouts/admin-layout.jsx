import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { ArrowLeftRight, LayoutGrid, Package, Tag, Truck, Users } from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
        icon: Tag,
    },
    {
        title: 'Pengguna',
        href: '/admin/users',
        icon: Users,
        children: [
            {
                title: 'Kelola Admin',
                href: '/admin/users/Admin',
            },
            {
                title: 'Kelola Vendor',
                href: '/admin/users/Vendor',
            },
            {
                title: 'Kelola Mitra',
                href: '/admin/users/Mitra',
            },
            {
                title: 'Kelola Sales Lapangan',
                href: '/admin/users/Sales Lapangan',
            },
            {
                title: 'Kelola Buyer',
                href: '/admin/users/Buyer',
            },
        ],
    },
    {
        title: 'Manajemen Produk Sales',
        href: '/admin/sales-products',
        icon: Truck,
    },
    {
        title: 'Transaksi',
        href: '/admin/transaction',
        icon: ArrowLeftRight,
    },
];

const homeUrl = route('admin.dashboard');

const footerNavItems = [];
export default ({ children, breadcrumbs, ...props }) => (
    <AppLayoutTemplate homeUrl={homeUrl} mainNavItems={mainNavItems} footerNavItems={footerNavItems} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
