import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VendorLayout from '@/layouts/vendor-layout';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X, User, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export default function Edit({ user }) {
    const { data, setData, processing, errors, reset } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        avatar: null,
    });

    const [avatarPreview, setAvatarPreview] = useState(user.avatar_url);
    const [hasNewAvatar, setHasNewAvatar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if there are any changes
        const hasChanges =
            data.name !== user.name ||
            data.email !== user.email ||
            data.phone !== (user.phone || '') ||
            data.avatar !== null ||
            hasNewAvatar;

        if (!hasChanges) {
            toast.info('Tidak ada perubahan untuk disimpan');
            return;
        }

        setIsSubmitting(true);

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);

        // Handle avatar
        if (data.avatar === 'remove') {
            formData.append('remove_avatar', '1');
        } else if (data.avatar instanceof File) {
            formData.append('avatar', data.avatar);
        }

        // Use router.put with FormData (add _method field for method spoofing)
        formData.append('_method', 'PUT');
        router.post(route('vendor.profile.update'), formData, {
            forceFormData: true,
            onSuccess: () => {
                setHasNewAvatar(false);
                setIsSubmitting(false);
                // Show success toast
                toast.success('Profil berhasil diperbarui!');
            },
            onError: (errors) => {
                console.error('Profile update failed:', errors);
                // Reset avatar preview on error
                setAvatarPreview(user.avatar_url);
                setHasNewAvatar(false);
                setData('avatar', null);
                setIsSubmitting(false);

                // Show specific error messages
                if (errors.name) {
                    toast.error(`Nama: ${errors.name}`);
                } else if (errors.email) {
                    toast.error(`Email: ${errors.email}`);
                } else if (errors.phone) {
                    toast.error(`Telepon: ${errors.phone}`);
                } else if (errors.avatar) {
                    toast.error(`Foto: ${errors.avatar}`);
                } else {
                    toast.error('Gagal memperbarui profil. Silakan coba lagi.');
                }
            },
        });
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Harap pilih file gambar');
                return;
            }

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran file maksimal 2MB');
                return;
            }

            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);

            // Store file in form data (without uploading)
            setData('avatar', file);
            setHasNewAvatar(true);
        }
    };

    
    const handleRemoveAvatar = () => {
        setAvatarPreview(null);
        setData('avatar', 'remove');
        setHasNewAvatar(true);
        fileInputRef.current.value = '';
        toast.success('Foto akan dihapus setelah menyimpan perubahan');
    };

    const getInitials = (name) => {
        if (!name) return 'V';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <VendorLayout
            title="Pengaturan Profil"
            breadcrumbs={[
                {
                    title: 'Pengaturan',
                    href: route('vendor.profile.edit'),
                },
            ]}
        >
            <Head title="Pengaturan Profil - Vendor" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6  ">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Pengaturan Profil
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Kelola informasi profil dan foto Anda
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Flash Messages */}
                    {usePage().props.flash?.success && (
                        <div className="mb-6 rounded-lg bg-green-50 p-4 text-green-700 border border-green-200">
                            {usePage().props.flash.success}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Profile Information */}
                        <div className="">
                            <div className="flex items-center space-x-6 mb-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24">
                                        <AvatarImage src={avatarPreview} alt={data.name} />
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-medium">
                                            {getInitials(data.name)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <Button
                                        type="button"
                                        onClick={handleAvatarClick}
                                        className="absolute -bottom-2 -right-2 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors size-10"
                                    >
                                        <Camera className="h-4 w-4" />
                                    </Button>

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900 mb-2">Foto Profil</h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Upload foto profil Anda. Format yang didukung: JPEG, PNG, JPG, GIF. Maksimal 2MB. Perubahan akan disimpan setelah klik "Simpan Perubahan".
                                    </p>

                                    <div className="flex space-x-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleAvatarClick}
                                        >
                                            <Upload className="h-4 w-4 mr-2" />
                                            Ganti Foto
                                        </Button>

                                        {avatarPreview && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleRemoveAvatar}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name">Nama Lengkap</Label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="name"
                                                type="text"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                className="pl-10"
                                                placeholder="Masukkan nama lengkap"
                                            />
                                        </div>
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email</Label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Mail className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="pl-10"
                                                placeholder="Masukkan email"
                                            />
                                        </div>
                                        {errors.email && (
                                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="phone">Nomor Telepon</Label>
                                        <div className="mt-1 relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Phone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="pl-10"
                                                placeholder="Masukkan nomor telepon"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            reset();
                                            setAvatarPreview(user.avatar_url);
                                            setHasNewAvatar(false);
                                            setData('avatar', null);
                                            fileInputRef.current.value = '';
                                            toast.info('Form telah direset ke data awal');
                                        }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                        {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
}