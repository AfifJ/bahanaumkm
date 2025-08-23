import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import ProductForm from './components/ProductForm';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        buy_price: 0,
        sell_price: 0,
        stock: 0,
        description: '',
        image: null,
        status: 'active',
    });

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        setData('image', file ?? null);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.products.store'), {
            forceFormData: true,
            onError: () => {},
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
                                onCancel={() => window.history.back()}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
