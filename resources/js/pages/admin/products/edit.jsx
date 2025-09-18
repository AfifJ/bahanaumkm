import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import ProductForm from './components/ProductForm';

export default function Edit({ product, vendors, categories }) {
    const { data, setData, post, processing, errors, setError } = useForm({
        name: product.name,
        buy_price: product.buy_price,
        sell_price: product.sell_price,
        stock: product.stock,
        description: product.description,
        image: null,
        image_url: product.image_url,
        status: product.status,
        vendor_id: product.vendor_id,
        vendor_name: product.vendor?.name || null,
        category_id: product.category_id,
        _method: 'PUT',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('admin.products.update', product.id), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout
            title="Edit Product"
            breadcrumbs={[
                { title: 'Products', href: route('admin.products.index') },
                { title: 'Edit', href: route('admin.products.edit', product.id) },
            ]}
        >
            <Head title="Edit Product" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <ProductForm
                        data={data}
                        setData={setData}
                        errors={errors}
                        processing={processing}
                        onSubmit={submit}
                        isEdit={true}
                        onCancel={() => window.history.back()}
                        vendors={vendors}
                        categories={categories}
                    />
                </div>
            </div>
        </AdminLayout>
    );
}
