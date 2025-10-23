import ProductList from '@/components/product-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BuyerLayout from '@/layouts/buyer-layout';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Search, Store, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function VendorShow({ vendor, products, categories, vendorStats, filters, layout }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'desc');
    const [showFilters, setShowFilters] = useState(false);

    const getVendorInitials = (name) => {
        if (!name) return 'V';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const applyFilters = () => {
        const params = new URLSearchParams();

        if (searchTerm) params.append('search', searchTerm);
        if (categoryFilter && categoryFilter !== 'all') params.append('category', categoryFilter);
        if (sortBy) params.append('sort_by', sortBy);
        if (sortOrder) params.append('sort_order', sortOrder);

        router.get(
            route('vendor.show', vendor.id),
            Object.fromEntries(params.entries()),
            { preserveScroll: true }
        );
    };

    const handleCategoryChange = (value) => {
        setCategoryFilter(value);
        if (value !== categoryFilter) {
            const params = new URLSearchParams(filters);

            if (value && value !== 'all') {
                params.set('category', value);
            } else {
                params.delete('category');
            }

            router.get(
                route('vendor.show', vendor.id),
                Object.fromEntries(params.entries()),
                { preserveScroll: true }
            );
        }
    };

    const handleSortChange = (field) => {
        const newSortBy = field;
        const newSortOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';

        setSortBy(newSortBy);
        setSortOrder(newSortOrder);

        const params = new URLSearchParams(filters);
        params.set('sort_by', newSortBy);
        params.set('sort_order', newSortOrder);

        router.get(
            route('vendor.show', vendor.id),
            Object.fromEntries(params.entries()),
            { preserveScroll: true }
        );
    };

    const resetFilters = () => {
        setSearchTerm('');
        setCategoryFilter('all');
        setSortBy('created_at');
        setSortOrder('desc');

        router.get(route('vendor.show', vendor.id));
    };

    // Determine layout
    const Layout = layout === 'guest' ? GuestLayout : BuyerLayout;

    return (
        <Layout>
            <Head title={`${vendor.name} - Produk Vendor - Bahana UMKM`} />

            {/* Vendor Profile Header */}
            <div className="container mx-auto px-4 pb-6">
                <div>
                    <div className="p-6">
                        <div className="flex items-center space-x-6">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={vendor.avatar_url} alt={vendor.name} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-medium">
                                    {getVendorInitials(vendor.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">{vendor.name || 'Vendor'}</h1>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Store className="h-4 w-4 mr-1" />
                                        <span>Vendor</span>
                                    </div>
                                    <div>
                                        <span className="font-medium">{vendorStats.active_products}</span> produk aktif
                                    </div>
                                    <div>
                                        <span className="font-medium">{vendorStats.total_products}</span> total produk
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="container mx-auto px-4 pb-6">
                <div>
                    <div className="">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder={`Cari produk oleh ${vendor.name || 'vendor'}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4"
                                />
                                <Button type="submit" className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8">
                                    Cari
                                </Button>
                            </div>
                        </form>

                        {/* Filter Controls */}
                        <div className="flex items-center justify-between">
                            <div className="items-center space-y-4">
                                {/* Category Filter */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Kategori:</span>
                                    <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua</SelectItem>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Options */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">Urutkan:</span>
                                    <Button
                                        variant={sortBy === 'name' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSortChange('name')}
                                    >
                                        Nama {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </Button>
                                    <Button
                                        variant={sortBy === 'sell_price' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSortChange('sell_price')}
                                    >
                                        Harga {sortBy === 'sell_price' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </Button>
                                    <Button
                                        variant={sortBy === 'created_at' ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => handleSortChange('created_at')}
                                    >
                                        Terbaru {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                    </Button>
                                </div>
                            </div>

                            {/* Reset Filters */}
                            {(searchTerm || categoryFilter !== 'all' || sortBy !== 'created_at' || sortOrder !== 'desc') && (
                                <Button variant="outline" size="sm" onClick={resetFilters}>
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="container mx-auto px-4 pb-8">
                {products.data.length > 0 ? (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Produk {vendor.name || 'Vendor'} ({products.total})
                            </h2>
                            <Badge variant="secondary">
                                {products.from}-{products.to} dari {products.total}
                            </Badge>
                        </div>

                        <ProductList productList={products.data} />

                        {/* Pagination */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex justify-center mt-8">
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
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Store className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm || categoryFilter !== 'all'
                                ? 'Tidak ada produk yang ditemukan'
                                : 'Belum ada produk dari vendor ini'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {searchTerm || categoryFilter !== 'all'
                                ? 'Coba ubah filter atau kata kunci pencarian'
                                : 'Vendor ini belum menambahkan produk apa pun'}
                        </p>
                        {(searchTerm || categoryFilter !== 'all') && (
                            <Button onClick={resetFilters}>
                                Reset Filter
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
}