<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BorrowedProduct;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class SalesProductController extends Controller
{
    public function index()
    {
        $salesUsers = User::where('role_id', 4) // Sales Lapangan role
            ->with(['borrowedProducts.product', 'borrowedProducts' => function ($query) {
                $query->where('status', 'borrowed');
            }])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'status' => $user->status,
                    'assigned_products' => $user->borrowedProducts->count(),
                    'total_borrowed' => $user->borrowedProducts->sum('borrowed_quantity'),
                    'total_sold' => $user->borrowedProducts->sum('sold_quantity'),
                    'total_available' => $user->borrowedProducts->sum('current_stock'),
                ];
            });

        $recentAssignments = BorrowedProduct::with(['sale', 'product'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($assignment) {
                return [
                    'id' => $assignment->id,
                    'sales_name' => $assignment->sale->name,
                    'product_name' => $assignment->product->name,
                    'borrowed_quantity' => $assignment->borrowed_quantity,
                    'sold_quantity' => $assignment->sold_quantity,
                    'current_stock' => $assignment->current_stock,
                    'status' => $assignment->status,
                    'borrowed_date' => $assignment->borrowed_date->format('Y-m-d'),
                    'return_date' => $assignment->return_date?->format('Y-m-d'),
                ];
            });

        return Inertia::render('admin/sales-products/index', [
            'salesUsers' => $salesUsers,
            'recentAssignments' => $recentAssignments,
        ]);
    }

    public function create()
    {
        $salesUsers = User::where('role_id', 4) // Sales Lapangan
            ->where('status', 'active')
            ->get(['id', 'name', 'email', 'phone']);

        $products = Product::with([
            'category',
            'primaryImage',
            'images' => function ($query) {
                $query->orderBy('sort_order')->orderBy('id');
            },
            'skus' => function ($query) {
                $query->where('status', 'active');
            }
        ])
            ->where('status', 'active')
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category->name ?? 'Uncategorized',
                    'stock' => $product->getTotalStockAttribute(),
                    'sell_price' => $product->sell_price,
                    'primary_image' => $product->primaryImage,
                    'has_variations' => $product->has_variations,
                    'min_price' => $product->min_price,
                    'max_price' => $product->max_price,
                    'skus' => $product->skus->map(function ($sku) {
                        return [
                            'id' => $sku->id,
                            'sku_code' => $sku->sku_code,
                            'variant_name' => $sku->variant_name,
                            'price' => $sku->price,
                            'stock' => $sku->stock,
                            'status' => $sku->status,
                        ];
                    }),
                ];
            });

        return Inertia::render('admin/sales-products/create', [
            'salesUsers' => $salesUsers,
            'products' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'sale_id' => 'required|exists:users,id',
            'products' => 'required|array|min:1',
            'products.*.product_id' => 'required|exists:products,id',
            'products.*.product_sku_id' => 'nullable|exists:product_skus,id',
            'products.*.quantity' => 'required|integer|min:1',
            'products.*.borrowed_date' => 'required|date',
        ], [
            'sale_id.required' => 'Sales harus dipilih',
            'sale_id.exists' => 'Sales tidak valid',
            'products.required' => 'Harus ada minimal 1 produk',
            'products.min' => 'Harus ada minimal 1 produk',
            'products.*.product_id.required' => 'Produk harus dipilih',
            'products.*.product_id.exists' => 'Produk tidak valid',
            'products.*.product_sku_id.exists' => 'Variasi produk tidak valid',
            'products.*.quantity.required' => 'Jumlah harus diisi',
            'products.*.quantity.min' => 'Jumlah minimal 1',
            'products.*.borrowed_date.required' => 'Tanggal pinjam harus diisi',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $saleId = $request->sale_id;
            $products = $request->products;

            foreach ($products as $productData) {
                $product = Product::find($productData['product_id']);
                $sku = null;

                // Handle SKU validation if provided (product with variations)
                if (!empty($productData['product_sku_id'])) {
                    $sku = ProductSku::find($productData['product_sku_id']);

                    // Verify SKU belongs to the product
                    if (!$sku || $sku->product_id !== $product->id) {
                        throw new \Exception("Variasi produk tidak valid untuk produk {$product->name}");
                    }

                    // Check if SKU has sufficient stock
                    if ($sku->stock < $productData['quantity']) {
                        throw new \Exception("Stok variasi {$sku->variant_name} tidak mencukupi. Stok tersedia: {$sku->stock}");
                    }
                } else {
                    // For products without SKU, check product stock
                    if ($product->stock < $productData['quantity']) {
                        throw new \Exception("Stok produk {$product->name} tidak mencukupi. Stok tersedia: {$product->stock}");
                    }
                }

                // Check for duplicate assignment (considering SKU)
                $duplicateQuery = BorrowedProduct::where('sale_id', $saleId)
                    ->where('product_id', $productData['product_id'])
                    ->where('status', 'borrowed');

                // Add SKU check if SKU is provided
                if (!empty($productData['product_sku_id'])) {
                    $duplicateQuery->where('sku_id', $productData['product_sku_id']);
                    $existingAssignment = $duplicateQuery->first();

                    if ($existingAssignment) {
                        throw new \Exception("Variasi produk {$sku->variant_name} sudah ditugaskan kepada sales ini");
                    }
                } else {
                    // For simple products, check only by product_id where sku_id is null
                    $duplicateQuery->whereNull('sku_id');
                    $existingAssignment = $duplicateQuery->first();

                    if ($existingAssignment) {
                        throw new \Exception("Produk {$product->name} sudah ditugaskan kepada sales ini");
                    }
                }

                // Create borrowed product record
                $borrowedProductData = [
                    'sale_id' => $saleId,
                    'product_id' => $productData['product_id'],
                    'borrowed_quantity' => $productData['quantity'],
                    'sold_quantity' => 0,
                    'status' => 'borrowed',
                    'borrowed_date' => $productData['borrowed_date'],
                ];

                // Add SKU if provided
                if (!empty($productData['product_sku_id'])) {
                    $borrowedProductData['sku_id'] = $productData['product_sku_id'];
                }

                BorrowedProduct::create($borrowedProductData);

                // Reduce stock (SKU stock if SKU provided, otherwise product stock)
                if (!empty($productData['product_sku_id'])) {
                    $sku->decrement('stock', $productData['quantity']);
                } else {
                    $product->decrement('stock', $productData['quantity']);
                }
            }

            DB::commit();

            return redirect()->route('admin.sales-products.index')
                ->with('success', 'Produk berhasil ditugaskan kepada sales');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->with('error', 'Gagal menugaskan produk: ' . $e->getMessage());
        }
    }

    public function show(BorrowedProduct $borrowedProduct)
    {
        $borrowedProduct->load(['sale', 'product.category']);

        $transactionHistory = \App\Models\OrderItem::where('product_id', $borrowedProduct->product_id)
            ->whereHas('order', function ($query) use ($borrowedProduct) {
                $query->where('sale_id', $borrowedProduct->sale_id);
            })
            ->with(['order'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'order_id' => $item->order_id,
                    'order_code' => $item->order->order_code,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'total_price' => $item->total_price,
                    'date' => $item->created_at->format('Y-m-d H:i:s'),
                ];
            });

        return Inertia::render('admin/sales-products/show', [
            'assignment' => [
                'id' => $borrowedProduct->id,
                'sales' => [
                    'id' => $borrowedProduct->sale->id,
                    'name' => $borrowedProduct->sale->name,
                    'email' => $borrowedProduct->sale->email,
                    'phone' => $borrowedProduct->sale->phone,
                ],
                'product' => [
                    'id' => $borrowedProduct->product->id,
                    'name' => $borrowedProduct->product->name,
                    'category' => $borrowedProduct->product->category->name ?? 'Uncategorized',
                ],
                'borrowed_quantity' => $borrowedProduct->borrowed_quantity,
                'sold_quantity' => $borrowedProduct->sold_quantity,
                'current_stock' => $borrowedProduct->current_stock,
                'status' => $borrowedProduct->status,
                'borrowed_date' => $borrowedProduct->borrowed_date->format('Y-m-d'),
                'return_date' => $borrowedProduct->return_date?->format('Y-m-d'),
                'created_at' => $borrowedProduct->created_at->format('Y-m-d H:i:s'),
            ],
            'transactionHistory' => $transactionHistory,
        ]);
    }

    public function salesProducts(User $user)
    {
        if ($user->role_id !== 4) { // Sales Lapangan role
            abort(404);
        }

        $borrowedProducts = BorrowedProduct::with(['product.category', 'sku'])
            ->where('sale_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($borrowedProduct) {
                return [
                    'id' => $borrowedProduct->id,
                    'product' => [
                        'id' => $borrowedProduct->product->id,
                        'name' => $borrowedProduct->product->name,
                        'category' => $borrowedProduct->product->category->name ?? 'Uncategorized',
                        'has_variations' => $borrowedProduct->product->has_variations,
                    ],
                    'sku' => $borrowedProduct->sku ? [
                        'id' => $borrowedProduct->sku->id,
                        'sku_code' => $borrowedProduct->sku->sku_code,
                        'variant_name' => $borrowedProduct->sku->variant_name,
                    ] : null,
                    'borrowed_quantity' => $borrowedProduct->borrowed_quantity,
                    'sold_quantity' => $borrowedProduct->sold_quantity,
                    'current_stock' => $borrowedProduct->current_stock,
                    'status' => $borrowedProduct->status,
                    'borrowed_date' => $borrowedProduct->borrowed_date->format('Y-m-d'),
                    'return_date' => $borrowedProduct->return_date?->format('Y-m-d'),
                ];
            });

        return Inertia::render('admin/sales-products/sales-products', [
            'sales' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'status' => $user->status,
            ],
            'borrowedProducts' => $borrowedProducts,
        ]);
    }

    public function edit(BorrowedProduct $borrowedProduct)
    {
        if ($borrowedProduct->status === 'returned') {
            return back()->with('error', 'Tidak dapat mengedit produk yang sudah dikembalikan');
        }

        $borrowedProduct->load(['sale', 'product']);

        return Inertia::render('admin/sales-products/edit', [
            'assignment' => [
                'id' => $borrowedProduct->id,
                'sales' => [
                    'id' => $borrowedProduct->sale->id,
                    'name' => $borrowedProduct->sale->name,
                ],
                'product' => [
                    'id' => $borrowedProduct->product->id,
                    'name' => $borrowedProduct->product->name,
                    'stock' => $borrowedProduct->product->stock,
                ],
                'borrowed_quantity' => $borrowedProduct->borrowed_quantity,
                'sold_quantity' => $borrowedProduct->sold_quantity,
                'current_stock' => $borrowedProduct->current_stock,
            ],
        ]);
    }

    public function update(Request $request, BorrowedProduct $borrowedProduct)
    {
        if ($borrowedProduct->status === 'returned') {
            return back()->with('error', 'Tidak dapat mengedit produk yang sudah dikembalikan');
        }

        $validator = Validator::make($request->all(), [
            'borrowed_quantity' => 'required|integer|min:' . $borrowedProduct->sold_quantity,
        ], [
            'borrowed_quantity.required' => 'Jumlah pinjam harus diisi',
            'borrowed_quantity.min' => 'Jumlah pinjam tidak boleh kurang dari jumlah yang terjual',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $newQuantity = $request->borrowed_quantity;
            $oldQuantity = $borrowedProduct->borrowed_quantity;
            $difference = $newQuantity - $oldQuantity;

            // Update product stock
            $borrowedProduct->product->decrement('stock', $difference);

            // Update borrowed product
            $borrowedProduct->update([
                'borrowed_quantity' => $newQuantity,
            ]);

            DB::commit();

            return redirect()->route('admin.sales-products.show', $borrowedProduct)
                ->with('success', 'Jumlah pinjam berhasil diperbarui');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->with('error', 'Gagal memperbarui jumlah pinjam: ' . $e->getMessage());
        }
    }

    public function return(BorrowedProduct $borrowedProduct)
    {
        if ($borrowedProduct->status === 'returned') {
            return back()->with('error', 'Produk sudah dikembalikan');
        }

        try {
            DB::beginTransaction();

            // Return remaining stock to product
            $remainingStock = $borrowedProduct->current_stock;
            $borrowedProduct->product->increment('stock', $remainingStock);

            // Mark as returned
            $borrowedProduct->update([
                'status' => 'returned',
                'return_date' => now(),
            ]);

            DB::commit();

            return redirect()->route('admin.sales-products.index')
                ->with('success', 'Produk berhasil dikembalikan ke stok');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Gagal mengembalikan produk: ' . $e->getMessage());
        }
    }

    public function returnProduct(Request $request, BorrowedProduct $borrowedProduct)
    {
        if ($borrowedProduct->status === 'returned') {
            return back()->with('error', 'Produk sudah dikembalikan');
        }

        $validator = Validator::make($request->all(), [
            'return_date' => 'required|date',
            'return_all' => 'required|boolean',
            'return_quantity' => 'required_if:return_all,false|integer|min:1|max:' . $borrowedProduct->current_stock,
        ], [
            'return_date.required' => 'Tanggal pengembalian harus diisi',
            'return_quantity.required_if' => 'Jumlah pengembalian harus diisi',
            'return_quantity.max' => 'Jumlah pengembalian tidak boleh melebihi stok tersedia',
        ]);

        if ($validator->fails()) {
            return back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            $returnQuantity = $request->return_all ? $borrowedProduct->current_stock : $request->return_quantity;

            // Return specified quantity to product stock
            if ($borrowedProduct->sku) {
                $borrowedProduct->sku->increment('stock', $returnQuantity);
            } else {
                $borrowedProduct->product->increment('stock', $returnQuantity);
            }

            // Update borrowed product
            $borrowedProduct->update([
                'sold_quantity' => $borrowedProduct->sold_quantity + $returnQuantity,
                'status' => 'returned',
                'return_date' => $request->return_date,
            ]);

            DB::commit();

            return back()->with('success', "Produk berhasil dikembalikan ke stok ({$returnQuantity} unit)");

        } catch (\Exception $e) {
            DB::rollBack();

            return back()
                ->withInput()
                ->with('error', 'Gagal mengembalikan produk: ' . $e->getMessage());
        }
    }

    public function destroy(BorrowedProduct $borrowedProduct)
    {
        if ($borrowedProduct->sold_quantity > 0) {
            return back()->with('error', 'Tidak dapat menghapus penugasan produk yang sudah terjual');
        }

        try {
            DB::beginTransaction();

            // Return all borrowed stock to product
            $borrowedProduct->product->increment('stock', $borrowedProduct->borrowed_quantity);

            // Delete the assignment
            $borrowedProduct->delete();

            DB::commit();

            return redirect()->route('admin.sales-products.index')
                ->with('success', 'Penugasan produk berhasil dihapus');

        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Gagal menghapus penugasan produk: ' . $e->getMessage());
        }
    }
}