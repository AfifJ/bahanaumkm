import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { LoaderCircle, Upload, X, ImageIcon } from 'lucide-react';
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

export default function ProductForm({ data, setData, errors, processing, onSubmit, isEdit = false, onCancel, categories = [], vendors = [] }) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleImageChange = (file) => {
        setData('image', file ?? null);
    };

    const handleFileInputChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageChange(file);
        }
    };

    const handleRemoveImage = () => {
        setData('image', null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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
            const file = files[0];
            if (file.type.startsWith('image/')) {
                handleImageChange(file);
            }
        }
    };

    const handleClickArea = () => {
        fileInputRef.current?.click();
    };

    return (
        <form onSubmit={onSubmit} encType="multipart/form-data">
            <div className="mb-6">
                <Label htmlFor="image" className="mb-2 block text-sm font-medium">Gambar Produk</Label>
                
                <input
                    ref={fileInputRef}
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                {(data.image || data.image_url) ? (
                    <Card className="p-4 border-2 border-dashed border-gray-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={data.image ? URL.createObjectURL(data.image) : data.image_url}
                                    alt="Preview"
                                    className="h-24 w-24 rounded-lg object-cover border"
                                />
                                <div>
                                    <p className="font-medium text-sm">{data.image?.name || 'Gambar produk'}</p>
                                    {data.image && (
                                        <p className="text-xs text-gray-500">
                                            {(data.image.size / 1024).toFixed(1)} KB
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleRemoveImage}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClickArea}
                            className="w-full"
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Ubah Gambar
                        </Button>
                    </Card>
                ) : (
                    <Card 
                        className={`p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                            isDragging 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onClick={handleClickArea}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-3">
                                <Upload className="h-6 w-6 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                                {isDragging ? 'Lepaskan gambar di sini' : 'Klik untuk mengunggah atau tarik dan lepas'}
                            </p>
                            <p className="text-xs text-gray-500">
                                PNG, JPG, GIF hingga 10MB
                            </p>
                        </div>
                    </Card>
                )}
                
                <InputError message={errors.image} className="mt-2" />
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
                    required
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
                    required
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
                    required
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
                    required
                />
                <InputError message={errors.stock} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                    name="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    required
                />
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
                {isEdit ? (
                    <div className="p-3 border rounded-md bg-gray-50">
                        <p className="text-sm">{data.vendor_name || data.vendor?.name || 'Tidak ada vendor'}</p>
                    </div>
                ) : (
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
                )}
                <InputError message={errors.vendor_id} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="status">Status</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)} required>
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
                <Button type="button" variant="ghost" onClick={onCancel} className="mr-4">
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
