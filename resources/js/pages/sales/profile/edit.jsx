import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Mail, Phone, User } from 'lucide-react';
import SalesLayout from '@/layouts/sales-layout';

const SalesProfileEdit = ({ user }) => {
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        patch(route('sales.profile.update'));
    };

    return (
        <SalesLayout>
            <Head title="Edit Profil Sales" />

            <div className="p-4 pb-20">
                <div className="max-w-md mx-auto">
                    {/* Header */}
                    <div className="flex items-center mb-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="mr-3"
                        >
                            <a href={route('sales.profile.index')}>
                                <ArrowLeft className="h-4 w-4" />
                            </a>
                        </Button>
                        <h1 className="text-xl font-semibold">Edit Profil</h1>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex flex-col w-full items-center gap-4 mb-6">
                                <div className="flex relative aspect-square h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                    <User size={40} />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            className="pl-10"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                    {errors.name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="email"
                                            className="pl-10"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="Masukkan email"
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nomor Telepon <span className="text-gray-500">(Opsional)</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="tel"
                                            className="pl-10"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            disabled={processing}
                                            placeholder="Contoh: 081234567890"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Nomor telepon diperlukan untuk mengakses fitur transaksi
                                    </p>
                                </div>
                            </div>

                            <Button type="submit" className="w-full" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </SalesLayout>
    );
};

export default SalesProfileEdit;