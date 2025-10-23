import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ data, onPageChange }) {
    const { current_page, last_page, per_page, total } = data;
    
    const handlePrevious = () => {
        if (current_page > 1) {
            onPageChange(current_page - 1);
        }
    };
    
    const handleNext = () => {
        if (current_page < last_page) {
            onPageChange(current_page + 1);
        }
    };
    
    const handlePageClick = (page) => {
        if (page !== current_page && page >= 1 && page <= last_page) {
            onPageChange(page);
        }
    };
    
    // Generate page numbers with ellipsis
    const generatePageNumbers = () => {
        const pages = [];
        const delta = 2; // Number of pages to show on each side of current page
        
        // Always show first page
        pages.push(1);
        
        // Calculate range around current page
        let rangeStart = Math.max(2, current_page - delta);
        let rangeEnd = Math.min(last_page - 1, current_page + delta);
        
        // Add left ellipsis
        if (rangeStart > 2) {
            pages.push('ellipsis-left');
        }
        
        // Add page numbers in range
        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }
        
        // Add right ellipsis
        if (rangeEnd < last_page - 1) {
            pages.push('ellipsis-right');
        }
        
        // Always show last page (if more than 1 page)
        if (last_page > 1) {
            pages.push(last_page);
        }
        
        return pages;
    };
    
    const startItem = ((current_page - 1) * per_page) + 1;
    const endItem = Math.min(current_page * per_page, total);
    
    const pageNumbers = generatePageNumbers();
    
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            <div className="text-sm text-gray-600">
                Menampilkan <span className="font-medium">{startItem}</span> hingga{' '}
                <span className="font-medium">{endItem}</span> dari{' '}
                <span className="font-medium">{total}</span> items
            </div>
            
            <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={current_page <= 1}
                    className="h-9 w-9 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Halaman sebelumnya"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page Numbers */}
                {pageNumbers.map((page, index) => {
                    if (typeof page === 'string' && page.startsWith('ellipsis')) {
                        return (
                            <span 
                                key={page} 
                                className="px-2 text-gray-400 select-none"
                            >
                                ...
                            </span>
                        );
                    }
                    
                    return (
                        <Button
                            key={`page-${page}`}
                            variant={current_page === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageClick(page)}
                            className={`h-9 w-9 p-0 ${
                                current_page === page 
                                    ? 'bg-primary text-white hover:bg-primary/90' 
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </Button>
                    );
                })}
                
                {/* Next Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNext}
                    disabled={current_page >= last_page}
                    className="h-9 w-9 p-0 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Halaman selanjutnya"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}