import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { Navbar04 } from '@/components/ui/navbar-04';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useIsMobile } from '@/hooks/use-mobile';
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
    const { auth } = usePage().props;
    const user = auth?.user;
    const isMobile = useIsMobile();

    // Desktop navigation items for sales
    const navigationLinks = [
        {
            label: 'Dashboard',
            href: route('sales.dashboard'),
        },
        {
            label: 'Produk',
            href: route('sales.products.index'),
        },
        {
            label: 'Transaksi',
            href: route('sales.transactions'),
        },
        {
            label: 'Laporan',
            href: route('sales.reports'),
        },
    ];

    // Default to true if not provided, to maintain responsive behavior
    const showBottomNav = withBottomNav !== false ? isMobile : false;

    return (
        <PersistentNavigationWrapper withBottomNav={showBottomNav} navType="sales">
            <Navbar04
                profileLink={user?.role_id === 4 ? '/sales/profile' : ""}
                navigationLinks={!isMobile ? navigationLinks : []}
                cartCount="" // Sales users don't need cart
                onCartClick={null} // No cart functionality for sales
                onSearchSubmit={null} // No search functionality for sales
            />
            <main className="w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </PersistentNavigationWrapper>
    );
};
