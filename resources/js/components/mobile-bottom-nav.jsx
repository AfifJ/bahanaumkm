import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    HomeIcon,
    ShoppingBagIcon,
    HeartIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    ShoppingBagIcon as ShoppingBagIconSolid,
    HeartIcon as HeartIconSolid,
    UserIcon as UserIconSolid
} from '@heroicons/react/24/solid';
import { memo } from 'react';

const MobileBottomNav = memo(function MobileBottomNav() {
    const { url } = usePage();

    const navItems = [
        {
            name: 'Beranda',
            href: route('home'),
            outlineIcon: HomeIcon,
            solidIcon: HomeIconSolid,
            active: url === '/',
        },
        {
            name: 'Transaksi',
            href: route('buyer.orders.index'),
            outlineIcon: ShoppingBagIcon,
            solidIcon: ShoppingBagIconSolid,
            active: url === '/orders',
        },
        {
            name: 'Wishlist',
            href: route('buyer.wishlist'),
            outlineIcon: HeartIcon,
            solidIcon: HeartIconSolid,
            active: url === '/wishlist',
        },
        {
            name: 'Akun',
            href: route('buyer.profile.index'),
            outlineIcon: UserIcon,
            solidIcon: UserIconSolid,
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
                        <div className={cn('flex flex-1 flex-col items-center justify-center p-1 rounded-lg transition-all')}>
                            {item.active ? (
                                <item.solidIcon className="h-5 w-5 mb-1 transition-transform" />
                            ) : (
                                <item.outlineIcon className="h-5 w-5 mb-1 transition-transform" />
                            )}
                            <span className={cn('text-xs font-medium transition-colors', item.active ? 'text-primary' : 'text-gray-600')}>
                                {item.name}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
});

export default MobileBottomNav;
