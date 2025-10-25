<?php

namespace App\Http\Controllers\Buyer;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function show(Order $order)
    {
        // Check if order belongs to authenticated user
        if ($order->buyer_id !== auth()->id()) {
            abort(403);
        }

        // Auto-cleanup conflicting session data for this order
        $this->cleanupConflictingSession($order);

        // Get QRIS image from settings
        $qrisImage = Setting::getValue('qris_image', 'qris/qris-code.png');

        return Inertia::render('buyer/payment/show', [
            'order' => $order->load(['items.product', 'mitra']),
            'qrisImage' => $qrisImage
        ]);
    }

    public function uploadProof(Request $request, Order $order)
    {
        // Check if order belongs to authenticated user
        if ($order->buyer_id !== auth()->id()) {
            abort(403);
        }

        $request->validate([
            'payment_proof' => 'required|image|mimes:jpeg,png,jpg|max:5120'
        ]);

        if ($request->hasFile('payment_proof')) {
            $file = $request->file('payment_proof');
            $filename = $order->order_code . '_' . time() . '.' . $file->getClientOriginalExtension();

            // Store file
            $path = $file->storeAs('payment-proofs', $filename, 'public');

            // Update order
            $order->update([
                'payment_proof' => $path,
                'status' => 'validation'
            ]);

            // ✅ CLEAR CART - Pastikan cart dikosongkan setelah upload bukti pembayaran
            // Ini adalah safety mechanism untuk memastikan cart benar-benar kosong
            $deletedCount = Cart::where('user_id', Auth::id())->delete();
            
            if ($deletedCount > 0) {
                \Log::info('🗑️ Cleared cart after payment proof upload', [
                    'user_id' => Auth::id(),
                    'order_id' => $order->id,
                    'deleted_items' => $deletedCount
                ]);
            }

            return redirect()->route('buyer.orders.show', $order->id)
                ->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu validasi admin.');
        }

        return back()->with('error', 'Gagal mengunggah bukti pembayaran.');
    }

    /**
     * Clean up conflicting session data when accessing payment for existing order
     */
    private function cleanupConflictingSession(Order $order)
    {
        // Check if there's conflicting checkout session data
        $checkoutCartItemIds = session()->get('checkout_cart_ids', []);

        if (!empty($checkoutCartItemIds)) {
            // Check if any cart items in session belong to products in this order
            $orderProductIds = $order->items()->pluck('product_id')->toArray();

            // Clear session if there's potential conflict
            session()->forget(['checkout_cart_items', 'checkout_cart_ids', 'checkout_subtotal']);

            \Log::info('🧹 Cleaned conflicting checkout session', [
                'order_id' => $order->id,
                'user_id' => auth()->id(),
                'cleared_session_data' => true
            ]);
        }
    }
}
