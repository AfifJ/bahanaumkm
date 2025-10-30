import ProductList from '@/components/product-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { LocationSelector } from '@/components/location-selector';
import { LocationDialog } from '@/components/location-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import BuyerLayout from '@/layouts/buyer-layout';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import { MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocationStorage } from '@/hooks/use-location-storage';
import Autoplay from 'embla-carousel-autoplay';
import { cn } from '@/lib/utils';

export default function Home({ carousels, featuredProducts, latestProducts, popularCategories, mitra, selectedHotel, showLocationDialog }) {
    const { selectedLocation, saveLocation } = useLocationStorage();
    const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
    const [carouselApi, setCarouselApi] = useState();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    // Use hotel from session (server) if available, otherwise use localStorage
    // Session data always takes priority over localStorage
    const effectiveLocation = selectedHotel || selectedLocation;

    // Sync localStorage with session data when session changes
    useEffect(() => {
        if (selectedHotel && JSON.stringify(selectedHotel) !== JSON.stringify(selectedLocation)) {
            // Update localStorage to match session data
            saveLocation(selectedHotel);
        }
    }, [selectedHotel]);

    const handleLocationSelect = (location) => {
        saveLocation(location);
    };

    const handleDialogLocationSelect = (location, dontShowAgain) => {
        router.post(route('location.select'), {
            location_id: location.id,
            dont_show_again: dontShowAgain
        }, {
            onSuccess: (page) => {
                saveLocation(location);
                // Show toast with location info
                toast.success('Lokasi berhasil diperbarui', {
                    description: `Hotel ${location.hotel_name} telah disimpan sebagai lokasi Anda`
                });
            },
            onError: (errors) => {
                toast.error('Gagal memperbarui lokasi', {
                    description: 'Terjadi kesalahan saat menyimpan lokasi Anda'
                });
            },
            preserveScroll: true
        });
    };
    // Carousel API handler
    useEffect(() => {
        if (!carouselApi) {
            return;
        }

        setCount(carouselApi.scrollSnapList().length);
        setCurrent(carouselApi.selectedScrollSnap() + 1);

        carouselApi.on("select", () => {
            setCurrent(carouselApi.selectedScrollSnap() + 1);
        });
    }, [carouselApi]);

    useEffect(() => {
        if (showLocationDialog && !effectiveLocation) {
            setIsLocationDialogOpen(true);
        }
    }, [showLocationDialog, effectiveLocation]);

    return (
        <BuyerLayout>
            <Head title="Beranda" />
            {/* Hero Banner Section */}
            <section className="px-4 py-2">
                <div className='container md:px-4 mx-auto '>
                    <h2 className="text-md font-medium text-gray-900 ">Lokasi Anda</h2>
                    <div className='py-1'>
                        <LocationSelector
                            mitra={mitra || []}
                            onSelect={handleLocationSelect}
                            selectedLocation={effectiveLocation}
                        />
                    </div>
                </div>
            </section>
            {carousels && carousels.length > 0 && (
                <section className="pb-4">
                    <div className="container mx-auto px-4">
                        <Carousel
                            setApi={setCarouselApi}
                            plugins={[
                                Autoplay({
                                    delay: 5000,
                                }),
                            ]}
                            className="w-full group"
                            onMouseEnter={() => {
                                const autoplay = carouselApi?.plugins()?.autoplay;
                                if (autoplay) autoplay.stop();
                            }}
                            onMouseLeave={() => {
                                const autoplay = carouselApi?.plugins()?.autoplay;
                                if (autoplay) autoplay.play();
                            }}
                        >
                            <CarouselContent>
                                {carousels.map((carousel) => (
                                    <CarouselItem key={carousel.id}>
                                        <div className="relative aspect-[4/1] overflow-hidden rounded-md">
                                            {carousel.link_url ? (
                                                <Link
                                                    href={carousel.link_url}
                                                    className="block w-full h-full"
                                                >
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
                                            )}
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-60 disabled:opacity-0 disabled:group-hover:opacity-60 transition-opacity" />
                            <CarouselNext className="right-4 opacity-0 group-hover:opacity-60 disabled:opacity-0 disabled:group-hover:opacity-60 transition-opacity" />
                        </Carousel>

                        {/* Pagination dots */}
                        <div className="mt-1 flex items-center justify-center gap-2">
                            {Array.from({ length: count }).map((_, index) => (
                                <Button
                                    key={index}
                                    onClick={() => carouselApi?.scrollTo(index)}
                                    className={cn("p-0 h-full rounded-full transition-all", {
                                        "border-primary bg-primary": current === index + 1,
                                        "bg-gray-200 hover:border-gray-400 hover:bg-gray-200": current !== index + 1,
                                    })}
                                    aria-label={`Go to slide ${index + 1}`}
                                >
                                    <div className='w-2 h-2'></div>
                                </Button>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            <section className="pb-2 pt-2">
                <div className="container mx-auto px-4">
                    <div className='flex justify-between pb-2'>
                        <h2 className="text-md font-medium text-gray-900 ">Kategori
                        </h2>
                        <Link className='text-sm text-primary' href={route('category.index')}>
                            Lihat Semua
                        </Link>
                    </div>
                    {/* <p className="mb-8 text-gray-600">Jelajahi kategori produk terpopuler</p> */}
                    {popularCategories.length > 0 ? (
                        <div className="flex overflow-auto gap-6 justify-center">
                            {popularCategories.map((category) => (
                                <Link preserveScroll key={category.id} href={route('category.show', category.slug)} className='hover:cursor-pointer'>
                                    <div className="group flex flex-col items-center rounded-lg">
                                        <div className="mb-3 flex p-1 rounded-full h-14 w-14 items-center justify-center">
                                            {category.image ? (
                                                <img src={`/storage/${category.image}`} alt={category.name} className="h-10 w-10 fill-green-200 rounded object-contain" />
                                            ) : (
                                                <span className="text-2xl text-blue-500">📦</span>
                                            )}
                                        </div>
                                        <h3 className="text-center line-clamp-2 h-8 text-xs font-light text-gray-900 group-hover:text-primary">{category.name}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>

                    ) : (
                        <p className="text-gray-600">Belum ada kategori tersedia</p>
                    )}
                </div>
            </section>

            <section className="py-4">
                <div className="container mx-auto px-4">
                    <div className="mb-4">
                        <h2 className="mb-4 text-md font-medium text-gray-900">Produk Terbaru</h2>
                    </div>

                    {latestProducts.length > 0 ? (
                        <ProductList productList={latestProducts} />
                    ) : (
                        <div className="py-12 text-center">
                            <h3 className="mb-2 text-lg font-medium text-gray-900">Belum ada produk</h3>
                            <p className="text-gray-600">Produk akan ditampilkan di sini</p>
                        </div>
                    )}

                    <div className="mt-12 text-center">
                        <Button asChild size="lg">
                            <Link href={route('category.index')}>Lihat Semua Produk</Link>
                        </Button>
                    </div>
                </div>
            </section>
            {/* Call to Action Section */}
            {/* <section className="bg-blue-600 py-16 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-2xl font-bold">Siap Berbelanja?</h2>
                    <p className="mb-8 text-xl opacity-90">Jelajahi ribuan produk UMKM berkualitas dengan harga terbaik</p>
                    <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        <Link href={route('category.index')}>Mulai Berbelanja</Link>
                    </Button>
                </div>
            </section> */}

            {/* Location Dialog */}
            <LocationDialog
                isOpen={isLocationDialogOpen}
                onClose={() => setIsLocationDialogOpen(false)}
                mitra={mitra}
                onSelectLocation={handleDialogLocationSelect}
            />
        </BuyerLayout>
    );
}
