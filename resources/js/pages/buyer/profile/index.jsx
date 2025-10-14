import ScrollToTop from '@/components/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BuyerLayoutWrapper from '@/layouts/buyer-layout-wrapper';
import { Head, Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { HelpingHand, Lock, LogOutIcon, LucideUsers2, Package2, Pencil } from 'lucide-react';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { useState } from 'react';

const Profile = ({ user }) => {
    const cleanup = useMobileNavigation();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    const handleLogout = () => {
        cleanup();
        router.post(route('logout'));
        setShowLogoutDialog(false);
    };

    return (
        <BuyerLayoutWrapper backLink={route('home')} title={'Profile'}>
            <ScrollToTop />
            <Head title="Profile" />
            <div className="w-full p-3 pb-20">
                {/* Header Profile yang Clean */}
                <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10">
                    <div className="flex w-full items-center gap-3">
                        <Avatar className="h-14 w-14 border border-white/50 shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-sm font-medium">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="text-base font-semibold text-foreground truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            <div className="mt-0.5 text-xs text-primary/80 font-medium">Member aktif</div>
                        </div>
                        <Button asChild variant={'ghost'} size={'sm'} className="shrink-0 h-8 w-8 p-0">
                            <Link href={route('buyer.profile.edit')}>
                                <Pencil className="h-3.5 w-3.5" />
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Menu Items yang Clean */}
                <div className="space-y-1">
                    {/* Section Header */}
                    <div className="px-3 py-2">
                        <div className="text-sm font-semibold text-muted-foreground">Akun Saya</div>
                    </div>

                    {/* Menu Items */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 text-sm font-normal hover:bg-accent/50"
                        asChild
                    >
                        <Link href={route('buyer.orders.index')}>
                            <Package2 className="h-4 w-4 text-primary" />
                            Pesanan Saya
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start gap-3 px-4 py-3 text-sm font-normal hover:bg-accent/50"
                    >
                        <Link href={route('buyer.profile.password')}>
                            <Lock className="h-4 w-4 text-primary" />
                            Ganti Password
                        </Link>
                    </Button>

                    {/* Section Header */}
                    <div className="px-3 py-2 mt-4">
                        <div className="text-sm font-semibold text-muted-foreground">Lainnya</div>
                    </div>

                    <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start gap-3 px-4 py-3 text-sm font-normal hover:bg-accent/50"
                    >
                        <Link href={route('about')}>
                            <LucideUsers2 className="h-4 w-4 text-primary" />
                            Tentang Kami
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-3 text-sm font-normal hover:bg-accent/50"
                    >
                        <Link href={route('buyer.profile.bantuan')}>
                            <HelpingHand className="h-4 w-4 text-primary" />
                            Pusat Bantuan
                        </Link>
                    </Button>

                    {/* Logout */}
                    <div className="mt-4">
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-3 px-4 py-3 text-sm font-normal text-red-600 hover:bg-red-50"
                            onClick={() => setShowLogoutDialog(true)}
                        >
                            <LogOutIcon className="h-4 w-4" />
                            Keluar Akun
                        </Button>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent className="rounded-lg">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin keluar dari akun Anda?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>
                            Logout
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </BuyerLayoutWrapper>
    );
};

export default Profile;
