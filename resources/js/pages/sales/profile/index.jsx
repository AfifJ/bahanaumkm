import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Phone, User } from 'lucide-react';
import SalesLayout from '@/layouts/sales-layout';

const SalesProfile = ({ user }) => {
    return (
        <SalesLayout>
            <Head title="Profil Sales" />

            <div className="p-4 pb-20">
                <div className="max-w-md mx-auto">
                    {/* Profile Header */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="flex relative aspect-square h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-blue-600 mb-4">
                                <User size={48} />
                            </div>
                            <h1 className="text-xl font-semibold text-gray-900">{user.name}</h1>
                            <p className="text-sm text-gray-600">Sales Lapangan</p>
                        </div>

                        {/* Profile Information */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <User className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Nama</p>
                                    <p className="text-sm text-gray-600">{user.name}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Mail className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Email</p>
                                    <p className="text-sm text-gray-600">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                <Phone className="h-5 w-5 text-gray-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Nomor Telepon</p>
                                    <p className="text-sm text-gray-600">
                                        {user.phone || 'Belum diisi'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!user.phone && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    ⚠️ Nomor telepon belum diisi. Lengkapi profil Anda untuk dapat mengakses fitur transaksi.
                                </p>
                            </div>
                        )}

                        <Link href={route('sales.profile.edit')}>
                            <Button className="w-full mt-6" variant="outline">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Profil
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </SalesLayout>
    );
};

export default SalesProfile;