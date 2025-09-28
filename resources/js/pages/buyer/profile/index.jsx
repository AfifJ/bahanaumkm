import ScrollToTop from '@/components/scroll-to-top';
import { Button } from '@/components/ui/button';
import BuyerLayout from '@/layouts/buyer-layout';
import BuyerLayoutNonSearch from '@/layouts/buyer-layout-non-search';
import { Head, Link } from '@inertiajs/react';
import { Heart, HelpingHand, Lock, LogOutIcon, LucideUsers2, Package2, Pencil, User } from 'lucide-react';

const Profile = ({ user }) => {
    return (
        <BuyerLayoutNonSearch title={'Profile'}>
            <ScrollToTop />
            <Head title="Profile" />
            <div className="w-full p-4">
                <div className="flex w-full items-center gap-4">
                    <div className="flex aspect-square h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                        <User />
                    </div>
                    <div className="w-full">
                        <div className="text-2xl font-bold">{user.name}</div>
                        <div>{user.email}</div>
                    </div>
                    <Button asChild variant={'ghost'}>
                        <Link href={route('buyer.profile.edit')}>
                            <Pencil className="mb-auto h-5 w-5" />
                        </Link>
                    </Button>
                </div>
                <div className="space-y-1 py-6">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-6 text-base font-semibold hover:cursor-pointer hover:bg-gray-50"
                        asChild
                    >
                        <Link href={route('buyer.profile.pesanan.index')}>
                            <Package2 className="h-5 w-5" />
                            Pesanan Saya
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start gap-3 px-4 py-6 text-base font-semibold hover:cursor-pointer hover:bg-gray-50"
                    >
                        <Link href={route('buyer.profile.password')}>
                            <Lock className="h-5 w-5" />
                            Ganti Password
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start gap-3 px-4 py-6 text-base font-semibold hover:cursor-pointer hover:bg-gray-50"
                    >
                        <Link href={route('about')}>
                            <LucideUsers2 className="h-5 w-5" />
                            Tentang Kami
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        asChild
                        className="w-full justify-start gap-3 px-4 py-6 text-base font-semibold hover:cursor-pointer hover:bg-gray-50"
                    >
                        <Link href={route('buyer.profile.wishlist')}>
                            <Heart className="h-5 w-5" />
                            Wishlist
                        </Link>
                    </Button>
                    <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-6 text-base font-semibold hover:cursor-pointer hover:bg-gray-50"
                    >
                        <Link href={route('buyer.profile.bantuan')}>
                            <HelpingHand className="h-5 w-5" />
                            Pusat Bantuan
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-4 py-6 text-base font-semibold text-red-600 hover:cursor-pointer hover:bg-gray-50"
                    >
                        <LogOutIcon className="h-5 w-5" />
                        Logout
                    </Button>
                </div>

                <div className="mt-2 text-xl font-bold">Rekomendasi Untuk Anda</div>
            </div>
        </BuyerLayoutNonSearch>
    );
};

export default Profile;
