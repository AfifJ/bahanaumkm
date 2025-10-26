import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'sonner';
import ProductForm from './components/ProductForm';
import { useEffect, useState } from 'react';

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
            id: sku.id, // Make sure SKU ID is preserved
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
        })) || [],
        image_data: {
            existing: product.images?.map(img => ({
                id: img.id,
                is_primary: img.is_primary,
                sort_order: img.sort_order
            })) || [],
            new_files_metadata: []
        }
    });

    // State untuk melacak perubahan
    const [hasChanges, setHasChanges] = useState(false);

    // Data awal untuk perbandingan - harus sama persis dengan structure data
    const initialData = {
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
        })) || [],
        image_data: {
            existing: product.images?.map(img => ({
                id: img.id,
                is_primary: img.is_primary,
                sort_order: img.sort_order
            })) || [],
            new_files_metadata: []
        }
    };

    // Function untuk deep comparison
    const deepEqual = (obj1, obj2) => {
        if (obj1 === obj2) return true;

        if (obj1 == null || obj2 == null) return false;

        if (typeof obj1 !== typeof obj2) return false;

        if (typeof obj1 !== 'object') return obj1 === obj2;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!keys2.includes(key)) return false;
            if (!deepEqual(obj1[key], obj2[key])) return false;
        }

        return true;
    };

    // Function untuk cek perubahan
    const checkForChanges = (currentData) => {
        const hasFormChanges = !deepEqual(currentData, initialData);
        setHasChanges(hasFormChanges);
    };

    // Override setData untuk tracking perubahan
    const trackedSetData = (key, value) => {
        setData(key, value);

        // Jika key adalah object, merge dengan data existing
        let newData;
        if (typeof key === 'object' && key !== null) {
            newData = { ...data, ...key };
        } else {
            newData = { ...data, [key]: value };
        }

        checkForChanges(newData);
    };

    // Initialize hasChanges state when component mounts
    useEffect(() => {
        console.log('=== DEBUG COMPARISON DATA (INITIAL) ===');
        console.log('Has changes:', hasChanges);
        console.log('Current data:', data);
        console.log('Initial data:', initialData);
        console.log('Are they equal?', deepEqual(data, initialData));

        // Set initial state
        checkForChanges(data);
    }, []); // Only run once on mount

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

                // Validasi gambar variasi jika opsi "Gunakan Gambar per Variasi" aktif
                if (data.use_images) {
                    const hasExistingImage = sku.image && sku.image.trim() !== '';
                    const hasNewImage = sku.image_file instanceof File;

                    if (!hasExistingImage && !hasNewImage) {
                        errors[`skus.${index}.image_file`] = 'Gambar variasi wajib diupload';
                        errors.variations_images = 'Semua variasi wajib memiliki gambar ketika opsi "Gunakan Gambar per Variasi" diaktifkan';
                    }
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

        // Skip image validation for edit mode - gambar sudah ada di database
        // Edit mode tidak perlu validasi gambar karena produk sudah punya gambar

        // Prevent submit if there are validation errors
        if (Object.keys(errors).length > 0) {
            console.error('Frontend validation errors:', errors);

            // Show specific error toast for image validation
            if (errors.variations_images) {
                toast.error('Validasi Gambar Variasi Gagal!', {
                    description: errors.variations_images,
                    duration: 5000
                });
            }

            return;
        }

        // Prevent submit if no changes made
        if (!hasChanges) {
            toast.info('Tidak ada perubahan yang tersimpan.', {
                description: 'Silakan lakukan perubahan terlebih dahulu sebelum menyimpan.'
            });
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
            image_data: data.image_data
        });

        // Debug image data specifically
        console.log('=== IMAGE DATA DEBUG ===');
        console.log('Image data structure:', data.image_data);
        console.log('Existing images to keep:', data.image_data?.existing || []);
        console.log('New files metadata:', data.image_data?.new_files_metadata || []);
        console.log('Files to upload:', data.images);

        // Create FormData for proper submission
        const formData = new FormData();

        // Add basic product fields
        formData.append('name', data.name);
        formData.append('description', data.description || '');
        formData.append('status', data.status);
        formData.append('vendor_id', data.vendor_id);
        formData.append('category_id', data.category_id);

        // Ensure boolean fields are sent as actual booleans, not strings
        formData.append('has_variations', data.has_variations ? '1' : '0');
        formData.append('different_prices', data.different_prices ? '1' : '0');
        formData.append('use_images', data.use_images ? '1' : '0');
        formData.append('_method', 'PUT');

        // Add fields for non-variation products
        if (!data.has_variations) {
            formData.append('buy_price', data.buy_price || 0);
            formData.append('sell_price', data.sell_price || 0);
            formData.append('stock', data.stock || 0);
        } else {
            // Add global prices for variation products
            formData.append('buy_price', data.global_prices?.buy_price || 0);
            formData.append('sell_price', data.global_prices?.sell_price || 0);
        }

        // Add SKUs data as individual form fields for proper FormData handling
        if (data.has_variations && data.skus) {
            console.log('=== ADDING SKUS TO FORM DATA ===');
            console.log('SKUs count:', data.skus.length);

            data.skus.forEach((sku, index) => {
                console.log(`Processing SKU ${index}:`, {
                    id: sku.id,
                    sku_code: sku.sku_code,
                    variant_name: sku.variant_name,
                    price: sku.price,
                    buy_price: sku.buy_price,
                    stock: sku.stock,
                    status: sku.status
                });

                formData.append(`skus[${index}][id]`, sku.id || '');
                formData.append(`skus[${index}][sku_code]`, sku.sku_code || '');
                formData.append(`skus[${index}][variant_name]`, sku.variant_name || '');
                formData.append(`skus[${index}][name]`, sku.variant_name || '');
                formData.append(`skus[${index}][price]`, sku.price || 0);
                formData.append(`skus[${index}][buy_price]`, sku.buy_price || 0);
                formData.append(`skus[${index}][stock]`, sku.stock || 0);
                formData.append(`skus[${index}][status]`, sku.status || 'active');
                formData.append(`skus[${index}][deleted_at]`, sku.deleted_at || '');

                // Handle variation image if exists
                if (sku.image_file instanceof File) {
                    formData.append(`skus[${index}][image_file]`, sku.image_file);
                }
                if (sku.image) {
                    formData.append(`skus[${index}][image]`, sku.image);
                }
            });
        }

        // Add image data
        if (data.image_data) {
            formData.append('image_data', JSON.stringify(data.image_data));
        }

        // Add image files
        if (data.images && Array.isArray(data.images)) {
            data.images.forEach((image, index) => {
                if (image instanceof File) {
                    formData.append(`images[${index}]`, image);
                }
            });
        }

        // Debug FormData content
        console.log('=== FORM DATA CONTENT ===');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        // Show loading toast
        const loadingToast = toast.loading('Sedang memperbarui produk...');

        console.log("formdat", formData);

        // Use router.post with FormData instead of useForm
        router.post(route('admin.products.update', product), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (page) => {
                toast.dismiss(loadingToast);
                toast.success('Produk berhasil diperbarui!', {
                    description: 'Perubahan telah tersimpan.'
                });
                console.log('Product updated successfully');
                console.log('Response page:', page);
            },
            onError: (errors, page) => {
                toast.dismiss(loadingToast);

                // Check for flash error messages from backend
                const flashError = page?.props?.flash?.error;
                
                // Format error messages for better display
                let errorDescription = 'Periksa kembali form yang Anda isi.';

                if (flashError) {
                    // Use backend error message if available
                    errorDescription = flashError;
                } else if (errors && Object.keys(errors).length > 0) {
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) {
                        errorDescription = errorMessages.join(', ');
                    }
                }

                // Show detailed error toast
                toast.error('Gagal memperbarui produk!', {
                    description: errorDescription,
                    duration: 10000, // 10 seconds
                });

                // Log all errors for debugging
                console.error('=== UPDATE ERRORS ===');
                console.error('Flash error:', flashError);
                console.error('Validation errors:', errors);
                console.error('Form data sent:', {
                    has_variations: data.has_variations,
                    different_prices: data.different_prices,
                    use_images: data.use_images,
                    skus_count: data.skus?.length || 0,
                    images_count: data.images?.length || 0,
                    name: data.name,
                    status: data.status,
                    vendor_id: data.vendor_id,
                    category_id: data.category_id
                });

                // Log SKU data specifically for debugging
                if (data.has_variations && data.skus) {
                    console.log('=== SKU DATA SENT ===');
                    data.skus.forEach((sku, index) => {
                        console.log(`SKU ${index}:`, {
                            id: sku.id,
                            sku_code: sku.sku_code,
                            variant_name: sku.variant_name,
                            price: sku.price,
                            buy_price: sku.buy_price,
                            stock: sku.stock,
                            status: sku.status
                        });
                    });
                }
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
                        setData={trackedSetData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        isEdit={true}
                        vendors={vendors}
                        categories={categories}
                        editRestrictions={product.edit_restrictions}
                        hasChanges={hasChanges}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
