import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Link } from '@inertiajs/react';
import { Image, LoaderCircle, X } from 'lucide-react';
import { useState } from 'react';

export default function CategoryForm({ data, setData, errors, processing, onSubmit, isEdit = false }) {
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('image', file);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('image', null);
        setData('image_url', null);
        setImagePreview(null);
    };

    return (
        <form onSubmit={onSubmit} encType="multipart/form-data">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name">Nama Kategori</Label>
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

                <div>
                    <Label htmlFor="description">Deskripsi</Label>
                    <Textarea
                        name="description"
                        value={data.description}
                        className="mt-1 block w-full"
                        onChange={(e) => setData('description', e.target.value)}
                        rows={4}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div>
                    <Label htmlFor="image">Gambar Kategori</Label>
                    <div className="mt-1">
                        {imagePreview || (isEdit && (data.image || data.image_url)) ? (
                            <div className="relative inline-block">
                                <img
                                    src={imagePreview || (data.image_url ? `/storage/${data.image_url}` : '')}
                                    alt="Preview"
                                    className="h-32 w-32 rounded-lg border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label
                                htmlFor="image"
                                className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400"
                            >
                                <Image className="mb-2 h-8 w-8 text-gray-400" />
                                <span className="text-center text-sm text-gray-500">Upload Gambar</span>
                                <input
                                    id="image"
                                    name="image"
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/jpg,image/svg+xml"
                                />
                            </label>
                        )}
                        <InputError message={errors.image} className="mt-2" />
                        <p className="mt-1 text-xs text-gray-500">Format: JPG, PNG, JPEG, SVG. Maksimal 2MB</p>
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                    <Button asChild type="button" variant="ghost">
                        <Link href="/admin/categories">Batal</Link>
                    </Button>
                    <Button type="submit" disabled={processing}>
                        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Update' : 'Simpan'}
                    </Button>
                </div>
            </div>
        </form>
    );
}
