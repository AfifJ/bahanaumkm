<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Sales;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\BorrowedProduct;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index()
    {
        $sale = Sales::where('user_id', auth()->id())->first();
        if (!$sale) {
            return redirect()->route('sales.profile.create');
        }

        $transactions = Order::where('sale_id', $sale->id)
            ->with(['items.product'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                return [
                    'id' => 'TRX-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
                    'date' => $order->created_at->format('Y-m-d H:i:s'),
                    'total_amount' => (float) $order->total_amount,
                    'items' => $order->items->map(function ($item) {
                        return [
                            'product' => $item->product->name,
                            'quantity' => $item->quantity,
                            'price' => (float) $item->unit_price,
                            'subtotal' => (float) $item->total_price
                        ];
                    })->toArray()
                ];
            });

        return Inertia::render('sales/transactions/index', [
            'transactions' => $transactions
        ]);
    }

    public function create()
    {
        $sale = Sales::where('user_id', auth()->id())->first();
        if (!$sale) {
            return redirect()->route('sales.profile.create')
                ->with('error', 'Profil sales belum lengkap. Silakan lengkapi profil terlebih dahulu.');
        }

        // Debug: Log basic info
        \Log::info('Transaction create debug:', [
            'sale_id' => $sale->id,
            'user_id' => auth()->id()
        ]);

        // Debug: Check borrowed products existence and status
        $allBorrowedProducts = BorrowedProduct::where('sale_id', $sale->id)->get();
        \Log::info('All borrowed products for sale:', [
            'count' => $allBorrowedProducts->count(),
            'products' => $allBorrowedProducts->map(function ($bp) {
                return [
                    'id' => $bp->id,
                    'product_id' => $bp->product_id,
                    'status' => $bp->status,
                    'borrowed_quantity' => $bp->borrowed_quantity,
                    'sold_quantity' => $bp->sold_quantity,
                    'current_stock' => $bp->current_stock
                ];
            })->toArray()
        ]);

        // Start with simple query
        $query = BorrowedProduct::where('sale_id', $sale->id);
        \Log::info('Query 1 - By sale_id:', ['count' => $query->count()]);

        // Add status filter (status is 'borrowed', not 'active')
        $query->where('status', 'borrowed');
        \Log::info('Query 2 - With status filter:', ['count' => $query->count()]);

        // Add stock filter (using DB::raw for PostgreSQL)
        $query->where('borrowed_quantity', '>', DB::raw('sold_quantity'));
        \Log::info('Query 3 - With stock filter:', ['count' => $query->count()]);

        // Add relations
        $borrowedProducts = $query->with(['product.category'])->get();
        \Log::info('Query 4 - With relations:', ['count' => $borrowedProducts->count()]);

        // Debug: Check individual products
        foreach ($borrowedProducts as $bp) {
            \Log::info('Borrowed product details:', [
                'id' => $bp->id,
                'product_id' => $bp->product_id,
                'borrowed_quantity' => $bp->borrowed_quantity,
                'sold_quantity' => $bp->sold_quantity,
                'current_stock' => $bp->current_stock,
                'product_exists' => $bp->product ? true : false,
                'product_name' => $bp->product ? $bp->product->name : 'NULL'
            ]);
        }

        $products = $borrowedProducts
            ->filter(function ($borrowedProduct) {
                return $borrowedProduct->current_stock > 0;
            })
            ->map(function ($borrowedProduct) {
                $product = $borrowedProduct->product;
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'sell_price' => (float) $product->sell_price,
                    'stock' => $borrowedProduct->current_stock,
                    'image_url' => $product->image_url ? asset($product->image_url) : null,
                    'category' => [
                        'name' => $product->category->name ?? 'Uncategorized'
                    ],
                    'borrowed_product_id' => $borrowedProduct->id
                ];
            });

        \Log::info('Final products result:', [
            'count' => $products->count(),
            'products' => $products->toArray()
        ]);

        return Inertia::render('sales/transactions/new', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $sale = Sales::where('user_id', auth()->id())->first();
        if (!$sale) {
            return redirect()->route('sales.profile.create')
                ->with('error', 'Profil sales belum lengkap. Silakan lengkapi profil terlebih dahulu.');
        }

        $validator = \Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
        ], [
            'items.required' => 'Harap tambahkan minimal 1 produk',
            'items.min' => 'Harap tambahkan minimal 1 produk',
            'items.*.productId.required' => 'Produk harus dipilih',
            'items.*.productId.integer' => 'ID produk tidak valid',
            'items.*.productId.exists' => 'Produk tidak valid',
            'items.*.quantity.required' => 'Jumlah harus diisi',
            'items.*.quantity.min' => 'Jumlah minimal 1',
            'items.*.price.required' => 'Harga harus diisi',
            'items.*.price.min' => 'Harga tidak boleh negatif',
            'items.*.subtotal.required' => 'Subtotal harus diisi',
            'items.*.subtotal.min' => 'Subtotal tidak boleh negatif',
        ]);

        if ($validator->fails()) {
            $errors = $validator->errors()->toArray();
            $errorMessages = array_map(fn($messages) => implode(', ', (array) $messages), $errors);

            return back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Validasi gagal: ' . implode(', ', $errorMessages));
        }

        try {
            DB::beginTransaction();

            foreach ($request->items as $item) {
                $borrowedProduct = BorrowedProduct::where('sale_id', $sale->id)
                    ->where('product_id', $item['productId'])
                    ->first();

                if (!$borrowedProduct) {
                    throw new \Exception("Produk tidak tersedia untuk sales ini");
                }

                if ($borrowedProduct->current_stock < $item['quantity']) {
                    throw new \Exception("Stok tidak mencukupi untuk produk: {$borrowedProduct->product->name}. Stok tersedia: {$borrowedProduct->current_stock}");
                }

                if (abs($borrowedProduct->product->sell_price - $item['price']) > 0.01) {
                    throw new \Exception("Harga produk {$borrowedProduct->product->name} tidak sesuai dengan harga saat ini");
                }
            }

            $totalAmount = collect($request->items)->sum('subtotal');

            $order = Order::create([
                'buyer_id' => null,
                'sale_id' => $sale->id,
                'total_amount' => $totalAmount,
                'status' => 'completed',
            ]);

            foreach ($request->items as $item) {
                $borrowedProduct = BorrowedProduct::where('sale_id', $sale->id)
                    ->where('product_id', $item['productId'])
                    ->first();

                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $item['productId'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['price'],
                    'total_price' => $item['subtotal']
                ]);

                // Update sold_quantity in borrowed_product
                $borrowedProduct->increment('sold_quantity', $item['quantity']);
            }

            DB::commit();

            return redirect()->route('sales.transactions')
                ->with('success', 'Transaksi berhasil disimpan! Total: ' . number_format($totalAmount, 0, ',', '.'));

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->with('error', 'Gagal menyimpan transaksi: ' . $e->getMessage());
        }
    }

    public function show($transactionId)
    {
        $sale = Sales::where('user_id', auth()->id())->first();
        if (!$sale) {
            return redirect()->route('sales.profile.create');
        }

        $order = Order::where('sale_id', $sale->id)
            ->where('id', $transactionId)
            ->with(['items.product', 'items.product.category'])
            ->first();

        if (!$order) {
            return redirect()->route('sales.transactions')
                ->with('error', 'Transaksi tidak ditemukan');
        }

        $transaction = [
            'id' => 'TRX-' . str_pad($order->id, 3, '0', STR_PAD_LEFT),
            'order_code' => $order->order_code,
            'date' => $order->created_at->format('Y-m-d H:i:s'),
            'total_amount' => (float) $order->total_amount,
            'status' => $order->status,
            'items' => $order->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product' => [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'image_url' => $item->product->image_url ? asset($item->product->image_url) : null,
                        'category' => [
                            'name' => $item->product->category->name ?? 'Uncategorized'
                        ]
                    ],
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'total_price' => (float) $item->total_price
                ];
            })->toArray()
        ];

        return Inertia::render('sales/transactions/show', [
            'transaction' => $transaction
        ]);
    }

    public function selectProducts()
    {
        return Inertia::render('sales/transactions/new/products');
    }
}
