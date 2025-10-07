"use client"

import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"

export function ProductSelector({ products = [], onSelect, selectedProduct }) {
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState("")
    const dropdownRef = useRef(null)
    const searchInputRef = useRef(null)

    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchValue.toLowerCase())
    )

    const handleProductSelect = (product) => {
        if (onSelect) {
            onSelect(product);
        }
        setOpen(false);
        setSearchValue("");
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
                setSearchValue("");
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [open]);

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Product Display Button */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex gap-2 py-3 px-4 items-center w-full text-left bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
                <div className="flex-1 text-left">
                    {selectedProduct ? (
                        <div className="flex items-center gap-3">
                            {selectedProduct.image_url ? (
                                <img
                                    src={selectedProduct.image_url}
                                    alt={selectedProduct.name}
                                    className="w-8 h-8 rounded object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">📦</span>
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900 truncate">
                                    {selectedProduct.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Stok: {selectedProduct.stock} • {formatPrice(selectedProduct.sell_price)}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-gray-500">Pilih produk...</span>
                    )}
                </div>
                <ChevronDown className={cn("w-4 transition-transform", open ? "rotate-180" : "")} />
            </button>

            {/* Dropdown Menu */}
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
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
                            />
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="max-h-60 overflow-auto">
                        {filteredProducts.length === 0 ? (
                            <div className="p-4 text-sm text-gray-500 text-center">
                                Produk tidak ditemukan.
                            </div>
                        ) : (
                            <div className="py-1">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                                            selectedProduct?.id === product.id ? "bg-blue-50 border-l-2 border-blue-500" : ""
                                        }`}
                                        onClick={() => handleProductSelect(product)}
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            {/* Product Image */}
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gray-500 text-xs">📦</span>
                                                </div>
                                            )}
                                            
                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-gray-900 truncate">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    <div className="flex items-center gap-2">
                                                        <span>Stok: {product.stock}</span>
                                                        <span>•</span>
                                                        <span className="font-semibold text-green-600">
                                                            {formatPrice(product.sell_price)}
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
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
