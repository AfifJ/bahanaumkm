import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import ProductForm from './components/ProductForm';

export default function Edit({ product }) {
    const { data, setData, post, processing, errors, setError } = useForm({
        name: product.name,
        buy_price: product.buy_price,
        sell_price: product.sell_price,
        stock: product.stock,
        description: product.description,
        image: null,
        image_url: product.image_url,
        status: product.status,
        _method: 'PUT',
    });

    const submit = (e) => {
        e.preventDefault();
        console.log(data);

        post(route('products.update', product.id), {
            forceFormData: true, 
            preserveScroll: true,
        });
    };

    return (
        <AppLayout
            title="Edit Product"
            breadcrumbs={[
                { title: 'Products', href: route('products.index') },
                { title: 'Edit', href: route('products.edit', product.id) },
            ]}
        >
            <Head title="Edit Product" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200 bg-white p-6">
                            <ProductForm
                                data={data}
                                setData={setData}
                                errors={errors}
                                processing={processing}
                                onSubmit={submit}
                                isEdit={true}
                                onCancel={() => window.history.back()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
