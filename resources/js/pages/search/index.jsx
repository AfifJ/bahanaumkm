import { Head, Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Filter, FilterX, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductList from '@/components/product-list';

export default function SearchIndex({ products, categories, filters, layout }) {
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [showFilters, setShowFilters] = useState(false);


    const handleFilter = () => {
        const params = {};

        if (search) params.search = search;
        if (category && category !== 'all') params.category = category;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        if (sortBy !== 'created_at') params.sort_by = sortBy;
        if (sortOrder !== 'desc') params.sort_order = sortOrder;

        router.get(route('search'), params);
    };

    const clearFilters = () => {
        setCategory('all');
        setMinPrice('');
        setMaxPrice('');
        setSortBy('created_at');
        setSortOrder('desc');
        router.get(route('search'), { search });
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const LayoutComponent = layout === 'guest' ? GuestLayout : AppLayout;

    return (
        <LayoutComponent>
            <Head title="Pencarian Produk" />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <div className='flex gap-2'>
                        <Button
                            variant={'outline'}
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            {showFilters ? <FilterX /> :
                                <Filter />
                            }
                        </Button>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            Pencarian Produk
                        </h1>
                    </div>


                    {/* Filters */}
                    {showFilters && (
                        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                            {/* Baris 1: Filter Kategori dan Harga */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                {/* Kategori */}
                                <Select value={category} onValueChange={setCategory}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Semua Kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Kategori</SelectItem>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id.toString()}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Harga Min */}
                                <Input
                                    type="number"
                                    placeholder="Harga Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="h-10"
                                />

                                {/* Harga Max */}
                                <Input
                                    type="number"
                                    placeholder="Harga Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="h-10"
                                />

                            </div>

                            {/* Baris 2: Sort Order dan Tombol Aksi */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* Sort By */}
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Urutkan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="created_at">Terbaru</SelectItem>
                                        <SelectItem value="name">Nama A-Z</SelectItem>
                                        <SelectItem value="sell_price">Harga</SelectItem>
                                    </SelectContent>
                                </Select>
                                {/* Sort Order */}
                                <Select value={sortOrder} onValueChange={setSortOrder}>
                                    <SelectTrigger className="h-10">
                                        <SelectValue placeholder="Urutan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="desc">Tertinggi</SelectItem>
                                        <SelectItem value="asc">Terendah</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Tombol Aksi */}
                                <div className="md:col-span-2 flex gap-2 justify-end">
                                    <Button onClick={handleFilter} className="h-10 px-6 flex-1 md:flex-none">
                                        Terapkan Filter
                                    </Button>
                                    <Button variant="outline" onClick={clearFilters} className="h-10">
                                        Reset
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}


                    {products.data.length > 0 ? (
                        <>
                            <div className="mb-4">
                                <p className="text-gray-600">
                                    Menampilkan {products.total} hasil pencarian
                                    {search && ` untuk "${search}"`}
                                </p>
                            </div>

                            <ProductList productList={products.data} />

                            {products.links && products.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex items-center gap-1">
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
                                                    } text-sm border rounded-md transition-colors ${
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
                                    </nav>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-6xl mb-4">🔍</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Produk tidak ditemukan</h3>
                            <p className="text-gray-600 mb-4">
                                Coba ubah kata kunci pencarian atau filter yang Anda gunakan.
                            </p>
                            <Button onClick={clearFilters}>Reset Pencarian</Button>
                        </div>
                    )}
                </div>
            </div>
        </LayoutComponent>
    );
}
