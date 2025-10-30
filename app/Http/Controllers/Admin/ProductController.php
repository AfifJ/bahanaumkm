<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProductRequest;
use App\Models\Category;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductSku;
use App\Models\ProductVariation;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Product::class);

        $query = Product::with([
            'vendor',
            'primaryImage',
            'images' => function ($query) {
                $query->orderBy('sort_order')->orderBy('id');
            },
            'skus' => function ($query) {
                $query->where('status', 'active');
            }
        ])
            ->withCount(['images', 'reviews', 'skus'])
            ->withAvg('reviews', 'rating');

        // Apply filters
        if ($request->filled('search')) {
            $query->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($request->search) . '%']);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('vendor')) {
            $query->where('vendor_id', $request->vendor);
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        $products = $query->latest()->paginate(10);

        // Calculate display prices and stock for products with variations
        $products->getCollection()->transform(function ($product) {
            if ($product->has_variations) {
                // Get pricing from active SKUs
                $activeSkus = $product->skus;

                if ($activeSkus->isNotEmpty()) {
                    $product->sell_price_display = $activeSkus->min('price');
                    $product->buy_price_display = $activeSkus->min('buy_price');
                    $product->sell_price_min = $activeSkus->min('price');
                    $product->sell_price_max = $activeSkus->max('price');
                    $product->buy_price_min = $activeSkus->min('buy_price');
                    $product->buy_price_max = $activeSkus->max('buy_price');

                    // Calculate stock range for products with variations
                    $stockMin = $activeSkus->min('stock');
                    $stockMax = $activeSkus->max('stock');
                    $product->stock_min = $stockMin;
                    $product->stock_max = $stockMax;
                    $product->stock_total = $activeSkus->sum('stock');
                } else {
                    // Fallback to product level prices if no active SKUs
                    $product->sell_price_display = $product->sell_price ?? 0;
                    $product->buy_price_display = $product->buy_price ?? 0;
                    $product->sell_price_min = $product->sell_price ?? 0;
                    $product->sell_price_max = $product->sell_price ?? 0;
                    $product->buy_price_min = $product->buy_price ?? 0;
                    $product->buy_price_max = $product->buy_price ?? 0;

                    // No SKUs means no stock
                    $product->stock_min = 0;
                    $product->stock_max = 0;
                    $product->stock_total = 0;
                }
            } else {
                // For products without variations, use product level prices
                $product->sell_price_display = $product->sell_price ?? 0;
                $product->buy_price_display = $product->buy_price ?? 0;
                $product->sell_price_min = $product->sell_price ?? 0;
                $product->sell_price_max = $product->sell_price ?? 0;
                $product->buy_price_min = $product->buy_price ?? 0;
                $product->buy_price_max = $product->buy_price ?? 0;

                // For non-variation products, all stock values are the same
                $product->stock_min = $product->stock ?? 0;
                $product->stock_max = $product->stock ?? 0;
                $product->stock_total = $product->stock ?? 0;
            }

            return $product;
        });

        // Get filter options
        $vendors = User::where('role_id', 2)->where('status', 'active')->get();
        $categories = Category::get();

        return Inertia::render('admin/products/index', [
            'products' => $products,
            'filters' => $request->only(['search', 'status', 'vendor', 'category']),
            'filterOptions' => [
                'vendors' => $vendors,
                'categories' => $categories,
            ],
            'can' => [
                'create' => auth()->user()->can('create', Product::class),
                'edit' => auth()->user()->can('update', Product::class),
                'delete' => auth()->user()->can('delete', Product::class),
                'deleteReviews' => auth()->user()->isAdmin(), // Only admin can delete reviews
            ]
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->authorize('create', Product::class);

        $categories = Category::get();
        $vendors = User::where('role_id', 2)->where('status', 'active')->get();

        return Inertia::render('admin/products/create', [
            'categories' => $categories,
            'vendors' => $vendors
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ProductRequest $request)
    {
        $this->authorize('create', Product::class);

        $data = $request->validated();

        DB::transaction(function () use ($request, $data) {
            // Filter data untuk hanya field yang ada di tabel products
            $productData = [
                'name' => $data['name'],
                'description' => $data['description'],
                'status' => $data['status'],
                'vendor_id' => $data['vendor_id'],
                'category_id' => $data['category_id'],
                'has_variations' => $data['has_variations'],
            ];

            // Tambahkan field variasi jika menggunakan variasi
            if ($data['has_variations']) {
                $productData['different_prices'] = $data['different_prices'];
                $productData['use_images'] = $data['use_images'];
            }

            // Tambahkan field ini hanya jika tidak menggunakan variasi
            if (!$data['has_variations']) {
                $productData['buy_price'] = $data['buy_price'];
                $productData['sell_price'] = $data['sell_price'];
                $productData['stock'] = $data['stock'];
            }

            $product = Product::create($productData);

            // Handle product variations/SKUs
            if ($data['has_variations'] && isset($data['skus'])) {
                foreach ($data['skus'] as $index => $skuData) {
                    // Handle global pricing if different_prices is false
                    $skuPrice = $data['different_prices'] ? $skuData['price'] : $data['sell_price'];
                    $skuBuyPrice = $data['different_prices'] ? $skuData['buy_price'] : $data['buy_price'];

                    $sku = $product->skus()->create([
                        'sku_code' => $skuData['sku_code'],
                        'variant_name' => $skuData['name'] ?? $skuData['variant_name'],
                        'price' => $skuPrice,
                        'buy_price' => $skuBuyPrice,
                        'stock' => $skuData['stock'],
                        'status' => $skuData['status'],
                    ]);

                    // Handle variant image if uploaded
                    if (isset($skuData['image_file']) && $skuData['image_file'] instanceof \Illuminate\Http\UploadedFile) {
                        $path = $skuData['image_file']->store('products/skus', 'public');
                        $sku->update(['image' => $path]);
                    }
                }
            }

            // Handle multiple image uploads (new system)
            if ($request->hasFile('images')) {
                $images = $request->file('images');
                $imageCount = count($images);

                // Validate image count before processing
                if ($imageCount > 5) {
                    throw new \Exception('Maksimal 5 gambar produk yang diizinkan (selain gambar variasi).');
                }

                foreach ($images as $index => $image) {
                    $path = $image->store('products', 'public');
                    $isPrimary = $index === 0; // First image is primary
                    $product->addImage($path, $isPrimary, $index);
                }
            }
            // Handle single image upload (backward compatibility)
            elseif ($request->hasFile('image')) {
                $path = $request->file('image')->store('products', 'public');
                $product->addImage($path, true, 0);
            }
        });

        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil dibuat.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $this->authorize('view', $product);
        return Inertia::render('admin/products/show', [
            'product' => $product->load([
                'vendor',
                'category',
                'images',
                'variations.options' => function ($query) {
                    $query->orderBy('sort_order')->orderBy('value');
                },
                'skus' => function ($query) {
                    $query->with('variationOptions.variation')->orderBy('sku_code');
                }
            ])
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $this->authorize('update', $product);

        $categories = Category::get();
        $vendors = User::where('role_id', 2)->where('status', 'active')->get();

        // Load product with necessary relationships
        $product->load([
            'vendor',
            'category',
            'images',
            'skus' => function ($query) {
                $query->withTrashed()->orderBy('sku_code');
            }
        ])->loadCount(['skus']);

        // Check if product has orders (trigger for edit restrictions)
        $hasOrders = $product->hasOrders();

        // Get SKUs with their order status
        $skusWithOrderInfo = $product->skus->map(function ($sku) use ($product) {
            $sku->has_orders = $product->skuHasOrders($sku->id);
            return $sku;
        });

        // Replace the skus collection with enriched data
        $product->setRelation('skus', $skusWithOrderInfo);

        // Generate variation_settings from product fields for frontend compatibility
        $product->variation_settings = [
            'differentPrices' => $product->different_prices ?? true,
            'useImages' => $product->use_images ?? false
        ];

        // Generate global_prices from product fields
        $product->global_prices = [
            'buy_price' => $product->buy_price ?? 0,
            'sell_price' => $product->sell_price ?? 0
        ];

        // Add edit restrictions metadata
        $product->edit_restrictions = [
            'has_orders' => $hasOrders,
            'can_change_type' => !$hasOrders, // tidak bisa ubah dari tunggal ke variasi
            'can_delete_attributes' => !$hasOrders,
            'can_delete_variation_values' => !$hasOrders,
            'can_delete_skus' => !$hasOrders,
            'can_add_attributes' => true,
            'can_add_variation_values' => true,
            'can_add_skus' => true,
            'can_edit_prices' => true,
            'can_edit_stock' => true,
            'can_disable_skus' => true, // bisa nonaktifkan dengan soft delete
        ];

        return Inertia::render('admin/products/edit', [
            'product' => $product,
            'categories' => $categories,
            'vendors' => $vendors
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ProductRequest $request, Product $product)
    {
        $this->authorize('update', $product);

        // DEBUG: Uncomment untuk melihat data awal

        try {
            $data = $request->validated();
            $hasOrders = $product->hasOrders();

            if ($hasOrders) {
                // Validasi 1: Tidak boleh mengubah tipe produk
                $currentHasVariations = (bool) $product->has_variations;
                $incomingHasVariations = (bool) ($data['has_variations'] ?? false);

                if ($currentHasVariations !== $incomingHasVariations) {
                    return redirect()->back()
                        ->with('error', 'Tidak dapat mengubah tipe produk (tunggal/variasi) karena produk ini sudah memiliki pesanan.')
                        ->withInput();
                }

                // Validasi 2: Jika produk memiliki variasi, tidak boleh menghapus SKU yang sudah ada
                if ($product->has_variations && isset($data['skus'])) {
                    $existingSkuIds = $product->skus()->pluck('id')->toArray();
                    $incomingSkuIds = array_filter(array_column($data['skus'], 'id'), function ($id) {
                        return !empty($id);
                    });

                    $skusToDelete = array_diff($existingSkuIds, $incomingSkuIds);

                    // if (!empty($skusToDelete)) {
                    //     // dd('1');
                    //     return redirect()->back()
                    //         ->with('error', 'Tidak dapat menghapus SKU karena produk ini sudah memiliki pesanan. Gunakan tombol "Nonaktifkan" untuk menonaktifkan SKU. SKU ID yang coba dihapus: ' . implode(', ', $skusToDelete))
                    //         ->withInput();
                    // }
                }
            }
            // dd('2');

            // Use transaction to ensure data consistency
            DB::transaction(function () use ($request, $product, $data) {
                try {
                    // Filter data untuk hanya field yang ada di tabel products
                    $productData = [
                        'name' => $data['name'],
                        'description' => $data['description'],
                        'status' => $data['status'],
                        'vendor_id' => $data['vendor_id'],
                        'category_id' => $data['category_id'],
                        'has_variations' => $data['has_variations'],
                    ];

                    // Tambahkan field variasi jika menggunakan variasi
                    if ($data['has_variations']) {
                        $productData['different_prices'] = $data['different_prices'];
                        $productData['use_images'] = $data['use_images'];
                    }

                    // Tambahkan field ini hanya jika tidak menggunakan variasi
                    if (!$data['has_variations']) {
                        $productData['buy_price'] = $data['buy_price'];
                        $productData['sell_price'] = $data['sell_price'];
                        $productData['stock'] = $data['stock'];
                    }


                    $result = $product->update($productData);


                    // Handle product variations/SKUs update
                    if ($data['has_variations'] && isset($data['skus'])) {

                        // Get existing SKU IDs to determine which ones to delete
                        $existingSkuIds = $product->skus()->pluck('id')->toArray();
                        $incomingSkuIds = [];
                        // dd($data);

                        foreach ($data['skus'] as $index => $skuData) {

                            // Validate required fields for SKU
                            if (empty($skuData['variant_name'])) {
                                throw new \Exception("Nama varian wajib diisi untuk variasi #" . ($index + 1));
                            }

                            $skuPrice = $skuData['price'] ?? 0;
                            $skuBuyPrice = $skuData['buy_price'] ?? 0;

                            // Validate pricing
                            if ($data['different_prices'] && (empty($skuPrice) || $skuPrice <= 0)) {
                                throw new \Exception("Harga jual variasi #" . ($index + 1) . " harus lebih dari 0");
                            }

                            if ($data['different_prices'] && (empty($skuBuyPrice) || $skuBuyPrice <= 0)) {
                                throw new \Exception("Harga beli variasi #" . ($index + 1) . " harus lebih dari 0");
                            }

                            if (empty($skuData['stock']) || $skuData['stock'] < 0) {
                                throw new \Exception("Stok variasi #" . ($index + 1) . " tidak boleh kurang dari 0");
                            }

                            $skuDataToUpdate = [
                                'sku_code' => $skuData['sku_code'],
                                'variant_name' => $skuData['name'] ?? $skuData['variant_name'],
                                'price' => $skuPrice,
                                'buy_price' => $skuBuyPrice,
                                'stock' => $skuData['stock'],
                                'status' => $skuData['status'],
                            ];



                            // Simplified SKU matching logic dengan error handling
                            $sku = null;
                            try {
                                if (isset($skuData['id']) && !empty($skuData['id'])) {
                                    $existingSku = $product->skus()->find($skuData['id']);
                                    if ($existingSku) {
                                        $sku = $existingSku;
                                        $updateResult = $sku->update($skuDataToUpdate);

                                        if (!$updateResult) {
                                            throw new \Exception("Gagal mengupdate SKU #{$skuData['id']}. Silakan coba lagi.");
                                        }

                                    } else {
                                        $sku = $product->skus()->create($skuDataToUpdate);
                                    }
                                    $incomingSkuIds[] = $sku->id;
                                } else {
                                    // Create new SKU (no ID provided)
                                    if (!empty($skuData['sku_code'])) {
                                        $duplicateCheck = $product->skus()->withTrashed()->where('sku_code', $skuData['sku_code'])->first();
                                        if ($duplicateCheck) {
                                            if ($duplicateCheck->trashed()) {
                                                // Restore soft-deleted SKU instead of creating new one
                                                $duplicateCheck->restore();
                                                $duplicateCheck->update($skuDataToUpdate);
                                                $sku = $duplicateCheck;
                                                $incomingSkuIds[] = $sku->id;
                                                continue; // Skip to next iteration
                                            } else {
                                                throw new \Exception("SKU dengan kode '{$skuData['sku_code']}' sudah ada dan tidak dapat dipulihkan. Gunakan ID SKU yang sudah ada atau hapus SKU yang aktif terlebih dahulu.");
                                            }
                                        }
                                    }

                                    $sku = $product->skus()->create($skuDataToUpdate);
                                    $incomingSkuIds[] = $sku->id;
                                }
                            } catch (\Exception $e) {
                                \Log::error("Error processing SKU #{$index}: " . $e->getMessage());
                                throw new \Exception("Error pada variasi #" . ($index + 1) . ": " . $e->getMessage());
                            }

                            // Handle soft delete if deleted_at is set
                            if (isset($skuData['deleted_at']) && !empty($skuData['deleted_at']) && $sku) {
                                $sku->delete(); // Soft delete
                                continue; // Skip further processing for deleted SKU
                            }

                            // Handle variant image if uploaded
                            if (isset($skuData['image_file']) && $skuData['image_file'] instanceof \Illuminate\Http\UploadedFile) {
                                if (!$skuData['image_file']->isValid()) {
                                    throw new \Exception("File gambar tidak valid untuk variasi #" . ($index + 1));
                                }

                                $path = $skuData['image_file']->store('products/skus', 'public');
                                if (!$path) {
                                    throw new \Exception("Gagal mengupload gambar untuk variasi #" . ($index + 1));
                                }

                                $sku->update(['image' => $path]);
                            }
                        }

                        // Delete SKUs that are not in the incoming data
                        $skusToDelete = array_diff($existingSkuIds, $incomingSkuIds);
                        if (!empty($skusToDelete)) {
                            $product->skus()->whereIn('id', $skusToDelete)->delete();
                        }

                    } else {
                        // If product has no variations, delete all existing SKUs
                        $product->skus()->delete();
                    }

                    // Handle image updates with improved logic
                    $this->processProductImages($request, $product);


                } catch (\Exception $e) {
                    \Log::error('=== TRANSACTION FAILED ===');
                    \Log::error('Transaction error: ' . $e->getMessage());
                    \Log::error('Transaction error file: ' . $e->getFile() . ' line: ' . $e->getLine());

                    // DEBUG: Uncomment this line to see detailed error
                    dd([
                        'error_message' => $e->getMessage(),
                        'error_file' => $e->getFile(),
                        'error_line' => $e->getLine(),
                        'error_trace' => $e->getTraceAsString(),
                        'request_data' => $data,
                        'product_id' => $product->id
                    ]);

                    throw $e; // Re-throw to trigger transaction rollback
                }
            });

            return redirect()->route('admin.products.index')
                ->with('success', 'Produk berhasil diperbarui.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('=== DATABASE QUERY EXCEPTION ===');
            \Log::error('Database error: ' . $e->getMessage());
            \Log::error('SQL State: ' . $e->errorInfo[0] ?? 'Unknown');
            \Log::error('SQL Error: ' . $e->errorInfo[2] ?? 'Unknown');

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan database saat memperbarui produk. Error: ' . $e->getMessage())
                ->withInput();

        } catch (\Illuminate\Database\Exception $e) {
            \Log::error('=== DATABASE EXCEPTION ===');
            \Log::error('Database error: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan database saat memperbarui produk. Error: ' . $e->getMessage())
                ->withInput();

        } catch (\Illuminate\Http\Client\RequestException $e) {
            \Log::error('=== HTTP REQUEST EXCEPTION ===');
            \Log::error('HTTP error: ' . $e->getMessage());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan koneksi saat memperbarui produk. Silakan coba lagi.')
                ->withInput();

        } catch (\Exception $e) {
            \Log::error('=== PRODUCT UPDATE EXCEPTION ===');
            \Log::error('Exception message: ' . $e->getMessage());
            \Log::error('Exception file: ' . $e->getFile() . ' line: ' . $e->getLine());
            \Log::error('Exception trace: ' . $e->getTraceAsString());

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui produk: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Set primary image for product.
     */
    public function setPrimaryImage(Request $request, Product $product, ProductImage $image)
    {
        $this->authorize('update', $product);

        if ($image->product_id !== $product->id) {
            abort(403);
        }

        $image->setAsPrimary();

        return back()->with('success', 'Gambar utama berhasil diperbarui.');
    }

    /**
     * Delete product image.
     */
    public function deleteImage(Product $product, ProductImage $image)
    {
        $this->authorize('update', $product);

        if ($image->product_id !== $product->id) {
            abort(403);
        }

        // Prevent deletion if it's only image
        if ($product->images()->count() <= 1) {
            return back()->with('error', 'Tidak dapat menghapus gambar satu-satunya. Tambahkan gambar lain terlebih dahulu.');
        }

        // Delete file from storage
        Storage::disk('public')->delete($image->image_path);

        // If this was primary, set another image as primary
        if ($image->is_primary) {
            $newPrimary = $product->images()->where('id', '!=', $image->id)->first();
            if ($newPrimary) {
                $newPrimary->setAsPrimary();
            }
        }

        $image->delete();

        return back()->with('success', 'Gambar berhasil dihapus.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $this->authorize('delete', $product);

        $product->delete();
        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil dihapus.');
    }

    /**
     * Process product images during update with improved logic.
     */
    private function processProductImages(Request $request, Product $product)
    {
        // Get current images from database
        $currentImages = $product->images()->get();

        // Get image data from request
        $imageData = $request->input('image_data', []);
        $existingImages = $imageData['existing'] ?? [];
        $newFilesMetadata = $imageData['new_files_metadata'] ?? [];
        $uploadedFiles = $request->file('images', []);

        // Debug: Log image processing data
        \Log::info("Processing Product Images", [
            'product_id' => $product->id,
            'current_images_count' => $currentImages->count(),
            'existing_images_count' => count($existingImages),
            'uploaded_files_count' => count($uploadedFiles),
            'image_data_structure' => $imageData
        ]);

        // Fallback: If no existing images specified and no new files uploaded, keep all current images
        if (empty($existingImages) && empty($uploadedFiles) && $currentImages->isNotEmpty()) {
            \Log::info("No image data provided, preserving all existing images");
            $existingImages = $currentImages->map(function ($image) {
                return [
                    'id' => $image->id,
                    'is_primary' => $image->is_primary,
                    'sort_order' => $image->sort_order
                ];
            })->toArray();
        }

        // Validate total image count before processing
        $totalImagesAfterUpdate = count($existingImages) + count($uploadedFiles);
        if ($totalImagesAfterUpdate > 5) {
            throw new \Exception('Total gambar produk tidak boleh lebih dari 5 (selain gambar variasi). ' .
                'Saat ini ada ' . count($existingImages) . ' gambar yang akan disimpan ' .
                'dan Anda mencoba menambah ' . count($uploadedFiles) . ' gambar baru.');
        }

        // Collect IDs of images to keep
        $imagesToKeep = [];
        foreach ($existingImages as $existingImage) {
            if (isset($existingImage['id']) && is_numeric($existingImage['id'])) {
                $imagesToKeep[] = $existingImage['id'];

                // Update existing image properties
                $image = $currentImages->where('id', $existingImage['id'])->first();
                if ($image) {
                    $image->update([
                        'is_primary' => $existingImage['is_primary'] ?? false,
                        'sort_order' => $existingImage['sort_order'] ?? 0
                    ]);
                }
            }
        }

        // Delete images that are not in the keep list
        $imagesToDelete = $currentImages->whereNotIn('id', $imagesToKeep);

        foreach ($imagesToDelete as $image) {
            // Delete file from storage
            Storage::disk('public')->delete($image->image_path);

            // Delete database record
            $image->delete();
        }

        // Upload new images
        foreach ($uploadedFiles as $index => $file) {
            if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                // Find metadata for this file
                $metadata = $newFilesMetadata[$index] ?? [];

                // Upload file
                $path = $file->store('products', 'public');

                // Add image to product
                $isPrimary = $metadata['is_primary'] ?? false;
                $sortOrder = $metadata['sort_order'] ?? 0;

                $newImage = $product->addImage($path, $isPrimary, $sortOrder);

                // If this is primary, unset other primary images
                if ($isPrimary) {
                    $product->images()->where('id', '!=', $newImage->id)->update(['is_primary' => false]);
                }
            }
        }

        // Final validation: ensure at least one primary image exists
        $primaryImage = $product->images()->where('is_primary', true)->first();
        $totalImages = $product->images()->count();

        if ($totalImages > 0 && !$primaryImage) {
            // Set first image as primary if none exists
            $firstImage = $product->images()->orderBy('sort_order')->orderBy('id')->first();
            if ($firstImage) {
                $firstImage->update(['is_primary' => true]);
            }
        }
    }

    /**
     * Show reviews for a product (admin view).
     */
    public function reviews(Product $product)
    {
        $this->authorize('view', $product);

        $reviews = $product->reviews()
            ->with(['user:id,name', 'order:id,order_code'])
            ->latest()
            ->paginate(20);

        return Inertia::render('admin/products/reviews', [
            'product' => $product->load(['vendor', 'category']),
            'reviews' => $reviews,
            'canDeleteReviews' => auth()->user()->isAdmin(),
        ]);
    }

    /**
     * Soft delete (disable) a SKU.
     */
    public function disableSku(Product $product, ProductSku $sku)
    {
        $this->authorize('update', $product);

        // Ensure SKU belongs to this product
        if ($sku->product_id !== $product->id) {
            abort(404);
        }

        // Soft delete SKU
        $sku->delete();

        return back()->with('success', 'SKU berhasil dinonaktifkan.');
    }

    /**
     * Restore a soft deleted SKU.
     */
    public function enableSku(Product $product, $skuId)
    {
        $this->authorize('update', $product);

        // Find SKU including trashed
        $sku = ProductSku::withTrashed()->findOrFail($skuId);

        // Ensure SKU belongs to this product
        if ($sku->product_id !== $product->id) {
            abort(404);
        }

        // Restore SKU
        $sku->restore();

        return back()->with('success', 'SKU berhasil diaktifkan kembali.');
    }
}
