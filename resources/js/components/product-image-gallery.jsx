import { useState } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductImageGallery = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

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
                        className="w-full h-full object-contain cursor-pointer transition-transform hover:scale-105"
                        onClick={() => openLightbox(selectedImageIndex)}
                        onError={(e) => {
                            // Handle broken images gracefully
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                                    Gambar tidak dapat dimuat
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
                            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all p-0 ${
                                selectedImageIndex === index
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
                                        <div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                                            Gambar error
                                        </div>
                                    `;
                                }}
                            />
                        </Button>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
                    <div className="relative w-full h-full flex items-center justify-center p-4">
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 text-white hover:bg-white/20"
                            onClick={closeLightbox}
                        >
                            <X className="h-6 w-6" />
                        </Button>

                        {/* Lightbox Image */}
                        <div className="max-w-4xl max-h-full">
                            <img
                                src={images[lightboxIndex]}
                                alt={`${product.name} - Lightbox ${lightboxIndex + 1}`}
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Lightbox Navigation */}
                        {images.length > 1 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                    onClick={handleLightboxPrevious}
                                >
                                    <ChevronLeft className="h-8 w-8" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                                    onClick={handleLightboxNext}
                                >
                                    <ChevronRight className="h-8 w-8" />
                                </Button>
                            </>
                        )}

                        {/* Lightbox Counter */}
                        {images.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-2 rounded-full text-sm">
                                {lightboxIndex + 1} / {images.length}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductImageGallery;