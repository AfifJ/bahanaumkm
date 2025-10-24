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
                'deleteReviews' => auth()->user()->role_id === 1, // Only admin can delete reviews
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

        \Log::info('=== PRODUCT STORE DEBUG ===');
        \Log::info('Has variations: ' . ($data['has_variations'] ?? 'false'));
        \Log::info('Different prices: ' . ($data['different_prices'] ?? 'false'));
        \Log::info('Buy price (product level): ' . ($data['buy_price'] ?? 'null'));
        \Log::info('Sell price (product level): ' . ($data['sell_price'] ?? 'null'));
        \Log::info('Global prices: ' . json_encode($data['global_prices'] ?? []));
        \Log::info('SKUs count: ' . (isset($data['skus']) ? count($data['skus']) : 0));

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

            \Log::info('Product data to create: ' . json_encode($productData));
            $product = Product::create($productData);

            // Handle product variations/SKUs
            if ($data['has_variations'] && isset($data['skus'])) {
                foreach ($data['skus'] as $index => $skuData) {
                    // Handle global pricing if different_prices is false
                    $skuPrice = $data['different_prices'] ? $skuData['price'] : $data['sell_price'];
                    $skuBuyPrice = $data['different_prices'] ? $skuData['buy_price'] : $data['buy_price'];

                    \Log::info("Processing SKU #{$index}:");
                    \Log::info("  - Different prices: " . ($data['different_prices'] ? 'true' : 'false'));
                    \Log::info("  - SKU data price: " . ($skuData['price'] ?? 'null'));
                    \Log::info("  - Data sell_price: " . ($data['sell_price'] ?? 'null'));
                    \Log::info("  - Final SKU price: " . $skuPrice);
                    \Log::info("  - Final SKU buy_price: " . $skuBuyPrice);

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
                        \Log::info('Processing variant image upload for new SKU ID: ' . $sku->id);
                        $path = $skuData['image_file']->store('products/skus', 'public');
                        $sku->update(['image' => $path]);
                        \Log::info('Variant image saved: ' . $path);
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
        // === DEBUG: ProductController Update ===
        \Log::info('=== PRODUCT CONTROLLER UPDATE DEBUG ===');
        \Log::info('Product ID: ' . $product->id);
        \Log::info('Product Name: ' . $product->name);

        $this->authorize('update', $product);

        \Log::info('Authorization passed');

        try {
            $data = $request->validated();
            \Log::info('Request validation passed');
            \Log::info('Validated data keys: ' . implode(', ', array_keys($data)));
            \Log::info('Has variations: ' . ($data['has_variations'] ?? 'false'));
            \Log::info('Different prices: ' . ($data['different_prices'] ?? 'false'));
            \Log::info('SKUs count: ' . (isset($data['skus']) ? count($data['skus']) : 0));

            // === EDIT RESTRICTIONS VALIDATION ===
            $hasOrders = $product->hasOrders();
            \Log::info('Product has orders: ' . ($hasOrders ? 'true' : 'false'));

            if ($hasOrders) {
                // Validasi 1: Tidak boleh mengubah tipe produk
                if ($product->has_variations !== $data['has_variations']) {
                    \Log::error('Attempt to change product type when product has orders');
                    return redirect()->back()
                        ->with('error', 'Tidak dapat mengubah tipe produk (tunggal/variasi) karena produk ini sudah memiliki pesanan.')
                        ->withInput();
                }

                // Validasi 2: Jika produk memiliki variasi, tidak boleh menghapus SKU yang sudah ada
                if ($product->has_variations && isset($data['skus'])) {
                    $existingSkuIds = $product->skus()->pluck('id')->toArray();
                    $incomingSkuIds = array_filter(array_column($data['skus'], 'id'), function($id) {
                        return !empty($id);
                    });

                    $skusToDelete = array_diff($existingSkuIds, $incomingSkuIds);
                    
                    if (!empty($skusToDelete)) {
                        \Log::error('Attempt to delete SKUs when product has orders: ' . implode(', ', $skusToDelete));
                        return redirect()->back()
                            ->with('error', 'Tidak dapat menghapus SKU karena produk ini sudah memiliki pesanan. Gunakan tombol "Nonaktifkan" untuk menonaktifkan SKU.')
                            ->withInput();
                    }
                }
            }

            DB::transaction(function () use ($request, $data, $product) {
                \Log::info('Starting database transaction...');

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

                \Log::info('Product data to update: ' . json_encode($productData));
                $product->update($productData);
                \Log::info('Product updated successfully');

            // Handle product variations/SKUs update
            if ($data['has_variations'] && isset($data['skus'])) {
                \Log::info('Processing SKUs update...');
                \Log::info('Existing SKUs to process: ' . count($data['skus']));

                // Get existing SKU IDs to determine which ones to delete
                $existingSkuIds = $product->skus()->pluck('id')->toArray();
                $incomingSkuIds = [];
                \Log::info('Current SKU IDs in database: ' . implode(', ', $existingSkuIds));

                foreach ($data['skus'] as $index => $skuData) {
                    \Log::info("Processing SKU #{$index}: " . ($skuData['sku_code'] ?? 'no code'));
                    \Log::info("SKU data: " . json_encode([
                        'id' => $skuData['id'] ?? 'null',
                        'sku_code' => $skuData['sku_code'] ?? 'null',
                        'variant_name' => $skuData['variant_name'] ?? 'null',
                        'existing_image' => $skuData['image'] ?? 'null'
                    ]));

                    // Validate required fields for SKU
                    if (empty($skuData['variant_name'])) {
                        throw new \Exception("Nama varian wajib diisi untuk variasi #" . ($index + 1));
                    }

                    // Handle global pricing if different_prices is false
                    $skuPrice = $data['different_prices'] ? $skuData['price'] : $data['sell_price'];
                    $skuBuyPrice = $data['different_prices'] ? $skuData['buy_price'] : $data['buy_price'];

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

                    // Check if this is existing SKU by ID or by matching existing SKU code
                    $isExistingSku = false;
                    $existingSku = null;

                    // First try to find by ID
                    if (isset($skuData['id']) && !empty($skuData['id'])) {
                        \Log::info('Looking for existing SKU by ID: ' . $skuData['id']);
                        $existingSku = $product->skus()->find($skuData['id']);
                        if ($existingSku) {
                            $isExistingSku = true;
                            \Log::info('Found existing SKU by ID: ' . $skuData['id']);
                        }
                    }

                    // If not found by ID, try to find by SKU code (for debugging)
                    if (!$isExistingSku && !empty($skuData['sku_code'])) {
                        \Log::info('Looking for existing SKU by code: ' . $skuData['sku_code']);
                        $existingSku = $product->skus()->where('sku_code', $skuData['sku_code'])->first();
                        if ($existingSku) {
                            \Log::warning('Found existing SKU by code but no ID provided! SKU ID: ' . $existingSku->id);
                            $isExistingSku = true;
                            $skuData['id'] = $existingSku->id; // Set the ID for further processing
                        }
                    }

                    $sku = null;
                    if ($isExistingSku) {
                        // Update existing SKU
                        \Log::info('Updating existing SKU ID: ' . $existingSku->id);
                        if (!$existingSku->update($skuDataToUpdate)) {
                            throw new \Exception("Gagal mengupdate SKU dengan ID {$existingSku->id}");
                        }
                        $sku = $existingSku;
                        $incomingSkuIds[] = $sku->id;
                        \Log::info('SKU updated successfully');
                    } else {
                        // Create new SKU
                        \Log::info('Creating new SKU');

                        // Check for duplicate SKU code before creating
                        if (!empty($skuData['sku_code'])) {
                            $duplicateCheck = $product->skus()->where('sku_code', $skuData['sku_code'])->first();
                            if ($duplicateCheck) {
                                throw new \Exception("SKU dengan kode '{$skuData['sku_code']}' sudah ada. Gunakan ID yang benar atau SKU code yang berbeda.");
                            }
                        }

                        $sku = $product->skus()->create($skuDataToUpdate);
                        if (!$sku) {
                            throw new \Exception("Gagal membuat SKU baru untuk variasi: " . $skuData['variant_name']);
                        }
                        $incomingSkuIds[] = $sku->id;
                        \Log::info('New SKU created with ID: ' . $sku->id);
                    }

                    // Handle soft delete if deleted_at is set
                    if (isset($skuData['deleted_at']) && !empty($skuData['deleted_at']) && $sku->id) {
                        \Log::info('Soft deleting SKU ID: ' . $sku->id);
                        $sku->delete(); // Soft delete
                        \Log::info('SKU soft deleted successfully');
                        continue; // Skip further processing for deleted SKU
                    }

                    // Handle variant image if uploaded (only if SKU exists)
                    if (isset($skuData['image_file']) && $skuData['image_file'] instanceof \Illuminate\Http\UploadedFile) {
                        \Log::info('Processing variant image upload for SKU ID: ' . $sku->id);

                        // Validate image file
                        if (!$skuData['image_file']->isValid()) {
                            throw new \Exception("File gambar tidak valid untuk variasi #" . ($index + 1));
                        }

                        $path = $skuData['image_file']->store('products/skus', 'public');
                        if (!$path) {
                            throw new \Exception("Gagal mengupload gambar untuk variasi #" . ($index + 1));
                        }

                        if (!$sku->update(['image' => $path])) {
                            throw new \Exception("Gagal menyimpan path gambar untuk SKU ID {$sku->id}");
                        }

                        \Log::info('Variant image saved: ' . $path);
                    }
                }

                // Delete SKUs that are not in the incoming data
                $skusToDelete = array_diff($existingSkuIds, $incomingSkuIds);
                if (!empty($skusToDelete)) {
                    \Log::info('Deleting SKUs: ' . implode(', ', $skusToDelete));
                    $deleteResult = $product->skus()->whereIn('id', $skusToDelete)->delete();
                    if ($deleteResult === 0) {
                        throw new \Exception("Gagal menghapus SKU yang tidak digunakan");
                    }
                    \Log::info('SKUs deleted successfully');
                }

                // Final validation will be done after processing all SKUs and images
                // This ensures we check against the actual database state

            } else {
                // If product has no variations, delete all existing SKUs
                \Log::info('Product has no variations, deleting all SKUs');
                $product->skus()->delete();
            }

            // Handle image updates with improved logic
            $this->processProductImages($request, $product);
            \Log::info('Image processing completed');

            // Handle backward compatibility for single image upload
            if ($request->hasFile('image')) {
                \Log::info('Processing backward compatibility single image upload');
                // Delete existing images
                $product->images()->each(function ($image) {
                    Storage::disk('public')->delete($image->image_path);
                    $image->delete();
                });

                $path = $request->file('image')->store('products', 'public');
                $product->addImage($path, true, 0);
                \Log::info('Single image uploaded: ' . $path);
            }

            \Log::info('Database transaction completed successfully');

        });

        // Final validation: ensure data was actually saved correctly
        if ($data['has_variations'] && isset($data['skus'])) {
            // Count active SKUs (excluding soft deleted)
            $savedSkuCount = $product->skus()->count();
            // Count expected SKUs (excluding those marked for soft delete)
            $expectedSkuCount = collect($data['skus'])->filter(function($sku) {
                return !isset($sku['deleted_at']) || empty($sku['deleted_at']);
            })->count();

            if ($savedSkuCount !== $expectedSkuCount) {
                \Log::error("SKU count mismatch! Expected: {$expectedSkuCount}, Saved: {$savedSkuCount}");
                return redirect()->back()
                    ->with('error', 'Terjadi kesalahan: Tidak semua variasi berhasil disimpan. Silakan coba lagi.')
                    ->withInput();
            }

            // Final image validation: check against actual database state
            if ($data['use_images']) {
                \Log::info('Performing final image validation against database state...');

                $skusWithoutImages = $product->skus()->whereNull('image')->get();
                $skusRequiringImages = [];

                foreach ($skusWithoutImages as $sku) {
                    // Find the corresponding SKU data from frontend
                    $frontendSku = collect($data['skus'])->first(function ($item) use ($sku) {
                        return ($item['sku_code'] ?? '') === ($sku->sku_code ?? '') ||
                               ($item['variant_name'] ?? '') === ($sku->variant_name ?? '');
                    });

                    if ($frontendSku) {
                        $hasNewImageUpload = isset($frontendSku['image_file']) && $frontendSku['image_file'] instanceof \Illuminate\Http\UploadedFile;
                        $isNewSku = !isset($frontendSku['id']) || empty($frontendSku['id']);

                        // Only consider it as requiring image if it's truly new or had no existing image
                        if ($isNewSku && !$hasNewImageUpload) {
                            $skusRequiringImages[] = "SKU baru: {$sku->variant_name}";
                        }
                    }
                }

                \Log::info('SKUs without images: ' . $skusWithoutImages->count());
                \Log::info('SKUs requiring images: ' . count($skusRequiringImages));

                if (!empty($skusRequiringImages)) {
                    $errorMessage = 'Beberapa variasi memerlukan gambar: ' . implode(', ', $skusRequiringImages);
                    \Log::error('Final image validation failed: ' . $errorMessage);
                    return redirect()->back()
                        ->with('error', $errorMessage)
                        ->withInput();
                }

                \Log::info('Final image validation passed!');
            }
        }

        \Log::info('Redirecting to products index with success message');
        return redirect()->route('admin.products.index')
            ->with('success', 'Produk berhasil diperbarui.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . $e->getMessage());
            \Log::error('Validation errors: ' . json_encode($e->errors()));
            throw $e;

        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database error updating product: ' . $e->getMessage());
            \Log::error('SQL: ' . $e->getSql());
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan database saat memperbarui produk. Silakan coba lagi.')
                ->withInput();

        } catch (\Illuminate\Http\Client\RequestException $e) {
            \Log::error('API error updating product: ' . $e->getMessage());
            return redirect()->back()
                ->with('error', 'Terjadi kesalahan koneksi saat memperbarui produk. Silakan coba lagi.')
                ->withInput();

        } catch (\Exception $e) {
            \Log::error('Error updating product: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
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

        // Prevent deletion if it's the only image
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
        \Log::info('=== PROCESSING PRODUCT IMAGES ===');
        \Log::info('Product ID: ' . $product->id);
        
        // Get current images from database
        $currentImages = $product->images()->get();
        \Log::info('Current images in database: ' . $currentImages->count());
        
        // Get image data from request
        $imageData = $request->input('image_data', []);
        $existingImages = $imageData['existing'] ?? [];
        $newFilesMetadata = $imageData['new_files_metadata'] ?? [];
        $uploadedFiles = $request->file('images', []);
        
        \Log::info('Images to keep: ' . count($existingImages));
        \Log::info('New files to upload: ' . count($uploadedFiles));
        
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
                \Log::info('Keeping existing image ID: ' . $existingImage['id']);
                
                // Update existing image properties
                $image = $currentImages->where('id', $existingImage['id'])->first();
                if ($image) {
                    $image->update([
                        'is_primary' => $existingImage['is_primary'] ?? false,
                        'sort_order' => $existingImage['sort_order'] ?? 0
                    ]);
                    \Log::info('Updated image ID ' . $existingImage['id'] . ' properties');
                }
            }
        }
        
        // Delete images that are not in the keep list
        $imagesToDelete = $currentImages->whereNotIn('id', $imagesToKeep);
        \Log::info('Images to delete: ' . $imagesToDelete->count());
        
        foreach ($imagesToDelete as $image) {
            \Log::info('Deleting image ID: ' . $image->id . ', path: ' . $image->image_path);
            
            // Delete file from storage
            Storage::disk('public')->delete($image->image_path);
            
            // Delete database record
            $image->delete();
            
            \Log::info('Successfully deleted image ID: ' . $image->id);
        }
        
        // Upload new images
        foreach ($uploadedFiles as $index => $file) {
            if ($file instanceof \Illuminate\Http\UploadedFile && $file->isValid()) {
                \Log::info('Processing new file upload at index: ' . $index);
                
                // Find metadata for this file
                $metadata = $newFilesMetadata[$index] ?? [];
                \Log::info('File metadata: ' . json_encode($metadata));
                
                // Upload file
                $path = $file->store('products', 'public');
                \Log::info('File uploaded to: ' . $path);
                
                // Add image to product
                $isPrimary = $metadata['is_primary'] ?? false;
                $sortOrder = $metadata['sort_order'] ?? 0;
                
                $newImage = $product->addImage($path, $isPrimary, $sortOrder);
                \Log::info('Added new image with ID: ' . $newImage->id . ', primary: ' . ($isPrimary ? 'true' : 'false'));
                
                // If this is primary, unset other primary images
                if ($isPrimary) {
                    $product->images()->where('id', '!=', $newImage->id)->update(['is_primary' => false]);
                    \Log::info('Set new image as primary and unset others');
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
                \Log::info('Set first image as primary (ID: ' . $firstImage->id . ')');
            }
        }
        
        \Log::info('Final image count: ' . $totalImages);
        \Log::info('=== IMAGE PROCESSING COMPLETED ===');
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
            'canDeleteReviews' => auth()->user()->role_id === 1,
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

        // Soft delete the SKU
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

        // Restore the SKU
        $sku->restore();

        return back()->with('success', 'SKU berhasil diaktifkan kembali.');
    }
}
