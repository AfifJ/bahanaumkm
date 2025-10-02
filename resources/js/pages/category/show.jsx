import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/breadcrumbs';
import ScrollToTop from '@/components/scroll-to-top';
import { ChevronLeft, ChevronRight, Filter, FilterX } from 'lucide-react';
import ProductList from '@/components/product-list';

export default function CategoryShow({ products, categories, currentCategory, filters, layout }) {
    const { url } = usePage();
    const [search, setSearch] = useState(filters.search || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [showFilters, setShowFilters] = useState(false);

    const handleFilter = () => {
        const params = new URLSearchParams();

        if (search) params.set('search', search);
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (sortBy !== 'created_at') params.set('sort_by', sortBy);
        if (sortOrder !== 'desc') params.set('sort_order', sortOrder);

        window.location.href = `${url}?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearch('');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('created_at');
        setSortOrder('desc');
        window.location.href = url;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const LayoutComponent = GuestLayout;

    return (
        <LayoutComponent>
            <ScrollToTop />
            <Head title={`Produk ${currentCategory.name}`} />

            <div className="container mx-auto px-4">
                {/* Breadcrumb */}
                <div className="mb-4">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: 'Home', href: route('home') },
                            { title: 'Kategori', href: route('category.index') },
                            {
                                title: currentCategory.name,
                                href: route('category.show', currentCategory.slug)
                            },
                        ]}
                    />
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Produk {currentCategory.name}</h1>
                    <Button
                        variant={'outline'}
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? <FilterX /> :
                            <Filter />
                        }
                    </Button>
                    <p className="text-gray-600">
                        {products.total} produk ditemukan dalam kategori ini
                    </p>
                </div>

                {/* Search and Filters */}
                {showFilters &&
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input
                                type="number"
                                placeholder="Harga Min"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                            <Input
                                type="number"
                                placeholder="Harga Max"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Urutkan berdasarkan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Terbaru</SelectItem>
                                    <SelectItem value="name">Nama A-Z</SelectItem>
                                    <SelectItem value="sell_price">Harga</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortOrder} onValueChange={setSortOrder}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Urutan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="desc">Tertinggi</SelectItem>
                                    <SelectItem value="asc">Terendah</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={handleFilter} className="flex-1">
                                    Terapkan Filter
                                </Button>
                                <Button variant="outline" onClick={clearFilters}>
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>
                }

                {products.data.length > 0 ? (
                    <>
                        <ProductList productList={products.data} />

                        {/* Pagination */}
                        {products.links && products.links.length > 3 && (
                            <div className="mt-8 flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan {products.from} sampai {products.to} dari {products.total} produk
                                </div>
                                <div className="flex items-center space-x-1">
                                    {/* Previous Button */}
                                    <Link
                                        href={products.links[0].url || '#'}
                                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${!products.links[0].url
                                            ? 'cursor-not-allowed text-gray-400'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="ml-1">Sebelumnya</span>
                                    </Link>

                                    {/* Page Numbers */}
                                    <div className="flex space-x-1">
                                        {products.links.slice(1, -1).map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium ${link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                    } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>

                                    {/* Next Button */}
                                    <Link
                                        href={products.links[products.links.length - 1].url || '#'}
                                        className={`inline-flex items-center rounded-md px-3 py-2 text-sm font-medium ${!products.links[products.links.length - 1].url
                                            ? 'cursor-not-allowed text-gray-400'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="mr-1">Selanjutnya</span>
                                        <ChevronRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Produk tidak ditemukan</h3>
                        <p className="text-gray-600 mb-4">
                            Coba ubah filter pencarian Anda atau lihat semua produk.
                        </p>
                        <Button onClick={clearFilters}>Lihat Semua Produk</Button>
                    </div>
                )}
            </div>
        </LayoutComponent>
    );
}
