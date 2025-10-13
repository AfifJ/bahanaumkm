import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { Home, FileText, BarChart3, User } from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/mitra/dashboard',
        icon: Home,
    },
    {
        title: 'Transaksi',
        href: '/mitra/transactions',
        icon: FileText,
    },
    {
        title: 'Laporan',
        href: '/mitra/reports',
        icon: BarChart3,
    },
    {
        title: 'Profil',
        href: '/mitra/profile',
        icon: User,
    },
];

const homeUrl = route('mitra.dashboard');

export default ({ children, breadcrumbs, ...props }) => (
    <AppLayoutTemplate homeUrl={homeUrl} mainNavItems={mainNavItems} footerNavItems={[]} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);