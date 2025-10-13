import { Navbar04 } from '@/components/ui/navbar-04';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useCart } from '@/hooks/use-cart';

export default ({ children, mainNavItems }) => {
    const { auth } = usePage().props;
    const user = auth?.user;
    const { cartCount } = useCart();

    const handleCartClick = () => {
        router.visit(route('buyer.cart.index'));
    }

    const handleSearchSubmit = (query) => {
        if (query.trim()) {
            router.get(route('search'), { search: query.trim() });
        }
    }

    return (
        <PersistentNavigationWrapper>
            <Navbar04
                profileLink={user?.role_id === 5 ? '/profile' : ""}
                menuItems={mainNavItems}
                onSearchSubmit={handleSearchSubmit}
                onCartClick={handleCartClick}
                cartCount={cartCount}
            />

            <main className="w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </PersistentNavigationWrapper>
    )
};
