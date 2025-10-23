import { Head, useForm, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Percent, QrCode, Upload, X } from 'lucide-react';
import { useState } from 'react';

export default function AdminSettingsIndex() {
    const { adminCommission, salesCommission, qrisImage } = usePage().props;
    const [imagePreview, setImagePreview] = useState(null);

    // Debug: Log the initial values (simplified like category)
    console.log('Admin Settings - Initial values:', {
        adminCommission,
        salesCommission,
        qrisImage,
        qrisImageUrl: qrisImage ? `/storage/${qrisImage}` : null
    });

    const { data, setData, processing, errors, reset } = useForm({
        admin_commission: parseFloat(adminCommission) || 10,
        sales_commission: parseFloat(salesCommission) || 5,
        qris_image: null,
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        console.log('Form submission (Category Edit Pattern with router.post + _method:PUT):', {
            admin_commission: data.admin_commission,
            sales_commission: data.sales_commission,
            _method: data._method,
            has_qris_image: !!data.qris_image,
            qris_image_name: data.qris_image?.name,
            qris_image_size: data.qris_image?.size
        });

        // Client-side validation
        if (data.admin_commission < 0 || data.admin_commission > 100) {
            console.error('Admin commission out of range:', data.admin_commission);
            return;
        }
        if (data.sales_commission < 0 || data.sales_commission > 100) {
            console.error('Sales commission out of range:', data.sales_commission);
            return;
        }

        // Use category edit pattern: router.post with _method: 'PUT'
        router.post(route('admin.settings.update'), data, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                console.log('Settings updated successfully (Category Edit Pattern with router.post + _method:PUT):', page.props.flash?.success);

                // Reset file input and preview
                setData('qris_image', null);
                setImagePreview(null);
                reset('qris_image');
            },
            onError: (errors) => {
                console.error('Settings update failed (Category Pattern):', errors);

                // Reset file and preview on error
                if (errors.qris_image) {
                    setData('qris_image', null);
                    setImagePreview(null);
                    reset('qris_image');
                }
            }
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                console.error('File size exceeds 2MB limit');
                e.target.value = ''; // Clear the input
                setData('qris_image', null);
                setImagePreview(null);
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                console.error('Invalid file type. Only JPEG, JPG, and PNG are allowed');
                e.target.value = ''; // Clear the input
                setData('qris_image', null);
                setImagePreview(null);
                return;
            }

            setData('qris_image', file);

            // Create preview (Category Pattern)
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);

            console.log('File selected (Category Pattern):', file.name, file.type, file.size);
        } else {
            setData('qris_image', null);
            setImagePreview(null);
        }
    };

    const removeImage = () => {
        setData('qris_image', null);
        setImagePreview(null);
    };

    const getQrisImageUrl = () => {
        // Simple URL generation like category pattern
        if (!qrisImage) {
            console.warn('QRIS image is null or undefined');
            return null;
        }

        const url = `/storage/${qrisImage}`;
        console.log('QRIS Image URL (Category Pattern):', {
            qrisImage,
            url
        });

        return url;
    };

    const handleImageError = (event) => {
        console.error('QRIS image failed to load:', {
            attemptedSrc: event.target.src
        });
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em"%3EGambar tidak tersedia%3C/text%3E%3C/svg%3E';
    };

    return (
        <AdminLayout
            title="Pengaturan"
            breadcrumbs={[
                {
                    title: 'Pengaturan',
                    href: route('admin.settings.index'),
                },
            ]}
        >
            <Head title="Pengaturan" />

            <div className="space-y-6 p-3">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
                    <p className="text-gray-600 mt-1">Kelola pengaturan komisi dan pembayaran sistem</p>
                </div>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                    {/* Commission Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Percent className="h-5 w-5" />
                                Pengaturan Komisi
                            </CardTitle>
                            <CardDescription>
                                Atur persentase komisi untuk admin dan sales
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="admin_commission">Komisi Admin (%)</Label>
                                    <Input
                                        id="admin_commission"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.admin_commission}
                                        onChange={(e) => setData('admin_commission', parseFloat(e.target.value) || 0)}
                                        className="mt-1"
                                    />
                                    {errors.admin_commission && (
                                        <p className="text-red-500 text-sm mt-1">{errors.admin_commission}</p>
                                    )}
                                </div>
                                <div>
                                    <Label htmlFor="sales_commission">Komisi Sales (%)</Label>
                                    <Input
                                        id="sales_commission"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.sales_commission}
                                        onChange={(e) => setData('sales_commission', parseFloat(e.target.value) || 0)}
                                        className="mt-1"
                                    />
                                    {errors.sales_commission && (
                                        <p className="text-red-500 text-sm mt-1">{errors.sales_commission}</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* QRIS Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <QrCode className="h-5 w-5" />
                                Pengaturan QRIS
                            </CardTitle>
                            <CardDescription>
                                Kelola gambar QRIS untuk pembayaran
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="qris_image">Gambar QRIS</Label>
                                <div className="mt-2">
                                    <div className="mt-1">
                                        {/* Show current QRIS image or preview */}
                                        {imagePreview || getQrisImageUrl() ? (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    {imagePreview ? 'Preview QRIS Baru:' : 'QRIS Saat Ini:'}
                                                </p>
                                                <div className="relative inline-block">
                                                    <img
                                                        src={imagePreview || getQrisImageUrl()}
                                                        alt="QRIS Preview"
                                                        className="h-32 w-32 object-cover rounded-lg border"
                                                        onError={handleImageError}
                                                    />
                                                    {imagePreview && (
                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center">
                                                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600">Belum ada gambar QRIS</p>
                                            </div>
                                        )}

                                        {/* File input */}
                                        {!imagePreview && (
                                            <label
                                                htmlFor="qris_image"
                                                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                                            >
                                                <Upload className="mb-2 h-8 w-8 text-gray-400" />
                                                <span className="text-center text-sm text-gray-500">Upload QRIS</span>
                                                <input
                                                    id="qris_image"
                                                    name="qris_image"
                                                    type="file"
                                                    className="hidden"
                                                    onChange={handleFileChange}
                                                    accept="image/jpeg,image/png,image/jpg"
                                                />
                                            </label>
                                        )}

                                        {/* File info and errors */}
                                        {data.qris_image && (
                                            <p className="text-sm text-green-600 mt-2">
                                                File selected: {data.qris_image.name} ({(data.qris_image.size / 1024).toFixed(1)}KB)
                                            </p>
                                        )}
                                        {errors.qris_image && (
                                            <p className="text-red-500 text-sm mt-2">{errors.qris_image}</p>
                                        )}
                                        <p className="mt-1 text-xs text-gray-500">Format: JPEG, PNG, JPG. Maksimal: 2MB</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing}
                            className="min-w-32"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}