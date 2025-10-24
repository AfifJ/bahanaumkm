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

            <div className="container mx-auto">
                <div className="my-4">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: 'Home', href: route('home') },
                            { title: 'Kategori' },
                        ]}
                    />
                </div>

                <div className="mb-4">
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Kategori Produk</h1>
                    <p className="text-gray-600 text-sm">
                        Jelajahi berbagai kategori produk yang tersedia di toko kami.
                    </p>
                </div>

                {categories.length > 0 ? (
                    <div className="divide-gray-300 divide-y-[1px] space-y-2">
                        {categories.map((category) => (
                            <div key={category.id} className="py-2">
                                <Link href={route('category.show', category.slug)}>
                                    <div className="flex items-center gap-4 px-4">
                                        {category.image ? (
                                            <img
                                                src={`/storage/${category.image}`}
                                                alt={category.name}
                                                className="w-8 h-8 object-cover rounded-lg flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <span className="text-gray-500 text-xl">📦</span>
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <h3 className="text-gray-900">
                                                {category.name}
                                            </h3>
                                        </div>
                                        <div className="text-gray-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            </div>
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
