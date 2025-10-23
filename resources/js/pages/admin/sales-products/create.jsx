import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductSelector } from '@/components/product-selector';
import { SalesSelector } from '@/components/sales-selector';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SalesProductCreate({ salesUsers, products }) {
    const { props } = usePage();
    const [selectedProducts, setSelectedProducts] = useState({});
    const [selectedSkus, setSelectedSkus] = useState({});

    const { data, setData, post, processing, errors } = useForm({
        sale_id: '',
        assignments: [
            {
                product_id: '',
                sku_id: '',
                quantity: '',
                borrowed_date: new Date().toISOString().split('T')[0]
            }
        ]
    });

    const addAssignment = () => {
        setData('assignments', [
            ...data.assignments,
            {
                product_id: '',
                sku_id: '',
                quantity: '',
                borrowed_date: new Date().toISOString().split('T')[0]
            }
        ]);
    };

    const removeAssignment = (index) => {
        const newAssignments = data.assignments.filter((_, i) => i !== index);
        setData('assignments', newAssignments);

        // Clean up selected products state
        const newSelectedProducts = { ...selectedProducts };
        delete newSelectedProducts[index];

        // Re-index selected products to match new assignments array
        const reindexedSelectedProducts = {};
        Object.keys(newSelectedProducts).forEach(key => {
            const numKey = parseInt(key);
            if (numKey > index) {
                reindexedSelectedProducts[numKey - 1] = newSelectedProducts[numKey];
            } else {
                reindexedSelectedProducts[numKey] = newSelectedProducts[numKey];
            }
        });
        setSelectedProducts(reindexedSelectedProducts);

        // Clean up selected SKUs state
        const newSelectedSkus = { ...selectedSkus };
        delete newSelectedSkus[index];

        // Re-index selected SKUs to match new assignments array
        const reindexedSelectedSkus = {};
        Object.keys(newSelectedSkus).forEach(key => {
            const numKey = parseInt(key);
            if (numKey > index) {
                reindexedSelectedSkus[numKey - 1] = newSelectedSkus[numKey];
            } else {
                reindexedSelectedSkus[numKey] = newSelectedSkus[numKey];
            }
        });
        setSelectedSkus(reindexedSelectedSkus);
    };

    const updateAssignment = (index, field, value) => {
        const newAssignments = [...data.assignments];
        newAssignments[index][field] = value;
        setData('assignments', newAssignments);
    };

    const handleProductSelect = (index, product) => {
        // Update form data
        updateAssignment(index, 'product_id', product.id.toString());

        // Reset SKU in form data when product changes
        updateAssignment(index, 'sku_id', '');

        // Update selected products state
        setSelectedProducts(prev => ({
            ...prev,
            [index]: product
        }));

        // Reset SKU selection when product changes
        if (!product.has_variations) {
            setSelectedSkus(prev => {
                const newSkus = { ...prev };
                delete newSkus[index];
                return newSkus;
            });
        }
    };

    const handleSkuQuantityChange = (index, skuId, quantity) => {
        // Update selected SKUs state with quantities
        setSelectedSkus(prev => ({
            ...prev,
            [index]: {
                ...prev[index],
                [skuId]: quantity
            }
        }));

        // Update form data with SKU ID and quantity
        if (quantity > 0) {
            updateAssignment(index, 'sku_id', skuId.toString());
            // For variation products, update quantity from SKU selection
            updateAssignment(index, 'quantity', quantity.toString());
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Transform data struktur baru
        const products = [];

        data.assignments.forEach((assignment, index) => {
            const product = selectedProducts[index];
            const skus = selectedSkus[index];

            // Jika produk memiliki variasi dan SKU dipilih
            if (product?.has_variations && skus && Object.keys(skus).length > 0) {
                // Buat entry terpisah untuk setiap SKU yang dipilih
                Object.entries(skus).forEach(([skuId, quantity]) => {
                    if (quantity > 0) {
                        products.push({
                            product_id: parseInt(assignment.product_id),
                            product_sku_id: parseInt(skuId),
                            quantity: parseInt(quantity),
                            borrowed_date: assignment.borrowed_date
                        });
                    }
                });
            }
            // Jika produk tanpa variasi
            else if (assignment.product_id && assignment.quantity) {
                products.push({
                    product_id: parseInt(assignment.product_id),
                    quantity: parseInt(assignment.quantity),
                    borrowed_date: assignment.borrowed_date
                });
            }
        });

        const payload = {
            sale_id: data.sale_id,
            products: products
        };

        // Show loading toast
        const toastId = toast.loading('Menugaskan produk...');

        // Gunakan router.post untuk mengirim payload custom
        router.post(route('admin.sales-products.store'), payload, {
            onSuccess: () => {
                toast.success('Produk berhasil ditugaskan kepada sales', { id: toastId });
            },
            onError: (errors) => {
                toast.error('Gagal menugaskan produk. Periksa form kembali.', { id: toastId });
            }
        });
    };

    return (
        <AdminLayout
            breadcrumbs={[
                { title: 'Dashboard', href: route('admin.dashboard') },
                { title: 'Manajemen Produk Sales', href: route('admin.sales-products.index') },
                { title: 'Tugaskan Produk' },
            ]}
        >
            <Head title="Tugaskan Produk ke Sales" />

            <div className="flex-1 space-y-4 p-8">
                {/* Header */}
                <div className="flex items-center">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Tugaskan Produk ke Sales</h2>
                        <p className="text-muted-foreground">Pilih sales dan produk yang akan ditugaskan</p>
                    </div>
                </div>

                {/* Flash Messages */}
                {props.flash?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-green-800">{props.flash.success}</p>
                            </div>
                        </div>
                    </div>
                )}

                {props.flash?.error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <p className="text-sm text-red-800">{props.flash.error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sales Selection */}
                    <SalesSelector
                        salesUsers={salesUsers}
                        value={data.sale_id}
                        onChange={(value) => setData('sale_id', value)}
                        placeholder="Pilih sales"
                        error={errors.sale_id}
                    />

                    {/* Product Assignments */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Produk yang Ditugaskan *</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addAssignment}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Tambah Produk
                            </Button>
                        </div>

                        {data.assignments.map((assignment, index) => (
                            <Card key={index} className="p-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-1 space-y-4">
                                        <div className="space-y-2">
                                            <Label>Produk *</Label>
                                            <ProductSelector
                                                products={products}
                                                onSelect={(product) => handleProductSelect(index, product)}
                                                selectedProduct={selectedProducts[index] || null}
                                                selectedSkus={selectedSkus[index] || {}}
                                                onSkuQuantityChange={(skuId, quantity) => handleSkuQuantityChange(index, skuId, quantity)}
                                            />
                                            {errors[`assignments.${index}.product_id`] && (
                                                <p className="text-sm text-red-600">
                                                    {errors[`assignments.${index}.product_id`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Quantity Input - Only show for products without variations */}
                                            {(!selectedProducts[index] || !selectedProducts[index]?.has_variations) ? (
                                                <div className="space-y-2">
                                                    <Label>Jumlah *</Label>
                                                    <Input
                                                        type="text"
                                                        min="1"
                                                        max={selectedProducts[index]?.stock || undefined}
                                                        placeholder="Masukkan jumlah"
                                                        value={assignment.quantity}
                                                        onChange={(e) => updateAssignment(index, 'quantity', e.target.value.replace(/\D/g, ''))}
                                                    />
                                                    {errors[`assignments.${index}.quantity`] && (
                                                        <p className="text-sm text-red-600">
                                                            {errors[`assignments.${index}.quantity`]}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Stok tersedia: {selectedProducts[index]?.stock || 0} unit
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <Label>Jumlah</Label>
                                                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                                                        <p className="text-sm text-gray-700">
                                                            {selectedSkus[index] && Object.entries(selectedSkus[index]).some(([skuId, qty]) => qty > 0)
                                                                ? `Total: ${Object.entries(selectedSkus[index]).reduce((sum, [skuId, qty]) => sum + qty, 0)} unit`
                                                                : 'Pilih variasi produk untuk menentukan jumlah'
                                                            }
                                                        </p>
                                                    </div>
                                                    {errors[`assignments.${index}.quantity`] && (
                                                        <p className="text-sm text-red-600">
                                                            {errors[`assignments.${index}.quantity`]}
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label>Tanggal Pinjam *</Label>
                                                <Input
                                                    type="date"
                                                    value={assignment.borrowed_date}
                                                    onChange={(e) => updateAssignment(index, 'borrowed_date', e.target.value)}
                                                />
                                                {errors[`assignments.${index}.borrowed_date`] && (
                                                    <p className="text-sm text-red-600">
                                                        {errors[`assignments.${index}.borrowed_date`]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {data.assignments.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => removeAssignment(index)}
                                            className="mt-6"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}

                        {errors.assignments && (
                            <p className="text-sm text-red-600">{errors.assignments}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Tugaskan Produk'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}