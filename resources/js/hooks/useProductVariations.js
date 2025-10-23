import { useState, useEffect, useCallback } from 'react';

export const useProductVariations = (product) => {
    const [selectedSku, setSelectedSku] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [availableSkus, setAvailableSkus] = useState([]);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Initialize SKUs when product changes
    useEffect(() => {
        if (product?.has_variations && product?.skusWithVariations) {
            setAvailableSkus(product.skusWithVariations);
        } else {
            setAvailableSkus([]);
        }
        setSelectedSku(null);
        setSelectedOptions({});
    }, [product]);

    // Handle variation selection
    const handleVariationChange = useCallback((options, sku) => {
        setSelectedOptions(options);
        setSelectedSku(sku);
    }, []);

    // Get current price
    const getCurrentPrice = useCallback(() => {
        if (product?.has_variations) {
            return selectedSku?.price || product?.min_price || product?.sell_price || 0;
        }
        return product?.sell_price || 0;
    }, [product, selectedSku]);

    // Get current stock
    const getCurrentStock = useCallback(() => {
        if (product?.has_variations) {
            return selectedSku?.stock || 0;
        }
        return product?.stock || 0;
    }, [product, selectedSku]);

    // Check if product can be added to cart
    const canAddToCart = useCallback(() => {
        if (product?.has_variations) {
            return selectedSku && selectedSku.stock > 0;
        }
        return (product?.stock || 0) > 0;
    }, [product, selectedSku]);

    // Get variation summary for display
    const getVariationSummary = useCallback(() => {
        if (!product?.has_variations || !selectedSku) {
            return '';
        }
        return selectedSku.variant_name || '';
    }, [product, selectedSku]);

    // Get formatted price range
    const getPriceRange = useCallback(() => {
        if (!product?.has_variations) {
            return product?.sell_price || 0;
        }

        const activeSkus = product.skusWithVariations?.filter(sku => sku.status === 'active') || [];
        if (activeSkus.length === 0) {
            return product?.sell_price || 0;
        }

        const prices = activeSkus.map(sku => sku.price).filter(p => p > 0);
        if (prices.length === 0) {
            return product?.sell_price || 0;
        }

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        return minPrice === maxPrice ? minPrice : { min: minPrice, max: maxPrice };
    }, [product]);

    // Check if product has any available stock
    const hasAvailableStock = useCallback(() => {
        if (!product?.has_variations) {
            return (product?.stock || 0) > 0;
        }

        return availableSkus.some(sku => sku.stock > 0 && sku.status === 'active');
    }, [product, availableSkus]);

    return {
        // State
        selectedSku,
        selectedOptions,
        availableSkus,
        isAddingToCart,
        setIsAddingToCart,

        // Methods
        handleVariationChange,
        getCurrentPrice,
        getCurrentStock,
        canAddToCart,
        getVariationSummary,
        getPriceRange,
        hasAvailableStock,

        // Computed properties
        hasVariations: product?.has_variations || false,
        variations: product?.variationsWithOptions || [],
        skus: product?.skusWithVariations || [],
    };
};