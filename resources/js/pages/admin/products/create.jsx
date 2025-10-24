import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import ProductForm from './components/ProductForm';
import { toast } from 'sonner';

export default function Create({ vendors, categories }) {
    const { props } = usePage();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        buy_price: 0,
        sell_price: 0,
        stock: 0,
        description: '',
        images: [],
        status: 'active',
        vendor_id: null,
        category_id: null,
        // Variation fields
        has_variations: false,
        different_prices: true,
        use_images: false,
        skus: [],
        global_prices: {
            buy_price: 0,
            sell_price: 0
        }
    });

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

        // Validasi gambar - diperkuat dengan toast error
        // Cek baik data.images maupun kondisi visual imagePreviews
        const hasImages = data.images && data.images.length > 0;
        if (!hasImages) {
            errors.images = 'Produk harus memiliki minimal 1 gambar';
            toast.error('Gambar minimal 1, produk tidak bisa disimpan tanpa gambar');
        }

        // Log data for debugging
        console.log('Submitting product data:', {
            has_variations: data.has_variations,
            different_prices: data.different_prices,
            skus_count: data.skus?.length || 0,
            images_count: data.images?.length || 0
        });

        // Prevent submit if there are validation errors
        if (Object.keys(errors).length > 0) {
            console.error('Frontend validation errors:', errors);
            return;
        }

        post(route('admin.products.store'), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Produk berhasil dibuat');
                console.log('Product created successfully');
            },
            onError: (errors) => {
                toast.error('Gagal membuat produk. Periksa form kembali.');
                console.error('Validation errors:', errors);
            }
        });
    };

    return (
        <AdminLayout
            title="Create Product"
            breadcrumbs={[
                {
                    title: 'Products',
                    href: route('admin.products.index'),
                },
                {
                    title: 'Create',
                    href: route('admin.products.create'),
                },
            ]}
        >
            <Head title="Create Product" />
            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6  ">
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
                                Sedang menyimpan produk...
                            </div>
                        </div>
                    )}

                    <ProductForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        vendors={vendors}
                        categories={categories}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
