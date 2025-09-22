import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import GuestLayout from '@/layouts/guest-layout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Home({ featuredProducts, latestProducts, popularCategories }) {
    const { auth } = usePage().props;

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <GuestLayout>
            <Head title="Beranda - Bahana UMKM" />
            {/* Hero Banner Section */}
            <section className="">
                <div className="container mx-auto px-4">
                    <div className="aspect-[4/1] overflow-hidden rounded-md">
                        <img
                            src="https://www.fastpay.co.id/blog/wp-content/uploads/2017/08/slide-agustus-belanja-online.jpg"
                            alt="Hero Banner"
                            className="w-full object-cover"
                        />
                    </div>
                </div>
            </section>
            {featuredProducts.length > 0 && (
                <section className="bg-gray-50 py-16">
                    <div className="container mx-auto px-4">
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-3xl font-bold text-gray-900">Produk Unggulan</h2>
                            <p className="text-lg text-gray-600">Produk pilihan dengan kualitas terbaik</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {featuredProducts.map((product) => (
                                <Card key={product.id} className="transition-shadow hover:shadow-lg">
                                    <CardHeader className="p-0">
                                        <Link href={route('product.show', product.slug)}>
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
                                        </Link>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <Link
                                            href={route('product.show', product.slug)}
                                            className="line-clamp-2 text-lg font-semibold text-gray-900 hover:text-blue-600"
                                        >
                                            {product.name}
                                        </Link>
                                        <p className="mt-1 text-sm text-gray-600">{product.category?.name}</p>
                                        <p className="mt-2 text-xl font-bold text-green-600">{formatPrice(product.sell_price)}</p>
                                    </CardContent>
                                    <CardFooter className="p-4 pt-0">
                                        <Button asChild className="w-full">
                                            <Link href={route('product.show', product.slug)}>Lihat Detail</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}
            {/* Popular Categories Section */}
            <section className="py-4">
                <div className="container mx-auto px-4">
                    <h2 className="mb-2 text-xl font-bold text-gray-900">Kategori</h2>
                    {/* <p className="mb-8 text-gray-600">Jelajahi kategori produk terpopuler</p> */}
                    {popularCategories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                            {popularCategories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={route('category.show', category.slug)}
                                    className="flex w-fit flex-col items-center justify-center"
                                >
                                    {category.image ? (
                                        <img src={`/storage/${category.image}`} alt={category.name} className="h-12 w-12 rounded object-cover" />
                                    ) : (
                                        <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-200">
                                            <span className="text-gray-400">📦</span>
                                        </div>
                                    )}

                                    <h3 className="text-gray-900">{category.name}</h3>
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
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Produk Terbaru</h2>
                    </div>

                    {latestProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-6 lg:grid-cols-6">
                            {latestProducts.map((product) => (
                                <Card key={product.id} className="rounded-0 gap-0 p-0 shadow-none transition-shadow hover:shadow-lg">
                                    <CardHeader className="p-0">
                                        <Link href={route('product.show', product.slug)}>
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="aspect-square h-48 rounded-t-lg object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-48 w-full items-center justify-center rounded-t-lg bg-gray-200">
                                                    <span className="px-4 text-center text-gray-500">Gambar Tidak Tersedia</span>
                                                </div>
                                            )}
                                        </Link>
                                    </CardHeader>
                                    <CardContent className="p-2">
                                        <Link
                                            href={route('product.show', product.slug)}
                                            className="text-md line-clamp-2 font-semibold text-gray-900 hover:text-blue-600"
                                        >
                                            {product.name}
                                        </Link>
                                        {/* <p className="mt-1 text-sm text-gray-600">{product.category?.name}</p> */}
                                        <p className="mt-2 text-lg font-bold text-black">{formatPrice(product.sell_price)}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
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
            <section className="bg-blue-600 py-16 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="mb-4 text-3xl font-bold">Siap Berbelanja?</h2>
                    <p className="mb-8 text-xl opacity-90">Jelajahi ribuan produk UMKM berkualitas dengan harga terbaik</p>
                    <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                        <Link href={route('category.index')}>Mulai Berbelanja</Link>
                    </Button>
                </div>
            </section>
        </GuestLayout>
    );
}
