import { Navbar04 } from '@/components/ui/navbar-04';
import MobileBottomNav from '@/components/mobile-bottom-nav';
import { BookOpen, Folder, LayoutGrid, ShoppingCart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
    const isMobile = useIsMobile();
    
    return (
        <div className="relative w-full">
            <Navbar04 />
            <main className={isMobile ? 'pb-16' : ''}>
                {children}
            </main>
            {isMobile && <MobileBottomNav />}
        </div>
    );
};

export default Example;
