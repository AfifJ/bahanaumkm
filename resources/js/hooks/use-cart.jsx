import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';
import { router } from '@inertiajs/react';

export function useCart() {
    const [cartCount, setCartCount] = useState(0);
    const [isCartLoading, setIsCartLoading] = useState(false);

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
    const addToCart = async (productId, quantity = 1) => {
        try {
            // Validate inputs
            if (!productId || quantity < 1) {
                throw new Error('Invalid product or quantity');
            }

            console.log('🛒 Adding to cart:', { productId, quantity });

            // Use Inertia.js to add to cart (same as wishlist)
            await router.post(route('buyer.cart.api.add'), {
                product_id: productId,
                quantity: quantity,
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    console.log('✅ Success response from Inertia');

                    // Update cart count from flash data or response
                    if (page.props.flash?.cartCount) {
                        setCartCount(page.props.flash.cartCount);
                    } else {
                        // Fallback: refetch cart count
                        fetchCartCount();
                    }
                },
                onError: (errors) => {
                    console.error('❌ Backend error:', errors);
                    const errorMessage = errors.error || errors.message || 'Gagal menambahkan ke keranjang';
                    throw new Error(errorMessage);
                }
            });

            console.log('✅ Cart add completed');
            return { success: true };

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