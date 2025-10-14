import ProductList from '@/components/product-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { LocationSelector } from '@/components/location-selector';
import Carousel from '@/components/carousel';
import BuyerLayout from '@/layouts/buyer-layout';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeftRight, ChevronDown, HelpCircle, LayoutDashboard, MapPin, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocationStorage } from '@/hooks/use-location-storage';

export default function Home({ carousels, featuredProducts, latestProducts, popularCategories, mitra }) {
    const { selectedLocation, saveLocation } = useLocationStorage();

    const handleLocationSelect = (location) => {
        saveLocation(location);
    };

    return (
        <BuyerLayout>
            <Head title="Beranda - Bahana UMKM" />
            {/* Hero Banner Section */}
            <section className="px-4 py-2">
                <h2 className="text-md font-medium text-gray-900 ">Lokasi Anda</h2>
                <div className='py-1'>
                    <LocationSelector
                        mitra={mitra || []}
                        onSelect={handleLocationSelect}
                        selectedLocation={selectedLocation}
                    />
                </div>
            </section>

            {/* Carousel Section */}
            <Carousel carousels={carousels} />
            {/* {featuredProducts.length > 0 && (
                            <section className="bg-gray-50 py-16">
                                <div className="container mx-auto px-4">
                                    <div className="mb-12 text-center">
                                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Produk Unggulan</h2>
                                        <p className="text-lg text-gray-600">Produk pilihan dengan kualitas terbaik</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                        {featuredProducts.map((product) => (
                                            <Link key={product.id} preserveScroll href={route('product.show', product.slug)}>
                                                <Card className="transition-shadow hover:shadow-lg">
                                                    <CardHeader className="p-0">
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                className="mx-auto h-48 w-48 rounded-lg object-cover"
                                                            />
                                                        ) : (
                                                            <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-lg bg-gray-200">
                                                                <span className="text-gray-500">Gambar Tidak Tersedia</span>
                                                            </div>
                                                        )}
                                                    </CardHeader>
                                                    <CardContent className="p-2">
                                                        <span
                                                            href={route('product.show', product.slug)}
                                                            className="line-clamp-2 text-lg font-semibold text-gray-900"
                                                        >
                                                            {product.name}
                                                        </span>
                                                        <p className="mt-1 text-sm text-gray-600">{product.category?.name}</p>
                                                        <p className="mt-2 text-xl font-bold text-primary">{formatPrice(product.sell_price)}</p>
                                                    </CardContent>
                                                </Card>
                                            </Link>

                                        ))}
                                    </div>
                                </div>
                            </section>
                        )} */}
            {/* Popular Categories Section */}
            <section className="pb-2 pt-2">
                <div className="container mx-auto px-4">
                    <div className='flex justify-between pb-2'>
                        <h2 className="text-md font-medium text-gray-900 ">Kategori
                        </h2>
                        <Link className='text-sm text-primary' href={'/category'}>
                            Lihat Semua
                        </Link>
                    </div>
                    {/* <p className="mb-8 text-gray-600">Jelajahi kategori produk terpopuler</p> */}
                    {popularCategories.length > 0 ? (
                        <div className="flex overflow-auto gap-6">
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
                            <div className="mb-4 text-6xl text-gray-400">🆕</div>
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
                    <h2 className="mb-4 text-3xl font-bold">Siap Berbelanja?</h2>
                    <p className="mb-8 text-xl opacity-90">Jelajahi ribuan produk UMKM berkualitas dengan harga terbaik</p>
                    <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        <Link href={route('category.index')}>Mulai Berbelanja</Link>
                    </Button>
                </div>
            </section> */}
        </BuyerLayout>
    );
}
