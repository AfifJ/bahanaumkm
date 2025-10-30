import { Navbar04 } from '@/components/ui/navbar-04';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useCart } from '@/hooks/use-cart';
import { useIsMobile } from '@/hooks/use-mobile';
import { Package, HelpCircle, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { NavbarNonSearch } from '@/components/ui/navbar-04/non-search';

export default ({ withBottomNav, children, breadcrumbs, backLink, title, navbar = true, ...props }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { cartCount } = useCart();
    const isMobile = useIsMobile();

    const handleCartClick = () => {
        router.visit(route('buyer.cart.index'));
    }

    // Role-based main navigation items
    const getRoleBasedMainNavItems = (user) => {
        const roleId = user?.role_id;

        // Buyer role navigation items
        if (roleId === 5) {
            return [
                {
                    label: 'Pesanan Saya',
                    href: route('buyer.orders.index'),
                    icon: Package,
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
                    label: 'Pusat Bantuan',
                    href: route('buyer.profile.bantuan'),
                    icon: HelpCircle,
                },
            ];
        }

        return [];
    };

    const mainNavItems = getRoleBasedMainNavItems(user);

    // Desktop navigation items for buyer
    const navigationLinks = [
        {
            label: 'Beranda',
            href: route('home'),
        },
        {
            label: 'Transaksi',
            href: route('buyer.orders.index'),
        },
        {
            label: 'Wishlist',
            href: route('buyer.wishlist'),
        },
        {
            label: 'Profil',
            href: route('buyer.profile.index'),
        },
    ];

    // Default to true if not provided, to maintain responsive behavior
    const showBottomNav = withBottomNav !== false ? isMobile : false;

    return (
        <PersistentNavigationWrapper withBottomNav={showBottomNav} navType="buyer">
            {navbar &&
                <NavbarNonSearch
                    profileLink={user?.role_id == 5 ? '/profile' : ""}
                    menuItems={mainNavItems}
                    navigationLinks={!isMobile ? navigationLinks : []}
                    onCartClick={handleCartClick}
                    cartCount={cartCount}
                    backLink={backLink}
                    title={title}
                />
            }

            <main className="w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </PersistentNavigationWrapper>
    )
};
