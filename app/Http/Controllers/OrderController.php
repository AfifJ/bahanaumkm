<?php

namespace App\Http\Controllers;

use App\Models\MitraProfile;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ShippingSetting;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $orders = Order::with(['items.product', 'mitra'])
            ->where('buyer_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('orders/index', [
            'orders' => $orders,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $productId = $request->input('product_id');
        $quantity = $request->input('quantity');

        $product = Product::find($productId);

        $mitra = MitraProfile::get();

        $shippingSetting = ShippingSetting::first();

        return Inertia::render('orders/create', [
            'product' => $product,
            'quantity' => $quantity,
            'mitra' => $mitra,
            'shippingSetting' => $shippingSetting
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'mitra_id' => 'required',
        ]);

        try {
            DB::beginTransaction();

            // Validate stock and calculate total
            $totalAmount = 0;
            $items = [];
            foreach ($request->items as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);

                if ($product->stock < $itemData['quantity']) {
                    throw new Exception("Stok produk {$product->name} tidak mencukupi. Stok tersedia: {$product->stock}");
                }

                $unitPrice = $product->sell_price;
                $itemTotal = $unitPrice * $itemData['quantity'];
                $totalAmount += $itemTotal;

                $items[] = [
                    'product_id' => $product->id,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                ];

                $product->decrement('stock', $itemData['quantity']);
            }

            // Calculate shipping cost
            $shippingCost = 0;
            
            if ($request->mitra_id) {
                $mitraProfile = MitraProfile::find($request->mitra_id);
                $shippingSetting = ShippingSetting::first();
                
                if ($mitraProfile && $shippingSetting && $mitraProfile->distance_from_warehouse > 0) {
                    // Convert meters to KM and calculate shipping cost
                    $distanceInKm = $mitraProfile->distance_from_warehouse / 1000;
                    $shippingCost = $distanceInKm * $shippingSetting->price_per_km;
                }
            }

            $mitraCommission = $totalAmount * 0.25;

            // Create order
            $order = Order::create([
                'buyer_id' => Auth::id(),
                'mitra_id' => $request->mitra_id,
                'total_amount' => $totalAmount + $shippingCost,
                'partner_commission' => $mitraCommission,
                'status' => 'pending',
            ]);

            // Create order items
            foreach ($items as $item) {
                $order->items()->create($item);
            }

            DB::commit();

            // Return JSON response for API calls
            if (request()->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Pesanan berhasil dibuat. Silakan lakukan pembayaran.',
                    'order_id' => $order->id,
                    'order' => $order
                ]);
            }

            return redirect()->route('buyer.orders.show', $order->id)
                ->with('success', 'Pesanan berhasil dibuat. Silakan lakukan pembayaran.');

        } catch (Exception $e) {
            DB::rollBack();
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Order $order)
    {
        // Ensure the order belongs to the authenticated buyer
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        $order->load(['items.product', 'mitra']);

        return Inertia::render('orders/show', [
            'order' => $order,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Order $order)
    {
        // Ensure the order belongs to the authenticated buyer
        if ($order->buyer_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'status' => 'sometimes|in:cancelled,paid',
        ]);

        // Handle payment update
        if ($request->status === 'paid' && $order->status === 'pending') {
            $updated = $order->update(['status' => 'paid']);
            return back()->with('success', 'Pembayaran berhasil diproses');
        }

        // Handle cancellation
        if ($request->status === 'cancelled' && $order->status === 'pending') {
            // Load items with products to ensure relationships exist
            $order->load('items.product');

            foreach ($order->items as $item) {
                if ($item->product) {
                    $item->product->increment('stock', $item->quantity);
                } else {
                    \Log::warning('Product not found for order item', [
                        'order_id' => $order->id,
                        'item_id' => $item->id,
                        'product_id' => $item->product_id
                    ]);
                }
            }

            $order->update(['status' => 'cancelled']);
            // DB::commit();
            return back()->with('success', 'Pesanan berhasil dibatalkan');
        }

        return back()->with('error', 'Tidak dapat mengubah status pesanan');
    }

    /**
     * Get cart items for current user (if any)
     */
    public function getCart()
    {
        // This would typically come from session or database cart
        // For now, return empty array
        return response()->json([]);
    }

    /**
     * Add item to cart
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $product = Product::findOrFail($request->product_id);

        // Check stock availability
        if ($product->stock < $request->quantity) {
            return response()->json([
                'error' => "Stok produk {$product->name} tidak mencukupi. Stok tersedia: {$product->stock}"
            ], 422);
        }

        // In a real implementation, this would add to session cart or database cart
        // For now, return success
        return response()->json([
            'message' => 'Produk berhasil ditambahkan ke keranjang',
            'product' => $product->only(['id', 'name', 'sell_price', 'image_url']),
            'quantity' => $request->quantity
        ]);
    }
}
