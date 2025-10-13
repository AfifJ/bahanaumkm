import { useState, useEffect } from 'react';
import { route } from 'ziggy-js';

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
            const response = await fetch(route('buyer.cart.api.add'), {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add to cart');
            }

            const data = await response.json();

            // Update cart count from response
            if (data.cart?.item_count !== undefined) {
                setCartCount(data.cart.item_count);
            }

            return data;
        } catch (error) {
            console.error('Failed to add to cart:', error);
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