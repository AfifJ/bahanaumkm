<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Check if user has selected location
     */
    private function checkLocation()
    {
        if (!Session::has('selected_hotel')) {
            return redirect()->route('home')
                ->with('error', 'Silakan pilih lokasi hotel Anda terlebih dahulu sebelum melanjutkan.');
        }
        return null;
    }

    /**
     * Display cart page with all cart items
     */
    public function index()
    {
        $cartItems = Cart::forUser(Auth::id())
            ->withProduct()
            ->withSku()
            ->orderBy('updated_at', 'desc') // Sort by most recently modified
            ->get()
            ->filter(function ($item) {
                return $item->isValid();
            });

        // Calculate totals
        $subtotal = $cartItems->sum(function ($item) {
            return $item->subtotal;
        });

        // Format cart items for frontend
        $formattedCartItems = $cartItems->map(function ($item) {
            return [
                'id' => $item->id,
                'product' => [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'sell_price' => $item->product->sell_price,
                    'stock' => $item->product->stock,
                    'status' => $item->product->status,
                    'has_variations' => $item->product->has_variations,
                    'primaryImage' => $item->product->primaryImage,
                ],
                'sku' => $item->sku ? [
                    'id' => $item->sku->id,
                    'sku_code' => $item->sku->sku_code,
                    'variant_name' => $item->sku->variant_name,
                    'price' => $item->sku->price,
                    'stock' => $item->sku->stock,
                    'variation_summary' => $item->sku->variation_summary,
                ] : null,
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
                'formatted_subtotal' => $item->getFormattedSubtotal(),
                'variation_summary' => $item->variation_summary,
            ];
        });

        return Inertia::render('buyer/cart/index', [
            'cartItems' => $formattedCartItems,
            'subtotal' => $subtotal,
            'formatted_subtotal' => number_format($subtotal, 0, ',', '.'),
            'itemCount' => $cartItems->sum('quantity'),
        ]);
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, Cart $cart)
    {
        // Ensure cart item belongs to authenticated user
        if ($cart->user_id !== Auth::id()) {
            return back()->with('error', 'Aksi tidak diizinkan');
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $success = $cart->updateQuantity($request->quantity);

        if (!$success) {
            return back()->with('error', 'Stok tidak mencukupi atau produk tidak tersedia');
        }

        return back()->with('success', 'Jumlah berhasil diperbarui');
    }

    /**
     * Remove item from cart
     */
    public function destroy(Cart $cart)
    {
        // Ensure cart item belongs to authenticated user
        if ($cart->user_id !== Auth::id()) {
            return back()->with('error', 'Aksi tidak diizinkan');
        }

        $cart->delete();

        return back()->with('success', 'Produk berhasil dihapus dari keranjang');
    }

    /**
     * Clear all cart items
     */
    public function clear()
    {
        Cart::forUser(Auth::id())->delete();

        return back()->with('success', 'Keranjang berhasil dikosongkan');
    }

    /**
     * Checkout cart items (create order)
     */
    public function checkout()
    {
        // Check if user has selected location
        $locationCheck = $this->checkLocation();
        if ($locationCheck) {
            return $locationCheck;
        }

        $cartItems = Cart::forUser(Auth::id())
            ->withProduct()
            ->withSku()
            ->orderBy('updated_at', 'desc') // Sort by most recently modified
            ->get()
            ->filter(function ($item) {
                return $item->isValid();
            });

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Keranjang Anda kosong');
        }

        // Validate stock for all items
        foreach ($cartItems as $item) {
            $product = $item->product;
            $availableStock = $item->sku ? $item->sku->stock : $product->stock;
            
            if ($availableStock < $item->quantity) {
                $productName = $product->name;
                $variant = $item->sku ? " ({$item->sku->variant_name})" : '';
                
                return back()->with('error', "Stok tidak mencukupi untuk {$productName}{$variant}. Stok tersedia: {$availableStock}");
            }
        }

        // Prepare checkout data
        $checkoutData = $cartItems->map(function ($item) {
            return [
                'cart_id' => $item->id,
                'product_id' => $item->product_id,
                'sku_id' => $item->sku_id,
                'quantity' => $item->quantity,
                'price' => $item->sku ? $item->sku->price : $item->product->sell_price,
            ];
        });

        // Calculate subtotal
        $subtotal = $checkoutData->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });

        // Store in session
        session()->put('checkout_cart_items', $checkoutData->toArray());
        session()->put('checkout_cart_ids', $checkoutData->pluck('cart_id')->toArray());
        session()->put('checkout_subtotal', $subtotal);

        return redirect()->route('buyer.orders.create', ['from_cart' => 1]);
    }
}