import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Edit({ carousel }) {
    const { data, setData, put, processing, errors, reset } = useForm({
        title: carousel.title || '',
        image: null,
        link_url: carousel.link_url || '',
        sort_order: carousel.sort_order || '',
        is_active: carousel.is_active,
    });

    const [imagePreview, setImagePreview] = useState(carousel.image_url);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setImagePreview(carousel.image_url);
    }, [carousel.image_url]);

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

        put(route('admin.carousels.update', carousel.id), {
            onSuccess: () => {
                setData('image', null);
                fileInputRef.current.value = '';
            },
        });
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            // Validate file size (2MB max)
            if (file.size > 2 * 1024 * 1024) {
                alert('File size must be less than 2MB');
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
        setImagePreview(carousel.image_url);
        fileInputRef.current.value = '';
    };

    return (
        <AdminLayout
            title="Edit Carousel"
            breadcrumbs={[
                {
                    title: 'Carousel',
                    href: route('admin.carousels.index'),
                },
                {
                    title: 'Edit',
                    href: route('admin.carousels.edit', carousel),
                },
            ]}
        >
            <Head title="Edit Carousel" />

            <div className="py-6">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" size="sm" asChild>
                                <Link href={route('admin.carousels.index')}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Carousels
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Edit Carousel
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Update carousel information and settings
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Current Image Preview */}
                            <div>
                                <Label>Current Image</Label>
                                <div className="mt-2">
                                    <img
                                        src={carousel.image_url}
                                        alt="Current carousel"
                                        className="h-20 w-32 object-cover rounded-md border"
                                    />
                                </div>
                            </div>

                            {/* Image Upload */}
                            <div>
                                <Label>Replace Image (Optional)</Label>
                                <div className="mt-2">
                                    <div className="flex items-center space-x-6">
                                        <div className="flex-shrink-0">
                                            {imagePreview && imagePreview !== carousel.image_url ? (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="h-32 w-48 object-cover rounded-md border"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveImage}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                    >
                                                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={handleImageClick}
                                                    className="h-32 w-48 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                                >
                                                    <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                                                    <p className="text-xs text-gray-500 text-center">
                                                        Click to upload new image
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

                                        <div className="flex-1">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleImageClick}
                                                className="mb-2"
                                            >
                                                <Upload className="h-4 w-4 mr-2" />
                                                Choose New Image
                                            </Button>
                                            <p className="text-sm text-gray-600">
                                                Recommended size: 1200x600px (2:1 ratio). Max file size: 2MB.
                                                Supported formats: JPEG, PNG, JPG, GIF.
                                            </p>
                                        </div>
                                    </div>
                                    {errors.image && (
                                        <p className="mt-1 text-sm text-red-600">{errors.image}</p>
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Enter carousel title (optional)"
                                    className="mt-1"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Title is optional but recommended for accessibility.
                                </p>
                                {errors.title && (
                                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                                )}
                            </div>

                            {/* Link URL */}
                            <div>
                                <Label htmlFor="link_url">Link URL</Label>
                                <Input
                                    id="link_url"
                                    type="url"
                                    value={data.link_url}
                                    onChange={(e) => setData('link_url', e.target.value)}
                                    placeholder="https://example.com"
                                    className="mt-1"
                                />
                                <p className="mt-1 text-sm text-gray-500">
                                    Optional: Users will be redirected to this URL when they click on the carousel.
                                </p>
                                {errors.link_url && (
                                    <p className="mt-1 text-sm text-red-600">{errors.link_url}</p>
                                )}
                            </div>

                            {/* Sort Order */}
                            <div>
                                <Label htmlFor="sort_order">Sort Order</Label>
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
                                    Determines the display order. Lower numbers appear first.
                                </p>
                                {errors.sort_order && (
                                    <p className="mt-1 text-sm text-red-600">{errors.sort_order}</p>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>
                            <p className="text-sm text-gray-500 -mt-4">
                                Only active carousels will be displayed on the home page.
                            </p>

                            {/* Actions */}
                            <div className="flex justify-end space-x-3 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        reset();
                                        setImagePreview(carousel.image_url);
                                        fileInputRef.current.value = '';
                                    }}
                                >
                                    Reset
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {processing ? 'Updating...' : 'Update Carousel'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}