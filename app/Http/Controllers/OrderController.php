<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\MitraProfile;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSku;
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
        // Check if this is from cart checkout
        $fromCart = $request->input('from_cart');
        
        if ($fromCart) {
            // Handle cart checkout
            $cartItems = session()->get('checkout_cart_items', []);
            $subtotal = session()->get('checkout_subtotal', 0);
            
            if (empty($cartItems)) {
                return redirect()->route('buyer.cart.index')
                    ->with('error', 'Keranjang Anda kosong');
            }
            
            // Load products and SKUs for cart items
            $items = [];
            foreach ($cartItems as $cartItem) {
                $product = Product::with(['primaryImage', 'images'])->find($cartItem['product_id']);
                
                if (!$product) continue;
                
                $sku = null;
                if (!empty($cartItem['sku_id'])) {
                    $sku = ProductSku::find($cartItem['sku_id']);
                }
                
                $items[] = [
                    'cart_id' => $cartItem['cart_id'],
                    'product' => $product,
                    'sku' => $sku,
                    'quantity' => $cartItem['quantity'],
                    'price' => $cartItem['price'],
                ];
            }
            
            $mitra = MitraProfile::get();
            $shippingSetting = ShippingSetting::first();
            
            return Inertia::render('orders/create', [
                'cartItems' => $items,
                'subtotal' => $subtotal,
                'fromCart' => true,
                'mitra' => $mitra,
                'shippingSetting' => $shippingSetting
            ]);
        }
        
        // Handle single product buy now
        $productId = $request->input('product_id');
        $quantity = $request->input('quantity');
        $skuId = $request->input('sku_id');
        
        if (!$productId || !$quantity) {
            return redirect()->route('home')
                ->with('error', 'Data produk tidak lengkap');
        }
        
        $product = Product::with(['primaryImage', 'images'])->find($productId);
        
        if (!$product) {
            return redirect()->route('home')
                ->with('error', 'Produk tidak ditemukan');
        }

        // Load SKU data if provided
        $sku = null;
        if ($skuId) {
            $sku = ProductSku::find($skuId);
        }

        $mitra = MitraProfile::get();
        $shippingSetting = ShippingSetting::first();

        return Inertia::render('orders/create', [
            'product' => $product,
            'quantity' => $quantity,
            'sku' => $sku,
            'fromCart' => false,
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
            'items.*.sku_id' => 'nullable|integer|exists:product_skus,id',
            'items.*.quantity' => 'required|integer|min:1',
            'mitra_id' => 'required',
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            // Check if this order is from cart checkout
            $cartItemIds = session()->get('checkout_cart_ids', []);

            // Validate stock and calculate total
            $totalAmount = 0;
            $items = [];
            foreach ($request->items as $itemData) {
                $product = Product::findOrFail($itemData['product_id']);
                
                // Handle SKU vs Product logic
                $unitPrice = $product->sell_price;
                $availableStock = $product->stock;
                $skuId = null;
                
                if (!empty($itemData['sku_id'])) {
                    // Product has variations, use SKU
                    $sku = \App\Models\ProductSku::findOrFail($itemData['sku_id']);
                    
                    if ($sku->product_id !== $product->id) {
                        throw new Exception("SKU tidak valid untuk produk ini.");
                    }
                    
                    $unitPrice = $sku->price;
                    $availableStock = $sku->stock;
                    $skuId = $sku->id;
                    
                    // Validate SKU stock
                    if ($sku->stock < $itemData['quantity']) {
                        throw new Exception("Stok varian {$sku->variant_name} tidak mencukupi. Stok tersedia: {$sku->stock}");
                    }
                } else {
                    // Product without variations
                    if ($product->has_variations) {
                        throw new Exception("Produk {$product->name} memiliki variasi. Silakan pilih varian terlebih dahulu.");
                    }
                    
                    // Validate product stock
                    if ($product->stock < $itemData['quantity']) {
                        throw new Exception("Stok produk {$product->name} tidak mencukupi. Stok tersedia: {$product->stock}");
                    }
                }

                $itemTotal = $unitPrice * $itemData['quantity'];
                $totalAmount += $itemTotal;

                $items[] = [
                    'product_id' => $product->id,
                    'sku_id' => $skuId,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $unitPrice,
                    'total_price' => $itemTotal,
                ];

                // Decrement stock (SKU or Product)
                if ($skuId) {
                    $sku->decrement('stock', $itemData['quantity']);
                } else {
                    $product->decrement('stock', $itemData['quantity']);
                }
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

            // Clear cart items if this was a cart checkout
            if (!empty($cartItemIds)) {
                Cart::whereIn('id', $cartItemIds)
                    ->where('user_id', Auth::id())
                    ->delete();
                
                // Clear session data
                session()->forget(['checkout_cart_items', 'checkout_cart_ids', 'checkout_subtotal']);
                
                \Log::info('🗑️ Cleared cart items after successful order', [
                    'cart_ids' => $cartItemIds,
                    'order_id' => $order->id
                ]);
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
            'sku_id' => 'nullable|exists:product_skus,id',
            'quantity' => 'required|integer|min:1',
        ]);

        \Log::info('✅ Request validation passed');

        $product = Product::findOrFail($request->product_id);
        \Log::info('📦 Product found:', [
            'id' => $product->id,
            'name' => $product->name,
            'status' => $product->status,
            'has_variations' => $product->has_variations,
            'sell_price' => $product->sell_price
        ]);

        // Check product status
        if ($product->status !== 'active') {
            \Log::warning('❌ Product not active:', $product->status);
            $errorMessage = 'Produk tidak tersedia';

            if (request()->expectsJson()) {
                return response()->json(['error' => $errorMessage], 422);
            } else {
                return redirect()->back()->with('error', $errorMessage);
            }
        }

        // Handle SKU vs Product logic
        $sku = null;
        $availableStock = 0;
        $variationSummary = '';

        if ($request->filled('sku_id')) {
            // Product has variations, use SKU
            $sku = ProductSku::findOrFail($request->sku_id);

            if ($sku->product_id !== $product->id) {
                $errorMessage = 'SKU tidak valid untuk produk ini';
                return back()->with('error', $errorMessage);
            }

            $availableStock = $sku->stock;
            $variationSummary = $sku->variation_summary;

            \Log::info('📦 SKU found:', [
                'sku_id' => $sku->id,
                'sku_code' => $sku->sku_code,
                'stock' => $sku->stock,
                'status' => $sku->status,
                'price' => $sku->price
            ]);

            // Check SKU status
            if ($sku->status !== 'active') {
                $errorMessage = 'Varian produk tidak tersedia';
                return back()->with('error', $errorMessage);
            }
        } else {
            // Product without variations
            if ($product->has_variations) {
                $errorMessage = 'Produk ini memiliki variasi. Silakan pilih varian terlebih dahulu.';
                return back()->with('error', $errorMessage);
            }

            $availableStock = $product->stock;
        }

        // Check stock availability
        if ($availableStock < $request->quantity) {
            \Log::warning('❌ Insufficient stock:', [
                'requested' => $request->quantity,
                'available' => $availableStock
            ]);
            $errorMessage = "Stok tidak mencukupi. Stok tersedia: {$availableStock}";

            if (request()->expectsJson()) {
                return response()->json(['error' => $errorMessage], 422);
            } else {
                return redirect()->back()->with('error', $errorMessage);
            }
        }

        // Check if item already exists in cart (by SKU if variations, by product if no variations)
        $cartQuery = Cart::forUser(Auth::id())
            ->where('product_id', $request->product_id);

        if ($sku) {
            // Product has variations, check by SKU
            $cartQuery->where('sku_id', $sku->id);
        } else {
            // Product without variations
            $cartQuery->whereNull('sku_id');
        }

        $existingCartItem = $cartQuery->first();

        if ($existingCartItem) {
            // Update quantity if item already in cart
            $newQuantity = $existingCartItem->quantity + $request->quantity;

            if ($availableStock < $newQuantity) {
                $errorMessage = "Stok tidak mencukupi. Stok tersedia: {$availableStock}";

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
                'sku_id' => $sku?->id,
                'quantity' => $request->quantity,
                'variation_summary' => $variationSummary,
            ]);
        }

        // Get updated cart
        $updatedCart = $this->getCart();
        $cartData = json_decode($updatedCart->getContent());

        // Handle different response types
        if (request()->expectsJson() || request()->wantsJson()) {
            // For API/JSON requests (fallback)
            return response()->json([
                'message' => 'Produk berhasil ditambahkan ke keranjang',
                'cart' => $cartData,
                'item_count' => $cartData->item_count ?? 0,
            ]);
        } else {
            // For Inertia.js requests
            \Log::info('✅ Returning Inertia response with cart count:', [
                'cart_count' => $cartData->item_count ?? 0
            ]);
            
            return redirect()->back()
                ->with('success', 'Produk berhasil ditambahkan ke keranjang')
                ->with('cartCount', $cartData->item_count ?? 0);
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
