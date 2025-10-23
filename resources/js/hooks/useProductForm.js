import { useState, useCallback, useMemo } from 'react';

const formatPrice = (value) => {
    if (!value) return '';
    const intValue = Math.floor(Number(value));
    return intValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parsePrice = (value) => {
    if (!value) return 0;
    return parseInt(value.toString().replace(/\./g, ''), 10);
};

export function useProductForm(initialData = {}) {
    const [formData, setFormData] = useState({
        // Basic Info
        name: '',
        description: '',
        category_id: null,
        vendor_id: null,
        status: 'active',

        // Images
        images: [],
        imagePreviews: [],

        // Pricing
        buy_price: 0,
        sell_price: 0,
        stock: 0,

        // Variations
        has_variations: false,
        variation_settings: {
            differentPrices: true,
            useImages: false
        },
        global_prices: {
            buy_price: 0,
            sell_price: 0
        },
        skus: [],

        // UI State
        activeStep: 0,
        isVariationMode: false,
        showVariationWizard: false,

        ...initialData
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    }, [errors]);

    const updateNestedField = useCallback((parent, field, value) => {
        setFormData(prev => {
            const parentValue = prev[parent];
            if (typeof parentValue === 'object' && parentValue !== null) {
                return {
                    ...prev,
                    [parent]: {
                        ...parentValue,
                        [field]: value
                    }
                };
            }
            return prev;
        });
    }, []);

    const addImage = useCallback((file) => {
        const preview = {
            id: Date.now(),
            url: URL.createObjectURL(file),
            is_primary: formData.imagePreviews.length === 0,
            file: file,
            sort_order: formData.imagePreviews.length
        };

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, file],
            imagePreviews: [...prev.imagePreviews, preview]
        }));
    }, [formData.imagePreviews.length]);

    const removeImage = useCallback((imageId) => {
        setFormData(prev => {
            const updatedPreviews = prev.imagePreviews.filter(img => img.id !== imageId);

            // If removed image was primary, set first remaining as primary
            if (prev.imagePreviews.find(img => img.id === imageId)?.is_primary && updatedPreviews.length > 0) {
                updatedPreviews[0].is_primary = true;
            }

            return {
                ...prev,
                imagePreviews: updatedPreviews,
                images: updatedPreviews.filter(img => img.file).map(img => img.file)
            };
        });
    }, []);

    const setPrimaryImage = useCallback((imageId) => {
        setFormData(prev => ({
            ...prev,
            imagePreviews: prev.imagePreviews.map(img => ({
                ...img,
                is_primary: img.id === imageId
            }))
        }));
    }, []);

    const setStep = useCallback((step) => {
        setFormData(prev => ({ ...prev, activeStep: step }));
    }, []);

    const nextStep = useCallback(() => {
        setFormData(prev => ({ ...prev, activeStep: prev.activeStep + 1 }));
    }, []);

    const prevStep = useCallback(() => {
        setFormData(prev => ({ ...prev, activeStep: Math.max(0, prev.activeStep - 1) }));
    }, []);

    const toggleVariationMode = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            isVariationMode: !prev.isVariationMode,
            has_variations: !prev.isVariationMode,
            showVariationWizard: !prev.isVariationMode && prev.skus.length === 0
        }));
    }, []);

    const addVariant = useCallback((variantData) => {
        const newVariant = {
            id: Date.now(),
            name: '',
            price: 0,
            buy_price: 0,
            stock: 0,
            image_preview: null,
            image_file: null,
            sku_code: `SKU-${Date.now()}`,
            ...variantData
        };

        setFormData(prev => ({
            ...prev,
            skus: [...prev.skus, newVariant]
        }));
    }, []);

    const updateVariant = useCallback((variantId, field, value) => {
        setFormData(prev => ({
            ...prev,
            skus: prev.skus.map(variant =>
                variant.id === variantId
                    ? { ...variant, [field]: value }
                    : variant
            )
        }));
    }, []);

    const removeVariant = useCallback((variantId) => {
        setFormData(prev => ({
            ...prev,
            skus: prev.skus.filter(variant => variant.id !== variantId)
        }));
    }, []);

    // Validation
    const validateStep = useCallback((step) => {
        const newErrors = {};

        switch (step) {
            case 0: // Basic Info
                if (!formData.name?.trim()) {
                    newErrors.name = 'Nama produk wajib diisi';
                }
                if (!formData.category_id) {
                    newErrors.category_id = 'Kategori wajib dipilih';
                }
                if (formData.imagePreviews.length === 0) {
                    newErrors.images = 'Produk harus memiliki minimal satu gambar';
                }
                break;

            case 1: // Pricing & Stock
                if (!formData.isVariationMode) {
                    if (!formData.buy_price || formData.buy_price <= 0) {
                        newErrors.buy_price = 'Harga beli harus diisi dan lebih dari 0';
                    }
                    if (!formData.sell_price || formData.sell_price <= 0) {
                        newErrors.sell_price = 'Harga jual harus diisi dan lebih dari 0';
                    }
                    if (formData.stock < 0) {
                        newErrors.stock = 'Stok tidak boleh negatif';
                    }
                } else {
                    if (formData.skus.length === 0) {
                        newErrors.variations = 'Produk dengan varian harus memiliki minimal satu varian';
                    } else {
                        // Validate all variants
                        const invalidVariants = formData.skus.filter(sku =>
                            !sku.name?.trim() || sku.price < 0 || sku.stock < 0 || sku.buy_price < 0
                        );

                        if (invalidVariants.length > 0) {
                            newErrors.variations = 'Semua varian harus memiliki nama, harga, dan stok yang valid';
                        }
                    }
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Computed values
    const totalStock = useMemo(() => {
        if (!formData.isVariationMode) {
            return formData.stock || 0;
        }
        return formData.skus.reduce((total, sku) => total + (sku.stock || 0), 0);
    }, [formData.isVariationMode, formData.stock, formData.skus]);

    const priceRange = useMemo(() => {
        if (!formData.isVariationMode) {
            return {
                min: formData.sell_price || 0,
                max: formData.sell_price || 0
            };
        }

        const prices = formData.skus.map(sku => sku.price || 0).filter(price => price > 0);
        if (prices.length === 0) {
            return { min: 0, max: 0 };
        }

        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }, [formData.isVariationMode, formData.sell_price, formData.skus]);

    const isFormValid = useMemo(() => {
        return Object.keys(errors).length === 0 &&
               formData.name?.trim() &&
               formData.category_id &&
               formData.imagePreviews.length > 0;
    }, [errors, formData]);

    return {
        // Form data
        formData,
        setFormData,

        // Field updates
        updateField,
        updateNestedField,

        // Image management
        addImage,
        removeImage,
        setPrimaryImage,

        // Step management
        activeStep: formData.activeStep,
        setStep,
        nextStep,
        prevStep,

        // Variation management
        isVariationMode: formData.isVariationMode,
        showVariationWizard: formData.showVariationWizard,
        toggleVariationMode,
        addVariant,
        updateVariant,
        removeVariant,

        // Validation
        errors,
        touched,
        validateStep,
        isFormValid,

        // Computed values
        totalStock,
        priceRange,

        // Utilities
        formatPrice,
        parsePrice
    };
}