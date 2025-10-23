"use client"

import { Check, ChevronDown, Search, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState, useEffect, useRef, useMemo, useCallback } from "react"

// Cache untuk Intl.NumberFormat agar tidak dibuat ulang setiap render
const priceFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
});

export function ProductSelector({ products = [], onSelect, selectedProduct, selectedSkus = {}, onSkuQuantityChange }) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const [debouncedSearchValue, setDebouncedSearchValue] = useState("")
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)
    const debounceTimeoutRef = useRef(null)
    const [userInputValues, setUserInputValues] = useState({}) // Store user's last input values

    // Debounced search untuk performa lebih baik
    useEffect(() => {
        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current)
        }

        debounceTimeoutRef.current = setTimeout(() => {
            setDebouncedSearchValue(searchValue)
        }, 300)

        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current)
            }
        }
    }, [searchValue])

    // Memoized filtered products untuk mencegah unnecessary re-renders
    const filteredProducts = useMemo(() => {
        if (!debouncedSearchValue) return products

        const searchTerm = debouncedSearchValue.toLowerCase()
        return products.filter((product) =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category?.name?.toLowerCase().includes(searchTerm)
        )
    }, [products, debouncedSearchValue])

    // Memoized formatPrice function
    const formatPrice = useCallback((price) => {
        return priceFormatter.format(price);
    }, [])

    // Optimized event handlers dengan useCallback
    const handleProductSelect = useCallback((product) => {
        if (onSelect) {
            onSelect(product);
        }
        setOpen(false);
        setSearchValue("");
        setDebouncedSearchValue("");
    }, [onSelect]);

    // Optimized click outside handler
    const handleClickOutside = useCallback((event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false);
            setSearchValue("");
            setDebouncedSearchValue("");
        }
    }, []);

    // Close dropdown when clicking outside dengan optimized cleanup
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [handleClickOutside]);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);

    // Keyboard navigation support
    const handleKeyDown = useCallback((e) => {
        if (!open) return;

        if (e.key === 'Escape') {
            e.preventDefault();
            setOpen(false);
            setSearchValue("");
            setDebouncedSearchValue("");
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();

            const focusableElements = dropdownRef.current?.querySelectorAll(
                '[role="option"], button'
            ) || [];

            const currentIndex = Array.from(focusableElements).findIndex(
                el => el === document.activeElement
            );

            let nextIndex;
            if (e.key === 'ArrowDown') {
                nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            } else {
                nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            }

            focusableElements[nextIndex]?.focus();
        }
    }, [open]);

    // Separate component for product image with error handling
    function ProductImage({ src, alt, className }) {
        const [imgError, setImgError] = useState(false);

        if (imgError || !src) {
            return (
                <div className={cn("bg-gray-200 flex items-center justify-center", className)}>
                    <Package className="w-4 h-4 text-gray-400" />
                </div>
            );
        }

        return (
            <img
                src={src}
                alt={alt}
                className={cn("object-cover", className)}
                loading="lazy"
                onError={() => setImgError(true)}
            />
        );
    }

    // Handle SKU checkbox toggle
    const handleSkuToggle = useCallback((sku) => {
        if (onSkuQuantityChange) {
            const currentQty = selectedSkus[sku.id] || 0;
            if (currentQty > 0) {
                // Deselect - set to 0
                onSkuQuantityChange(sku.id, 0);
            } else {
                // Select - use user's last input value or default to 1
                const userInputValue = userInputValues[sku.id] || 1;
                onSkuQuantityChange(sku.id, userInputValue);
            }
        }
    }, [onSkuQuantityChange, selectedSkus, userInputValues]);

    // Handle SKU quantity change
    const handleSkuQuantityChange = useCallback((sku, value) => {
        if (onSkuQuantityChange) {
            // Convert text to integer, handling non-numeric input
            const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
            const qty = numericValue > sku.stock ? sku.stock : Math.max(0, numericValue);

            // Save user's input value
            setUserInputValues(prev => ({
                ...prev,
                [sku.id]: qty
            }));

            // Only update if SKU is currently selected (has quantity > 0)
            if (selectedSkus[sku.id] > 0) {
                onSkuQuantityChange(sku.id, qty);
            }
        }
    }, [onSkuQuantityChange, selectedSkus]);

    // Get selected SKU details (for backward compatibility)
    const selectedSku = useMemo(() => {
        if (!selectedProduct?.has_variations) return null;

        const selectedSkuIds = Object.keys(selectedSkus).filter(id => selectedSkus[id] > 0);
        if (selectedSkuIds.length > 0) {
            return selectedProduct.skus?.find(sku => sku.id === parseInt(selectedSkuIds[0]));
        }
        return null;
    }, [selectedProduct, selectedSkus]);

    return (
        <div className="relative" ref={dropdownRef} onKeyDown={handleKeyDown}>
            {/* Product Display Button */}
            <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(!open)}
                className="flex gap-2 items-center w-full text-left bg-white border-gray-300 hover:bg-gray-50 justify-between h-auto"
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <div className="flex-1 text-left">
                    {selectedProduct ? (
                        <div className="flex items-center gap-3">
                            <ProductImage
                                src={selectedProduct.primary_image?.url}
                                alt={selectedProduct.name}
                                className="w-8 h-8 rounded"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="font-medium text-sm text-gray-900 truncate">
                                        {selectedProduct.name}
                                    </div>
                                    {selectedProduct.has_variations && (
                                        <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                            Variasi
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-gray-500">Pilih produk...</span>
                    )}
                </div>
                <ChevronDown className={cn("w-4 transition-transform", open ? "rotate-180" : "")} />
            </Button>

            {/* Dropdown Menu */}
            {open && (
                <div
                    className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden"
                    role="listbox"
                    aria-label="Daftar produk"
                >
                    {/* Search Bar */}
                    <div className="p-3 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Cari produk..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    {/* Product List dengan optimasi */}
                    <div className="max-h-60 overflow-auto" role="presentation">
                        {filteredProducts.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 text-center">
                                Produk tidak ditemukan.
                            </div>
                        ) : (
                            <div className="py-1" role="presentation">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        role="option"
                                        aria-selected={selectedProduct?.id === product.id}
                                        className={cn(
                                            "px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between outline-none",
                                            selectedProduct?.id === product.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                                        )}
                                        onClick={() => handleProductSelect(product)}
                                        tabIndex={open ? 0 : -1}
                                        data-product-id={product.id}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Product Image */}
                                            <ProductImage
                                                src={product.primary_image?.url}
                                                alt={product.name}
                                                className="w-10 h-10 rounded flex-shrink-0"
                                            />

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="font-medium text-gray-900 truncate">
                                                        {product.name}
                                                    </div>
                                                    {product.has_variations && (
                                                        <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                                                            {product.skus?.length || 0} Variasi
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <span>Stok: {product.stock}</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-green-600">
                                                            {product.has_variations ?
                                                                `${formatPrice(product.min_price || product.sell_price)} - ${formatPrice(product.max_price || product.sell_price)}` :
                                                                formatPrice(product.sell_price)
                                                            }
                                                        </span>
                                                    </div>
                                                    {product.category?.name && (
                                                        <div className="text-gray-400">
                                                            {product.category.name}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkmark */}
                                        <Check
                                            className={cn(
                                                "h-4 w-4 ml-2 flex-shrink-0",
                                                selectedProduct?.id === product.id ? "opacity-100 text-blue-600" : "opacity-0"
                                            )}
                                            aria-hidden="true"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SKU Selection for Products with Variations */}
            {selectedProduct?.has_variations && (
                <div className="mt-2">
                    <Label className="text-sm font-medium text-gray-900 mb-3 block">
                        Pilih Variasi ({selectedProduct.skus?.length || 0} tersedia):
                    </Label>
                    <div className="space-y-3">
                        {selectedProduct.skus?.map((sku) => {
                            const isSelected = (selectedSkus[sku.id] || 0) > 0;
                            const selectedQty = selectedSkus[sku.id] || 0;
                            return (
                                <div
                                    key={sku.id}
                                    className={`border rounded-lg p-3 cursor-pointer transition-all ${isSelected
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        } ${sku.stock <= 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    onClick={() => sku.stock > 0 && handleSkuToggle(sku)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Checkbox */}
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => handleSkuToggle(sku)}
                                            disabled={sku.stock <= 0}
                                            className="w-5 h-5 rounded border-2 text-blue-500 focus:ring-blue-500 disabled:opacity-60"
                                            onClick={(e) => e.stopPropagation()}
                                        />

                                        {/* SKU Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-medium text-gray-900">
                                                    {sku.variant_name || sku.sku_code}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    {sku.stock > 0 && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                            Stok: {sku.stock}
                                                        </span>
                                                    )}
                                                    <span className="text-lg font-bold text-gray-900">
                                                        {formatPrice(sku.price)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Kode SKU: {sku.sku_code}
                                            </div>
                                        </div>

                                        {/* Quantity Input - selalu muncul, nilai sesuai dengan status checkbox */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <Label className="text-sm font-medium text-gray-700">
                                                Jumlah:
                                            </Label>
                                            <Input
                                                type="text"
                                                value={selectedQty > 0 ? selectedQty.toString() : userInputValues[sku.id] ? userInputValues[sku.id].toString() : ''}
                                                onChange={(e) => handleSkuQuantityChange(sku, e.target.value)}
                                                className="w-24 text-sm"
                                                placeholder="0"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <span className="text-xs text-gray-500">
                                                / {sku.stock} stok
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        )}
                    </div>
                </div>
            )}
        </div>

    )
}
