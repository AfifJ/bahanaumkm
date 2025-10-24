import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';

export default function Carousel({ carousels = [], autoPlay = true, interval = 5000 }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const intervalRef = useRef(null);

    // Auto-play functionality
    useEffect(() => {
        if (carousels.length <= 1) return;

        if (autoPlay && !isPaused) {
            intervalRef.current = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % carousels.length);
            }, interval);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoPlay, isPaused, interval, carousels.length]);

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? carousels.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % carousels.length);
    };

    const handleMouseEnter = () => {
        setIsPaused(true);
    };

    const handleMouseLeave = () => {
        setIsPaused(false);
    };

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                goToPrevious();
            } else if (e.key === 'ArrowRight') {
                goToNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [carousels.length]);

    if (carousels.length === 0) {
        return (
            <section className="pb-2">
                <div className="container mx-auto px-4">
                    <div className="aspect-[4/1] overflow-hidden rounded-md bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Tidak ada carousel tersedia</span>
                    </div>
                </div>
            </section>
        );
    }

    if (carousels.length === 1) {
        const carousel = carousels[0];
        const content = carousel.link_url ? (
            <Link href={carousel.link_url} className="block w-full h-full">
                <img
                    src={carousel.image_url}
                    alt={carousel.title || 'Carousel'}
                    className="w-full h-full object-cover"
                />
            </Link>
        ) : (
            <img
                src={carousel.image_url}
                alt={carousel.title || 'Carousel'}
                className="w-full h-full object-cover"
            />
        );

        return (
            <section className="pb-2">
                <div className="container mx-auto px-4">
                    <div className="aspect-[4/1] overflow-hidden rounded-md">
                        {content}
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="pb-2">
            <div className="container mx-auto px-4">
                <div
                    className="relative aspect-[4/1] overflow-hidden rounded-md group"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Carousel Images */}
                    <div className="relative h-full">
                        {carousels.map((carousel, index) => {
                            const content = carousel.link_url ? (
                                <Link
                                    key={carousel.id}
                                    href={carousel.link_url}
                                    className={`absolute inset-0 transition-opacity duration-500 ${
                                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                                >
                                    <img
                                        src={carousel.image_url}
                                        alt={carousel.title || `Carousel ${index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading={index === 0 ? 'eager' : 'lazy'}
                                    />
                                </Link>
                            ) : (
                                <img
                                    key={carousel.id}
                                    src={carousel.image_url}
                                    alt={carousel.title || `Carousel ${index + 1}`}
                                    className={`absolute inset-0 transition-opacity duration-500 w-full h-full object-cover ${
                                        index === currentIndex ? 'opacity-100' : 'opacity-0'
                                    }`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />
                            );

                            return content;
                        })}
                    </div>

                    {/* Navigation Buttons */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    {/* Dots Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {carousels.map((_, index) => (
                            <Button
                                key={index}
                                variant="ghost"
                                onClick={() => goToSlide(index)}
                                className={`h-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white p-0 ${
                                    index === currentIndex
                                        ? 'w-8 bg-white'
                                        : 'w-2 bg-white/50 hover:bg-white/75'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                                aria-current={index === currentIndex ? 'true' : 'false'}
                            />
                        ))}
                    </div>

                    {/* Auto-play indicator */}
                    {autoPlay && (
                        <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs">
                            {isPaused ? 'Paused' : 'Playing'}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
