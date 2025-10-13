import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@inertiajs/react';
import { LoaderCircle, Upload, X, Star, Camera, Plus } from 'lucide-react';
import { useRef, useState } from 'react';

const formatPrice = (value) => {
    if (!value) return '';
    const intValue = Math.floor(Number(value));
    return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parsePrice = (value) => {
    if (!value) return 0;
    return parseInt(value.toString().replace(/\./g, ''), 10);
};

export default function ProductForm({ data, setData, errors, processing, onSubmit, isEdit = false, categories = [], vendors = [] }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Initialize image previews for existing product
    useState(() => {
        if (isEdit && data.images && data.images.length > 0) {
            const previews = data.images.map(img => ({
                id: img.id,
                url: img.url,
                is_primary: img.is_primary,
                file: null,
                sort_order: img.sort_order
            }));
            setImagePreviews(previews);
        } else if (data.image_url && !isEdit) {
            // Single image for new products
            setImagePreviews([{
                id: 'existing',
                url: data.image_url,
                is_primary: true,
                file: data.image || null,
                sort_order: 0
            }]);
        }
    });

    const handleMultipleImageChange = (files) => {
        const newImages = Array.from(files).map((file, index) => ({
            id: Date.now() + index,
            url: URL.createObjectURL(file),
            is_primary: imagePreviews.length === 0 && index === 0, // First image is primary if no existing images
            file: file,
            sort_order: imagePreviews.length + index
        }));

        const updatedPreviews = [...imagePreviews, ...newImages];
        setImagePreviews(updatedPreviews);
        setData('images', updatedPreviews.filter(img => img.file).map(img => img.file));
    };

    const handleFileInputChange = (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleMultipleImageChange(files);
        }
    };

    const handleRemoveImage = (imageId) => {
        const updatedPreviews = imagePreviews.filter(img => img.id !== imageId);

        // If removed image was primary, set first remaining image as primary
        if (imagePreviews.find(img => img.id === imageId)?.is_primary && updatedPreviews.length > 0) {
            updatedPreviews[0].is_primary = true;
        }

        setImagePreviews(updatedPreviews);
        setData('images', updatedPreviews.filter(img => img.file).map(img => img.file));
    };

    const handleSetPrimary = (imageId) => {
        const updatedPreviews = imagePreviews.map(img => ({
            ...img,
            is_primary: img.id === imageId
        }));
        setImagePreviews(updatedPreviews);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            if (imageFiles.length > 0) {
                handleMultipleImageChange(imageFiles);
            }
        }
    };

    const handleClickArea = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={onSubmit} encType="multipart/form-data">
            <div className="mb-6">
                <Label className="mb-2 block text-sm font-medium">
                    Gambar Produk
                    <span className="ml-2 text-xs text-gray-500">(Maksimal 5 gambar, PNG/JPG/GIF hingga 10MB)</span>
                </Label>

                <input
                    ref={fileInputRef}
                    type="file"
                    id="images"
                    name="images"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    multiple
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                {/* Image Gallery */}
                {imagePreviews.length > 0 && (
                    <Card className="mb-4 p-4">
                        <div className="mb-4">
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                {imagePreviews.map((image) => (
                                    <div key={image.id} className="relative group">
                                        <div className="aspect-square overflow-hidden rounded-lg border-2 border-gray-200">
                                            <img
                                                src={image.url}
                                                alt="Product preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>

                                        {/* Primary Badge */}
                                        {image.is_primary && (
                                            <div className="absolute left-2 top-2 flex items-center space-x-1 rounded-full bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                                                <Star className="h-3 w-3" />
                                                <span>Utama</span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="absolute right-2 top-2 flex space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                                            {!image.is_primary && (
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={() => handleSetPrimary(image.id)}
                                                    className="h-6 w-6 rounded-full bg-white/90 hover:bg-white"
                                                    title="Jadikan gambar utama"
                                                >
                                                    <Star className="h-3 w-3" />
                                                </Button>
                                            )}
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleRemoveImage(image.id)}
                                                className="h-6 w-6 rounded-full bg-red-500/90 hover:bg-red-500"
                                                title="Hapus gambar"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>

                                        {/* Image Info */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                                            <p className="text-xs text-white truncate">
                                                {image.file?.name || `Gambar ${image.sort_order + 1}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add More Images Button */}
                        {imagePreviews.length < 5 && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClickArea}
                                className="w-full"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Gambar Lainnya
                            </Button>
                        )}
                    </Card>
                )}

                {/* Upload Area */}
                {imagePreviews.length === 0 && (
                    <Card
                        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 transition-colors ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        onClick={handleClickArea}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <Camera className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="mb-2 text-sm font-medium text-gray-900">
                                {isDragging ? 'Lepaskan gambar di sini' : 'Unggah Gambar Produk'}
                            </h3>
                            <p className="mb-4 text-sm text-gray-600">
                                Klik untuk memilih atau tarik dan lepas gambar di sini
                            </p>
                            <div className="text-xs text-gray-500">
                                <p>• PNG, JPG, JPEG, GIF, WebP</p>
                                <p>• Maksimal 5 gambar</p>
                                <p>• Maksimal 10MB per gambar</p>
                                <p>• Gambar pertama akan menjadi gambar utama</p>
                            </div>
                        </div>
                    </Card>
                )}

                <InputError message={errors.images} className="mt-2" />
            </div>
            <div>
                <Label htmlFor="name">Nama Produk</Label>
                <Input
                    type="text"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    autoComplete="name"
                    autoFocus
                    onChange={(e) => setData('name', e.target.value)}
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="buy_price">Harga dari Vendor(Rp)</Label>
                <Input
                    type="text"
                    name="buy_price"
                    value={formatPrice(data.buy_price)}
                    className="mt-1 block w-full"
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setData('buy_price', parsePrice(value));
                    }}
                />
                <InputError message={errors.buy_price} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="sell_price">Harga Jual(Rp)</Label>
                <Input
                    type="text"
                    name="sell_price"
                    value={formatPrice(data.sell_price)}
                    className="mt-1 block w-full"
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setData('sell_price', parsePrice(value));
                    }}
                />
                <InputError message={errors.sell_price} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="stock">Persediaan/Stok</Label>
                <Input
                    type="number"
                    name="stock"
                    value={data.stock}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('stock', parseInt(e.target.value))}
                />
                <InputError message={errors.stock} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea name="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="category_id">Kategori</Label>
                <Select
                    value={data.category_id?.toString()}
                    onValueChange={(value) => setData('category_id', value === 'null' ? null : parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">Tidak ada kategori</SelectItem>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.category_id} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="vendor_id">Vendor</Label>
                <Select
                    value={data.vendor_id?.toString()}
                    onValueChange={(value) => setData('vendor_id', value === 'null' ? null : parseInt(value))}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih vendor" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="null">Tidak ada vendor</SelectItem>
                        {vendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                {vendor.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <InputError message={errors.vendor_id} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="status">Status</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Nonaktif</SelectItem>
                    </SelectContent>
                </Select>
                <InputError message={errors.status} className="mt-2" />
            </div>

            <div className="mt-4 flex items-center justify-end">
                <Button asChild type="button" variant="ghost" className="mr-4">
                    <Link href="/admin/products" className="mr-4">
                        Cancel
                    </Link>
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
