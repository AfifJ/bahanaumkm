import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { BarChart3, Home, Package, ShoppingBag, User } from 'lucide-react';
import { memo } from 'react';

const SalesMobileBottomNav = memo(function SalesMobileBottomNav() {
    const { url } = usePage();

    const navItems = [
        {
            name: 'Home',
            href: route('sales.dashboard'),
            icon: Home,
            active: url === '/sales/dashboard',
        },
        {
            name: 'Produk',
            href: route('sales.products.index'),
            icon: Package,
            active: url === '/sales/products',
        },
        {
            name: 'Transaksi',
            href: route('sales.transactions'),
            icon: ShoppingBag,
            active: url === '/sales/transactions',
        },
        {
            name: 'Akun',
            href: route('sales.profile.index'),
            icon: User,
            active: url.startsWith('/sales/profile'),
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
                            'transition-colors',
                            item.active ? 'text-primary' : 'text-gray-600 hover:text-gray-900',
                        )}
                    >
                        <div className={cn('flex flex-1 flex-col items-center justify-center rounded-lg')}>
                            <item.icon size={20} className='mb-1 transition-transform' />
                            <span className="text-xs font-medium">{item.name}</span>
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
});

export default SalesMobileBottomNav;
