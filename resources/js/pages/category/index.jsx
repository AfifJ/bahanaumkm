import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ScrollToTop from '@/components/scroll-to-top';

export default function CategoryIndex({ categories, layout }) {
    const LayoutComponent = layout === 'guest' ? GuestLayout : AppLayout;

    return (
        <LayoutComponent>
            <ScrollToTop />
            <Head title="Kategori Produk" />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: 'Home', href: route('home') },
                            { title: 'Kategori' },
                        ]}
                    />
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Kategori Produk</h1>
                    <p className="text-gray-600">
                        Jelajahi berbagai kategori produk yang tersedia di toko kami.
                    </p>
                </div>

                {categories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {categories.map((category) => (
                            <Card key={category.id} className="hover:shadow-lg transition-shadow">
                                <Link href={route('category.show', category.slug)}>
                                    <CardContent className="p-6 text-center">
                                        {category.image ? (
                                            <img
                                                src={`/storage/${category.image}`}
                                                alt={category.name}
                                                className="w-24 h-24 mx-auto object-cover rounded-lg mb-4"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                                                <span className="text-gray-500 text-2xl">📦</span>
                                            </div>
                                        )}
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {category.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {category.products_count} produk
                                        </p>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kategori</h3>
                        <p className="text-gray-600">
                            Kategori produk akan segera tersedia.
                        </p>
                    </div>
                )}
            </div>
        </LayoutComponent>
    );
}
