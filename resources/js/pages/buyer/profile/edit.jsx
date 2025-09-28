import ScrollToTop from '@/components/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BuyerLayout from '@/layouts/buyer-layout';
import BuyerLayoutNonSearch from '@/layouts/buyer-layout-non-search';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Heart, HelpingHand, Lock, LogOutIcon, LucideUsers2, MoveLeft, Package2, Pencil, User } from 'lucide-react';

const Profile = ({ user }) => {
    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title={'Edit Profile'}>
            <ScrollToTop />
            <Head title="Profile" />
            <div className="w-full p-4 space-y-3">
               
                <div className="flex flex-col w-full items-center gap-4">
                    <div className="flex relative aspect-square h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                        <User />
                        <Button type="button" aria-label="Edit profile picture" className='absolute rounded-full -bottom-2 cursor-pointer -right-2 flex items-center justify-center p-1 h-8 w-8' >
                            <Pencil className='h-5 w-5' />
                        </Button>
                    </div>
                    <div className="w-full space-y-3 pb-4">
                        <div className='font-semibold'>Nama</div>
                        <Input className="" value={user.name} />
                        <div className='font-semibold'>Email</div>
                        <Input className="" value={user.email} />
                    </div>
                </div>
                <Button asChild className='w-full'>
                    <Link href={'/#'}>
                        Simpan
                    </Link>
                </Button>
            </div>
        </BuyerLayoutNonSearch>
    );
};

export default Profile;
