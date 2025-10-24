import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import ProductForm from './components/ProductForm';

export default function Edit({ product, vendors, categories }) {
    const { props } = usePage();
    const { data, setData, post, processing, errors, setError } = useForm({
        name: product.name,
        buy_price: product.buy_price,
        sell_price: product.sell_price,
        stock: product.stock,
        description: product.description,
        image: null,
        image_url: product.primaryImage?.url || null,
        status: product.status,
        vendor_id: product.vendor_id,
        vendor_name: product.vendor?.name || null,
        category_id: product.category_id,
        _method: 'PUT',
        // Variation fields
        has_variations: product.has_variations || false,
        different_prices: product.different_prices || true,
        use_images: product.use_images || false,
        skus: product.skus?.map(sku => ({
            id: sku.id,
            sku_code: sku.sku_code,
            name: sku.variant_name,
            variant_name: sku.variant_name,
            price: sku.price,
            buy_price: sku.buy_price,
            stock: sku.stock,
            weight: sku.weight,
            status: sku.status,
            image: sku.image,
            deleted_at: sku.deleted_at,
            has_orders: sku.has_orders || false
        })) || [],
        global_prices: {
            buy_price: product.buy_price || 0,
            sell_price: product.sell_price || 0
        },
        images: product.images?.map(img => ({
            id: img.id,
            url: img.url,
            is_primary: img.is_primary,
            sort_order: img.sort_order,
            file: null
        })) || []
    });

    // Debug: Log image data
    console.log('=== EDIT FORM - RAW PRODUCT DATA ===');
    console.log('Product images from props:', product.images);
    console.log('Mapped images in form data:', data.images);
    console.log('Image URLs:', data.images?.map(img => ({ id: img.id, url: img.url, path: img.image_path })) || []);

    const submit = (e) => {
        e.preventDefault();

        // Validasi form
        const errors = {};

        // Validasi variasi
        if (data.has_variations) {
            if (!data.skus || data.skus.length < 2) {
                errors.variations = 'Produk dengan variasi harus memiliki minimal 2 variasi';
                toast.error('Variasi minimal 2, produk dengan variasi harus memiliki minimal 2 variasi');
            }

            // Validasi setiap variasi
            data.skus?.forEach((sku, index) => {
                if (!sku.variant_name || sku.variant_name.trim() === '') {
                    errors[`skus.${index}.variant_name`] = 'Nama variasi harus diisi';
                }
                if (!sku.price || sku.price <= 0) {
                    errors[`skus.${index}.price`] = 'Harga harus lebih dari 0';
                }
                if (!sku.stock || sku.stock < 0) {
                    errors[`skus.${index}.stock`] = 'Stok tidak boleh negatif';
                }
            });
        } else {
            // Validasi produk tanpa variasi
            if (!data.name || data.name.trim() === '') {
                errors.name = 'Nama produk harus diisi';
            }
            if (!data.sell_price || data.sell_price <= 0) {
                errors.sell_price = 'Harga jual harus lebih dari 0';
            }
            if (!data.stock || data.stock < 0) {
                errors.stock = 'Stok tidak boleh negatif';
            }
        }

        // Validasi gambar (khusus untuk edit, gambar tidak wajib diupload ulang)
        // Cek baik data.images maupun existing images dari product
        const hasExistingImages = product.primaryImage?.url || (data.image_data?.existing && data.image_data.existing.length > 0);
        const hasNewImages = data.images && data.images.length > 0;
        
        if (!hasExistingImages && !hasNewImages) {
            errors.images = 'Produk harus memiliki minimal 1 gambar';
            toast.error('Gambar minimal 1, produk tidak bisa disimpan tanpa gambar');
        }

        // Prevent submit if there are validation errors
        if (Object.keys(errors).length > 0) {
            console.error('Frontend validation errors:', errors);
            return;
        }

        console.log('=== SUBMITTING PRODUCT UPDATE ===');
        console.log('Product ID:', product.id);
        console.log('Form data:', {
            has_variations: data.has_variations,
            different_prices: data.different_prices,
            use_images: data.use_images,
            skus_count: data.skus?.length || 0,
            images_count: data.images?.length || 0,
            image_data: data.image_data,
            images_files_count: data.images?.length || 0,
            hasExistingImages: hasExistingImages,
            hasNewImages: hasNewImages
        });
        
        // Debug image data specifically
        console.log('=== IMAGE DATA DEBUG ===');
        console.log('Image data structure:', data.image_data);
        console.log('Existing images to keep:', data.image_data?.existing || []);
        console.log('New files metadata:', data.image_data?.new_files_metadata || []);
        console.log('Files to upload:', data.images);

        // Show loading toast
        const loadingToast = toast.loading('Sedang memperbarui produk...');

        post(route('admin.products.update', product), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                toast.dismiss(loadingToast);
                toast.success('Produk berhasil diperbarui!', {
                    description: 'Perubahan telah tersimpan.'
                });
                console.log('Product updated successfully');
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                toast.error('Gagal memperbarui produk!', {
                    description: 'Periksa kembali form yang Anda isi.',
                });
                console.error('Update validation errors:', errors);
            },
            onCancel: () => {
                toast.dismiss(loadingToast);
                toast.info('Update dibatalkan');
            }
        });
    };

    return (
        <AdminLayout
            title="Edit Product"
            breadcrumbs={[
                { title: 'Products', href: route('admin.products.index') },
                { title: 'Edit', href: route('admin.products.edit', product) },
            ]}
        >
            <Head title="Edit Product" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 px-4 ">
                    {/* Flash Messages */}
                    {props.flash?.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                            {props.flash.success}
                        </div>
                    )}
                    {props.flash?.error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            {props.flash.error}
                        </div>
                    )}

                    {/* Validation Error Summary */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                            <h4 className="font-semibold mb-2">Terdapat kesalahan pada form:</h4>
                            <ul className="list-disc list-inside text-sm">
                                {[...new Set(Object.values(errors))].map((message, index) => (
                                    <li key={index}>{message}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Processing State */}
                    {processing && (
                        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                                Sedang memperbarui produk...
                            </div>
                        </div>
                    )}

                    <ProductForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        isEdit={true}
                        vendors={vendors}
                        categories={categories}
                        editRestrictions={product.edit_restrictions}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
