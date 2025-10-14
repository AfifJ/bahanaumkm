<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\MitraProfile;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
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
            'notes' => 'nullable|string|max:500',
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
                'payment_method' => 'qris',
                'notes' => $request->notes,
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

            return redirect()->route('buyer.payment.show', $order->id)
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

        // Load basic relationships
        $order->load(['items.product', 'mitra']);

        // For delivered orders, check review eligibility and load existing reviews
        if ($order->status === 'delivered') {
            try {
                $orderItemsWithReviewData = [];

                foreach ($order->items as $item) {
                    // Check if user has already reviewed this product from this order
                    $existingReview = Review::where('user_id', Auth::id())
                        ->where('product_id', $item->product_id)
                        ->where('order_id', $order->id)
                        ->with(['user:id,name'])
                        ->first();

                    $orderItemsWithReviewData[] = [
                        'id' => $item->id,
                        'product' => $item->product,
                        'quantity' => $item->quantity,
                        'unit_price' => $item->unit_price,
                        'total_price' => $item->total_price,
                        'can_review' => !$existingReview, // Can review if no existing review
                        'existing_review' => $existingReview,
                    ];
                }

                $order->setRelation('items', collect($orderItemsWithReviewData));
            } catch (\Exception $e) {
                // Log error but don't break the page
                \Log::error('Error loading review data for order ' . $order->id . ': ' . $e->getMessage());

                // Fallback: load items without review data
                $order->load(['items.product']);
            }
        }

        return Inertia::render('orders/show', [
            'order' => $order,
            'canReviewProducts' => $order->status === 'delivered',
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
            'status' => 'sometimes|in:cancelled,paid,validation',
        ]);

        // Handle payment update
        if ($request->status === 'paid' && $order->status === 'pending') {
            $order->update(['status' => 'paid']);
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
     * Get cart items for current user
     */
    public function getCart()
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

        return response()->json([
            'items' => $cartItems,
            'subtotal' => $subtotal,
            'item_count' => $cartItems->count(), // Jumlah unique products, bukan total quantity
        ]);
    }

    /**
     * Add item to cart
     */
    public function addToCart(Request $request)
    {
        // Debug logging
        \Log::info('🛒 Add to cart request:', [
            'product_id' => $request->product_id,
            'quantity' => $request->quantity,
            'user_id' => Auth::id(),
            'user_authenticated' => Auth::check(),
            'buyer_role' => Auth::user() ? Auth::user()->role_id === 5 : 'no'
        ]);

        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        \Log::info('✅ Request validation passed');

        $product = Product::findOrFail($request->product_id);
        \Log::info('📦 Product found:', [
            'id' => $product->id,
            'name' => $product->name,
            'status' => $product->status,
            'stock' => $product->stock,
            'sell_price' => $product->sell_price
        ]);

        // Check product status and stock availability
        if ($product->status !== 'active') {
            \Log::warning('❌ Product not active:', $product->status);
            $errorMessage = 'Produk tidak tersedia';

            if (request()->expectsJson()) {
                return response()->json(['error' => $errorMessage], 422);
            } else {
                return redirect()->back()->with('error', $errorMessage);
            }
        }

        if ($product->stock < $request->quantity) {
            \Log::warning('❌ Insufficient stock:', [
                'requested' => $request->quantity,
                'available' => $product->stock
            ]);
            $errorMessage = "Stok produk {$product->name} tidak mencukupi. Stok tersedia: {$product->stock}";

            if (request()->expectsJson()) {
                return response()->json(['error' => $errorMessage], 422);
            } else {
                return redirect()->back()->with('error', $errorMessage);
            }
        }

        // Check if product already exists in cart
        $existingCartItem = Cart::forUser(Auth::id())
            ->where('product_id', $request->product_id)
            ->first();

        if ($existingCartItem) {
            // Update quantity if product already in cart
            $newQuantity = $existingCartItem->quantity + $request->quantity;

            if ($product->stock < $newQuantity) {
                $errorMessage = "Stok produk tidak mencukupi. Stok tersedia: {$product->stock}";

                if (request()->expectsJson()) {
                    return response()->json(['error' => $errorMessage], 422);
                } else {
                    return redirect()->back()->with('error', $errorMessage);
                }
            }

            $existingCartItem->update(['quantity' => $newQuantity]);
        } else {
            // Add new item to cart
            Cart::create([
                'user_id' => Auth::id(),
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        // Get updated cart
        $updatedCart = $this->getCart();
        $cartData = json_decode($updatedCart->getContent());

        // Handle different response types
        if (request()->expectsJson()) {
            // For API/JSON requests (fallback)
            return response()->json([
                'message' => 'Produk berhasil ditambahkan ke keranjang',
                'cart' => $cartData,
            ]);
        } else {
            // For Inertia.js requests
            return redirect()->back()
                ->with('success', 'Produk berhasil ditambahkan ke keranjang')
                ->with('cartCount', $cartData->item_count);
        }
    }

    /**
     * Update cart item quantity
     */
    public function updateCartItem(Request $request, Cart $cart)
    {
        // Ensure cart item belongs to authenticated user
        if ($cart->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $success = $cart->updateQuantity($request->quantity);

        if (!$success) {
            return response()->json([
                'error' => 'Stok tidak mencukupi atau produk tidak tersedia'
            ], 422);
        }

        // Get updated cart
        $updatedCart = $this->getCart();

        return response()->json([
            'message' => 'Jumlah berhasil diperbarui',
            'cart' => json_decode($updatedCart->getContent()),
        ]);
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart(Cart $cart)
    {
        // Ensure cart item belongs to authenticated user
        if ($cart->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $cart->delete();

        // Get updated cart
        $updatedCart = $this->getCart();

        return response()->json([
            'message' => 'Produk berhasil dihapus dari keranjang',
            'cart' => json_decode($updatedCart->getContent()),
        ]);
    }

    /**
     * Clear all cart items for current user
     */
    public function clearCart()
    {
        Cart::forUser(Auth::id())->delete();

        return response()->json([
            'message' => 'Keranjang berhasil dikosongkan'
        ]);
    }
}
