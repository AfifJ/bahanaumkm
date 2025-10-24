import { Head, usePage, router } from '@inertiajs/react';
import SalesLayout from '@/layouts/sales-layout';
import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SalesProductSelector } from '@/components/sales-product-selector';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trash2, Plus, Minus, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    { id: 0, productId: '', skuId: null, quantity: 1, price: 0, subtotal: 0 }
  ]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState({});

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
    const price = product ? (product.has_variations ? 0 : product.sell_price) : 0;

    newItems[index] = {
      ...newItems[index],
      productId: product ? product.id.toString() : '',
      productName: product ? product.name : '',
      skuId: null, // Reset SKU when product changes
      price: price,
      subtotal: price * newItems[index].quantity
    };
    setItems(newItems);

    // Update selectedProducts state to keep ProductSelector in sync
    setSelectedProducts(prev => ({
      ...prev,
      [index]: product
    }));
  };

  const handleSkuChange = (index, skuId) => {
    const newItems = [...items];
    const product = products.find(p => p.id === parseInt(newItems[index].productId));

    if (product && skuId) {
      const selectedSku = product.skus?.find(sku => sku.id === skuId);
      if (selectedSku) {
        newItems[index] = {
          ...newItems[index],
          skuId: skuId,
          price: selectedSku.price,
          subtotal: selectedSku.price * newItems[index].quantity
        };
      }
    } else {
      // Reset to base price if no SKU selected
      const basePrice = product ? product.sell_price : 0;
      newItems[index] = {
        ...newItems[index],
        skuId: null,
        price: basePrice,
        subtotal: basePrice * newItems[index].quantity
      };
    }

    setItems(newItems);
    setSubmitError('');

    // Ensure selectedProducts state remains in sync
    if (product) {
      setSelectedProducts(prev => ({
        ...prev,
        [index]: product
      }));
    }
  };

  const handleQuantityChange = (index, quantity) => {
    const qty = parseInt(quantity) || 0;
    const newItems = [...items];
    const product = products.find(p => p.id === parseInt(newItems[index].productId));

    // Get available stock based on SKU selection
    let availableStock = 0;
    if (product) {
      if (newItems[index].skuId) {
        const selectedSku = product.skus?.find(sku => sku.id === newItems[index].skuId);
        availableStock = selectedSku ? selectedSku.stock : 0;
      } else {
        availableStock = product.stock;
      }
    }

    if (product && qty > availableStock) {
      const itemName = newItems[index].skuId ?
        product.skus?.find(sku => sku.id === newItems[index].skuId)?.variation_summary || product.name :
        product.name;
      setSubmitError(`Stok tidak mencukupi untuk ${itemName}. Stok tersedia: ${availableStock}`);
      setTimeout(() => setSubmitError(''), 3000);
      return;
    }

    newItems[index] = {
      ...newItems[index],
      quantity: qty,
      subtotal: newItems[index].price * qty
    };
    setItems(newItems);
    setSubmitError('');
  };

  const handleIncrement = (index) => {
    const newItems = [...items];
    const currentQuantity = newItems[index].quantity || 1;
    const product = products.find(p => p.id === parseInt(newItems[index].productId));

    // Get available stock based on SKU selection
    let availableStock = 0;
    if (product) {
      if (newItems[index].skuId) {
        const selectedSku = product.skus?.find(sku => sku.id === newItems[index].skuId);
        availableStock = selectedSku ? selectedSku.stock : 0;
      } else {
        availableStock = product.stock;
      }
    }

    if (product && currentQuantity >= availableStock) {
      const itemName = newItems[index].skuId ?
        product.skus?.find(sku => sku.id === newItems[index].skuId)?.variation_summary || product.name :
        product.name;
      setSubmitError(`Stok tidak mencukupi untuk ${itemName}. Stok tersedia: ${availableStock}`);
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
    const newIndex = items.length;
    setItems([...items, { id: newId, productId: '', skuId: null, quantity: 1, price: 0, subtotal: 0 }]);

    // Initialize selectedProducts for the new item
    setSelectedProducts(prev => ({
      ...prev,
      [newIndex]: null
    }));
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);

      // Cleanup selectedProducts state
      setSelectedProducts(prev => {
        const newSelected = { ...prev };
        delete newSelected[index];
        // Reindex to maintain consistency
        const reindexed = {};
        Object.keys(newSelected).forEach((key, i) => {
          reindexed[i] = newSelected[key];
        });
        return reindexed;
      });
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

    // Check for items with variations but no SKU selected
    const itemWithoutSku = items.find(item => {
      if (!item.productId) return false;
      const product = products.find(p => p.id === parseInt(item.productId));
      return product?.has_variations && !item.skuId;
    });

    if (itemWithoutSku) {
      const product = products.find(p => p.id === parseInt(itemWithoutSku.productId));
      setSubmitError(`Harap pilih variasi untuk produk: ${product?.name}`);
      return;
    }

    const invalidItem = items.find(item => {
      if (item.quantity <= 0) return true;
      const product = products.find(p => p.id === parseInt(item.productId));
      if (!product) return false;

      // Check stock based on SKU selection
      if (item.skuId) {
        const selectedSku = product.skus?.find(sku => sku.id === item.skuId);
        return !selectedSku || item.quantity > selectedSku.stock;
      } else {
        return item.quantity > product.stock;
      }
    });

    if (invalidItem) {
      const product = products.find(p => p.id === parseInt(invalidItem.productId));
      if (invalidItem.quantity <= 0) {
        setSubmitError('Jumlah produk harus lebih dari 0');
      } else if (product) {
        if (invalidItem.skuId) {
          const selectedSku = product.skus?.find(sku => sku.id === invalidItem.skuId);
          setSubmitError(`Stok tidak mencukupi untuk ${selectedSku?.variation_summary}. Stok tersedia: ${selectedSku?.stock || 0}`);
        } else {
          setSubmitError(`Stok tidak mencukupi untuk ${product.name}. Stok tersedia: ${product.stock}`);
        }
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
        skuId: item.skuId || null,
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
        setItems([{ id: 1, productId: '', skuId: null, quantity: 1, price: 0, subtotal: 0 }]);
        setSelectedProducts({});
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
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Header with Product Info */}
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-900">
                          Produk {index + 1}
                        </span>
                        {selectedProducts[index] && (
                          <Badge variant="secondary" className="text-xs">
                            {selectedProducts[index].name}
                          </Badge>
                        )}
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Product Selection Section */}
                  <div className="p-4">
                    <SalesProductSelector
                      products={products}
                      onProductChange={(product) => handleProductChange(index, product)}
                      onSkuChange={(skuId) => handleSkuChange(index, skuId)}
                      selectedProduct={selectedProducts[index]}
                      selectedSkuId={item.skuId}
                    />
                  </div>

                  {/* Quantity and Price Section */}
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                        {/* Quantity Controls - 4 columns */}
                        <div className="md:col-span-4">
                          <Label htmlFor={`quantity-${index}`} className="text-sm font-medium text-gray-700 mb-2 block">
                            Jumlah
                          </Label>
                          <div className="flex items-center space-x-2">
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
                                if (!product) return true;

                                if (item.skuId) {
                                  const selectedSku = product.skus?.find(sku => sku.id === item.skuId);
                                  return selectedSku ? item.quantity >= selectedSku.stock : true;
                                } else {
                                  return item.quantity >= product.stock;
                                }
                              })()}
                              className="h-10 w-10 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Price Information - 4 columns */}
                        <div className="md:col-span-4">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Harga Satuan
                          </Label>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(item.price)}
                          </div>
                          {item.productId && (() => {
                            const product = products.find(p => p.id === parseInt(item.productId));
                            if (product && item.quantity > 0) {
                              let remainingStock = 0;
                              if (item.skuId) {
                                const selectedSku = product.skus?.find(sku => sku.id === item.skuId);
                                remainingStock = selectedSku ? selectedSku.stock - item.quantity : 0;
                              } else {
                                remainingStock = product.stock - item.quantity;
                              }

                              if (remainingStock <= 0) {
                                return (
                                  <div className="text-xs text-red-600 font-medium bg-red-50 px-2 py-1 rounded mt-1">
                                    Stok habis!
                                  </div>
                                );
                              } else if (remainingStock <= 5) {
                                return (
                                  <div className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded mt-1">
                                    Sisa stok: {remainingStock}
                                  </div>
                                );
                              }
                            }
                            return null;
                          })()}
                        </div>

                        {/* Subtotal - 4 columns */}
                        <div className="md:col-span-4 text-right">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Subtotal
                          </Label>
                          <div className="text-xl font-bold text-green-600">
                            {formatCurrency(item.subtotal || 0)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 h-11 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
                Tambah Produk Lain
              </Button>
            </div>
          </div>

          {/* Total Transaction Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Total Transaksi
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {items.length > 0
                    ? `Total dari ${items.length} produk`
                    : 'Belum ada produk yang dipilih'
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(totalAmount || 0)}
                </div>
                {items.length > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    {items.reduce((sum, item) => sum + (item.quantity || 0), 0)} unit
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={processing || items.some(item => !item.productId) || items.some(item => {
                const product = products.find(p => p.id === parseInt(item.productId));
                return product?.has_variations && !item.skuId;
              }) || totalAmount <= 0}
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
            {items.some(item => {
              const product = products.find(p => p.id === parseInt(item.productId));
              return product?.has_variations && !item.skuId;
            }) && (
                <p className="text-orange-600">Silakan pilih variasi untuk produk yang memiliki variasi</p>
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
