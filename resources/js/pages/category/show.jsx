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

            <div className="container mx-auto">
                {/* Breadcrumb */}
                <div className="my-4">
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
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Produk {currentCategory.name}</h1>
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
                                    {products.links.map((link, index) => {
                                        const isFirst = index === 0;
                                        const isLast = index === products.links.length - 1;
                                        
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`inline-flex items-center justify-center ${
                                                    isFirst || isLast 
                                                        ? 'h-9 w-9' 
                                                        : 'h-9 min-w-[2.25rem] px-2'
                                                } text-sm border rounded-md font-medium transition-colors ${
                                                    link.active
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                preserveScroll
                                            >
                                                {isFirst ? (
                                                    <ChevronLeft className="h-4 w-4" />
                                                ) : isLast ? (
                                                    <ChevronRight className="h-4 w-4" />
                                                ) : (
                                                    link.label
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
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
