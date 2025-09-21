import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, useForm } from '@inertiajs/react';
import CategoryForm from './components/CategoryForm';

export default function CategoriesCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.categories.store'), data, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    return (
        <AdminLayout>
            <Head title="Tambah Kategori" />

            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Tambah Kategori</h2>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Form Tambah Kategori</CardTitle>
                        <CardDescription>Tambahkan kategori baru untuk produk</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CategoryForm
                            data={data}
                            setData={setData}
                            errors={errors}
                            processing={processing}
                            onSubmit={handleSubmit}
                        />
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
