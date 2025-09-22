import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import GuestLayout from '@/layouts/guest-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

export default function SearchIndex({ products, categories, filters, layout }) {
    const { url } = usePage();
    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || 'all');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');

    const handleFilter = () => {
        const params = new URLSearchParams();
        
        if (search) params.set('search', search);
        if (category && category !== 'all') params.set('category', category);
        if (minPrice) params.set('min_price', minPrice);
        if (maxPrice) params.set('max_price', maxPrice);
        if (sortBy !== 'created_at') params.set('sort_by', sortBy);
        if (sortOrder !== 'desc') params.set('sort_order', sortOrder);

        window.location.href = `${url}?${params.toString()}`;
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('all');
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

    const LayoutComponent = layout === 'guest' ? GuestLayout : AppLayout;

    return (
        <LayoutComponent>
            <Head title="Pencarian Produk" />

            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Pencarian Produk</h1>
                    
                    {/* Search and Filters */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Cari produk..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleFilter()}
                                />
                            </div>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger>
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

                    {products.data.length > 0 ? (
                        <>
                            <div className="mb-4">
                                <p className="text-gray-600">
                                    Menampilkan {products.total} hasil pencarian
                                    {search && ` untuk "${search}"`}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {products.data.map((product) => (
                                    <Card key={product.id} className="hover:shadow-lg transition-shadow p-0">
                                        <CardHeader className="p-0">
                                            <Link href={route('product.show', product.slug)}>
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="w-full h-48 object-cover rounded-t-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
                                                        <span className="text-gray-500">Gambar Tidak Tersedia</span>
                                                    </div>
                                                )}
                                            </Link>
                                        </CardHeader>
                                        <CardContent className="p-4">
                                            <Link 
                                                href={route('product.show', product.slug)}
                                                className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2"
                                            >
                                                {product.name}
                                            </Link>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {product.category?.name}
                                            </p>
                                            <p className="text-2xl font-bold text-green-600 mt-2">
                                                {formatPrice(product.sell_price)}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Stok: {product.stock}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="p-4 pt-0">
                                            <Button asChild className="w-full">
                                                <Link href={route('product.show', product.slug)}>
                                                    Lihat Detail
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>

                            {/* Pagination */}
                            {products.links && products.links.length > 3 && (
                                <div className="mt-8 flex justify-center">
                                    <nav className="flex items-center gap-2">
                                        {products.links.map((link, index) => (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 rounded-md border ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
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
