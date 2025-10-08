<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\BorrowedProduct;
use Exception;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TransactionController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        if (!$user->hasPhone()) {
            return redirect()->route('sales.profile.edit')
                ->with('error', 'Silakan lengkapi nomor telepon terlebih dahulu.');
        }

        $transactions = Order::where('sale_id', $user->id)
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
        $user = auth()->user();
        if (!$user->hasPhone()) {
            return redirect()->route('sales.profile.edit')
                ->with('error', 'Silakan lengkapi nomor telepon terlebih dahulu.');
        }

        // Get available products for sales
        $products = BorrowedProduct::where('sale_id', $user->id)
            ->where('status', 'borrowed')
            ->where('borrowed_quantity', '>', DB::raw('sold_quantity'))
            ->with(['product.category'])
            ->get()
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

        return Inertia::render('sales/transactions/new', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        if (!$user->hasPhone()) {
            return redirect()->route('sales.profile.edit')
                ->with('error', 'Silakan lengkapi nomor telepon terlebih dahulu.');
        }

        $validator = Validator::make($request->all(), [
            'items' => 'required|array|min:1',
            'items.*.productId' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.subtotal' => 'required|numeric|min:0',
        ], [
            'items.required' => 'Harap tambahkan minimal 1 produk',
            'items.min' => 'Harap tambahkan minimal 1 produk',
            'items.*.productId.required' => 'Produk harus dipilih',
            'items.*.productId.exists' => 'Produk tidak valid',
            'items.*.quantity.required' => 'Jumlah harus diisi',
            'items.*.quantity.min' => 'Jumlah minimal 1',
            'items.*.price.required' => 'Harga harus diisi',
            'items.*.price.min' => 'Harga tidak boleh negatif',
            'items.*.subtotal.required' => 'Subtotal harus diisi',
            'items.*.subtotal.min' => 'Subtotal tidak boleh negatif',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $totalAmount = 0;
            foreach ($request->items as $item) {
                $borrowedProduct = BorrowedProduct::where('sale_id', $user->id)
                    ->where('product_id', $item['productId'])
                    ->first();

                if (!$borrowedProduct) {
                    throw new Exception("Produk tidak tersedia untuk sales ini");
                }

                if ($borrowedProduct->current_stock < $item['quantity']) {
                    throw new Exception("Stok tidak mencukupi untuk produk: {$borrowedProduct->product->name}. Stok tersedia: {$borrowedProduct->current_stock}");
                }

                if (abs($borrowedProduct->product->sell_price - $item['price']) > 0.01) {
                    throw new Exception("Harga produk {$borrowedProduct->product->name} tidak sesuai dengan harga saat ini");
                }

                $totalAmount += $item['subtotal'];
            }

            $order = Order::create([
                'buyer_id' => null,
                'sale_id' => $user->id,
                'total_amount' => $totalAmount,
                'status' => 'completed',
            ]);

            foreach ($request->items as $item) {
                $borrowedProduct = BorrowedProduct::where('sale_id', $user->id)
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
                ->with('success', 'Transaksi berhasil disimpan! Total: Rp ' . number_format($totalAmount, 0, ',', '.'));

        } catch (Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->with('error', 'Gagal menyimpan transaksi: ' . $e->getMessage());
        }
    }

    public function show($transactionId)
    {
        $user = auth()->user();
        if (!$user->hasPhone()) {
            return redirect()->route('sales.profile.edit')
                ->with('error', 'Silakan lengkapi nomor telepon terlebih dahulu.');
        }

        $order = Order::where('sale_id', $user->id)
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

    }
