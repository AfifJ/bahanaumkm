import { Head, useForm, router, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import AdminLayout from '@/layouts/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Percent, QrCode, Upload, X, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import QrisUploadDialog from './components/qris-upload-dialog';

export default function AdminSettingsIndex() {
    const { adminCommission, salesCommission, shippingPricePerKm, qrisImage } = usePage().props;
    const [imagePreview, setImagePreview] = useState(null);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [formattedShippingPrice, setFormattedShippingPrice] = useState('');
    
    // Track initial values for change detection
    const initialValues = {
        admin_commission: parseFloat(adminCommission) || 10,
        sales_commission: parseFloat(salesCommission) || 5,
        shipping_price_per_km: parseFloat(shippingPricePerKm) || 5000,
        qris_image: null,
    };

    // Debug: Log the initial values (simplified like category)
    console.log('Admin Settings - Initial values:', {
        adminCommission,
        salesCommission,
        shippingPricePerKm,
        qrisImage,
        qrisImageUrl: qrisImage ? `/storage/${qrisImage}` : null
    });

    const { data, setData, processing, errors, reset } = useForm({
        admin_commission: parseFloat(adminCommission) || 10,
        sales_commission: parseFloat(salesCommission) || 5,
        shipping_price_per_km: parseFloat(shippingPricePerKm) || 5000,
        qris_image: null,
        _method: 'PUT',
    });

    // Format number to Indonesian thousand separator
    const formatNumber = (value) => {
        if (value === '' || value === null || value === undefined) return '';
        return parseFloat(value).toLocaleString('id-ID');
    };

    // Handle shipping price input with formatting
    const handleShippingPriceChange = (e) => {
        const value = e.target.value.replace(/\./g, ''); // Remove dots for processing
        const numericValue = parseFloat(value) || 0;

        // Update form data with numeric value
        setData('shipping_price_per_km', numericValue);

        // Update formatted display value
        setFormattedShippingPrice(formatNumber(numericValue));
    };

    // Initialize formatted shipping price
    useEffect(() => {
        const initialValue = formatNumber(shippingPricePerKm || 5000);
        setFormattedShippingPrice(initialValue);
    }, [shippingPricePerKm]);

    // Check if form has changes
    const hasChanges = () => {
        const commissionChanged = data.admin_commission !== initialValues.admin_commission ||
                                 data.sales_commission !== initialValues.sales_commission;
        const shippingChanged = data.shipping_price_per_km !== initialValues.shipping_price_per_km;
        const imageChanged = !!data.qris_image || !!imagePreview;
        return commissionChanged || shippingChanged || imageChanged;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Check if there are any changes
        if (!hasChanges()) {
            toast.info('Tidak ada perubahan untuk disimpan');
            return;
        }

        // Client-side validation
        if (data.admin_commission < 0 || data.admin_commission > 100) {
            toast.error('Komisi admin harus antara 0% hingga 100%');
            return;
        }
        if (data.sales_commission < 0 || data.sales_commission > 100) {
            toast.error('Komisi sales harus antara 0% hingga 100%');
            return;
        }

        // Show loading toast
        const toastId = toast.loading('Menyimpan pengaturan...');

        // Use category edit pattern: router.post with _method: 'PUT'
        router.post(route('admin.settings.update'), data, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                toast.success('Pengaturan berhasil disimpan!', { id: toastId });
                
                // Reset file input and preview
                setData('qris_image', null);
                setImagePreview(null);
                reset('qris_image');
            },
            onError: (errors) => {
                toast.error('Gagal menyimpan pengaturan. Periksa kembali form Anda.', { id: toastId });
                
                // Reset file and preview on error
                if (errors.qris_image) {
                    setData('qris_image', null);
                    setImagePreview(null);
                    reset('qris_image');
                }
            }
        });
    };

    const removeImage = () => {
        setData('qris_image', null);
        setImagePreview(null);
    };

    const handleImageSave = (file) => {
        setData('qris_image', file);
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
        
        setIsImageDialogOpen(false);
        toast.success('Gambar QRIS berhasil diunggah!');
    };

    const handleImageDialogCancel = () => {
        setIsImageDialogOpen(false);
    };

    const getQrisImageUrl = () => {
        // Simple URL generation like category pattern
        if (!qrisImage) {
            return null;
        }

        const url = `/storage/${qrisImage}`;
        return url;
    };

    const handleImageError = (event) => {
        event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-family="Arial" font-size="12" fill="%236b7280" text-anchor="middle" dy=".3em" %3ETidak tersedia%3C/text%3E%3C/svg%3E';
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

            <div className="space-y-6 py-6 sm:px-6 px-4">
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

                    {/* Shipping Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Pengaturan Ongkos Kirim
                            </CardTitle>
                            <CardDescription>
                                Atur harga per kilometer untuk perhitungan ongkos kirim
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="shipping_price_per_km" className="text-base">
                                    Harga per KM (IDR)
                                </Label>
                                <Input
                                    id="shipping_price_per_km"
                                    type="text"
                                    step="100"
                                    min="0"
                                    value={formattedShippingPrice}
                                    onChange={handleShippingPriceChange}
                                    className="mt-1"
                                    placeholder="Masukkan harga per kilometer"
                                />
                                {errors.shipping_price_per_km && (
                                    <p className="text-red-500 text-sm mt-1">{errors.shipping_price_per_km}</p>
                                )}
                                <p className="mt-2 text-sm text-gray-500">
                                    Harga saat ini: {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                    }).format(data.shipping_price_per_km)} per kilometer
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-medium text-blue-800 mb-2">Cara Perhitungan Ongkir</h3>
                                <p className="text-sm text-blue-700">
                                    Ongkos kirim = (Jarak dalam meter ÷ 1000) × Harga per KM
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    Contoh: Jarak 5000 meter × {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                    }).format(data.shipping_price_per_km)}/KM = {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0,
                                    }).format((5000 / 1000) * data.shipping_price_per_km)}
                                </p>
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
                                <Label>Gambar QRIS</Label>
                                <div className="mt-2">
                                    {/* Show current QRIS image or preview */}
                                    {imagePreview || getQrisImageUrl() ? (
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600 mb-2">
                                                {imagePreview ? 'Preview QRIS Baru:' : 'QRIS Saat Ini:'}
                                            </p>
                                            <div className="relative inline-block group">
                                                <img
                                                    src={imagePreview || getQrisImageUrl()}
                                                    alt="QRIS Preview"
                                                    className="h-56 w-5h-56 object-cover rounded-lg border"
                                                    onError={handleImageError}
                                                />
                                                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => setIsImageDialogOpen(true)}
                                                        className="bg-white text-gray-900 hover:bg-gray-100"
                                                    >
                                                        <Upload className="h-4 w-4 mr-2" />
                                                        Ganti Gambar
                                                    </Button>
                                                </div>
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
                                        <div
                                            className="mb-4 p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-100 transition-colors group"
                                            onClick={() => setIsImageDialogOpen(true)}
                                        >
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="relative">
                                                    <QrCode className="h-12 w-12 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Upload className="h-6 w-6 text-gray-600" />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2 group-hover:text-gray-800 transition-colors">
                                                    Klik untuk upload QRIS
                                                </p>
                                            </div>
                                        </div>
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
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={processing || !hasChanges()}
                            className="min-w-32"
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            {processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </Button>
                    </div>
                </form>

                {/* QRIS Upload Dialog */}
                <QrisUploadDialog
                    open={isImageDialogOpen}
                    onOpenChange={setIsImageDialogOpen}
                    onSave={handleImageSave}
                    onCancel={handleImageDialogCancel}
                />
            </div>
        </AdminLayout>
    );
}