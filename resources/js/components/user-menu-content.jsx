import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, LayoutDashboard } from 'lucide-react';

export function UserMenuContent({ user, menuItems = [], profileLink = '/profile' }) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (<>
        <DropdownMenuItem asChild className="p-0 font-normal hover:cursor-pointer">
            <Link href={profileLink}>
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
            {menuItems.map((item, index) => (
                <DropdownMenuItem key={index} asChild>
                    <Link className="block w-full hover:cursor-pointer" href={item.href} as="button" prefetch onClick={cleanup}>
                        <item.icon className="mr-2" />
                        {item.label}
                    </Link>
                </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                <LogOut className="mr-2" />
                Log out
            </Link>
        </DropdownMenuItem>
    </>);
}
