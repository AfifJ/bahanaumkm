import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { Navbar04 } from '@/components/ui/navbar-04';
import { NavbarNonSearch } from '@/components/ui/navbar-04/non-search';
import { router, usePage } from '@inertiajs/react';
import { ArrowLeftRight, LayoutGrid, Newspaper, Package } from 'lucide-react';

const mainNavItems = [
    {
        title: 'Dashboard',
        href: '/sales/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Produk',
        href: '/sales/update-stock',
        icon: Package,
    },
    {
        title: 'Transaksi',
        href: '/sales/transaction',
        icon: ArrowLeftRight,
    },
    {
        title: 'Laporan',
        href: '/sales/reports',
        icon: Newspaper,
    },
];

export default ({ children, withBottomNav, breadcrumbs, title, backLink, ...props }) => {
    const { auth: { user } } = usePage().props;

    return (
        <PersistentNavigationWrapper withBottomNav={withBottomNav} navType="sales">
            <NavbarNonSearch
                backLink={backLink}
                title={title}
            />
            <main>
                {children}
            </main>
        </PersistentNavigationWrapper>
    );
};
