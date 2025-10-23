import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { router, usePage } from '@inertiajs/react';

export function useCart() {
    const [cartCount, setCartCount] = useState(0);
    const [isCartLoading, setIsCartLoading] = useState(false);
    const page = usePage();

    // Fetch cart count from server
    const fetchCartCount = async () => {
        try {
            setIsCartLoading(true);
            const response = await fetch(route('buyer.cart.api.index'), {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch cart count');
            }

            const data = await response.json();

            // Update cart count from JSON response
            if (data.item_count !== undefined) {
                setCartCount(data.item_count);
            }
        } catch (error) {
            console.error('Failed to fetch cart count:', error);
        } finally {
            setIsCartLoading(false);
        }
    };

    // Initial cart count fetch
    useEffect(() => {
        fetchCartCount();
    }, []);

    // Listen for cart updates via page visits
    useEffect(() => {
        const handleRouteChange = (event) => {
            // Refetch cart count when user navigates to cart-related pages
            if (event.detail.page.url.includes('/cart')) {
                fetchCartCount();
            }
        };

        // Listen for Inertia navigation events
        document.addEventListener('inertia:success', handleRouteChange);

        return () => {
            document.removeEventListener('inertia:success', handleRouteChange);
        };
    }, []);

    // Function to add to cart and update count
    const addToCart = async (productId, quantity = 1, skuId = null) => {
        try {
            // Validate inputs
            if (!productId || quantity < 1) {
                throw new Error('Invalid product or quantity');
            }

            // Check if user is authenticated
            if (!page.props.auth?.user) {
                // Redirect to login page without showing any toast
                router.visit(route('login'));
                return { success: false, redirect: true };
            }

            console.log('🛒 Adding to cart:', { productId, quantity, skuId });

            // Prepare payload
            const payload = {
                product_id: productId,
                quantity: quantity,
            };

            // Add sku_id if provided
            if (skuId) {
                payload.sku_id = skuId;
            }

            // Return a promise that resolves when the operation completes
            return new Promise((resolve, reject) => {
                router.post(route('buyer.cart.api.add'), payload, {
                    preserveScroll: true,
                    onSuccess: (page) => {
                        console.log('✅ Success response from Inertia:', page);

                        // Update cart count from flash data or response
                        if (page.props.flash?.cartCount !== undefined) {
                            console.log('📊 Updating cart count from flash:', page.props.flash.cartCount);
                            setCartCount(page.props.flash.cartCount);
                        } else {
                            console.log('📊 Refetching cart count (no flash data)');
                            // Fallback: refetch cart count
                            fetchCartCount();
                        }
                        
                        resolve({ success: true });
                    },
                    onError: (errors) => {
                        console.error('❌ Backend error:', errors);
                        const errorMessage = errors.error || errors.message || Object.values(errors)[0] || 'Gagal menambahkan ke keranjang';
                        reject(new Error(errorMessage));
                    },
                    onFinish: () => {
                        console.log('✅ Cart add request finished');
                    }
                });
            });

        } catch (error) {
            console.error('❌ Failed to add to cart:', error);

            // Provide more user-friendly error messages
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Koneksi gagal. Periksa koneksi internet Anda.');
            }

            // Re-throw with the original or modified error message
            throw error;
        }
    };

    return {
        cartCount,
        isCartLoading,
        addToCart,
        fetchCartCount,
        setCartCount,
    };
}
