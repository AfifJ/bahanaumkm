import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import VendorLayout from '@/layouts/vendor-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

export default function Edit({ product, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        name: product.name,
        description: product.description,
        category_id: product.category_id,
        buy_price: product.buy_price,
        sell_price: product.sell_price,
        stock: product.stock,
        status: product.status,
        image: null,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('vendor.products.update', product.id));
    };

    return (
        <VendorLayout
            title="Edit Produk"
            breadcrumbs={[
                {
                    title: 'Produk',
                    href: route('vendor.products.index'),
                },
                {
                    title: 'Edit Produk',
                    href: route('vendor.products.edit', product.id),
                },
            ]}
        >
            <Head title="Edit Produk" />
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex items-center mb-6">
                        <Link href={route('vendor.products.index')}>
                            <Button variant="outline" className="mr-4">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <h2 className="text-2xl font-bold">Edit Produk</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Nama Produk</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama produk"
                                        className="mt-1"
                                    />
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="category_id">Kategori</Label>
                                    <Select value={data.category_id} onValueChange={(value) => setData('category_id', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category_id && <p className="text-sm text-red-500 mt-1">{errors.category_id}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="buy_price">Harga Beli</Label>
                                    <Input
                                        id="buy_price"
                                        type="number"
                                        value={data.buy_price}
                                        onChange={(e) => setData('buy_price', e.target.value)}
                                        placeholder="0"
                                        className="mt-1"
                                    />
                                    {errors.buy_price && <p className="text-sm text-red-500 mt-1">{errors.buy_price}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="sell_price">Harga Jual</Label>
                                    <Input
                                        id="sell_price"
                                        type="number"
                                        value={data.sell_price}
                                        onChange={(e) => setData('sell_price', e.target.value)}
                                        placeholder="0"
                                        className="mt-1"
                                    />
                                    {errors.sell_price && <p className="text-sm text-red-500 mt-1">{errors.sell_price}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="stock">Stok</Label>
                                    <Input
                                        id="stock"
                                        type="number"
                                        value={data.stock}
                                        onChange={(e) => setData('stock', e.target.value)}
                                        placeholder="0"
                                        className="mt-1"
                                    />
                                    {errors.stock && <p className="text-sm text-red-500 mt-1">{errors.stock}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Pilih status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Aktif</SelectItem>
                                            <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-red-500 mt-1">{errors.status}</p>}
                                </div>

                                <div>
                                    <Label htmlFor="image">Gambar Produk</Label>
                                    <Input
                                        id="image"
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData('image', e.target.files[0])}
                                        className="mt-1"
                                    />
                                    {errors.image && <p className="text-sm text-red-500 mt-1">{errors.image}</p>}
                                    {product.image_url && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500 mb-1">Gambar saat ini:</p>
                                            <img src={product.image_url} alt={product.name} className="h-20 w-20 object-contain border rounded" />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="description">Deskripsi</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Masukkan deskripsi produk"
                                        rows={4}
                                        className="mt-1"
                                    />
                                    {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end space-x-4">
                            <Link href={route('vendor.products.index')}>
                                <Button type="button" variant="outline">
                                    Batal
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </VendorLayout>
    );
}
