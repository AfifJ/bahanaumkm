import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LoaderCircle } from 'lucide-react';

const formatPrice = (value) => {
    if (!value) return '';
    // Convert to integer to remove decimals, then format with dots
    const intValue = Math.floor(Number(value));
    return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parsePrice = (value) => {
    if (!value) return 0;
    // Remove dots and convert to number (already handles whole numbers)
    return parseInt(value.toString().replace(/\./g, ''), 10);
};

export default function ProductForm({ data, setData, errors, processing, onSubmit, isEdit = false, onCancel }) {
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        setData('image', file ?? null);
    };

    return (
        <form onSubmit={onSubmit} encType="multipart/form-data">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input
                    type="text"
                    name="name"
                    value={data.name}
                    className="mt-1 block w-full"
                    autoComplete="name"
                    autoFocus
                    onChange={(e) => setData('name', e.target.value)}
                    required
                />
                <InputError message={errors.name} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="buy_price">Buy Price</Label>
                <Input
                    type="text"
                    name="buy_price"
                    value={formatPrice(data.buy_price)}
                    className="mt-1 block w-full"
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setData('buy_price', parsePrice(value));
                    }}
                    required
                />
                <InputError message={errors.buy_price} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="sell_price">Sell Price</Label>
                <Input
                    type="text"
                    name="sell_price"
                    value={formatPrice(data.sell_price)}
                    className="mt-1 block w-full"
                    onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setData('sell_price', parsePrice(value));
                    }}
                    required
                />
                <InputError message={errors.sell_price} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="stock">Stock</Label>
                <Input
                    type="number"
                    name="stock"
                    value={data.stock}
                    className="mt-1 block w-full"
                    onChange={(e) => setData('stock', parseInt(e.target.value))}
                    required
                />
                <InputError message={errors.stock} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="description">Description</Label>
                <textarea
                    name="description"
                    value={data.description}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => setData('description', e.target.value)}
                    required
                />
                <InputError message={errors.description} className="mt-2" />
            </div>

            <div className="mt-4">
                <Label htmlFor="image">Product Image</Label>
                <Input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleImageChange}
                    className="mt-1 block w-full"
                />
                <InputError message={errors.image} className="mt-2" />
                {(data.image || data.image_url) && (
                    <div className="mt-2">
                        <img
                            src={data.image ? URL.createObjectURL(data.image) : data.image_url}
                            alt="Preview"
                            className="h-20 w-20 rounded object-cover"
                        />
                    </div>
                )}
            </div>

            <div className="mt-4">
                <Label htmlFor="status">Status</Label>
                <select
                    name="status"
                    value={data.status}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => setData('status', e.target.value)}
                    required
                >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
                <InputError message={errors.status} className="mt-2" />
            </div>

            <div className="mt-4 flex items-center justify-end">
                <Button type="button" variant="ghost" onClick={onCancel} className="mr-4">
                    Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                    {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {isEdit ? 'Update' : 'Create'}
                </Button>
            </div>
        </form>
    );
}
