import MobileBottomNav from '@/components/mobile-bottom-nav';
import { Navbar04 } from '@/components/ui/navbar-04';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { router } from '@inertiajs/react';
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
export default ({ children, breadcrumbs, ...props }) => {
    const isMobile = useIsMobile();

    const handleCartClick = () => {
        console.log('cart click');
        router.visit(route('buyer.cart.index')); // atau route yang sesuai
    }

    const handleSearchSubmit = (query) => {
        if (query.trim()) {
            router.get(route('search'), { search: query.trim() });
        }
    }
    return (
        <div className="relative w-full">
            <Navbar04
                onSearchSubmit={handleSearchSubmit}
                onCartClick={handleCartClick}
            />

            <main className={isMobile ? 'pb-16' : ''}>
                {children}
            </main>
            {isMobile && <MobileBottomNav />}
        </div>
    )
};
