<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display cart page with all cart items
     */
    public function index()
    {
        $cartItems = Cart::forUser(Auth::id())
            ->withProduct()
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
                    'sell_price' => $item->product->sell_price,
                    'stock' => $item->product->stock,
                    'status' => $item->product->status,
                    'primaryImage' => $item->product->primaryImage,
                    'image_url' => $item->product->image_url,
                ],
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
                'formatted_subtotal' => $item->getFormattedSubtotal(),
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
        $cartItems = Cart::forUser(Auth::id())
            ->withProduct()
            ->get()
            ->filter(function ($item) {
                return $item->isValid();
            });

        if ($cartItems->isEmpty()) {
            return back()->with('error', 'Keranjang Anda kosong');
        }

        // Check if any items have insufficient stock
        $hasStockIssues = $cartItems->some(function ($item) {
            return $item->product->stock < $item->quantity;
        });

        if ($hasStockIssues) {
            return back()->with('error', 'Beberapa produk dalam keranjang tidak memiliki stok yang cukup');
        }

        // TODO: Implement checkout logic
        // This would redirect to order creation flow
        return redirect()->route('buyer.orders.create')
            ->with('cartItems', $cartItems)
            ->with('subtotal', $cartItems->sum('subtotal'));
    }
}