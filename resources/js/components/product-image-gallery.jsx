import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

const ProductImageGallery = ({ product, selectedSku, onSkuChange }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const isMobile = useIsMobile();

    // Use refs to store functions
    const findSkuByImageRef = useRef();
    const findImageIndexBySkuRef = useRef();

    // Find SKU by image URL
    const findSkuByImage = (imageUrl) => {
        if (!product.has_variations || !product.skus || !Array.isArray(product.skus)) {
            return null;
        }

        return product.skus.find(sku => {
            if (!sku.image) return false;
            const skuImageUrl = sku.image.startsWith('http') ? sku.image : '/storage/' + sku.image;
            return skuImageUrl === imageUrl;
        });
    };

    // Find image index by SKU
    const findImageIndexBySku = (sku, imagesArray) => {
        if (!sku || !sku.image) return -1;

        const skuImageUrl = sku.image.startsWith('http') ? sku.image : '/storage/' + sku.image;
        return imagesArray.findIndex(url => url === skuImageUrl);
    };

    
    // Store functions in refs to prevent infinite loops
    findSkuByImageRef.current = findSkuByImage;
    findImageIndexBySkuRef.current = findImageIndexBySku;

    // Get all images with new logic: primary image, then non-primary product images, then variation images
    const getAllImages = () => {
        const images = [];
        const uniqueUrls = new Set(); // To avoid duplicates

        // 1. Always start with product primary image/thumbnail
        // Try images from relationship first (new system)
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // Find primary image or use first image as thumbnail
            const primaryImage = product.images.find(img => img.is_primary) || product.images[0];
            if (primaryImage && primaryImage.url) {
                if (!uniqueUrls.has(primaryImage.url)) {
                    images.push(primaryImage.url);
                    uniqueUrls.add(primaryImage.url);
                }
            }
        }

        // If no images from relationship, try primaryImage (new system fallback)
        if (images.length === 0 && product.primary_image?.url) {
            if (!uniqueUrls.has(product.primary_image.url)) {
                images.push(product.primary_image.url);
                uniqueUrls.add(product.primary_image.url);
            }
        }

  
        // 2. Add remaining product images (non-primary) in sort_order
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            // Sort by sort_order first, then by id
            const sortedImages = [...product.images]
                .filter(img => img && img.url && !img.is_primary)
                .sort((a, b) => {
                    if (a.sort_order !== b.sort_order) {
                        return (a.sort_order || 0) - (b.sort_order || 0);
                    }
                    return (a.id || 0) - (b.id || 0);
                });

            sortedImages.forEach(img => {
                if (!uniqueUrls.has(img.url)) {
                    images.push(img.url);
                    uniqueUrls.add(img.url);
                }
            });
        }

        // 3. Add variation images (SKU images) if product has variations
        if (product.has_variations && product.skus && Array.isArray(product.skus)) {
            product.skus.forEach(sku => {
                if (sku.image) {
                    // SKU images are stored as full URLs or paths
                    const skuImageUrl = sku.image.startsWith('http')
                        ? sku.image
                        : '/storage/' + sku.image;

                    // Only add if not already in the list (avoid duplicates)
                    if (!uniqueUrls.has(skuImageUrl)) {
                        images.push(skuImageUrl);
                        uniqueUrls.add(skuImageUrl);
                    }
                }
            });
        }

        return images;
    };

    const images = getAllImages();

    // Initialize to first image on component mount
    useEffect(() => {
        // Always start with first image (index 0)
        setSelectedImageIndex(0);
    }, []); // Empty dependency - run only once

    // Sync selectedImageIndex with selectedSku
    useEffect(() => {
        if (selectedSku && selectedSku.image) {
            // Find the image index for this SKU
            const skuImageUrl = selectedSku.image.startsWith('http')
                ? selectedSku.image
                : '/storage/' + selectedSku.image;
            
            const imageIndex = images.findIndex(url => url === skuImageUrl);
            
            if (imageIndex !== -1) {
                setSelectedImageIndex(imageIndex);
            }
        }
    }, [selectedSku]); // Run when selectedSku changes

    
    // Get variation info for current image
    const getCurrentVariationInfo = () => {
        if (!product.has_variations || !product.skus || !Array.isArray(product.skus)) {
            return null;
        }

        const currentImageUrl = images[selectedImageIndex];

        // Find SKU that matches current image
        const matchingSku = product.skus.find(sku => {
            if (!sku.image) return false;
            const skuImageUrl = sku.image.startsWith('http') ? sku.image : '/storage/' + sku.image;
            return skuImageUrl === currentImageUrl;
        });

        return matchingSku ? matchingSku.variant_name : null;
    };

    // Get variation info for lightbox image
    const getLightboxVariationInfo = (index) => {
        if (!product.has_variations || !product.skus || !Array.isArray(product.skus)) {
            return null;
        }

        const currentImageUrl = images[index];

        // Find SKU that matches current image
        const matchingSku = product.skus.find(sku => {
            if (!sku.image) return false;
            const skuImageUrl = sku.image.startsWith('http') ? sku.image : '/storage/' + sku.image;
            return skuImageUrl === currentImageUrl;
        });

        return matchingSku ? matchingSku.variant_name : null;
    };

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
        
        // Find if this image belongs to a SKU and update selectedSku
        const imageUrl = images[index];
        const matchingSku = findSkuByImage(imageUrl);
        
        if (matchingSku && onSkuChange) {
            onSkuChange(matchingSku);
        }
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

                {/* Variation Info */}
                {getCurrentVariationInfo() && (
                    <Badge
                        variant="secondary"
                        className="absolute top-2 left-2 bg-white/90 text-gray-800 border border-gray-200 shadow-sm"
                    >
                        {getCurrentVariationInfo()}
                    </Badge>
                )}

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
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((image, index) => (
                        <div key={index} className="relative flex-shrink-0">
                            <Button
                                variant="ghost"
                                onClick={() => handleThumbnailClick(index)}
                                className={`w-16 h-16 rounded-md overflow-hidden border-2 transition-all p-0 ${selectedImageIndex === index
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
                        </div>
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
                                <div className="max-w-full max-h-full relative">
                                    <img
                                        src={images[lightboxIndex]}
                                        alt={`${product.name} - Lightbox ${lightboxIndex + 1}`}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    />
                                    {/* Variation Info in Lightbox */}
                                    {getLightboxVariationInfo(lightboxIndex) && (
                                        <Badge
                                            variant="secondary"
                                            className="absolute top-2 left-2 bg-white/90 text-gray-800 border border-gray-200 shadow-sm"
                                        >
                                            {getLightboxVariationInfo(lightboxIndex)}
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Right Side - Thumbnail List */}
                            {images.length > 1 && (
                                <div className="w-24 bg-white border-l border-gray-200 p-3 overflow-y-auto">
                                    <div className="space-y-2">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <Button
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
                                                {/* Badge for selected lightbox image - no check icon */}
                                                {lightboxIndex === index && (
                                                    <Badge
                                                        variant="default"
                                                        className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center bg-blue-500 border-white border-2 shadow-sm"
                                                    />
                                                )}
                                            </div>
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
                                <div className="max-w-full max-h-[60vh] relative">
                                    <img
                                        src={images[lightboxIndex]}
                                        alt={`${product.name} - Lightbox ${lightboxIndex + 1}`}
                                        className="max-w-full max-h-[60vh] object-contain"
                                    />
                                    {/* Variation Info in Mobile Lightbox */}
                                    {getLightboxVariationInfo(lightboxIndex) && (
                                        <Badge
                                            variant="secondary"
                                            className="absolute top-2 left-2 bg-white/90 text-gray-800 border border-gray-200 shadow-sm"
                                        >
                                            {getLightboxVariationInfo(lightboxIndex)}
                                        </Badge>
                                    )}
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
                                            <div key={index} className="relative flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setLightboxIndex(index);
                                                    }}
                                                    className={`w-16 h-16 bg-gray-100 rounded-md overflow-hidden border-2 transition-all p-0 ${lightboxIndex === index
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
                                                {/* Badge for selected mobile lightbox image - no check icon */}
                                                {lightboxIndex === index && (
                                                    <Badge
                                                        variant="default"
                                                        className="absolute top-1 right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-400 border-white border-2 shadow-sm"
                                                    />
                                                )}
                                            </div>
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
