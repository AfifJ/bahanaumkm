import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Package,
    ArrowLeftRight,
    User
} from 'lucide-react';
import { memo } from 'react';

const SalesMobileBottomNav = memo(function SalesMobileBottomNav() {
    const { url } = usePage();

    const navItems = [
        {
            name: 'Dashboard',
            href: route('sales.dashboard'),
            outlineIcon: LayoutDashboard,
            solidIcon: LayoutDashboard,
            active: url === '/sales/dashboard' || url.startsWith('/sales/dashboard'),
        },
        {
            name: 'Produk',
            href: route('sales.products.index'),
            outlineIcon: Package,
            solidIcon: Package,
            active: url === '/sales/products' || url.startsWith('/sales/products'),
        },
        {
            name: 'Transaksi',
            href: route('sales.transactions'),
            outlineIcon: ArrowLeftRight,
            solidIcon: ArrowLeftRight,
            active: url === '/sales/transactions' || url.startsWith('/sales/transactions'),
        },
        {
            name: 'Akun',
            href: route('sales.profile.index'),
            outlineIcon: User,
            solidIcon: User,
            active: url.startsWith('/sales/profile'),
        },
    ];

    return (
        <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white">
            <div className="flex h-16 items-center justify-around">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex flex-1 flex-col items-center justify-center py-2 px-3 text-xs font-medium transition-colors',
                            item.active
                                ? 'text-primary'
                                : 'text-gray-600 hover:text-gray-900'
                        )}
                    >
                        {item.active ? (
                            <item.solidIcon className="mb-1 h-6 w-6" aria-hidden="true" />
                        ) : (
                            <item.outlineIcon className="mb-1 h-6 w-6" aria-hidden="true" />
                        )}
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
});

export default SalesMobileBottomNav;
