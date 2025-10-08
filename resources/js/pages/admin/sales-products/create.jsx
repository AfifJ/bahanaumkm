import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductSelector } from '@/components/product-selector';
import { SalesSelector } from '@/components/sales-selector';
import AdminLayout from '@/layouts/admin-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function SalesProductCreate({ salesUsers, products }) {
    const [selectedProducts, setSelectedProducts] = useState({});

    const { data, setData, post, processing, errors } = useForm({
        sale_id: '',
        assignments: [
            {
                product_id: '',
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
    };

    const updateAssignment = (index, field, value) => {
        const newAssignments = [...data.assignments];
        newAssignments[index][field] = value;
        setData('assignments', newAssignments);
    };

    const handleProductSelect = (index, product) => {
        // Update form data
        updateAssignment(index, 'product_id', product.id.toString());

        // Update selected products state
        setSelectedProducts(prev => ({
            ...prev,
            [index]: product
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.sales-products.store'));
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
                                            />
                                            {errors[`assignments.${index}.product_id`] && (
                                                <p className="text-sm text-red-600">
                                                    {errors[`assignments.${index}.product_id`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Jumlah *</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Masukkan jumlah"
                                                    value={assignment.quantity}
                                                    onChange={(e) => updateAssignment(index, 'quantity', e.target.value)}
                                                />
                                                {errors[`assignments.${index}.quantity`] && (
                                                    <p className="text-sm text-red-600">
                                                        {errors[`assignments.${index}.quantity`]}
                                                    </p>
                                                )}
                                            </div>

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