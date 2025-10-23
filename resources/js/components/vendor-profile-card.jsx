import { Link } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Store } from 'lucide-react';

export function VendorProfileCard({ vendor, compact = false }) {
    const getVendorInitials = (name) => {
        if (!name) return 'V';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (compact) {
        return (
            <Link href={route('vendor.show', vendor.id)}>
                <div className="cursor-pointer">
                    <div className="">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={vendor.avatar_url} alt={vendor.name} />
                                <AvatarFallback className="bg-gray-100 text-gray-600 text-sm font-medium">
                                    {getVendorInitials(vendor.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 truncate">
                                    {vendor.name || 'Vendor'}
                                </h3>
                                <p className="text-sm text-gray-500 flex items-center">
                                    <Store className="h-3 w-3 mr-1" />
                                    Lihat Profil
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    return (
        <Link href={route('vendor.show', vendor.id)}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={vendor.avatar_url} alt={vendor.name} />
                            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-medium">
                                {getVendorInitials(vendor.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {vendor.name || 'Vendor'}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Store className="h-4 w-4 mr-1" />
                                Lihat semua produk vendor ini
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}