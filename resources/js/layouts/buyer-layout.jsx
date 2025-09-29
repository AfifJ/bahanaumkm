import MobileBottomNav from '@/components/mobile-bottom-nav';
import { Navbar04 } from '@/components/ui/navbar-04';
import { useIsMobile } from '@/hooks/use-mobile';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { router } from '@inertiajs/react';
import { LayoutGrid, Package, ShoppingCart, History, HelpCircle } from 'lucide-react';

const footerNavItems = [];
export default ({ children, breadcrumbs, mainNavItems, ...props }) => {
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
                menuItems={mainNavItems}
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
