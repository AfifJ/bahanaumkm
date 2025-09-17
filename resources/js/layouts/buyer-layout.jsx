import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { LayoutGrid, Package } from 'lucide-react';

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
];

const homeUrl = route('admin.dashboard');

const footerNavItems = [];
export default ({ children, breadcrumbs, ...props }) => (
    <AppLayoutTemplate homeUrl={homeUrl} mainNavItems={mainNavItems} footerNavItems={footerNavItems} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
