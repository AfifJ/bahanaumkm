import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useIsMobile } from '@/hooks/use-mobile';

const ProductImageGallery = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const isMobile = useIsMobile();

    // Get all images with fallback to legacy image_url
    const getAllImages = () => {
        const images = [];

        // Add images from relationship if available (new system)
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            product.images.forEach(img => {
                if (img && img.image_path) {
                    // Generate URL from image_path since backend doesn't include URL attribute
                    const url = '/storage/' + img.image_path;
                    images.push(url);
                }
            });
        }

        // If no images from relationship, try primaryImage (new system fallback)
        if (images.length === 0 && product.primary_image?.image_path) {
            const url = '/storage/' + product.primary_image.image_path;
            images.push(url);
        }

        // Final fallback: legacy image_url field (old system)
        if (images.length === 0 && product.image_url) {
            images.push(product.image_url);
        }

        return images;
    };

    const images = getAllImages();


    // Handle case when no images are available
    if (images.length === 0) {
        return (
            <div className="relative">
                <div className="w-full h-64 sm:h-80 md:h-96 aspect-square rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Gambar Tidak Tersedia</span>
                </div>
            </div>
        );
    }

    const handlePreviousImage = () => {
        setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleNextImage = () => {
        setSelectedImageIndex((prev) => (prev + 1) % images.length);
    };

    const handleThumbnailClick = (index) => {
        setSelectedImageIndex(index);
    };

    const openLightbox = (index) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    const closeLightbox = () => {
        setIsLightboxOpen(false);
    };

    const handleLightboxPrevious = () => {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleLightboxNext = () => {
        setLightboxIndex((prev) => (prev + 1) % images.length);
    };

    return (
        <div className="space-y-4">

            {/* Main Image */}
            <div className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                        src={images[selectedImageIndex]}
                        alt={`${product.name} - Gambar ${selectedImageIndex + 1}`}
                        className="w-full h-full object-contain cursor-pointer transition-transform"
                        onClick={() => openLightbox(selectedImageIndex)}
                        onError={(e) => {
                            // Handle broken images gracefully
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-8 w-8 text-gray-400">
                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                        <polyline points="3.27 6.96 12 13.44 20.73 6.96"></polyline>
                                        <line x1="12" y1="2" x2="12" y2="22"></line>
                                    </svg>
                                </div>
                            `;
                        }}
                    />
                </div>

                {/* Navigation Buttons - Only show if multiple images */}
                {images?.length > 1 && (
                    <>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handlePreviousImage}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={handleNextImage}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>

                        {/* Image Counter */}
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
                            {selectedImageIndex + 1} / {images.length}
                        </div>
                    </>
                )}

                {/* Zoom Indicator */}
                <Button
                    variant="outline"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white"
                    onClick={() => openLightbox(selectedImageIndex)}
                >
                    <ZoomIn className="h-4 w-4" />
                </Button>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <Button
                            variant="ghost"
                            key={index}
                            onClick={() => handleThumbnailClick(index)}
                            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all p-0 ${selectedImageIndex === index
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <img
                                src={image}
                                alt={`${product.name} - Thumbnail ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Handle broken thumbnail images
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = `
                                        <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6 text-gray-400">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                <polyline points="3.27 6.96 12 13.44 20.73 6.96"></polyline>
                                                <line x1="12" y1="2" x2="12" y2="22"></line>
                                            </svg>
                                        </div>
                                    `;
                                }}
                            />
                        </Button>
                    ))}
                </div>
            )}

            {/* Lightbox Dialog */}
            <Dialog open={isLightboxOpen} onOpenChange={closeLightbox}>
                <DialogContent className={`${isMobile
                    ? 'max-w-full w-full h-full rounded-none'
                    : 'max-w-6xl w-full h-[90vh] max-h-[90vh]'} p-0 overflow-hidden`}>

                    {/* Desktop Layout */}
                    {!isMobile && (
                        <div className="flex h-full">
                            {/* Left Side - Main Image */}
                            <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
                                <div className="max-w-full max-h-full">
                                    <img
                                        src={images[lightboxIndex]}
                                        alt={`${product.name} - Lightbox ${lightboxIndex + 1}`}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    />
                                </div>
                            </div>

                            {/* Right Side - Thumbnail List */}
                            {images.length > 1 && (
                                <div className="w-24 bg-white border-l border-gray-200 p-3 overflow-y-auto">
                                    <div className="space-y-2">
                                        {images.map((image, index) => (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                onClick={() => setLightboxIndex(index)}
                                                className={`aspect-square w-full h-full rounded-lg overflow-hidden border-2 transition-all hover:scale-105 p-0 ${lightboxIndex === index
                                                        ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg'
                                                        : 'border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} - Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Navigation Arrows - Overlay on Image */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full h-10 w-10 shadow-lg"
                                        onClick={handleLightboxPrevious}
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-28 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black rounded-full h-10 w-10 shadow-lg"
                                        onClick={handleLightboxNext}
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </Button>
                                </>
                            )}

                            {/* Image Counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                                    {lightboxIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Layout */}
                    {isMobile && (
                        <div className="flex flex-col h-full bg-gray-50">
                            {/* Main Image */}
                            <div className="flex-1 flex items-center justify-center p-4">
                                <div className="max-w-full max-h-[60vh]">
                                    <img
                                        src={images[lightboxIndex]}
                                        alt={`${product.name} - Lightbox ${lightboxIndex + 1}`}
                                        className="max-w-full max-h-[60vh] object-contain"
                                    />
                                </div>
                            </div>

                            {/* Mobile Navigation */}
                            {images.length > 1 && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full "
                                        onClick={handleLightboxPrevious}
                                    >
                                        <ChevronLeft className="h-7 w-7" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full "
                                        onClick={handleLightboxNext}
                                    >
                                        <ChevronRight className="h-7 w-7" />
                                    </Button>
                                </>
                            )}

                            {/* Mobile Thumbnail Strip */}
                            {images.length > 1 && (
                                <div className="p-4 bg-black/80">
                                    <div className="flex gap-2 overflow-x-auto justify-center">
                                        {images.map((image, index) => (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setLightboxIndex(index);
                                                }}
                                                className={`flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden border-2 transition-all p-0 ${lightboxIndex === index
                                                        ? 'border-blue-400 ring-2 ring-blue-300'
                                                        : 'border-gray-600 hover:border-gray-400'
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} - Mobile Thumbnail ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Mobile Counter */}
                            {images.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                                    {lightboxIndex + 1} / {images.length}
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProductImageGallery;