import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { BookOpen, Folder, LayoutGrid, ShoppingCart } from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Katalog',
        href: '/catalog',
        icon: ShoppingCart,
    },
];

const footerNavItems = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];
export default ({ children, breadcrumbs, ...props }) => (
    <AppLayoutTemplate mainNavItems={mainNavItems} footerNavItems={footerNavItems} breadcrumbs={breadcrumbs} {...props}>
        {children}
    </AppLayoutTemplate>
);
