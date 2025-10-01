import { Navbar04 } from '@/components/ui/navbar-04';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { router, usePage } from '@inertiajs/react';

export default ({ children, mainNavItems }) => {
    const { auth: { user } } = usePage().props;

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
            />

            <main>
                {children}
            </main>
        </PersistentNavigationWrapper>
    )
};
