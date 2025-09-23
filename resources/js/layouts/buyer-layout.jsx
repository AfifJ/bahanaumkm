import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { LayoutGrid, Package, ShoppingCart, History } from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Products',
        href: '/products',
        icon: Package,
    },
    {
        title: 'Keranjang',
        href: '/buyer/orders/create',
        icon: ShoppingCart,
    },
    {
        title: 'Riwayat Pesanan',
        href: '/buyer/orders',
        icon: History,
    },
];

const homeUrl = route('admin.dashboard');

const footerNavItems = [];
export default ({ children, breadcrumbs, ...props }) => (
    <AppLayoutTemplate homeUrl={homeUrl} mainNavItems={mainNavItems} footerNavItems={footerNavItems} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
