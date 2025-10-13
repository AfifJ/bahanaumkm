import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BuyerLayoutNonSearch from "@/layouts/buyer-layout-non-search"
import { Head, useForm, router } from "@inertiajs/react"

const GantiPassword = () => {
    const { data, setData, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        router.put(route('buyer.profile.password.update'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title="Ganti Password">
            <Head title="Ganti Password" />
            <form onSubmit={handleSubmit} className="w-full p-4 space-y-3">

                <div className="flex flex-col w-full items-center gap-4">
                    <div className="w-full space-y-3 pb-4 *:space-y-1">
                        <div>
                            <div className='font-semibold text-sm'>Password Lama</div>
                            <Input 
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                disabled={processing}
                            />
                            {errors.current_password && <div className="text-red-500 text-sm">{errors.current_password}</div>}
                        </div>
                        <div>
                            <div className='font-semibold text-sm'>Password Baru</div>
                            <Input 
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                disabled={processing}
                            />
                            {errors.password && <div className="text-red-500 text-sm">{errors.password}</div>}
                        </div>
                        <div>
                            <div className='font-semibold text-sm'>Konfirmasi Password Baru</div>
                            <Input 
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                disabled={processing}
                            />
                        </div>
                    </div>
                </div>
                <Button type="submit" className='w-full' disabled={processing}>
                    {processing ? 'Mengganti Password...' : 'Ganti Password'}
                </Button>
            </form>
        </BuyerLayoutNonSearch>
    )
}
export default GantiPassword
