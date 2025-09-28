import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import BuyerLayoutNonSearch from "@/layouts/buyer-layout-non-search"
import { Head, Link } from "@inertiajs/react"

const GantiPassword = () => {
    return (
        <BuyerLayoutNonSearch backLink={route('buyer.profile.index')} title="Ganti Password">
            <Head title="Profile" />
            <div className="w-full p-4 space-y-3">

                <div className="flex flex-col w-full items-center gap-4">
                    <div className="w-full space-y-3 pb-4 *:space-y-1">
                        <div>
                            <div className='font-semibold text-sm'>Password Lama</div>
                            <Input className="" />
                        </div>
                        <div>
                            <div className='font-semibold text-sm'>Password Baru</div>
                            <Input className="" />
                        </div>
                        <div>
                            <div className='font-semibold text-sm'>Konfirmasi Password Baru</div>
                            <Input className="" />
                        </div>
                    </div>
                </div>
                <Button asChild className='w-full'>
                    <Link href={'/#'}>
                        Ganti Password
                    </Link>
                </Button>
            </div>
        </BuyerLayoutNonSearch>
    )
}
export default GantiPassword