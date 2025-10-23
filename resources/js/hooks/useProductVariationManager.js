import { useState, useCallback, useEffect } from 'react';

export const useProductVariationManager = (initialData = null) => {
    const [skus, setSkus] = useState([]);
    const [isVariationMode, setIsVariationMode] = useState(false);
    const [variationSettings, setVariationSettings] = useState({
        differentPrices: true,     // "Harga Berbeda" - default active
        useImages: false           // "Gunakan Gambar"
    });
    const [globalPrices, setGlobalPrices] = useState({
        buy_price: 0,
        sell_price: 0
    });

    // Initialize with existing data if provided
    useEffect(() => {
        if (initialData) {
            console.log('🔄 INITIALIZING VARIATION MANAGER:', initialData);

            // Map backend data to frontend format
            const mappedSkus = (initialData.skus || []).map(sku => ({
                ...sku,
                // Ensure we have both name and variant_name for compatibility
                name: sku.name || sku.variant_name || '',
                variant_name: sku.variant_name || sku.name || ''
            }));

            setSkus(mappedSkus);
            setIsVariationMode(initialData.has_variations || false);
            setVariationSettings(initialData.variation_settings || {
                differentPrices: true, // Always true - individual prices per variant
                useImages: initialData.use_images ?? false
            });
            setGlobalPrices(initialData.global_prices || {
                buy_price: initialData.buy_price || 0,
                sell_price: initialData.sell_price || 0
            });
        }
    }, [initialData]);

    // NEW: Sync with external data changes (for tab switching persistence)
    useEffect(() => {
        if (initialData && initialData.skus) {
            const mappedSkus = initialData.skus.map(sku => ({
                ...sku,
                name: sku.name || sku.variant_name || '',
                variant_name: sku.variant_name || sku.name || ''
            }));

            // Only update if there are actual changes to prevent infinite loops
            const hasChanges = JSON.stringify(mappedSkus) !== JSON.stringify(skus) ||
                             JSON.stringify(initialData.variation_settings) !== JSON.stringify(variationSettings) ||
                             JSON.stringify(initialData.global_prices) !== JSON.stringify(globalPrices);

            if (hasChanges) {
                console.log('🔄 SYNCING VARIATION MANAGER WITH EXTERNAL DATA:', {
                    hasChanges,
                    skusCount: mappedSkus.length,
                    isVariationMode: initialData.has_variations
                });

                setSkus(mappedSkus);
                setVariationSettings(initialData.variation_settings || {
                    differentPrices: true,
                    useImages: initialData.use_images ?? false
                });
                setGlobalPrices(initialData.global_prices || {
                    buy_price: initialData.buy_price || 0,
                    sell_price: initialData.sell_price || 0
                });
                setIsVariationMode(initialData.has_variations || false);
            }
        }
    }, [initialData?.skus, initialData?.variation_settings, initialData?.global_prices, initialData?.has_variations]);

  

    // Generate unique SKU code
    const generateSKUCode = useCallback(() => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `VAR-${timestamp}-${random}`;
    }, []);

    // Toggle variation mode
    const toggleVariationMode = useCallback(() => {
        console.log('🔄 TOGGLE VARIATION MODE called. Current isVariationMode:', isVariationMode);
        console.log('🔄 Current differentPrices:', variationSettings.differentPrices);

        if (!isVariationMode) {
            // Enabling variation mode
            if (variationSettings.differentPrices) {
                // Harga berbeda ON → buat SKU pertama
                const firstVariant = {
                    id: Date.now(),
                    sku_code: generateSKUCode(),
                    name: '',
                    variant_name: '',
                    price: 0,
                    buy_price: 0,
                    stock: 0,
                    status: 'active',
                    image_preview: null,
                    image_file: null,
                    is_new: true
                };
                console.log('🔄 Creating first variant (different prices ON):', firstVariant);
                setSkus([firstVariant]);
            } else {
                // Harga berbeda OFF → tidak perlu SKU
                console.log('🔄 Different prices OFF - no SKUs needed');
                setSkus([]);
            }
        } else {
            // Disabling variation mode - clear everything
            console.log('🔄 Disabling variation mode - clearing skus');
            setSkus([]);
        }

        const newMode = !isVariationMode;
        console.log('🔄 Setting isVariationMode to:', newMode);
        setIsVariationMode(newMode);
    }, [isVariationMode, generateSKUCode, variationSettings.differentPrices]);

    // Add new variant
    const addVariant = useCallback((variantData) => {
        const name = variantData.name || '';
        console.log('➕ ADDING VARIANT WITH PRICES:', {
            variantData: variantData,
            variantPrice: variantData.price || 0,
            variantBuyPrice: variantData.buy_price || 0
        });

        const newVariant = {
            id: Date.now(),
            sku_code: generateSKUCode(),
            name: name,
            variant_name: name, // Keep both fields in sync
            price: variantData.price || 0,
            buy_price: variantData.buy_price || 0,
            stock: variantData.stock || 0,
            status: 'active',
            image_preview: variantData.image_preview || null,
            image_file: variantData.image_file || null,
            is_new: true
        };

        setSkus(prev => [...prev, newVariant]);
    }, [generateSKUCode]);

    // Update variant
    const updateVariant = useCallback((variantId, field, value) => {
        setSkus(prev => prev.map(variant =>
            variant.id === variantId
                ? { ...variant, [field]: value }
                : variant
        ));
    }, []);

    // Remove variant
    const removeVariant = useCallback((variantId) => {
        setSkus(prev => prev.filter(variant => variant.id !== variantId));
    }, []);

    // Update variation settings
    const updateVariationSettings = useCallback((setting, value) => {
        setVariationSettings(prev => ({ ...prev, [setting]: value }));
    }, []);

    // Update global prices
    const updateGlobalPrices = useCallback((field, value) => {
        setGlobalPrices(prev => ({ ...prev, [field]: value }));
    }, []);

    // Bulk update variants
    const bulkUpdateVariants = useCallback((updates) => {
        setSkus(prev => prev.map(variant => {
            const update = updates.find(u => u.id === variant.id);
            return update ? { ...variant, ...update } : variant;
        }));
    }, []);

    // Get price range for display
    const getPriceRange = useCallback(() => {
        if (skus.length === 0) return { min: 0, max: 0 };

        const activePrices = skus
            .filter(s => s.status === 'active' && s.price > 0)
            .map(s => s.price);

        if (activePrices.length === 0) return { min: 0, max: 0 };

        return {
            min: Math.min(...activePrices),
            max: Math.max(...activePrices)
        };
    }, [skus]);

    // Get total stock
    const getTotalStock = useCallback(() => {
        return skus
            .filter(s => s.status === 'active')
            .reduce((total, variant) => total + (variant.stock || 0), 0);
    }, [skus]);

    // Validate variants
    const validateVariants = useCallback(() => {
        if (!isVariationMode) return true;

        // For validation purposes, allow empty names for auto-created variants
        // But ensure we have at least one variant
        if (skus.length === 0) return false;

        // Check for validation errors (negative prices, stock, etc.)
        const invalidVariants = skus.filter(sku => {
            return sku.price < 0 || sku.buy_price < 0 || sku.stock < 0;
        });

        return invalidVariants.length === 0;
    }, [skus, isVariationMode]);

    // Get formatted data for form submission
    const getFormData = useCallback(() => {
        if (!isVariationMode) {
            return {
                has_variations: false,
                variation_settings: {
                    differentPrices: true,     // Default values for normal products
                    useImages: false
                },
                global_prices: globalPrices,  // Include global prices for consistency
                skus: []
            };
        }

        const formData = {
            has_variations: true,
            variation_settings: {
                ...variationSettings,
                differentPrices: true // Always true - individual prices per variant
            },
            global_prices: globalPrices,
            skus: skus.map(s => ({
                id: s.id,
                sku_code: s.sku_code,
                name: (s.name || '').trim(),
                price: s.price,
                buy_price: s.buy_price,
                stock: s.stock,
                status: s.status,
                variant_name: (s.name || '').trim(), // Use name as variant name
                image_file: s.image_file
            }))
        };

        console.log('📦 GET FORM DATA (VARIATION MANAGER):', {
            hasVariations: formData.has_variations,
            differentPrices: variationSettings.differentPrices,
            globalPrices: formData.global_prices,
            skusCount: formData.skus.length,
            firstSkuPrice: formData.skus[0]?.price,
            firstSkuBuyPrice: formData.skus[0]?.buy_price
        });

        return formData;
    }, [isVariationMode, skus, variationSettings, globalPrices]);

    // Initialize with dummy data for demonstration
    const initializeWithDummyData = useCallback(() => {
        const dummyVariants = [
            {
                id: Date.now(),
                sku_code: `VAR-${Date.now()}-1`,
                name: 'S',
                price: 50000,
                buy_price: 30000,
                stock: 20,
                status: 'active',
                image_preview: null,
                is_new: true
            },
            {
                id: Date.now() + 1,
                sku_code: `VAR-${Date.now()}-2`,
                name: 'M',
                price: 55000,
                buy_price: 35000,
                stock: 15,
                status: 'active',
                image_preview: null,
                is_new: true
            },
            {
                id: Date.now() + 2,
                sku_code: `VAR-${Date.now()}-3`,
                name: 'L',
                price: 60000,
                buy_price: 40000,
                stock: 10,
                status: 'active',
                image_preview: null,
                is_new: true
            }
        ];

        setSkus(dummyVariants);
        setIsVariationMode(true);
    }, []);

    return {
        // State
        skus,
        isVariationMode,
        variationSettings,
        globalPrices,

        // Actions
        toggleVariationMode,
        addVariant,
        updateVariant,
        removeVariant,
        updateVariationSettings,
        updateGlobalPrices,
        bulkUpdateVariants,
        initializeWithDummyData,

        // Computed properties
        priceRange: getPriceRange(),
        totalStock: getTotalStock(),
        isValid: validateVariants(),

        // Helpers
        getFormData,
        generateSKUCode
    };
};