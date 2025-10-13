<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ReviewController extends Controller
{
    /**
     * Store a newly created review in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'order_id' => 'required|exists:orders,id',
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();
        $product = Product::findOrFail($request->product_id);
        $order = Order::findOrFail($request->order_id);

        // Validate user eligibility
        if ($order->buyer_id !== $user->id) {
            return back()->with('error', 'Anda tidak memiliki izin untuk mereview produk ini.');
        }

        // Check if the product exists in this order's items
        $orderItem = $order->items()->where('product_id', $product->id)->first();
        if (!$orderItem) {
            return back()->with('error', 'Produk tidak ditemukan dalam pesanan ini.');
        }

        if ($order->status !== 'delivered') {
            return back()->with('error', 'Anda hanya bisa mereview produk dari pesanan yang sudah selesai.');
        }

        // Check if user already reviewed this product from this order
        $existingReview = Review::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->where('order_id', $order->id)
            ->first();

        if ($existingReview) {
            return back()->with('error', 'Anda sudah pernah mereview produk ini dari pesanan ini.');
        }

        // Create review
        Review::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'order_id' => $order->id,
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        return back()->with('success', 'Review berhasil ditambahkan!');
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, Review $review)
    {
        $this->authorize('update', $review);

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'review' => 'nullable|string|max:1000',
        ]);

        $review->update([
            'rating' => $request->rating,
            'review' => $request->review,
        ]);

        return back()->with('success', 'Review berhasil diperbarui!');
    }

    /**
     * Remove the specified review.
     */
    public function destroy(Review $review)
    {
        // Only admin can delete reviews
        if (Auth::user()->role_id !== 1) {
            return back()->with('error', 'Anda tidak memiliki izin untuk menghapus review.');
        }

        $review->delete();

        return back()->with('success', 'Review berhasil dihapus!');
    }

    /**
     * Get reviews for a product.
     */
    public function index(Request $request, Product $product)
    {
        $reviews = $product->reviews()
            ->with(['user:id,name'])
            ->paginate(10);

        return response()->json($reviews);
    }
}
