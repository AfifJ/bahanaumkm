import { Logo } from '@/components/ui/navbar-04/logo';
import { Link } from '@inertiajs/react';
import { ChevronLeft, MoveLeft } from 'lucide-react';

export default function AuthSimpleLayout({ children, title, description }) {
    return (<div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={'/'} className='flex border rounded-md items-center py-1 px-2 text-sm gap-1 me-auto'>
                            <ChevronLeft className='w-4 h-4' />
                            Kembali
                        </Link>
                        <div className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-md">
                                <Logo className="size-9"/>
                            </div>
                            <span className="sr-only">{title}</span>
                        </div>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>
                    {children}
                </div>
            </div>
        </div>);
}

