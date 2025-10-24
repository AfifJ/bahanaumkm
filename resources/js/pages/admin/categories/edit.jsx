import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import CategoryForm from './components/CategoryForm';
import { Button } from '@/components/ui/button';

export default function CategoriesEdit({ category }) {
    const { data, setData, post, processing, errors } = useForm({
        name: category.name,
        description: category.description,
        image: null,
        image_url: category.image, // Untuk preview gambar existing
        _method: 'PUT',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.categories.update', category), {
            forceFormData: true,
            preserveScroll: true,
            onError: (errors) => {
                console.log('Validation errors:', errors);
            },
        });
    };

    return (
        <AdminLayout
            title="Edit Kategori"
            breadcrumbs={[
                {
                    title: 'Kategori',
                    href: route('admin.categories.index'),
                },
                {
                    title: 'Edit',
                    href: route('admin.categories.edit', category),
                },
            ]}
        >
            <Head title="Edit Kategori" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 px-4">
                    <div className="flex flex-row items-center justify-between pb-4">
                        <h2 className="text-2xl font-bold">Edit Kategori</h2>
                        <Button variant="outline" size="sm" asChild>
                            <Link href={route('admin.categories.index')}>
                                Kembali
                            </Link>
                        </Button>
                    </div>

                    <div className="">
                        <CategoryForm data={data} setData={setData} errors={errors} processing={processing} onSubmit={handleSubmit} isEdit={true} />
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
