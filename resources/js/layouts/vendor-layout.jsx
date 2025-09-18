import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { LayoutGrid, Package } from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/vendor/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Produk',
        href: route('vendor.products.index'),
        icon: Package,
    },
];

const homeUrl = route('vendor.dashboard');

const footerNavItems = [];
export default ({ children, breadcrumbs, ...props }) => (
    <AppLayoutTemplate homeUrl={homeUrl} mainNavItems={mainNavItems} footerNavItems={footerNavItems} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
