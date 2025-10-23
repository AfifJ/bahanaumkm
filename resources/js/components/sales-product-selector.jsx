import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export function SalesProductSelector({
  products = [],
  onProductChange,
  onSkuChange,
  selectedProduct = null,
  selectedSkuId = null,
  disabled = false
}) {
  const [selectedProductId, setSelectedProductId] = useState(selectedProduct?.id?.toString() || '');
  const [selectedSku, setSelectedSku] = useState(selectedSkuId);

  const handleProductSelect = (productId) => {
    setSelectedProductId(productId);
    setSelectedSku(null); // Reset SKU when product changes

    const product = products.find(p => p.id.toString() === productId);
    onProductChange(product);

    // Auto-select first available SKU if product has variations
    if (product && product.has_variations && product.skus && product.skus.length > 0) {
      const firstAvailableSku = product.skus[0];
      setSelectedSku(firstAvailableSku.id);
      onSkuChange(firstAvailableSku.id);
    }
  };

  const handleSkuSelect = (skuId) => {
    setSelectedSku(skuId);
    onSkuChange(skuId ? parseInt(skuId) : null);
  };

  const getCurrentProduct = () => {
    return products.find(p => p.id.toString() === selectedProductId);
  };

  const getCurrentSku = () => {
    const product = getCurrentProduct();
    if (!product || !product.has_variations) return null;
    return product.skus?.find(sku => sku.id === parseInt(selectedSku));
  };

  const getCurrentStock = () => {
    const product = getCurrentProduct();
    if (!product) return 0;

    if (product.has_variations) {
      const sku = getCurrentSku();
      return Math.min(sku?.stock || 0, product.stock || 0);
    }

    return product.stock || 0;
  };

  
  const currentProduct = getCurrentProduct();
  const currentStock = getCurrentStock();

  return (
    <div className="space-y-4">
      {/* Product Selection */}
      <div>
        <Label htmlFor="product-select" className="text-sm font-medium text-gray-700 mb-2 block">
          Pilih Produk
        </Label>
        <Select
          value={selectedProductId}
          onValueChange={handleProductSelect}
          disabled={disabled}
        >
          <SelectTrigger id="product-select" className="h-11">
            <SelectValue placeholder="Pilih produk..." />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1 truncate">{product.name}</span>
                  <Badge variant="outline" className="ml-2 text-xs shrink-0">
                    Stok: {product.stock}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Product Selected Info */}
      {currentProduct && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {currentProduct.name}
            </span>
          </div>
          {currentProduct.category && (
            <div className="text-xs text-blue-700 mt-1">
              Kategori: {currentProduct.category.name}
            </div>
          )}
        </div>
      )}

      {/* SKU Selection for Products with Variations */}
      {currentProduct && currentProduct.has_variations && (
        <div className="space-y-2">
          <Label htmlFor="sku-select" className="text-sm font-medium text-gray-700 block">
            Pilih Variasi
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Select
            value={selectedSku?.toString() || ''}
            onValueChange={handleSkuSelect}
            disabled={disabled}
          >
            <SelectTrigger id="sku-select" className="h-11">
              <SelectValue placeholder="Pilih variasi..." />
            </SelectTrigger>
            <SelectContent>
              {currentProduct.skus?.map((sku) => (
                <SelectItem
                  key={sku.id}
                  value={sku.id.toString()}
                  disabled={sku.stock <= 0}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-1">
                      <div className="font-medium">{sku.variant_name || sku.sku_code}</div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(sku.price)} • Stok: {sku.stock}
                      </div>
                    </div>
                    {sku.stock <= 0 && (
                      <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Stock Warning */}
      {currentProduct && currentStock <= 3 && currentStock > 0 && (
        <div className="flex items-center gap-2 text-xs p-2 rounded bg-orange-50 text-orange-700 border border-orange-200">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>Sisa stok: {currentStock}</span>
        </div>
      )}

      {/* Out of Stock Warning */}
      {currentProduct && currentStock === 0 && (
        <div className="flex items-center gap-2 text-xs p-2 rounded bg-red-50 text-red-700 border border-red-200">
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span>Stok habis</span>
        </div>
      )}
    </div>
  );
}