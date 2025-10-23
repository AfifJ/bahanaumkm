import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProductSearch({ filters, filterOptions, onFilterChange }) {
    const handleFilterChange = (key, value) => {
        if (key === 'clear') {
            // Clear all filters by calling parent with clear action
            onFilterChange('clear', true);
        } else {
            onFilterChange(key, value);
        }
    };

    const hasActiveFilters = filters.search || filters.status || filters.vendor || filters.category;

    return (
        <div className=" mb-6">
            {/* Search by name */}
            <div className="mb-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Cari produk..."
                        value={filters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 w-full"
                    />
                </div>
            </div>
            <div className="flex flex-col lg:flex-row gap-4">

                {/* Filter by status */}
                <div className="w-full lg:w-48">
                    <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Filter by vendor */}
                <div className="w-full lg:w-48">
                    <Select value={filters.vendor || 'all'} onValueChange={(value) => handleFilterChange('vendor', value === 'all' ? '' : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semua Vendor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Vendor</SelectItem>
                            {filterOptions?.vendors?.map((vendor) => (
                                <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                    {vendor.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Filter by category */}
                <div className="w-full lg:w-48">
                    <Select value={filters.category || 'all'} onValueChange={(value) => handleFilterChange('category', value === 'all' ? '' : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {filterOptions?.categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={() => handleFilterChange('clear', true)}
                        className="w-full lg:w-auto"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}