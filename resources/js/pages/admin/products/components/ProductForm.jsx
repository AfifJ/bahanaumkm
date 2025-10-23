import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@inertiajs/react';
import { LoaderCircle, Upload, X, Star, Camera, Plus, Edit, Trash, AlertTriangle, Ban, Lock } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

const formatPrice = (value) => {
    if (!value) return '';
    return Math.floor(Number(value)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parsePrice = (value) => {
    return parseInt(value.toString().replace(/\./g, ''), 10) || 0;
};

const generateSku = (productName, variantName) => {
    if (!productName || !variantName) return '';

    const cleanText = (text) => text.toUpperCase()
        .replace(/[^A-Z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return `${cleanText(productName)} - ${cleanText(variantName)}`;
};

export default function ProductForm({ data, setData, errors, processing, onSubmit, isEdit = false, categories = [], vendors = [], editRestrictions = null }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [bulkUpdateData, setBulkUpdateData] = useState({
        price: 0,
        buy_price: 0,
        stock: ''
    });
    const [isBulkUpdateDialogOpen, setIsBulkUpdateDialogOpen] = useState(false);

    const updateImagesData = (previews) => {
        console.log('=== UPDATE IMAGES DATA ===');
        console.log('Current previews:', previews);
        
        // Separate existing images from new files
        const existingImages = [];
        const newFiles = [];
        let newFileIndex = 0;

        previews.forEach((img, previewIndex) => {
            if (img.file) {
                // New image with file - add to files array
                const fileData = {
                    index: newFileIndex,
                    file: img.file,
                    is_primary: img.is_primary,
                    sort_order: img.sort_order
                };
                newFiles.push(fileData);
                console.log('New file added:', {
                    index: newFileIndex,
                    fileName: img.file.name,
                    is_primary: img.is_primary,
                    sort_order: img.sort_order
                });
                newFileIndex++;
            } else if (img.id && typeof img.id === 'number') {
                // Existing image - keep track of its data
                const existingImageData = {
                    id: img.id,
                    is_primary: img.is_primary,
                    sort_order: img.sort_order
                };
                existingImages.push(existingImageData);
                console.log('Existing image to keep:', existingImageData);
            } else {
                console.warn('Invalid image data found:', img);
            }
        });

        console.log('Final existing images:', existingImages);
        console.log('Final new files:', newFiles);

        // Set files and metadata for form submission
        setData('images', newFiles.map(item => item.file));
        setData('image_data', {
            existing: existingImages,
            new_files_metadata: newFiles.map(item => ({
                index: item.index,
                is_primary: item.is_primary,
                sort_order: item.sort_order
            }))
        });

        console.log('=== IMAGES DATA UPDATED ===');
    };

    // Initialize image previews for existing product
    useState(() => {
        if (isEdit && data.images && data.images.length > 0) {
            console.log('=== EDIT MODE - IMAGE INITIALIZATION ===');
            console.log('Raw images data:', data.images);

            const previews = data.images.map(img => {
                const previewData = {
                    id: img.id,
                    url: img.url,
                    image_path: img.image_path,
                    is_primary: img.is_primary,
                    file: null,
                    sort_order: img.sort_order
                };
                console.log('Processed image:', previewData);
                return previewData;
            });

            console.log('Final previews:', previews);
            setImagePreviews(previews);
            // Initialize images data for form submission
            updateImagesData(previews);
        } else if (data.image_url && !isEdit) {
            // Single image for new products
            const singleImage = [{
                id: 'existing',
                url: data.image_url,
                is_primary: true,
                file: data.image || null,
                sort_order: 0
            }];
            setImagePreviews(singleImage);
            updateImagesData(singleImage);
        }
    });

    // Initialize skus for edit mode
    useState(() => {
        if (isEdit && data.skus && data.skus.length > 0) {
            // Ensure all skus have required fields including ID
            const initializedSkus = data.skus.map(sku => ({
                ...sku,
                id: sku.id, // Explicitly preserve the ID
                name: sku.name || sku.variant_name,
                variant_name: sku.variant_name || sku.name,
                price: sku.price || 0,
                buy_price: sku.buy_price || 0,
                stock: sku.stock || 0,
                weight: sku.weight || 0,
                status: sku.status || 'active',
                // Preserve existing image path
                image: sku.image || null,
                // Reset preview when editing existing SKU
                image_preview: null
            }));
            setData('skus', initializedSkus);
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
        updateImagesData(updatedPreviews);
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
        updateImagesData(updatedPreviews);
    };

    const handleSetPrimary = (imageId) => {
        const updatedPreviews = imagePreviews.map(img => ({
            ...img,
            is_primary: img.id === imageId
        }));
        setImagePreviews(updatedPreviews);
        updateImagesData(updatedPreviews);
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

        const files = Array.from(e.dataTransfer.files)
            .filter(file => file.type.startsWith('image/'));

        if (files.length > 0) {
            handleMultipleImageChange(files);
        }
    };

    const handleClickArea = () => {
        fileInputRef.current?.click();
    };

    const handleVariationsToggle = (hasVariations) => {
        if (hasVariations) {
            // Create 2 default SKUs for variations
            const defaultSku = {
                sku_code: '',
                variant_name: '',
                price: 0,
                buy_price: 0,
                stock: 0,
                status: 'active'
            };

            setData('has_variations', true);
            setData('skus', [defaultSku, { ...defaultSku }]);
        } else {
            // Clear variations
            setData('has_variations', false);
            setData('skus', []);
        }
    };

    const handleBulkUpdate = () => {
        // Update all variations with bulk data

        // Update form data with bulk values if has_variations is true
        if (data.has_variations && data.skus && data.skus.length > 0) {
            const updatedSkus = data.skus.map(sku => ({
                ...sku,
                price: bulkUpdateData.price ? bulkUpdateData.price : sku.price,
                buy_price: bulkUpdateData.buy_price ? bulkUpdateData.buy_price : sku.buy_price,
                stock: bulkUpdateData.stock ? parseInt(bulkUpdateData.stock) : sku.stock,
                sku_code: generateSku(data.name, sku.variant_name)
            }));

            setData('skus', updatedSkus);
        }

        // Reset bulk update data
        setBulkUpdateData({
            price: 0,
            buy_price: 0,
            stock: ''
        });
        // Close the dialog
        setIsBulkUpdateDialogOpen(false);
    };

    // Function to update all SKUs with generated SKU codes when product name changes
    const updateAllSkuCodes = (productName) => {
        if (data.has_variations && data.skus && data.skus.length > 0) {
            const updatedSkus = data.skus.map(sku => ({
                ...sku,
                sku_code: generateSku(productName, sku.variant_name)
            }));
            setData('skus', updatedSkus);
        }
    };

    return (
        <form onSubmit={onSubmit} className='px-4' encType="multipart/form-data">
            <h1 className='text-xl font-bold mb-3'>Informasi produk</h1>
            <div className="mb-6">
                <Label className="mb-2 block text-sm font-medium">
                    Gambar Produk
                    <span className="ml-2 text-xs text-gray-500">(Maksimal 5 gambar, PNG/JPG/GIF hingga 10MB)</span>
                </Label>

                <Input
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
                                                onError={(e) => {
                                                    console.error('Image failed to load:', {
                                                        id: image.id,
                                                        url: image.url,
                                                        image_path: image.image_path
                                                    });
                                                    // Fallback to image_path if url fails
                                                    if (image.image_path && image.image_path !== image.url) {
                                                        e.target.src = image.image_path;
                                                    } else {
                                                        // Set a placeholder if all fails
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-family="Arial" font-size="12" fill="%23666" Image%3C/text%3E%3C/svg%3E';
                                                    }
                                                }}
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

                                    </div>
                                ))}

                                {imagePreviews.length < 5 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleClickArea}
                                        className="w-full aspect-square h-full flex flex-col items-center justify-center"
                                    >
                                        <Plus className="h-4 w-4 mb-1" />
                                        <span className='text-xs text-center break-words whitespace-normal leading-tight'>
                                            Tambah Gambar Lainnya
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </div>
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

                {/* Warning untuk gambar kosong */}
                {imagePreviews.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center">
                            <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                            <p className="text-sm text-yellow-800">
                                <strong>Perhatian:</strong> Produk belum memiliki gambar. 
                                Produk harus memiliki minimal 1 gambar sebelum disimpan.
                            </p>
                        </div>
                    </div>
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
                    onChange={(e) => {
                        setData('name', e.target.value);
                        updateAllSkuCodes(e.target.value);
                    }}
                />
                <InputError message={errors.name} className="mt-2" />
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
                <h1 className='text-xl font-bold mb-3'>Informasi penjualan</h1>

                <div className="flex justify-between items-center space-x-3">
                    <Label htmlFor="has-variations">Variasi</Label>
                    <Switch
                        id="has-variations"
                        checked={data.has_variations || false}
                        onCheckedChange={handleVariationsToggle}
                    />
                </div>

                {data.has_variations && (
                    <div className="space-y-4 mt-4">
                        <div className="flex justify-between items-center space-x-3">
                            <Label htmlFor="different_prices">Harga Berbeda per Variasi</Label>
                            <Switch
                                id="different_prices"
                                checked={data.different_prices || false}
                                onCheckedChange={(checked) => setData('different_prices', checked)}
                            />
                        </div>

                        <div className="flex justify-between items-center space-x-3">
                            <Label htmlFor="use_images">Gunakan Gambar per Variasi</Label>
                            <Switch
                                id="use_images"
                                checked={data.use_images || false}
                                onCheckedChange={(checked) => setData('use_images', checked)}
                            />
                        </div>
                    </div>
                )}

            </div>
            {!data.has_variations && (
                <>
                    <div className="mt-4">
                        <Label htmlFor="buy_price">Harga dari Vendor(Rp)</Label>
                        <Input
                            type="text"
                            name="buy_price"
                            placeholder="contoh: 50.000"
                            value={formatPrice(data.buy_price)}
                            className="mt-1 block w-full"
                            onChange={(e) => {
                                const value = parsePrice(e.target.value);
                                setData('buy_price', value);
                            }}
                        />
                        <InputError message={errors.buy_price} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <Label htmlFor="sell_price">Harga Jual(Rp)</Label>
                        <Input
                            type="text"
                            name="sell_price"
                            placeholder="contoh: 75.000"
                            value={formatPrice(data.sell_price)}
                            className="mt-1 block w-full"
                            onChange={(e) => {
                                const value = parsePrice(e.target.value);
                                setData('sell_price', value);
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
                </>
            )}



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



            {/* Product Variations */}
            {data.has_variations && (
                <div className="space-y-4">
                    <div className='flex justify-between my-4'>
                        <h1 className='text-xl font-bold'>Variasi produk</h1>
                    </div>

                    {/* Bulk Update Dialog */}
                    <Dialog open={isBulkUpdateDialogOpen} onOpenChange={setIsBulkUpdateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full mt-4"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Update Semua
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Bulk Update Variasi</DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="bulk_price">Harga (Rp)</Label>
                                    <Input
                                        id="bulk_price"
                                        type="text"
                                        placeholder="Masukkan harga baru (kosongkan untuk tidak mengubah)"
                                        value={formatPrice(bulkUpdateData.price)}
                                        onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, price: parsePrice(e.target.value) })}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bulk_buy_price">Harga Beli (Rp)</Label>
                                    <Input
                                        id="bulk_buy_price"
                                        type="text"
                                        placeholder="Masukkan harga beli baru (kosongkan untuk tidak mengubah)"
                                        value={formatPrice(bulkUpdateData.buy_price)}
                                        onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, buy_price: parsePrice(e.target.value) })}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="bulk_stock">Stok</Label>
                                    <Input
                                        id="bulk_stock"
                                        type="number"
                                        placeholder="Masukkan stok baru (kosongkan untuk tidak mengubah)"
                                        value={bulkUpdateData.stock}
                                        onChange={(e) => setBulkUpdateData({ ...bulkUpdateData, stock: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>


                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Informasi:</strong> Semua variasi produk akan diperbarui dengan nilai yang dimasukkan. Biarkan kosong jika tidak ingin mengubah field tersebut. Harga beli dan harga jual harus lebih dari 0.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsBulkUpdateDialogOpen(false)}>
                                    Batal
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleBulkUpdate}
                                >
                                    Update Semua Variasi
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Daftar Variasi</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const newSku = {
                                    sku_code: '',
                                    name: '',
                                    variant_name: '',
                                    price: 0,
                                    buy_price: 0,
                                    stock: 0,
                                    status: 'active'
                                };
                                setData('skus', [...(data.skus || []), newSku]);
                            }}
                            disabled={data.skus && data.skus.length >= 10} // Maksimal 10 variasi
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Variasi
                        </Button>
                    </div>

                    {/* Validasi variasi minimal 2 */}
                    {data.skus && data.skus.length > 0 && data.skus.length < 2 && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                                <strong>Perhatian:</strong> Produk dengan variasi harus memiliki minimal 2 variasi.
                                Tambahkan minimal {2 - data.skus.length} variasi lagi.
                            </p>
                        </div>
                    )}

                    {data.skus && data.skus.length > 0 ? (
                        <>
                            {/* Validasi info */}
                            {data.skus.length < 2 && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Perhatian:</strong> Produk dengan variasi harus memiliki minimal 2 variasi.
                                        Tambahkan minimal {2 - data.skus.length} variasi lagi.
                                    </p>
                                </div>
                            )}

                            {data.skus.map((sku, index) => (
                                <div key={index} className={`border rounded-lg p-4 ${sku.deleted_at ? 'bg-gray-50 opacity-60' : ''}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium">{sku.variant_name || `Variasi ${index + 1}`}</h3>
                                            {sku.deleted_at && (
                                                <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-700 rounded">
                                                    Nonaktif
                                                </span>
                                            )}
                                            {sku.has_orders && (
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                                    Pernah Dipesan
                                                </span>
                                            )}
                                        </div>
                                        {/* Tombol hapus/nonaktifkan SKU */}
                                        {!sku.deleted_at && (
                                            <>
                                                {editRestrictions?.has_orders && sku.id ? (
                                                    // Jika produk punya orders dan SKU sudah ada di database, tampilkan tombol nonaktifkan
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                        title="SKU tidak dapat dihapus karena produk memiliki pesanan. Gunakan tombol ini untuk menonaktifkan."
                                                        onClick={() => {
                                                            const updatedSkus = [...data.skus];
                                                            updatedSkus[index].deleted_at = new Date().toISOString();
                                                            updatedSkus[index].status = 'inactive';
                                                            setData('skus', updatedSkus);
                                                            toast.info('SKU akan dinonaktifkan setelah Anda menyimpan perubahan.');
                                                        }}
                                                    >
                                                        <Ban className="h-4 w-4 mr-1" />
                                                        Nonaktifkan
                                                    </Button>
                                                ) : (
                                                    // Jika produk belum punya orders atau SKU baru, tampilkan tombol hapus biasa
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700"
                                                        onClick={() => {
                                                            const updatedSkus = data.skus.filter((_, i) => i !== index);
                                                            setData('skus', updatedSkus);
                                                        }}
                                                    >
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                        {/* Tombol aktifkan kembali untuk SKU yang dinonaktifkan */}
                                        {sku.deleted_at && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => {
                                                    const updatedSkus = [...data.skus];
                                                    delete updatedSkus[index].deleted_at;
                                                    updatedSkus[index].status = 'active';
                                                    setData('skus', updatedSkus);
                                                    toast.success('SKU akan diaktifkan kembali.');
                                                }}
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Aktifkan
                                            </Button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor={`variant-name-${index}`}>Nama Variasi</Label>
                                            <Input
                                                id={`variant-name-${index}`}
                                                type="text"
                                                value={sku.variant_name || ''}
                                                onChange={(e) => {
                                                    const updatedSkus = [...data.skus];
                                                    updatedSkus[index].variant_name = e.target.value;
                                                    updatedSkus[index].name = e.target.value; // Sync with name field
                                                    // Auto-generate SKU
                                                    updatedSkus[index].sku_code = generateSku(data.name, e.target.value);
                                                    setData('skus', updatedSkus);
                                                }}
                                                className="mt-1"
                                                placeholder="Contoh: Warna Merah, Ukuran L"
                                            />
                                            {/* Display generated SKU below variation name */}
                                            {sku.variant_name && (
                                                <div className="mt-1 text-xs text-gray-600 font-medium">
                                                    SKU: {generateSku(data.name, sku.variant_name)}
                                                </div>
                                            )}
                                            <InputError message={errors[`skus.${index}.variant_name`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor={`variant-price-${index}`}>Harga (Rp)</Label>
                                            <Input
                                                id={`variant-price-${index}`}
                                                type="text"
                                                value={formatPrice(sku.price)}
                                                onChange={(e) => {
                                                    const value = parsePrice(e.target.value);
                                                    if (value > 0 || e.target.value === '') { // Hanya terima nilai positif atau kosong
                                                        const updatedSkus = [...data.skus];
                                                        updatedSkus[index].price = value;
                                                        setData('skus', updatedSkus);
                                                    }
                                                }}
                                                className="mt-1"
                                                placeholder="Masukkan harga"
                                            />
                                            <InputError message={errors[`skus.${index}.price`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor={`variant-buy-price-${index}`}>Harga Beli (Rp)</Label>
                                            <Input
                                                id={`variant-buy-price-${index}`}
                                                type="text"
                                                value={formatPrice(sku.buy_price)}
                                                onChange={(e) => {
                                                    const value = parsePrice(e.target.value);
                                                    if (value > 0 || e.target.value === '') { // Hanya terima nilai positif atau kosong
                                                        const updatedSkus = [...data.skus];
                                                        updatedSkus[index].buy_price = value;
                                                        setData('skus', updatedSkus);
                                                    }
                                                }}
                                                className="mt-1"
                                                placeholder="Masukkan harga beli"
                                            />
                                            <InputError message={errors[`skus.${index}.buy_price`]} className="mt-2" />
                                        </div>
                                        <div>
                                            <Label htmlFor={`variant-stock-${index}`}>Stok</Label>
                                            <Input
                                                id={`variant-stock-${index}`}
                                                type="number"
                                                value={sku.stock || 0}
                                                onChange={(e) => {
                                                    const updatedSkus = [...data.skus];
                                                    updatedSkus[index].stock = parseInt(e.target.value) || 0;
                                                    setData('skus', updatedSkus);
                                                }}
                                                className="mt-1"
                                            />
                                            <InputError message={errors[`skus.${index}.stock`]} className="mt-2" />
                                        </div>
                                    </div>

                                    {/* Variation Image Upload */}
                                    {data.use_images && (
                                        <div className="mt-4">
                                            <Label>Gambar Variasi</Label>
                                            <div className="mt-2 space-y-2">
                                                {/* Display existing image */}
                                                {sku.image && (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-12 h-12 rounded border overflow-hidden">
                                                            <img
                                                                src={`/storage/${sku.image}`}
                                                                alt="Variation"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <span className="text-sm text-gray-600">Gambar saat ini</span>
                                                    </div>
                                                )}

                                                <input
                                                    type="file"
                                                    id={`sku-image-${index}`}
                                                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            // Clean up previous preview URL if exists
                                                            if (sku.image_preview) {
                                                                URL.revokeObjectURL(sku.image_preview);
                                                            }

                                                            // Create preview URL
                                                            const previewUrl = URL.createObjectURL(file);
                                                            const updatedSkus = [...data.skus];
                                                            updatedSkus[index].image_file = file;
                                                            updatedSkus[index].image_preview = previewUrl;
                                                            setData('skus', updatedSkus);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => document.getElementById(`sku-image-${index}`).click()}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    {sku.image_file ? 'Ganti Gambar' : (sku.image ? 'Ganti Gambar' : 'Upload Gambar')}
                                                </Button>
                                                {sku.image_file && (
                                                    <div className="mt-2 space-y-2">
                                                        {/* Preview new image */}
                                                        {sku.image_preview && (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-16 h-16 rounded border overflow-hidden">
                                                                        <img
                                                                            src={sku.image_preview}
                                                                            alt="Preview variasi"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm text-gray-600">File baru:</p>
                                                                        <p className="text-xs text-gray-500">{sku.image_file.name}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 hover:text-red-700"
                                                                    onClick={() => {
                                                                        // Clean up preview URL
                                                                        if (sku.image_preview) {
                                                                            URL.revokeObjectURL(sku.image_preview);
                                                                        }
                                                                        // Remove image file and preview
                                                                        const updatedSkus = [...data.skus];
                                                                        updatedSkus[index].image_file = null;
                                                                        updatedSkus[index].image_preview = null;
                                                                        setData('skus', updatedSkus);
                                                                    }}
                                                                >
                                                                    <Trash className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                <InputError message={errors[`skus.${index}.image_file`]} className="mt-2" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                            <p>Belum ada variasi</p>
                            <p className="text-sm">Klik "Tambah Variasi" untuk menambahkan variasi produk</p>
                        </div>
                    )}
                </div>
            )}


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
