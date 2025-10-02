import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { Home, ShoppingBag, ShoppingCart, Tag, User } from 'lucide-react';
import { memo } from 'react';

const MobileBottomNav = memo(function MobileBottomNav() {
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
            icon: ShoppingBag,
            active: url === '/orders',
        },
        {
            name: 'Wishlist',
            href: route('buyer.wishlist'),
            icon: Tag,
            active: url === '/wishlist',
        },
        {
            name: 'Akun',
            href: route('buyer.profile.index'),
            icon: User,
            active: url.startsWith('/profile'),
        },
    ];

    return (
        <nav className="fixed right-0 bottom-0 left-0 z-50 border-t bg-white">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'p-1 transition-colors',
                            item.active ? 'text-primary' : 'text-gray-600 hover:text-gray-900',
                        )}
                    >
                        <div className={cn('flex flex-1 flex-col items-center justify-center p-1 rounded-lg', item.active && 'bg-green-600/20')}>
                            <item.icon size={20} className={cn('mb-1 transition-transform', item.active && 'scale-110')} />
                            <span className="text-xs font-medium">{item.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
});

export default MobileBottomNav;
