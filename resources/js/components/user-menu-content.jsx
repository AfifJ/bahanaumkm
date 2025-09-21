import { DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { Link, router } from '@inertiajs/react';
import { LogOut, Settings, LayoutDashboard } from 'lucide-react';

export function UserMenuContent({ user }) {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (<>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true}/>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                {user.role_id === 2 && (
                    <DropdownMenuItem asChild>
                        <Link className="block w-full" href={route('vendor.dashboard')} as="button" prefetch onClick={cleanup}>
                            <LayoutDashboard className="mr-2"/>
                            Dashboard Vendor
                        </Link>
                    </DropdownMenuItem>
                )}
                {user.role_id === 1 && (
                    <DropdownMenuItem asChild>
                        <Link className="block w-full" href={route('admin.dashboard')} as="button" prefetch onClick={cleanup}>
                            <LayoutDashboard className="mr-2"/>
                            Dashboard Admin
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                    <Link className="block w-full" href={route('profile.edit')} as="button" prefetch onClick={cleanup}>
                        <Settings className="mr-2"/>
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link className="block w-full" method="post" href={route('logout')} as="button" onClick={handleLogout}>
                    <LogOut className="mr-2"/>
                    Log out
                </Link>
            </DropdownMenuItem>
        </>);
}
