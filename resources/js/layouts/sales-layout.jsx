import { Navbar04 } from '@/components/ui/navbar-04';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeftRight, LayoutDashboard, Newspaper, Package, User } from 'lucide-react';

export default ({ children, withBottomNav, breadcrumbs, title, backLink, ...props }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const isMobile = useIsMobile();

    // Sales menu items for dropdown
    const salesMenuItems = [
        {
            label: 'Dashboard',
            href: route('sales.dashboard'),
            icon: LayoutDashboard,
        },
        {
            label: 'Produk',
            href: route('sales.products.index'),
            icon: Package,
        },
        {
            label: 'Transaksi',
            href: route('sales.transactions'),
            icon: ArrowLeftRight,
        },
        {
            label: 'Laporan',
            href: route('sales.reports'),
            icon: Newspaper,
        },
        {
            label: 'Profil',
            href: route('sales.profile.index'),
            icon: User,
        },
    ];

    // Default to true if not provided, to maintain responsive behavior
    const showBottomNav = withBottomNav !== false ? isMobile : false;

    return (
        <PersistentNavigationWrapper withBottomNav={showBottomNav} navType="sales">
            <Navbar04
                profileLink="/sales/profile"
                menuItems={salesMenuItems}
                navigationLinks={[]} // No top navigation links, use dropdown instead
                cartCount="" // Sales users don't need cart
                onCartClick={null} // No cart functionality for sales
                onSearchSubmit={undefined} // Disable search functionality for sales
            />
            <main className="w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </PersistentNavigationWrapper>
    );
};
