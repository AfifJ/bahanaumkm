import { Head, usePage, router } from '@inertiajs/react';
import SalesLayout from '@/layouts/sales-layout';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductSelector } from '@/components/product-selector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function NewTransaction({ products = [] }) {
  const { flash } = usePage().props;
  const [items, setItems] = useState([
    { id: 1, productId: '', quantity: 1, price: 0, subtotal: 0 }
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    setTotalAmount(total);
    console.log('products');
    console.log(products);
  }, [items]);

  useEffect(() => {
    if (flash?.error) {
      setSubmitError(flash.error);
      setTimeout(() => setSubmitError(''), 5000);
    }
    if (flash?.success) {
      setSubmitError('');
    }
  }, [flash]);

  const handleProductChange = (index, product) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: product ? product.id.toString() : '',
      productName: product ? product.name : '',
      price: product ? product.sell_price : 0,
      subtotal: product ? product.sell_price * newItems[index].quantity : 0
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index, quantity) => {
    const qty = parseInt(quantity) || 0;
    const newItems = [...items];
    const product = products.find(p => p.id === parseInt(newItems[index].productId));

    if (product && qty > product.stock) {
      setSubmitError(`Stok tidak mencukupi untuk ${product.name}. Stok tersedia: ${product.stock}`);
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    newItems[index] = {
      ...newItems[index],
      quantity: qty,
      subtotal: product ? product.sell_price * qty : 0
    };
    setItems(newItems);
    setSubmitError('');
  };

  const handleIncrement = (index) => {
    const newItems = [...items];
    const currentQuantity = newItems[index].quantity || 1;
    const product = products.find(p => p.id === parseInt(newItems[index].productId));

    if (product && currentQuantity >= product.stock) {
      setSubmitError(`Stok tidak mencukupi untuk ${product.name}. Stok tersedia: ${product.stock}`);
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    newItems[index] = {
      ...newItems[index],
      quantity: currentQuantity + 1,
      subtotal: newItems[index].price * (currentQuantity + 1)
    };
    setItems(newItems);
    setSubmitError('');
  };

  const handleDecrement = (index) => {
    const newItems = [...items];
    const currentQuantity = newItems[index].quantity || 2;
    if (currentQuantity > 1) {
      newItems[index] = {
        ...newItems[index],
        quantity: currentQuantity - 1,
        subtotal: newItems[index].price * (currentQuantity - 1)
      };
      setItems(newItems);
      setSubmitError('');
    }
  };

  const addItem = () => {
    const newId = Math.max(...items.map(item => item.id), 0) + 1;
    setItems([...items, { id: newId, productId: '', quantity: 1, price: 0, subtotal: 0 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    const hasEmptyProducts = items.some(item => !item.productId || item.productId === '' || item.productId === null);
    if (hasEmptyProducts) {
      setSubmitError('Harap pilih produk untuk semua item');
      return;
    }

    const invalidItem = items.find(item => {
      if (item.quantity <= 0) return true;
      const product = products.find(p => p.id === parseInt(item.productId));
      if (product && item.quantity > product.stock) return true;
      return false;
    });

    if (invalidItem) {
      const product = products.find(p => p.id === parseInt(invalidItem.productId));
      if (invalidItem.quantity <= 0) {
        setSubmitError('Jumlah produk harus lebih dari 0');
      } else if (product) {
        setSubmitError(`Stok tidak mencukupi untuk ${product.name}. Stok tersedia: ${product.stock}`);
      }
      return;
    }

    if (totalAmount <= 0) {
      setSubmitError('Total transaksi harus lebih dari 0');
      return;
    }

    const transactionData = {
      items: items.map(item => ({
        productId: item.productId ? parseInt(item.productId) : null,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal
      })),
      totalAmount
    };

    setProcessing(true);

    router.post(route('sales.transactions.store'), transactionData, {
      onError: () => {
        setSubmitError('Terjadi kesalahan saat menyimpan transaksi. Silakan coba lagi.');
        setProcessing(false);
      },
      onSuccess: () => {
        setItems([{ id: 1, productId: '', quantity: 1, price: 0, subtotal: 0 }]);
        setTotalAmount(0);
        setSubmitError('');
        setProcessing(false);
      },
      onFinish: () => {
        setProcessing(false);
      }
    });
  };

  return (
    <SalesLayout withBottomNav={false} backLink="/sales/transactions" title="Tambah Transaksi">
      <Head title="Tambah Transaksi Baru" />

      <div className="p-4">
        {flash?.success && (
          <Alert className="mb-4 border-green-200 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{flash.success}</AlertDescription>
          </Alert>
        )}

        {submitError && (
          <Alert className="mb-4 border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Produk</h2>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="md:col-span-5">
                    <Label htmlFor={`product-${index}`} className="text-sm font-medium text-gray-700">
                      Nama Produk
                    </Label>
                    <ProductSelector
                      products={products}
                      onSelect={(product) => handleProductChange(index, product)}
                      selectedProduct={products.find(p => p.id === parseInt(item.productId))}
                    />
                  </div>

                  <div className="md:col-span-3">
                    <Label htmlFor={`quantity-${index}`} className="text-sm font-medium text-gray-700">
                      Jumlah
                    </Label>
                    <div className="mt-1 flex items-center space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDecrement(index)}
                        disabled={item.quantity <= 1}
                        className="h-10 w-10 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        id={`quantity-${index}`}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-20 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="1"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleIncrement(index)}
                        disabled={item.productId && (() => {
                          const product = products.find(p => p.id === parseInt(item.productId));
                          return product ? item.quantity >= product.stock : false;
                        })()}
                        className="h-10 w-10 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Harga Satuan
                    </Label>
                    <div className="mt-1 p-2 rounded text-sm">
                      {formatCurrency(item.price)}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Subtotal
                    </Label>
                    <div className="mt-1 p-2 bg-white border border-gray-300 rounded-md text-sm font-semibold text-green-600">
                      {formatCurrency(item.subtotal || 0)}
                    </div>
                    {item.productId && (() => {
                      const product = products.find(p => p.id === parseInt(item.productId));
                      if (product && item.quantity > 0) {
                        const remainingStock = product.stock - item.quantity;
                        if (remainingStock <= 0) {
                          return (
                            <div className="mt-1 text-xs text-red-600 font-medium">
                              Stok habis!
                            </div>
                          );
                        } else if (remainingStock <= 5) {
                          return (
                            <div className="mt-1 text-xs text-orange-600 font-medium">
                              Sisa stok: {remainingStock}
                            </div>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              <Button type="button" onClick={addItem} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah Produk
              </Button>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total Transaksi</h3>
                <p className="text-sm text-gray-600">Total harga dari semua produk</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalAmount || 0)}
                </div>
                <div className="text-sm text-gray-500">
                  {items.length} produk
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={processing || items.some(item => !item.productId) || totalAmount <= 0}
            >
              {processing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Menyimpan...
                </>
              ) : (
                'Simpan Transaksi'
              )}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            {items.some(item => !item.productId) && (
              <p className="text-orange-600">Silakan pilih produk untuk semua item</p>
            )}
            {totalAmount <= 0 && items.every(item => item.productId) && (
              <p className="text-orange-600">Total transaksi harus lebih dari 0</p>
            )}
            {processing && (
              <p className="text-blue-600">Sedang memproses transaksi...</p>
            )}
          </div>
        </form>
      </div>
    </SalesLayout>
  );
}