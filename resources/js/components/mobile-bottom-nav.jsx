import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Home, ShoppingCart, Tag, User } from 'lucide-react';

const MobileBottomNav = () => {
    const { url } = usePage();

    const navItems = [
        {
            name: 'Beranda',
            href: route('home'),
            icon: Home,
            active: url === '/',
        },
        {
            name: 'Transaksi',
            href: route('buyer.orders.index'),
            icon: ShoppingCart,
            active: url === '/orders',
        },
        {
            name: 'Promo',
            href: route('promo'),
            icon: Tag,
            active: url === '/promo',
        },
        {
            name: 'Akun',
            href: route('buyer.profile.index'),
            icon: User,
            active: url.startsWith('/profile'),
        },
    ];

    return (
        <nav className="fixed right-0 bottom-0 left-0 z-50 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex flex-1 flex-col items-center justify-center p-2 transition-colors',
                            item.active ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900',
                        )}
                    >
                        <item.icon size={20} className={cn('mb-1 transition-transform', item.active && 'scale-110')} />
                        <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

export default MobileBottomNav;
