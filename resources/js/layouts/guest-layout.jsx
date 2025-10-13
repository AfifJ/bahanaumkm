import { Navbar04 } from '@/components/ui/navbar-04';
import PersistentNavigationWrapper from '@/components/persistent-navigation-wrapper';
import { BookOpen, Folder, LayoutGrid, ShoppingCart } from 'lucide-react';
import { router } from '@inertiajs/react';

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

const Example = ({ children }) => {
    const handleSearchSubmit = (query) => {
        if (query.trim()) {
            router.get(route('search'), { search: query.trim() });
        }
    };

    return (
        <PersistentNavigationWrapper>
            <Navbar04 onSearchSubmit={handleSearchSubmit} />
            <main className="w-full">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    {children}
                </div>
            </main>
        </PersistentNavigationWrapper>
    );
};

export default Example;
