import ScrollToTop from '@/components/scroll-to-top';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import BuyerLayoutNonSearch from '@/layouts/buyer-layout-non-search';
import { Head, useForm } from '@inertiajs/react';
import { Pencil, User } from 'lucide-react';

const Profile = ({ user }) => {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('buyer.profile.update'));
    };

    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title={'Edit Profile'}>
            <ScrollToTop />
            <Head title="Edit Profile" />
            <form onSubmit={handleSubmit} className="w-full p-4 space-y-3">
               
                <div className="flex flex-col w-full items-center gap-4">
                    <div className="flex relative aspect-square h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                        <User />
                        <Button type="button" aria-label="Edit profile picture" className='absolute rounded-full -bottom-2 cursor-pointer -right-2 flex items-center justify-center p-1 h-8 w-8' >
                            <Pencil className='h-5 w-5' />
                        </Button>
                    </div>
                    <div className="w-full space-y-3 pb-4">
                        <div className='font-semibold'>Nama</div>
                        <Input 
                            className="" 
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                        />
                        {errors.name && <div className="text-red-500 text-sm">{errors.name}</div>}
                        
                        <div className='font-semibold'>Email</div>
                        <Input 
                            className="" 
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                        />
                        {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                    </div>
                </div>
                <Button type="submit" className='w-full' disabled={processing}>
                    {processing ? 'Menyimpan...' : 'Simpan'}
                </Button>
            </form>
        </BuyerLayoutNonSearch>
    );
};

export default Profile;
