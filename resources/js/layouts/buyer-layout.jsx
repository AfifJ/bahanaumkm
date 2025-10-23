import { Navbar04 } from '@/components/ui/navbar-04';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useCart } from '@/hooks/use-cart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Home, Heart, User, Package, HelpCircle, LayoutDashboard, ShoppingCart, ArrowLeftRight } from 'lucide-react';

export default ({ children, mainNavItems }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { cartCount } = useCart();
    const isMobile = useIsMobile();

    const handleCartClick = () => {
        router.visit(route('buyer.cart.index'));
    }

    const handleSearchSubmit = (query) => {
        if (query.trim()) {
            router.get(route('search'), { search: query.trim() });
        }
    }

    // Role-based main navigation items
    const getRoleBasedMainNavItems = (user) => {
        const roleId = user?.role_id;

        // Buyer role navigation items
        if (roleId === 5) {
            return [
                {
                    label: 'Beranda',
                    href: route('home'),
                    icon: Home,
                },
                {
                    label: 'Transaksi',
                    href: route('buyer.orders.index'),
                    icon: Package,
                },
                {
                    label: 'Wishlist',
                    href: route('buyer.wishlist'),
                    icon: Heart,
                },
                {
                    label: 'Profil',
                    href: route('buyer.profile.index'),
                    icon: User,
                },
                {
                    label: 'Pusat Bantuan',
                    href: route('buyer.profile.bantuan'),
                    icon: HelpCircle,
                },
            ];
        }

        // Admin role navigation items
        if (roleId === 1) {
            return [
                {
                    label: 'Dashboard',
                    href: route('admin.dashboard'),
                    icon: LayoutDashboard,
                },
            ];
        }

        // Vendor role navigation items
        if (roleId === 2) {
            return [
                {
                    label: 'Dashboard',
                    href: route('vendor.dashboard'),
                    icon: LayoutDashboard,
                },
                {
                    label: 'Produk Saya',
                    href: route('vendor.products.index'),
                    icon: Package,
                },
                {
                    label: 'Transaksi',
                    href: route('vendor.transaction.index'),
                    icon: ShoppingCart,
                },
                {
                    label: 'Pusat Bantuan',
                    href: route('buyer.profile.bantuan'),
                    icon: HelpCircle,
                },
            ];
        }

        // Sales role navigation items
        if (roleId === 4) {
            return [
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
                {
                    label: 'Pusat Bantuan',
                    href: route('buyer.profile.bantuan'),
                    icon: HelpCircle,
                },
            ];
        }

        return [];
    };

    // Get mainNavItems from props or generate from user role
    const effectiveMainNavItems = mainNavItems || getRoleBasedMainNavItems(user);


    return (
        <PersistentNavigationWrapper withBottomNav={isMobile} navType="buyer">
            <Navbar04
                profileLink={user?.role_id === 5 ? '/profile' : ""}
                menuItems={effectiveMainNavItems}
                navigationLinks={[]}
                onSearchSubmit={handleSearchSubmit}
                onCartClick={handleCartClick}
                cartCount={cartCount}
            />

            <main className="w-full max-w-screen-2xl mx-auto">
                {children}
            </main>
        </PersistentNavigationWrapper>
    )
};
