import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CategoryForm from './components/CategoryForm';

export default function CategoriesEdit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name,
        description: category.description,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.categories.update', category.id));
    };

    const handleCancel = () => {
        window.history.back();
    };

    return (
        <AdminLayout>
            <Head title="Edit Kategori" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Edit Kategori</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Edit Kategori</CardTitle>
                        <CardDescription>
                            Edit informasi kategori produk
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={handleSubmit}
                            onCancel={handleCancel}
                            isEdit={true}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
