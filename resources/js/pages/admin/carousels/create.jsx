import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import ImageUploadDialog from '@/components/admin/image-upload-dialog';

export default function Create() {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        image: null,
        link_url: '',
        sort_order: '',
        is_active: true,
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('title', data.title);
        if (data.image) {
            formData.append('image', data.image);
        }
        formData.append('link_url', data.link_url);
        formData.append('sort_order', data.sort_order || '');
        formData.append('is_active', data.is_active);

        post(route('admin.carousels.store'), {
            onSuccess: () => {
                reset();
                setImagePreview(null);
                fileInputRef.current.value = '';
            },
        });
    };

    const handleImageClick = () => {
        setIsDialogOpen(true);
    };

    const handleDialogSave = (croppedFile) => {
        // Handle cropped file from dialog
        setData('image', croppedFile);

        // Generate preview for cropped image
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(croppedFile);

        setIsDialogOpen(false);
        toast.success('Gambar berhasil dipotong dan diunggah!');
    };

    const handleDialogCancel = () => {
        setIsDialogOpen(false);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Silakan pilih file gambar');
                return;
            }

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                toast.error('Ukuran file harus kurang dari 2MB');
                return;
            }

            setData('image', file);

            // Preview image
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setData('image', null);
        setImagePreview(null);
        fileInputRef.current.value = '';
    };

    return (
        <AdminLayout
            title="Buat Carousel"
            breadcrumbs={[
                {
                    title: 'Carousel',
                    href: route('admin.carousels.index'),
                },
                {
                    title: 'Buat',
                    href: route('admin.carousels.create'),
                },
            ]}
        >
            <Head title="Buat Carousel" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 px-4">
                    <div className="flex flex-row items-center justify-between pb-4">
                        <h2 className="text-2xl font-bold">Buat Carousel Baru</h2>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.carousels.index')}>
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali ke Carousel
                            </Link>
                        </Button>
                    </div>

                    <div className="">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload */}
                            <div>
                                <Label>Gambar Carousel *</Label>
                                <div className="mt-2">
                                    <div className="flex-shrink-0">
                                        {imagePreview ? (
                                            <div className="relative group">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-full aspect-[4/1] object-cover rounded-md border"
                                                />
                                                <div
                                                    onClick={handleImageClick}
                                                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity rounded-md"
                                                >
                                                    <ImageIcon className="h-8 w-8 text-white mb-2" />
                                                    <p className="text-xs text-white text-center font-medium">
                                                        Klik untuk mengubah gambar
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 z-10"
                                                >
                                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={handleImageClick}
                                                className="h-full aspect-[4/1] border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                            >
                                                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-xs text-gray-500 text-center">
                                                    Klik untuk mengunggah gambar
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </div>

                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul carousel (opsional)"
                                    className="mt-1"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Judul opsional namun direkomendasikan untuk aksesibilitas.
                                </p>
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Link URL */}
                            <div>
                                <Label htmlFor="link_url">URL Link</Label>
                                <Input
                                    id="link_url"
                                    type="url"
                                    value={data.link_url}
                                    onChange={(e) => setData('link_url', e.target.value)}
                                    placeholder="https://contoh.com"
                                    className="mt-1"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Opsional: Pengguna akan diarahkan ke URL ini saat mengklik carousel.
                                </p>
                                {errors.link_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.link_url}</p>
                                )}
                            </div>

                            {/* Sort Order */}
                            <div>
                                <Label htmlFor="sort_order">Urutan Sortir</Label>
                                <Input
                                    id="sort_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) => setData('sort_order', e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    className="mt-1"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Menentukan urutan tampilan. Angka lebih rendah akan muncul pertama. Kosongkan untuk penugasan otomatis.
                                </p>
                                {errors.sort_order && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Aktif</Label>
                                <Badge variant={data.is_active ? 'default' : 'secondary'} className="ml-2">
                                    {data.is_active ? 'Aktif' : 'Tidak Aktif'}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-500 -mt-4">
                                Hanya carousel yang aktif akan ditampilkan di halaman utama.
                            </p>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-6">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.carousels.index')}>
                                        Batal
                                    </Link>
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing || !data.image}
                                >
                                    {processing ? 'Membuat...' : 'Buat Carousel'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Image Upload Dialog */}
            <ImageUploadDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSave={handleDialogSave}
                onCancel={handleDialogCancel}
            />
        </AdminLayout>
    );
}
